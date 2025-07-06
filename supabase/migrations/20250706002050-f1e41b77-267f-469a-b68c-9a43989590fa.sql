-- Criar tabela para salvar simulações de preços
CREATE TABLE public.simulacoes_precos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  nome_produto TEXT NOT NULL,
  custo_direto NUMERIC NOT NULL DEFAULT 0,
  custo_mao_obra NUMERIC NOT NULL DEFAULT 0,
  custos_fixos NUMERIC NOT NULL DEFAULT 0,
  margem_desejada NUMERIC NOT NULL DEFAULT 30,
  impostos_percentual NUMERIC NOT NULL DEFAULT 12,
  taxa_entrega NUMERIC NOT NULL DEFAULT 0,
  taxa_plataforma NUMERIC NOT NULL DEFAULT 0,
  precos_concorrentes JSONB DEFAULT '[]'::jsonb,
  preco_sugerido NUMERIC NOT NULL DEFAULT 0,
  lucro_bruto NUMERIC NOT NULL DEFAULT 0,
  markup_calculado NUMERIC NOT NULL DEFAULT 0,
  status_viabilidade TEXT NOT NULL DEFAULT 'neutro',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.simulacoes_precos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can manage their restaurant price simulations"
ON public.simulacoes_precos
FOR ALL
USING (
  restaurant_id IN (
    SELECT restaurants.id FROM restaurants 
    WHERE restaurants.owner_id = auth.uid()
  )
);

-- Criar índices para performance
CREATE INDEX idx_simulacoes_precos_restaurant_id ON public.simulacoes_precos(restaurant_id);
CREATE INDEX idx_simulacoes_precos_user_id ON public.simulacoes_precos(user_id);
CREATE INDEX idx_simulacoes_precos_created_at ON public.simulacoes_precos(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_simulacoes_precos_updated_at
  BEFORE UPDATE ON public.simulacoes_precos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();