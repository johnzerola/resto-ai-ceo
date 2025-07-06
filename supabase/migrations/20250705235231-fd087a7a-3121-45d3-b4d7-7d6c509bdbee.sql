-- Criar tabela para categorias customizáveis de despesas
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  impacta_cmv boolean NOT NULL DEFAULT false,
  impacta_dre boolean NOT NULL DEFAULT true,
  cor text DEFAULT '#64748b',
  icone text DEFAULT 'circle',
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their restaurant financial categories" 
ON public.categorias_financeiras 
FOR ALL 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_categorias_financeiras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categorias_financeiras_updated_at
  BEFORE UPDATE ON public.categorias_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_categorias_financeiras_updated_at();

-- Função para calcular métricas financeiras em tempo real
CREATE OR REPLACE FUNCTION public.calcular_metricas_financeiras(restaurant_uuid uuid)
RETURNS TABLE(
  cmv_valor numeric,
  cmv_percentual numeric,
  receita_total numeric,
  despesas_operacionais numeric,
  lucro_bruto numeric,
  margem_bruta_percentual numeric
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_receita_total NUMERIC := 0;
  v_cmv_total NUMERIC := 0;
  v_despesas_operacionais NUMERIC := 0;
BEGIN
  -- Calcular receita total do mês atual
  SELECT COALESCE(SUM(amount), 0) INTO v_receita_total
  FROM public.cash_flow cf
  WHERE cf.restaurant_id = restaurant_uuid
    AND cf.type = 'income'
    AND cf.status = 'paid'
    AND EXTRACT(MONTH FROM cf.date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM cf.date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Calcular CMV (despesas que impactam CMV)
  SELECT COALESCE(SUM(cf.amount), 0) INTO v_cmv_total
  FROM public.cash_flow cf
  JOIN public.categorias_financeiras cat ON cf.category = cat.nome
  WHERE cf.restaurant_id = restaurant_uuid
    AND cf.type = 'expense'
    AND cf.status = 'paid'
    AND cat.impacta_cmv = true
    AND EXTRACT(MONTH FROM cf.date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM cf.date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Calcular despesas operacionais (despesas que não impactam CMV)
  SELECT COALESCE(SUM(cf.amount), 0) INTO v_despesas_operacionais
  FROM public.cash_flow cf
  JOIN public.categorias_financeiras cat ON cf.category = cat.nome
  WHERE cf.restaurant_id = restaurant_uuid
    AND cf.type = 'expense'
    AND cf.status = 'paid'
    AND cat.impacta_cmv = false
    AND EXTRACT(MONTH FROM cf.date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM cf.date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Retornar métricas calculadas
  cmv_valor := v_cmv_total;
  cmv_percentual := CASE WHEN v_receita_total > 0 THEN (v_cmv_total / v_receita_total) * 100 ELSE 0 END;
  receita_total := v_receita_total;
  despesas_operacionais := v_despesas_operacionais;
  lucro_bruto := v_receita_total - v_cmv_total;
  margem_bruta_percentual := CASE WHEN v_receita_total > 0 THEN ((v_receita_total - v_cmv_total) / v_receita_total) * 100 ELSE 0 END;

  RETURN NEXT;
END;
$$;