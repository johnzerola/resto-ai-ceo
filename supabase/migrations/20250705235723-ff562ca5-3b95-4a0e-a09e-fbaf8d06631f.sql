-- Atualizar tipos na tabela supabase types
COMMENT ON TABLE public.categorias_financeiras IS 'Categorias financeiras customizáveis para classificação de receitas e despesas';
COMMENT ON FUNCTION public.calcular_metricas_financeiras(uuid) IS 'Calcula métricas financeiras em tempo real incluindo CMV e margens';