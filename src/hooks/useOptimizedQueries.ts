import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Cache keys padronizadas
export const QUERY_KEYS = {
  RESTAURANT: (id: string) => ['restaurant', id],
  CASH_FLOW: (restaurantId: string) => ['cash_flow', restaurantId],
  INSUMOS: (restaurantId: string) => ['insumos', restaurantId],
  PRATOS: (restaurantId: string) => ['pratos', restaurantId],
  BUSINESS_PROFILE: (restaurantId: string) => ['business_profile', restaurantId],
  FINANCIAL_METRICS: (restaurantId: string) => ['financial_metrics', restaurantId],
  USER_PERMISSIONS: (userId: string) => ['user_permissions', userId],
  DASHBOARD_DATA: (restaurantId: string) => ['dashboard_data', restaurantId],
} as const;

// Hook otimizado para queries com cache inteligente
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000, // 10 minutos
    enabled = true,
    refetchOnMount = false
  } = options || {};

  return useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    refetchOnMount,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook para dados do dashboard com cache otimizado
export function useDashboardData() {
  const { currentRestaurant } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => 
    currentRestaurant ? QUERY_KEYS.DASHBOARD_DATA(currentRestaurant.id) : null,
    [currentRestaurant?.id]
  );

  // Invalidar cache quando necessário
  const invalidateCache = useCallback(() => {
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey]);

  // Função otimizada de fetch
  const fetchDashboardData = useCallback(async () => {
    if (!currentRestaurant?.id) throw new Error('Restaurant not found');

    // Buscar dados em paralelo para performance
    const [cashFlow, metrics, profile] = await Promise.all([
      supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('date', { ascending: false })
        .limit(30),
      supabase
        .rpc('calcular_metricas_financeiras', { restaurant_uuid: currentRestaurant.id }),
      supabase
        .from('business_profiles')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single()
    ]);

    return {
      cashFlow: cashFlow.data || [],
      metrics: metrics.data?.[0] || null,
      profile: profile.data || null,
      lastUpdated: new Date().toISOString()
    };
  }, [currentRestaurant?.id]);

  const query = useOptimizedQuery(
    queryKey || ['dashboard_empty'],
    fetchDashboardData,
    {
      enabled: !!currentRestaurant?.id,
      staleTime: 2 * 60 * 1000, // 2 minutos para dashboard
      cacheTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  return {
    ...query,
    invalidateCache,
  };
}

// Hook para dados de insumos com cache
export function useInsumosData() {
  const { currentRestaurant } = useAuth();

  const queryKey = useMemo(() => 
    currentRestaurant ? QUERY_KEYS.INSUMOS(currentRestaurant.id) : null,
    [currentRestaurant?.id]
  );

  const fetchInsumos = useCallback(async () => {
    if (!currentRestaurant?.id) throw new Error('Restaurant not found');

    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .eq('restaurant_id', currentRestaurant.id)
      .order('nome');

    if (error) throw error;
    return data || [];
  }, [currentRestaurant?.id]);

  return useOptimizedQuery(
    queryKey || ['insumos_empty'],
    fetchInsumos,
    {
      enabled: !!currentRestaurant?.id,
      staleTime: 10 * 60 * 1000, // 10 minutos - dados menos voláteis
    }
  );
}

// Hook para invalidar múltiplas queries
export function useQueryInvalidation() {
  const queryClient = useQueryClient();
  const { currentRestaurant } = useAuth();

  const invalidateRestaurantData = useCallback(() => {
    if (!currentRestaurant?.id) return;

    // Invalidar todas as queries relacionadas ao restaurante
    queryClient.invalidateQueries({ 
      queryKey: ['restaurant', currentRestaurant.id] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['dashboard_data', currentRestaurant.id] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['cash_flow', currentRestaurant.id] 
    });
  }, [queryClient, currentRestaurant?.id]);

  const invalidateFinancialData = useCallback(() => {
    if (!currentRestaurant?.id) return;

    queryClient.invalidateQueries({ 
      queryKey: ['cash_flow', currentRestaurant.id] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['financial_metrics', currentRestaurant.id] 
    });
  }, [queryClient, currentRestaurant?.id]);

  return {
    invalidateRestaurantData,
    invalidateFinancialData,
  };
}