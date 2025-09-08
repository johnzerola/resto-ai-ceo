-- FASE 1: ESTRUTURA MULTI-TENANT
-- 1. Criar tabela fixed_expenses completa
CREATE TABLE IF NOT EXISTS public.fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_day INTEGER NOT NULL DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT NOT NULL DEFAULT 'operational',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  auto_pay BOOLEAN DEFAULT false,
  notification_days INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Índices para performance
  CONSTRAINT unique_tenant_restaurant_name UNIQUE (tenant_id, restaurant_id, name)
);

-- Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_tenant_id ON public.fixed_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_restaurant_id ON public.fixed_expenses(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_due_day ON public.fixed_expenses(due_day);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_active ON public.fixed_expenses(active) WHERE active = true;

-- 2. Adicionar tenant_id às tabelas principais se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.restaurants ADD COLUMN tenant_id UUID;
    UPDATE public.restaurants SET tenant_id = gen_random_uuid() WHERE tenant_id IS NULL;
    ALTER TABLE public.restaurants ALTER COLUMN tenant_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_restaurants_tenant_id ON public.restaurants(tenant_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cash_flow' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.cash_flow ADD COLUMN tenant_id UUID;
    -- Atualizar com tenant_id do restaurante
    UPDATE public.cash_flow 
    SET tenant_id = (SELECT tenant_id FROM public.restaurants WHERE restaurants.id = cash_flow.restaurant_id)
    WHERE tenant_id IS NULL;
    CREATE INDEX IF NOT EXISTS idx_cash_flow_tenant_id ON public.cash_flow(tenant_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.inventory ADD COLUMN tenant_id UUID;
    UPDATE public.inventory 
    SET tenant_id = (SELECT tenant_id FROM public.restaurants WHERE restaurants.id = inventory.restaurant_id)
    WHERE tenant_id IS NULL;
    CREATE INDEX IF NOT EXISTS idx_inventory_tenant_id ON public.inventory(tenant_id);
  END IF;
END $$;

-- 3. Criar tabela tenant_instances para mapear tenant_id → instance_id
CREATE TABLE IF NOT EXISTS public.tenant_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE,
  instance_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  subscription_tier TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para tenant_instances
CREATE INDEX IF NOT EXISTS idx_tenant_instances_tenant_id ON public.tenant_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_instance_id ON public.tenant_instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_status ON public.tenant_instances(status);

-- 4. RLS Policies para isolamento multi-tenant
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

-- Fixed Expenses RLS
CREATE POLICY "tenant_isolation_fixed_expenses_select" ON public.fixed_expenses
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.restaurants WHERE id = fixed_expenses.restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_fixed_expenses_insert" ON public.fixed_expenses
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.restaurants WHERE id = fixed_expenses.restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_fixed_expenses_update" ON public.fixed_expenses
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.restaurants WHERE id = fixed_expenses.restaurant_id AND owner_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_fixed_expenses_delete" ON public.fixed_expenses
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.restaurants WHERE id = fixed_expenses.restaurant_id AND owner_id = auth.uid())
  );

-- Atualizar RLS existentes para incluir tenant_id
DROP POLICY IF EXISTS "Users can manage their restaurant cash flow" ON public.cash_flow;
CREATE POLICY "tenant_isolation_cash_flow" ON public.cash_flow
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid() AND tenant_id = cash_flow.tenant_id
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid() AND tenant_id = cash_flow.tenant_id
    )
  );

-- Função para obter tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id 
  FROM public.restaurants 
  WHERE owner_id = auth.uid() 
  LIMIT 1;
$$;

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fixed_expenses_updated_at
  BEFORE UPDATE ON public.fixed_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_instances_updated_at
  BEFORE UPDATE ON public.tenant_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();