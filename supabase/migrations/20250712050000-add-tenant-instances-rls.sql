-- Habilitar RLS para tenant_instances
ALTER TABLE public.tenant_instances ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "tenant_isolation_tenant_instances_select" ON public.tenant_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.tenant_id = tenant_instances.tenant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- Política de INSERT
CREATE POLICY "tenant_isolation_tenant_instances_insert" ON public.tenant_instances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.tenant_id = tenant_instances.tenant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- Política de UPDATE
CREATE POLICY "tenant_isolation_tenant_instances_update" ON public.tenant_instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.tenant_id = tenant_instances.tenant_id
        AND restaurants.owner_id = auth.uid()
    )
  );

-- Política de DELETE
CREATE POLICY "tenant_isolation_tenant_instances_delete" ON public.tenant_instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.tenant_id = tenant_instances.tenant_id
        AND restaurants.owner_id = auth.uid()
    )
  );
