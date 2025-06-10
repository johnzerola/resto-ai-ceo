
-- Corrigir problemas de segurança identificados pelo Security Advisor
-- (Removendo ALTER SYSTEM que não pode ser executado em transação)

-- 1. Corrigir search_path para as funções (torná-las mais seguras)
ALTER FUNCTION public.update_pricing_models_updated_at() SET search_path = '';
ALTER FUNCTION public.calcular_custos_prato(uuid) SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- 2. Garantir que todas as tabelas sensíveis tenham RLS habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes_por_prato ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS básicas para tabelas que não têm
-- Profiles - usuários só podem ver e editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

-- Restaurants - usuários só podem ver restaurantes que possuem
CREATE POLICY "Users can view own restaurants" ON public.restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own restaurants" ON public.restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Cash Flow - usuários só podem ver dados dos seus restaurantes
CREATE POLICY "Users can view cash flow of their restaurants" ON public.cash_flow
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cash flow for their restaurants" ON public.cash_flow
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Goals - usuários só podem ver metas dos seus restaurantes
CREATE POLICY "Users can view goals of their restaurants" ON public.goals
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Inventory - usuários só podem ver inventário dos seus restaurantes
CREATE POLICY "Users can view inventory of their restaurants" ON public.inventory
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Recipes - usuários só podem ver receitas dos seus restaurantes
CREATE POLICY "Users can view recipes of their restaurants" ON public.recipes
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Insumos - usuários só podem ver insumos dos seus restaurantes
CREATE POLICY "Users can view insumos of their restaurants" ON public.insumos
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Pratos - usuários só podem ver pratos dos seus restaurantes
CREATE POLICY "Users can view pratos of their restaurants" ON public.pratos
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );
