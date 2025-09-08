import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache para consultas frequentes
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  USER_DATA: 5 * 60 * 1000, // 5 minutos
  RESTAURANTS: 10 * 60 * 1000, // 10 minutos
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutos
};

export function useOptimizedQueries() {
  const getCachedData = useCallback((key: string) => {
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: any, ttl: number) => {
    queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  // Query otimizada para dados do usuário (combina múltiplas consultas)
  const fetchUserDataOptimized = useCallback(async (userId: string) => {
    const cacheKey = `user_data_${userId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Usar uma única query com joins para buscar todos os dados necessários
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          business_profiles(*)
        `)
        .eq('owner_id', userId)
        .limit(10);

      if (error) throw error;

      const result = {
        restaurants: data || [],
        userRole: data?.[0]?.business_profiles?.[0]?.owner_name ? 'owner' : 'user'
      };

      setCachedData(cacheKey, result, CACHE_TTL.USER_DATA);
      return result;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return { restaurants: [], userRole: 'user' };
    }
  }, [getCachedData, setCachedData]);

  // Query otimizada para dashboard (combina estatísticas)
  const fetchDashboardStatsOptimized = useCallback(async (restaurantId: string) => {
    const cacheKey = `dashboard_${restaurantId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Usar Promise.all para consultas paralelas em vez de sequenciais
      const [financialData, inventoryData, goalsData] = await Promise.all([
        supabase
          .from('cash_flow')
          .select('amount, type, date')
          .eq('restaurant_id', restaurantId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

        supabase
          .from('insumos')
          .select('estoque_atual, preco_unitario')
          .eq('restaurant_id', restaurantId),

        supabase
          .from('goals')
          .select('completed, target')
          .eq('restaurant_id', restaurantId)
      ]);

      const result = {
        financial: financialData.data || [],
        inventory: inventoryData.data || [],
        goals: goalsData.data || []
      };

      setCachedData(cacheKey, result, CACHE_TTL.DASHBOARD_STATS);
      return result;
    } catch (error) {
      console.error('Erro ao buscar stats do dashboard:', error);
      return { financial: [], inventory: [], goals: [] };
    }
  }, [getCachedData, setCachedData]);

  // Limpar cache quando necessário
  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      for (const key of queryCache.keys()) {
        if (key.includes(pattern)) {
          queryCache.delete(key);
        }
      }
    } else {
      queryCache.clear();
    }
  }, []);

  return useMemo(() => ({
    fetchUserDataOptimized,
    fetchDashboardStatsOptimized,
    clearCache,
    getCachedData,
    setCachedData
  }), [fetchUserDataOptimized, fetchDashboardStatsOptimized, clearCache, getCachedData, setCachedData]);
}