-- Criar tabela pratos se não existir
CREATE TABLE IF NOT EXISTS public.pratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_prato TEXT NOT NULL,
  categoria TEXT,
  rendimento_porcoes NUMERIC DEFAULT 1,
  observacoes TEXT,
  custo_total NUMERIC,
  margem_seguranca NUMERIC DEFAULT 10,
  custo_por_porcao NUMERIC,
  preco_sugerido NUMERIC,
  preco_praticado NUMERIC,
  lucro_estimado NUMERIC,
  margem_percentual NUMERIC,
  status_viabilidade TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  peso_bruto_kg NUMERIC,
  peso_liquido_kg NUMERIC,
  tempo_preparo_min INTEGER DEFAULT 15,
  formato_venda TEXT DEFAULT 'unidade',
  embalagem_id UUID,
  taxa_ifood_percentual NUMERIC DEFAULT 0,
  taxa_entrega NUMERIC DEFAULT 0,
  preco_concorrente NUMERIC,
  promocao_ativa BOOLEAN DEFAULT FALSE,
  preco_promocional NUMERIC,
  custo_embalagem NUMERIC DEFAULT 0,
  custo_perdas NUMERIC DEFAULT 0,
  preco_ifood NUMERIC DEFAULT 0,
  preco_uber_eats NUMERIC DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  vendas_dia INTEGER DEFAULT 0,
  ultima_venda TIMESTAMP
);

-- Habilitar RLS na tabela pratos
ALTER TABLE public.pratos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para pratos
CREATE POLICY IF NOT EXISTS "Users can view their restaurant dishes"
  ON public.pratos FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can insert their restaurant dishes"
  ON public.pratos FOR INSERT
  WITH CHECK (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can update their restaurant dishes"
  ON public.pratos FOR UPDATE
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can delete their restaurant dishes"
  ON public.pratos FOR DELETE
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_pratos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_pratos_updated_at
  BEFORE UPDATE ON public.pratos
  FOR EACH ROW EXECUTE FUNCTION public.update_pratos_updated_at();