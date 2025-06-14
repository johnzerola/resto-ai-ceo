
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionPlan } from './useSubscriptionPlan';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLAN_LIMITS, checkUsageLimit } from '@/utils/subscription-utils';

interface UsageData {
  restaurants: number;
  menuItems: number;
  cashFlowEntries: number;
  teamMembers: number;
}

export function useUsageLimits() {
  const { planType } = useSubscriptionPlan();
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData>({
    restaurants: 0,
    menuItems: 0,
    cashFlowEntries: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsageData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Buscar IDs dos restaurantes do usuário
      const { data: userRestaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id);

      const restaurantIds = userRestaurants?.map(r => r.id) || [];

      // Buscar quantidade de restaurantes
      const { count: restaurantCount } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Buscar quantidade de receitas/itens do menu
      const { count: menuItemsCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .in('restaurant_id', restaurantIds);

      // Buscar quantidade de registros de fluxo de caixa
      const { count: cashFlowCount } = await supabase
        .from('cash_flow')
        .select('*', { count: 'exact', head: true })
        .in('restaurant_id', restaurantIds);

      // Buscar quantidade de membros da equipe
      const { count: teamMembersCount } = await supabase
        .from('restaurant_members')
        .select('*', { count: 'exact', head: true })
        .in('restaurant_id', restaurantIds);

      setUsage({
        restaurants: restaurantCount || 0,
        menuItems: menuItemsCount || 0,
        cashFlowEntries: cashFlowCount || 0,
        teamMembers: teamMembersCount || 0
      });

    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  const checkLimit = useCallback((limitType: keyof typeof PLAN_LIMITS[typeof planType]) => {
    return checkUsageLimit(planType, limitType, usage[limitType] || 0);
  }, [planType, usage]);

  const canCreate = useCallback((resourceType: keyof UsageData): boolean => {
    const limitCheck = checkLimit(resourceType as any);
    return limitCheck.allowed;
  }, [checkLimit]);

  const getUsagePercentage = useCallback((resourceType: keyof UsageData): number => {
    const limit = PLAN_LIMITS[planType][resourceType as keyof typeof PLAN_LIMITS[typeof planType]];
    if (limit === -1) return 0; // Ilimitado
    
    const currentUsage = usage[resourceType];
    return Math.min((currentUsage / (limit as number)) * 100, 100);
  }, [planType, usage]);

  return {
    usage,
    isLoading,
    checkLimit,
    canCreate,
    getUsagePercentage,
    refreshUsage: fetchUsageData,
    limits: PLAN_LIMITS[planType]
  };
}
