
-- Criar tabela de configurações administrativas se não existir
CREATE TABLE IF NOT EXISTS public.configuracoes_restaurante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  despesas_fixas_mensais DECIMAL(10,2) DEFAULT 0,
  despesas_variaveis_mensais DECIMAL(10,2) DEFAULT 0,
  receita_mensal_esperada DECIMAL(10,2) DEFAULT 0,
  markup_padrao DECIMAL(5,2) DEFAULT 250,
  margem_lucro_esperada DECIMAL(5,2) DEFAULT 30,
  taxa_ifood DECIMAL(5,2) DEFAULT 15,
  taxa_entrega DECIMAL(5,2) DEFAULT 5,
  taxa_impostos DECIMAL(5,2) DEFAULT 12,
  meta_vendas_diaria DECIMAL(10,2) DEFAULT 0,
  custo_medio_por_prato DECIMAL(8,2) DEFAULT 0,
  rendimento_porcao_padrao DECIMAL(5,2) DEFAULT 1,
  perda_media_percentual DECIMAL(5,2) DEFAULT 5,
  ticket_medio_esperado DECIMAL(8,2) DEFAULT 0,
  pratos_vendidos_dia_meta INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de metas e alertas
CREATE TABLE IF NOT EXISTS public.metas_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  data_meta DATE NOT NULL,
  meta_receita_dia DECIMAL(10,2),
  receita_real_dia DECIMAL(10,2) DEFAULT 0,
  meta_pratos_dia INTEGER,
  pratos_vendidos_dia INTEGER DEFAULT 0,
  status TEXT DEFAULT 'em_andamento',
  percentual_atingido DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Atualizar tabela de pratos com campos essenciais
ALTER TABLE public.pratos 
ADD COLUMN IF NOT EXISTS custo_embalagem DECIMAL(8,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_perdas DECIMAL(8,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_ifood DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_uber_eats DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vendas_dia INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_venda TIMESTAMP;

-- Criar função para calcular metas automáticas
CREATE OR REPLACE FUNCTION public.calcular_meta_diaria(restaurant_uuid UUID)
RETURNS TABLE(
  meta_receita DECIMAL(10,2),
  meta_pratos INTEGER,
  ticket_medio DECIMAL(8,2)
) AS $$
DECLARE
  config RECORD;
BEGIN
  SELECT * INTO config FROM public.configuracoes_restaurante WHERE restaurant_id = restaurant_uuid;
  
  -- Meta de receita diária = receita mensal / 30
  meta_receita := COALESCE(config.receita_mensal_esperada, 0) / 30;
  
  -- Ticket médio baseado no custo médio + markup
  ticket_medio := COALESCE(config.custo_medio_por_prato, 0) * (COALESCE(config.markup_padrao, 250) / 100);
  
  -- Meta de pratos = meta receita / ticket médio
  IF ticket_medio > 0 THEN
    meta_pratos := CEIL(meta_receita / ticket_medio);
  ELSE
    meta_pratos := COALESCE(config.pratos_vendidos_dia_meta, 50);
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_restaurant ON public.configuracoes_restaurante(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_metas_restaurant_data ON public.metas_vendas(restaurant_id, data_meta);
CREATE INDEX IF NOT EXISTS idx_pratos_ativo ON public.pratos(restaurant_id, ativo);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.configuracoes_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_vendas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configurações
CREATE POLICY "Users can view own restaurant configs" ON public.configuracoes_restaurante
  FOR SELECT USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can modify own restaurant configs" ON public.configuracoes_restaurante
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Políticas RLS para metas
CREATE POLICY "Users can view own restaurant goals" ON public.metas_vendas
  FOR SELECT USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can modify own restaurant goals" ON public.metas_vendas
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
