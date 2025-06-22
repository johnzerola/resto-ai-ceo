
-- Corrigir problemas de segurança identificados pelo Security Advisor

-- 1. Corrigir search_path para as funções (torná-las mais seguras)
ALTER FUNCTION public.calcular_cmv_inteligente(uuid, numeric) SET search_path = '';
ALTER FUNCTION public.calcular_cmv_completo(uuid) SET search_path = '';
ALTER FUNCTION public.calcular_meta_diaria(uuid) SET search_path = '';
ALTER FUNCTION public.calcular_custos_prato(uuid) SET search_path = '';
ALTER FUNCTION public.update_pricing_models_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- 2. Garantir que todas as tabelas sensíveis tenham RLS habilitado
ALTER TABLE public.unidades_medida ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para unidades_medida (permitir leitura pública, mas escrita controlada)
CREATE POLICY "Allow public read access to units" ON public.unidades_medida
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage units" ON public.unidades_medida
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Criar tabelas contas_a_pagar e contas_a_receber se não existirem
CREATE TABLE IF NOT EXISTS public.contas_a_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  categoria TEXT NOT NULL DEFAULT 'operacional',
  fornecedor TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contas_a_receber (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido')),
  categoria TEXT NOT NULL DEFAULT 'vendas',
  cliente TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ativar RLS nas novas tabelas
ALTER TABLE public.contas_a_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_a_receber ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para as novas tabelas
CREATE POLICY "Users can manage their restaurant payables" ON public.contas_a_pagar
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their restaurant receivables" ON public.contas_a_receber
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_restaurant_id ON public.contas_a_pagar(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_status ON public.contas_a_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_vencimento ON public.contas_a_pagar(data_vencimento);

CREATE INDEX IF NOT EXISTS idx_contas_a_receber_restaurant_id ON public.contas_a_receber(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_status ON public.contas_a_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_vencimento ON public.contas_a_receber(data_vencimento);

-- 8. Otimizar índices existentes para performance
CREATE INDEX IF NOT EXISTS idx_pratos_restaurant_id ON public.pratos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_insumos_restaurant_id ON public.insumos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ingredientes_por_prato_prato_id ON public.ingredientes_por_prato(prato_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_restaurant_id_date ON public.cash_flow(restaurant_id, date);

-- 9. Trigger para atualizar updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION public.update_contas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER update_contas_a_pagar_updated_at
  BEFORE UPDATE ON public.contas_a_pagar
  FOR EACH ROW EXECUTE FUNCTION public.update_contas_updated_at();

CREATE TRIGGER update_contas_a_receber_updated_at
  BEFORE UPDATE ON public.contas_a_receber
  FOR EACH ROW EXECUTE FUNCTION public.update_contas_updated_at();
