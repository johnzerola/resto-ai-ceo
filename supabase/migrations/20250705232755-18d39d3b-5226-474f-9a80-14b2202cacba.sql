-- Criar tabela para projeções financeiras
CREATE TABLE public.projecoes_financeiras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  nome_projecao text NOT NULL,
  receita_mensal_atual numeric NOT NULL DEFAULT 0,
  despesas_mensais_atuais numeric NOT NULL DEFAULT 0,
  taxa_crescimento_anual numeric NOT NULL DEFAULT 5,
  periodo_meses integer NOT NULL DEFAULT 12,
  receita_projetada_final numeric DEFAULT 0,
  lucro_projetado_final numeric DEFAULT 0,
  margem_final_percentual numeric DEFAULT 0,
  dados_mensais jsonb DEFAULT '[]'::jsonb,
  cenario_selecionado text DEFAULT 'moderado',
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projecoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their restaurant projections" 
ON public.projecoes_financeiras 
FOR SELECT 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can insert their restaurant projections" 
ON public.projecoes_financeiras 
FOR INSERT 
WITH CHECK (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can update their restaurant projections" 
ON public.projecoes_financeiras 
FOR UPDATE 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can delete their restaurant projections" 
ON public.projecoes_financeiras 
FOR DELETE 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_projecoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projecoes_financeiras_updated_at
  BEFORE UPDATE ON public.projecoes_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_projecoes_updated_at();