
-- Verificar se tabelas contas_a_pagar e contas_a_receber existem e ajustá-las
-- Adicionar campos necessários para integração completa

-- Adicionar campos de integração na tabela cash_flow para melhor rastreamento
ALTER TABLE public.cash_flow ADD COLUMN IF NOT EXISTS conta_origem_id UUID;
ALTER TABLE public.cash_flow ADD COLUMN IF NOT EXISTS categoria_customizada TEXT;
ALTER TABLE public.cash_flow ADD COLUMN IF NOT EXISTS impacta_dre BOOLEAN DEFAULT true;
ALTER TABLE public.cash_flow ADD COLUMN IF NOT EXISTS impacta_cmv BOOLEAN DEFAULT false;

-- Criar tabela de categorias customizadas para despesas
CREATE TABLE IF NOT EXISTS public.categorias_despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('despesa_operacional', 'insumo_cmv', 'custom')),
  impacta_dre BOOLEAN DEFAULT true,
  impacta_cmv BOOLEAN DEFAULT false,
  cor TEXT DEFAULT '#64748b',
  icone TEXT DEFAULT 'receipt',
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.categorias_despesas ENABLE ROW LEVEL SECURITY;

-- Política para categorias de despesas
CREATE POLICY "Users can manage their restaurant expense categories" ON public.categorias_despesas
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Adicionar campo de notificações na tabela contas_a_pagar
ALTER TABLE public.contas_a_pagar ADD COLUMN IF NOT EXISTS notificacao_enviada_1_dia BOOLEAN DEFAULT false;
ALTER TABLE public.contas_a_pagar ADD COLUMN IF NOT EXISTS notificacao_enviada_vencimento BOOLEAN DEFAULT false;
ALTER TABLE public.contas_a_pagar ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;

-- Adicionar campo de notificações na tabela contas_a_receber  
ALTER TABLE public.contas_a_receber ADD COLUMN IF NOT EXISTS notificacao_enviada_1_dia BOOLEAN DEFAULT false;
ALTER TABLE public.contas_a_receber ADD COLUMN IF NOT EXISTS notificacao_enviada_vencimento BOOLEAN DEFAULT false;
ALTER TABLE public.contas_a_receber ADD COLUMN IF NOT EXISTS forma_recebimento TEXT;

-- Criar tabela de configurações de taxas de delivery
CREATE TABLE IF NOT EXISTS public.taxas_delivery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  plataforma TEXT NOT NULL, -- 'ifood', 'uber_eats', 'rappi', etc
  tipo_taxa TEXT NOT NULL CHECK (tipo_taxa IN ('percentual', 'valor_fixo')),
  valor_taxa NUMERIC NOT NULL DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS para taxas de delivery
ALTER TABLE public.taxas_delivery ENABLE ROW LEVEL SECURITY;

-- Política para taxas de delivery
CREATE POLICY "Users can manage their restaurant delivery rates" ON public.taxas_delivery
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  user_id UUID,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Ativar RLS para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para audit logs
CREATE POLICY "Users can view their restaurant audit logs" ON public.audit_logs
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Insert de categorias padrão
INSERT INTO public.categorias_despesas (restaurant_id, nome, tipo, impacta_dre, impacta_cmv) 
SELECT id, 'Insumos Alimentares', 'insumo_cmv', false, true FROM public.restaurants
ON CONFLICT DO NOTHING;

INSERT INTO public.categorias_despesas (restaurant_id, nome, tipo, impacta_dre, impacta_cmv) 
SELECT id, 'Marketing', 'despesa_operacional', true, false FROM public.restaurants
ON CONFLICT DO NOTHING;

INSERT INTO public.categorias_despesas (restaurant_id, nome, tipo, impacta_dre, impacta_cmv) 
SELECT id, 'Delivery', 'despesa_operacional', true, false FROM public.restaurants
ON CONFLICT DO NOTHING;

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (restaurant_id, action, table_name, record_id, old_values)
    VALUES (OLD.restaurant_id, 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (restaurant_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.restaurant_id, 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (restaurant_id, action, table_name, record_id, new_values)
    VALUES (NEW.restaurant_id, 'insert', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoria nas tabelas críticas
CREATE TRIGGER audit_cash_flow AFTER INSERT OR UPDATE OR DELETE ON public.cash_flow
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_contas_pagar AFTER INSERT OR UPDATE OR DELETE ON public.contas_a_pagar
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_contas_receber AFTER INSERT OR UPDATE OR DELETE ON public.contas_a_receber
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Função para verificar sistema (healthcheck)
CREATE OR REPLACE FUNCTION public.system_healthcheck(restaurant_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  table_count INTEGER;
  cash_flow_count INTEGER;
  contas_pagar_count INTEGER;
  contas_receber_count INTEGER;
BEGIN
  -- Verificar conexões de tabelas
  SELECT COUNT(*) INTO table_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name IN ('cash_flow', 'contas_a_pagar', 'contas_a_receber');
  
  -- Verificar dados do restaurante
  SELECT COUNT(*) INTO cash_flow_count FROM public.cash_flow WHERE restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO contas_pagar_count FROM public.contas_a_pagar WHERE restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO contas_receber_count FROM public.contas_a_receber WHERE restaurant_id = restaurant_uuid;
  
  result := jsonb_build_object(
    'status', 'healthy',
    'tables_count', table_count,
    'cash_flow_records', cash_flow_count,
    'accounts_payable_records', contas_pagar_count,
    'accounts_receivable_records', contas_receber_count,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_categorias_despesas_restaurant_id ON public.categorias_despesas(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_taxas_delivery_restaurant_id ON public.taxas_delivery(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant_id ON public.audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
