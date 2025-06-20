
-- Ativar RLS na tabela unidades_medida
ALTER TABLE public.unidades_medida ENABLE ROW LEVEL SECURITY;

-- Criar política para unidades_medida (dados públicos de leitura)
CREATE POLICY "Unidades de medida são públicas para leitura" 
  ON public.unidades_medida 
  FOR SELECT 
  USING (true);

-- Criar tabela para preços desejados por produto
CREATE TABLE public.precos_desejados_por_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prato_id UUID REFERENCES public.pratos(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  preco_desejado NUMERIC NOT NULL DEFAULT 0,
  margem_desejada NUMERIC DEFAULT 30,
  lucro_desejado NUMERIC DEFAULT 0,
  tipo_meta TEXT DEFAULT 'margem' CHECK (tipo_meta IN ('margem', 'lucro', 'preco')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.precos_desejados_por_produto ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para precos_desejados_por_produto
CREATE POLICY "Usuários podem ver preços desejados do seu restaurante" 
  ON public.precos_desejados_por_produto 
  FOR SELECT 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar preços desejados do seu restaurante" 
  ON public.precos_desejados_por_produto 
  FOR INSERT 
  WITH CHECK (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar preços desejados do seu restaurante" 
  ON public.precos_desejados_por_produto 
  FOR UPDATE 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Criar tabela para metas de lucro individual
CREATE TABLE public.metas_lucro_individual (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prato_id UUID REFERENCES public.pratos(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  meta_lucro_percentual NUMERIC DEFAULT 30,
  meta_lucro_valor NUMERIC DEFAULT 0,
  meta_cmv_percentual NUMERIC DEFAULT 30,
  meta_vendas_mes INTEGER DEFAULT 100,
  tipo_meta TEXT DEFAULT 'percentual' CHECK (tipo_meta IN ('percentual', 'valor', 'cmv')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.metas_lucro_individual ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para metas_lucro_individual
CREATE POLICY "Usuários podem ver metas do seu restaurante" 
  ON public.metas_lucro_individual 
  FOR SELECT 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar metas do seu restaurante" 
  ON public.metas_lucro_individual 
  FOR INSERT 
  WITH CHECK (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar metas do seu restaurante" 
  ON public.metas_lucro_individual 
  FOR UPDATE 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Criar tabela para resultados estimados por receita
CREATE TABLE public.resultados_estimados_por_receita (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prato_id UUID REFERENCES public.pratos(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  cmv_estimado_percentual NUMERIC DEFAULT 0,
  cmv_estimado_valor NUMERIC DEFAULT 0,
  lucro_estimado_valor NUMERIC DEFAULT 0,
  lucro_estimado_percentual NUMERIC DEFAULT 0,
  margem_bruta NUMERIC DEFAULT 0,
  margem_liquida NUMERIC DEFAULT 0,
  rentabilidade_unitaria NUMERIC DEFAULT 0,
  rentabilidade_mensal NUMERIC DEFAULT 0,
  preco_sugerido NUMERIC DEFAULT 0,
  status_analise TEXT DEFAULT 'saudavel' CHECK (status_analise IN ('saudavel', 'atencao', 'prejuizo')),
  alertas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.resultados_estimados_por_receita ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para resultados_estimados_por_receita
CREATE POLICY "Usuários podem ver resultados do seu restaurante" 
  ON public.resultados_estimados_por_receita 
  FOR SELECT 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem criar resultados do seu restaurante" 
  ON public.resultados_estimados_por_receita 
  FOR INSERT 
  WITH CHECK (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar resultados do seu restaurante" 
  ON public.resultados_estimados_por_receita 
  FOR UPDATE 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Função para calcular CMV automaticamente baseado nas configurações
CREATE OR REPLACE FUNCTION public.calcular_cmv_inteligente(
  prato_uuid UUID,
  preco_final NUMERIC DEFAULT NULL
) RETURNS TABLE(
  cmv_estimado_percentual NUMERIC,
  cmv_estimado_valor NUMERIC,
  lucro_estimado_valor NUMERIC,
  lucro_estimado_percentual NUMERIC,
  margem_bruta NUMERIC,
  margem_liquida NUMERIC,
  preco_sugerido NUMERIC,
  status_viabilidade TEXT,
  alertas JSONB
) AS $$
DECLARE
  v_prato RECORD;
  v_config RECORD;
  v_custo_total NUMERIC := 0;
  v_preco_usado NUMERIC;
  v_alertas JSONB := '[]'::jsonb;
BEGIN
  -- Buscar dados do prato
  SELECT * INTO v_prato FROM public.pratos WHERE id = prato_uuid;
  
  -- Buscar configurações do restaurante
  SELECT * INTO v_config FROM public.configuracoes_restaurante 
  WHERE restaurant_id = v_prato.restaurant_id;
  
  -- Calcular custo total dos ingredientes
  SELECT COALESCE(SUM(ipp.custo_total), 0) INTO v_custo_total
  FROM public.ingredientes_por_prato ipp
  WHERE ipp.prato_id = prato_uuid;
  
  -- Adicionar margem de segurança
  v_custo_total := v_custo_total * (1 + COALESCE(v_prato.margem_seguranca, 10) / 100);
  
  -- Usar preço fornecido ou calcular sugerido
  IF preco_final IS NOT NULL THEN
    v_preco_usado := preco_final;
  ELSE
    v_preco_usado := v_custo_total * (COALESCE(v_config.markup_padrao, 250) / 100);
  END IF;
  
  -- Calcular métricas
  cmv_estimado_valor := v_custo_total;
  cmv_estimado_percentual := CASE WHEN v_preco_usado > 0 THEN (v_custo_total / v_preco_usado) * 100 ELSE 0 END;
  lucro_estimado_valor := v_preco_usado - v_custo_total;
  lucro_estimado_percentual := CASE WHEN v_preco_usado > 0 THEN (lucro_estimado_valor / v_preco_usado) * 100 ELSE 0 END;
  margem_bruta := lucro_estimado_percentual;
  margem_liquida := margem_bruta - COALESCE(v_config.taxa_impostos, 12);
  preco_sugerido := v_custo_total * (COALESCE(v_config.markup_padrao, 250) / 100);
  
  -- Determinar status e alertas
  IF margem_liquida < 0 THEN
    status_viabilidade := 'prejuizo';
    v_alertas := v_alertas || '["🚨 PREJUÍZO: Margem líquida negativa!"]'::jsonb;
  ELSIF margem_liquida < COALESCE(v_config.margem_lucro_esperada, 20) THEN
    status_viabilidade := 'atencao';
    v_alertas := v_alertas || '["⚠️ Margem abaixo da meta esperada"]'::jsonb;
  ELSE
    status_viabilidade := 'saudavel';
  END IF;
  
  -- Alertas adicionais
  IF cmv_estimado_percentual > 35 THEN
    v_alertas := v_alertas || '["📊 CMV muito alto (>35%)"]'::jsonb;
  END IF;
  
  IF preco_final IS NOT NULL AND preco_final > preco_sugerido * 1.3 THEN
    v_alertas := v_alertas || '["💰 Preço pode estar alto para o mercado"]'::jsonb;
  END IF;
  
  alertas := v_alertas;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX idx_precos_desejados_restaurant ON public.precos_desejados_por_produto(restaurant_id);
CREATE INDEX idx_precos_desejados_prato ON public.precos_desejados_por_produto(prato_id);
CREATE INDEX idx_metas_lucro_restaurant ON public.metas_lucro_individual(restaurant_id);
CREATE INDEX idx_metas_lucro_prato ON public.metas_lucro_individual(prato_id);
CREATE INDEX idx_resultados_restaurant ON public.resultados_estimados_por_receita(restaurant_id);
CREATE INDEX idx_resultados_prato ON public.resultados_estimados_por_receita(prato_id);
