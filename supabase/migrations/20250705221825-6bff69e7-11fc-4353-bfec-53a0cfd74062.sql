-- Adicionar campos para conversões automáticas de unidades nos insumos
ALTER TABLE public.insumos 
ADD COLUMN IF NOT EXISTS conversoes_unidade JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ciclo_compra_dias INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS tempo_entrega_dias INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS consumo_medio_diario NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_compra DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preco_ultima_compra NUMERIC DEFAULT 0;

-- Criar tabela para histórico de rupturas
CREATE TABLE IF NOT EXISTS public.historico_rupturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  insumo_id UUID REFERENCES public.insumos(id),
  data_ruptura DATE NOT NULL,
  dias_sem_estoque INTEGER DEFAULT 1,
  motivo TEXT,
  impacto_vendas NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de rupturas
ALTER TABLE public.historico_rupturas ENABLE ROW LEVEL SECURITY;

-- Política RLS para rupturas
CREATE POLICY "Users can manage their restaurant stock outages"
ON public.historico_rupturas
FOR ALL
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

-- Criar tabela para tendências de estoque
CREATE TABLE IF NOT EXISTS public.tendencias_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  insumo_id UUID REFERENCES public.insumos(id),
  data_analise DATE NOT NULL DEFAULT CURRENT_DATE,
  estoque_inicial NUMERIC DEFAULT 0,
  entradas_periodo NUMERIC DEFAULT 0,
  saidas_periodo NUMERIC DEFAULT 0,
  estoque_final NUMERIC DEFAULT 0,
  taxa_consumo_diaria NUMERIC DEFAULT 0,
  tendencia TEXT CHECK (tendencia IN ('acumulando', 'normal', 'risco_ruptura', 'critico')),
  dias_para_ruptura INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de tendências
ALTER TABLE public.tendencias_estoque ENABLE ROW LEVEL SECURITY;

-- Política RLS para tendências
CREATE POLICY "Users can manage their restaurant stock trends"
ON public.tendencias_estoque
FOR ALL
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

-- Função para calcular estoque mínimo automático
CREATE OR REPLACE FUNCTION public.calcular_estoque_minimo_automatico(
  insumo_uuid UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_consumo_medio NUMERIC;
  v_ciclo_compra INTEGER;
  v_tempo_entrega INTEGER;
  v_margem_seguranca NUMERIC := 1.2; -- 20% de margem
  v_estoque_minimo NUMERIC;
BEGIN
  -- Buscar dados do insumo
  SELECT 
    COALESCE(consumo_medio_diario, 0),
    COALESCE(ciclo_compra_dias, 7),
    COALESCE(tempo_entrega_dias, 3)
  INTO v_consumo_medio, v_ciclo_compra, v_tempo_entrega
  FROM public.insumos
  WHERE id = insumo_uuid;
  
  -- Calcular estoque mínimo
  -- Fórmula: (Consumo médio diário × (Ciclo de compra + Tempo de entrega)) × Margem de segurança
  v_estoque_minimo := (v_consumo_medio * (v_ciclo_compra + v_tempo_entrega)) * v_margem_seguranca;
  
  -- Retornar pelo menos 1 unidade
  RETURN GREATEST(v_estoque_minimo, 1);
END;
$$;

-- Função para detectar tendências de estoque
CREATE OR REPLACE FUNCTION public.detectar_tendencias_estoque(
  restaurant_uuid UUID
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_insumo RECORD;
  v_tendencia TEXT;
  v_dias_ruptura INTEGER;
BEGIN
  -- Analisar cada insumo do restaurante
  FOR v_insumo IN 
    SELECT id, nome, estoque_atual, consumo_medio_diario, estoque_minimo
    FROM public.insumos 
    WHERE restaurant_id = restaurant_uuid
  LOOP
    -- Determinar tendência
    IF v_insumo.estoque_atual <= 0 THEN
      v_tendencia := 'critico';
      v_dias_ruptura := 0;
    ELSIF v_insumo.consumo_medio_diario > 0 THEN
      v_dias_ruptura := FLOOR(v_insumo.estoque_atual / v_insumo.consumo_medio_diario);
      
      IF v_dias_ruptura <= 3 THEN
        v_tendencia := 'critico';
      ELSIF v_dias_ruptura <= 7 THEN
        v_tendencia := 'risco_ruptura';
      ELSIF v_insumo.estoque_atual > (v_insumo.estoque_minimo * 2) THEN
        v_tendencia := 'acumulando';
      ELSE
        v_tendencia := 'normal';
      END IF;
    ELSE
      v_tendencia := 'normal';
      v_dias_ruptura := NULL;
    END IF;
    
    -- Inserir ou atualizar tendência
    INSERT INTO public.tendencias_estoque (
      restaurant_id,
      insumo_id,
      data_analise,
      estoque_final,
      taxa_consumo_diaria,
      tendencia,
      dias_para_ruptura
    ) VALUES (
      restaurant_uuid,
      v_insumo.id,
      CURRENT_DATE,
      v_insumo.estoque_atual,
      v_insumo.consumo_medio_diario,
      v_tendencia,
      v_dias_ruptura
    )
    ON CONFLICT (restaurant_id, insumo_id, data_analise) 
    DO UPDATE SET
      estoque_final = EXCLUDED.estoque_final,
      taxa_consumo_diaria = EXCLUDED.taxa_consumo_diaria,
      tendencia = EXCLUDED.tendencia,
      dias_para_ruptura = EXCLUDED.dias_para_ruptura;
  END LOOP;
END;
$$;