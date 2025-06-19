
-- Criar tabelas essenciais para precificação completa de restaurante

-- Tabela de embalagens
CREATE TABLE IF NOT EXISTS public.embalagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'descartavel', 'retornavel', 'personalizada'
  custo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 1,
  fornecedor TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de unidades de medida padronizadas
CREATE TABLE IF NOT EXISTS public.unidades_medida (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE, -- 'kg', 'g', 'l', 'ml', 'unidade', 'pacote'
  tipo TEXT NOT NULL, -- 'peso', 'volume', 'quantidade'
  fator_conversao DECIMAL(10,4) DEFAULT 1, -- para conversão para unidade base
  unidade_base TEXT, -- 'kg' para peso, 'l' para volume
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir unidades padrão se não existirem
INSERT INTO public.unidades_medida (nome, tipo, fator_conversao, unidade_base) 
VALUES 
  ('kg', 'peso', 1, 'kg'),
  ('g', 'peso', 0.001, 'kg'),
  ('l', 'volume', 1, 'l'),
  ('ml', 'volume', 0.001, 'l'),
  ('unidade', 'quantidade', 1, 'unidade'),
  ('pacote', 'quantidade', 1, 'unidade')
ON CONFLICT (nome) DO NOTHING;

-- Atualizar tabela de insumos com campos essenciais
ALTER TABLE public.insumos 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'geral',
ADD COLUMN IF NOT EXISTS fornecedor TEXT,
ADD COLUMN IF NOT EXISTS validade_dias INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estoque_atual DECIMAL(10,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS perda_media_percentual DECIMAL(5,2) DEFAULT 5.0;

-- Atualizar tabela de pratos com campos de precificação
ALTER TABLE public.pratos 
ADD COLUMN IF NOT EXISTS peso_bruto_kg DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS peso_liquido_kg DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS tempo_preparo_min INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS formato_venda TEXT DEFAULT 'unidade', -- 'unidade', 'kg', 'combo'
ADD COLUMN IF NOT EXISTS embalagem_id UUID REFERENCES public.embalagens(id),
ADD COLUMN IF NOT EXISTS taxa_ifood_percentual DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS taxa_entrega DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_concorrente DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS promocao_ativa BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preco_promocional DECIMAL(8,2);

-- Tabela de taxas e impostos por canal
CREATE TABLE IF NOT EXISTS public.canais_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id),
  nome TEXT NOT NULL, -- 'balcao', 'ifood', 'uber_eats', 'delivery_proprio'
  taxa_percentual DECIMAL(5,2) DEFAULT 0,
  taxa_fixa DECIMAL(8,2) DEFAULT 0,
  tempo_entrega_min INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fluxo de caixa detalhado
ALTER TABLE public.cash_flow 
ADD COLUMN IF NOT EXISTS conta_tipo TEXT DEFAULT 'operacional', -- 'operacional', 'investimento', 'financiamento'
ADD COLUMN IF NOT EXISTS centro_custo TEXT,
ADD COLUMN IF NOT EXISTS documento TEXT,
ADD COLUMN IF NOT EXISTS pessoa_responsavel TEXT,
ADD COLUMN IF NOT EXISTS recorrente BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vencimento DATE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pratos_restaurant_categoria ON public.pratos(restaurant_id, categoria);
CREATE INDEX IF NOT EXISTS idx_ingredientes_prato_insumo ON public.ingredientes_por_prato(prato_id, insumo_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_restaurant_date ON public.cash_flow(restaurant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_insumos_restaurant ON public.insumos(restaurant_id);

-- Função para calcular CMV avançado com perdas e embalagens
CREATE OR REPLACE FUNCTION public.calcular_cmv_completo(prato_uuid UUID)
RETURNS TABLE(
  custo_ingredientes DECIMAL,
  custo_embalagem DECIMAL,
  custo_perdas DECIMAL,
  custo_total DECIMAL,
  custo_por_porcao DECIMAL,
  margem_bruta_percentual DECIMAL,
  margem_liquida_percentual DECIMAL,
  preco_sugerido_balcao DECIMAL,
  preco_sugerido_ifood DECIMAL,
  status_viabilidade TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_prato RECORD;
  v_markup DECIMAL := 300;
  v_custo_ingredientes DECIMAL := 0;
  v_custo_embalagem DECIMAL := 0;
  v_custo_perdas DECIMAL := 0;
  v_taxa_ifood DECIMAL := 0;
BEGIN
  -- Buscar dados do prato
  SELECT * INTO v_prato FROM public.pratos WHERE id = prato_uuid;
  
  -- Calcular custo dos ingredientes com perdas
  SELECT COALESCE(SUM(
    ipp.quantidade_liquida * 
    ins.preco_unitario * 
    (1 + COALESCE(ins.perda_media_percentual, 5) / 100)
  ), 0) INTO v_custo_ingredientes
  FROM public.ingredientes_por_prato ipp
  JOIN public.insumos ins ON ipp.insumo_id = ins.id
  WHERE ipp.prato_id = prato_uuid;
  
  -- Calcular custo da embalagem
  IF v_prato.embalagem_id IS NOT NULL THEN
    SELECT COALESCE(custo_unitario, 0) INTO v_custo_embalagem
    FROM public.embalagens WHERE id = v_prato.embalagem_id;
  END IF;
  
  -- Calcular perdas adicionais
  v_custo_perdas := v_custo_ingredientes * (COALESCE(v_prato.margem_seguranca, 10) / 100);
  
  -- Custo total
  custo_total := v_custo_ingredientes + v_custo_embalagem + v_custo_perdas;
  custo_por_porcao := custo_total / COALESCE(v_prato.rendimento_porcoes, 1);
  custo_ingredientes := v_custo_ingredientes;
  custo_embalagem := v_custo_embalagem;
  custo_perdas := v_custo_perdas;
  
  -- Preços sugeridos
  preco_sugerido_balcao := custo_por_porcao * (v_markup / 100);
  
  -- Preço iFood (considerando taxa)
  v_taxa_ifood := COALESCE(v_prato.taxa_ifood_percentual, 15);
  preco_sugerido_ifood := preco_sugerido_balcao / (1 - v_taxa_ifood / 100);
  
  -- Margens
  margem_bruta_percentual := CASE 
    WHEN preco_sugerido_balcao > 0 THEN 
      ((preco_sugerido_balcao - custo_por_porcao) / preco_sugerido_balcao) * 100 
    ELSE 0 
  END;
  
  margem_liquida_percentual := margem_bruta_percentual - 15; -- Considerando impostos/operacional
  
  -- Status de viabilidade
  IF margem_liquida_percentual < 0 THEN
    status_viabilidade := 'prejuizo';
  ELSIF margem_liquida_percentual < 15 THEN
    status_viabilidade := 'margem_baixa';
  ELSE
    status_viabilidade := 'saudavel';
  END IF;
  
  RETURN NEXT;
END;
$$;

-- RLS policies para as novas tabelas
ALTER TABLE public.embalagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage embalagens for their restaurants" ON public.embalagens
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage canais_venda for their restaurants" ON public.canais_venda
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
