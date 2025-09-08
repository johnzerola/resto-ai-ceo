-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their restaurant dishes" ON public.pratos;
DROP POLICY IF EXISTS "Users can insert their restaurant dishes" ON public.pratos;
DROP POLICY IF EXISTS "Users can update their restaurant dishes" ON public.pratos;
DROP POLICY IF EXISTS "Users can delete their restaurant dishes" ON public.pratos;

-- Criar políticas RLS para pratos
CREATE POLICY "Users can view their restaurant dishes"
  ON public.pratos FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their restaurant dishes"
  ON public.pratos FOR INSERT
  WITH CHECK (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their restaurant dishes"
  ON public.pratos FOR UPDATE
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their restaurant dishes"
  ON public.pratos FOR DELETE
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    UNION
    SELECT restaurant_id FROM public.restaurant_members WHERE user_id = auth.uid()
  ));