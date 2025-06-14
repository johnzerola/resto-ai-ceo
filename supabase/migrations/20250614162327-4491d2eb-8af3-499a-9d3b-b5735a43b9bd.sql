
-- Habilitar RLS na tabela subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem apenas sua própria assinatura
CREATE POLICY "Users can view own subscription" ON public.subscribers
FOR SELECT 
USING (user_id = auth.uid() OR email = auth.email());

-- Política para edge functions atualizarem assinaturas (usando service role)
CREATE POLICY "Service can manage subscriptions" ON public.subscribers
FOR ALL 
USING (true);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);

-- Garantir que tabelas relacionadas também tenham RLS habilitado
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver e recriar
DROP POLICY IF EXISTS "Users can view own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can create restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update own restaurants" ON public.restaurants;

-- Políticas para restaurantes
CREATE POLICY "Users can view own restaurants" ON public.restaurants
FOR SELECT 
USING (owner_id = auth.uid());

CREATE POLICY "Users can create restaurants" ON public.restaurants
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own restaurants" ON public.restaurants
FOR UPDATE 
USING (owner_id = auth.uid());

-- Remover políticas existentes para cash_flow
DROP POLICY IF EXISTS "Users can view cash flow of their restaurants" ON public.cash_flow;
DROP POLICY IF EXISTS "Users can insert cash flow for their restaurants" ON public.cash_flow;

-- Políticas para cash_flow
CREATE POLICY "Users can view cash flow of their restaurants" ON public.cash_flow
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert cash flow for their restaurants" ON public.cash_flow
FOR INSERT 
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Remover políticas existentes para inventory
DROP POLICY IF EXISTS "Users can view inventory of their restaurants" ON public.inventory;
DROP POLICY IF EXISTS "Users can manage inventory of their restaurants" ON public.inventory;

-- Políticas para inventory
CREATE POLICY "Users can view inventory of their restaurants" ON public.inventory
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage inventory of their restaurants" ON public.inventory
FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Remover políticas existentes para recipes
DROP POLICY IF EXISTS "Users can view recipes of their restaurants" ON public.recipes;
DROP POLICY IF EXISTS "Users can manage recipes of their restaurants" ON public.recipes;

-- Políticas para recipes
CREATE POLICY "Users can view recipes of their restaurants" ON public.recipes
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage recipes of their restaurants" ON public.recipes
FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Remover políticas existentes para goals
DROP POLICY IF EXISTS "Users can view goals of their restaurants" ON public.goals;
DROP POLICY IF EXISTS "Users can manage goals of their restaurants" ON public.goals;

-- Políticas para goals
CREATE POLICY "Users can view goals of their restaurants" ON public.goals
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage goals of their restaurants" ON public.goals
FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);
