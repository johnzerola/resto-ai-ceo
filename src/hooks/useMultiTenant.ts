import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TenantContext {
  tenantId: string | null;
  instanceId: string | null;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'inactive';
  trialEnd: string | null;
}

interface UsageQuotas {
  transactions: { used: number; limit: number };
  inventory: { used: number; limit: number };
  fixedExpenses: { used: number; limit: number };
  whatsappMessages: { used: number; limit: number };
}

const PLAN_LIMITS = {
  basic: {
    transactions: 100,
    inventory: 50,
    fixedExpenses: 10,
    whatsappMessages: 50
  },
  premium: {
    transactions: 500,
    inventory: 200,
    fixedExpenses: 50,
    whatsappMessages: 200
  },
  enterprise: {
    transactions: -1, // unlimited
    inventory: -1,
    fixedExpenses: -1,
    whatsappMessages: -1
  }
};

export function useMultiTenant() {
  const [tenantContext, setTenantContext] = useState<TenantContext>({
    tenantId: null,
    instanceId: null,
    subscriptionTier: 'basic',
    status: 'active',
    trialEnd: null
  });
  
  const [usageQuotas, setUsageQuotas] = useState<UsageQuotas>({
    transactions: { used: 0, limit: 100 },
    inventory: { used: 0, limit: 50 },
    fixedExpenses: { used: 0, limit: 10 },
    whatsappMessages: { used: 0, limit: 50 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { user, currentRestaurant } = useAuth();

  // Inicializar contexto do tenant
  const initializeTenant = useCallback(async () => {
    if (!user || !currentRestaurant) return;

    try {
      setIsLoading(true);

      // Buscar tenant_id do restaurante
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('tenant_id')
        .eq('id', currentRestaurant.id)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Erro ao buscar tenant_id:', restaurantError);
        return;
      }

      // Buscar ou criar tenant_instance
      let { data: tenantInstance, error: tenantError } = await supabase
        .from('tenant_instances')
        .select('*')
        .eq('tenant_id', restaurant.tenant_id)
        .single();

      if (tenantError && tenantError.code === 'PGRST116') {
        // Criar tenant_instance se não existir
        const { data: newTenantInstance, error: createError } = await supabase
          .from('tenant_instances')
          .insert({
            tenant_id: restaurant.tenant_id,
            instance_id: `instance_${restaurant.tenant_id.substring(0, 8)}`,
            name: currentRestaurant.name,
            status: 'active',
            subscription_tier: 'basic',
            trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar tenant_instance:', createError);
          return;
        }

        tenantInstance = newTenantInstance;
      }

      if (!tenantInstance) return;

      // Atualizar contexto
      setTenantContext({
        tenantId: tenantInstance.tenant_id,
        instanceId: tenantInstance.instance_id,
        subscriptionTier: tenantInstance.subscription_tier as 'basic' | 'premium' | 'enterprise',
        status: tenantInstance.status as 'active' | 'suspended' | 'inactive',
        trialEnd: tenantInstance.trial_end
      });

      // Atualizar quotas de uso
      const limits = PLAN_LIMITS[tenantInstance.subscription_tier as keyof typeof PLAN_LIMITS];
      await updateUsageQuotas(restaurant.tenant_id, limits);

    } catch (error) {
      console.error('Erro ao inicializar tenant:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentRestaurant]);

  // Atualizar quotas de uso
  const updateUsageQuotas = async (tenantId: string, limits: any) => {
    try {
      // Contar transações do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('cash_flow')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .gte('created_at', startOfMonth.toISOString());

      // Contar itens do inventário
      const { data: inventory } = await supabase
        .from('inventory')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId);

      // Contar despesas fixas
      const { data: fixedExpenses } = await supabase
        .from('fixed_expenses')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('active', true);

      setUsageQuotas({
        transactions: {
          used: transactions?.length || 0,
          limit: limits.transactions
        },
        inventory: {
          used: inventory?.length || 0,
          limit: limits.inventory
        },
        fixedExpenses: {
          used: fixedExpenses?.length || 0,
          limit: limits.fixedExpenses
        },
        whatsappMessages: {
          used: 0, // TODO: Implementar contagem de mensagens WhatsApp
          limit: limits.whatsappMessages
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar quotas:', error);
    }
  };

  // Verificar se pode criar recurso
  const canCreateResource = (resourceType: keyof UsageQuotas): boolean => {
    const quota = usageQuotas[resourceType];
    
    // Se unlimited (-1), sempre pode criar
    if (quota.limit === -1) return true;
    
    // Verificar se ainda tem quota disponível
    return quota.used < quota.limit;
  };

  // Verificar se trial está ativo
  const isTrialActive = (): boolean => {
    if (!tenantContext.trialEnd) return false;
    return new Date(tenantContext.trialEnd) > new Date();
  };

  // Verificar se assinatura está ativa
  const isSubscriptionActive = (): boolean => {
    if (tenantContext.status !== 'active') return false;
    
    // Se tem trial ativo, está ativo
    if (isTrialActive()) return true;
    
    // Se não tem trial, verificar se tem assinatura paga
    return tenantContext.subscriptionTier !== 'basic';
  };

  // Headers para requests multi-tenant
  const getTenantHeaders = () => ({
    'X-Tenant-ID': tenantContext.tenantId || '',
    'X-Instance-ID': tenantContext.instanceId || ''
  });

  // Executar request com headers multi-tenant
  const executeWithTenantContext = async <T>(
    operation: (headers: Record<string, string>) => Promise<T>
  ): Promise<T> => {
    if (!tenantContext.tenantId || !tenantContext.instanceId) {
      throw new Error('Contexto multi-tenant não inicializado');
    }

    if (!isSubscriptionActive()) {
      throw new Error('Assinatura inativa. Renove para continuar usando.');
    }

    return operation(getTenantHeaders());
  };

  useEffect(() => {
    initializeTenant();
  }, [initializeTenant]);

  return {
    tenantContext,
    usageQuotas,
    isLoading,
    canCreateResource,
    isTrialActive,
    isSubscriptionActive,
    getTenantHeaders,
    executeWithTenantContext,
    refreshContext: initializeTenant
  };
}