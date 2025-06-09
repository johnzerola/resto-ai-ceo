
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

export function useQueryCache() {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  const prefetchQuery = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    config?: CacheConfig
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: config?.staleTime || 1000 * 60 * 5, // 5 minutos
      ...config
    });
  }, [queryClient]);

  const getCachedData = useCallback((queryKey: string[]) => {
    return queryClient.getQueryData(queryKey);
  }, [queryClient]);

  const setCachedData = useCallback((queryKey: string[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  }, [queryClient]);

  return {
    invalidateQueries,
    prefetchQuery,
    getCachedData,
    setCachedData
  };
}

export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config?: CacheConfig
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: config?.staleTime || 1000 * 60 * 5,
    cacheTime: config?.cacheTime || 1000 * 60 * 30,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    ...config
  });
}
