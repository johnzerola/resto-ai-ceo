import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isStale: boolean;
  lastFetched: number | null;
}

// Simple cache implementation
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  staleTime: number;
}>();

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  retry = 3,
  retryDelay = 1000,
  onError,
  onSuccess
}: UseOptimizedQueryOptions<T>) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isStale: false,
    lastFetched: null
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkCache = useCallback(() => {
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      return cached.data;
    }
    return null;
  }, [queryKey]);

  const setCache = useCallback((data: T) => {
    queryCache.set(queryKey, {
      data,
      timestamp: Date.now(),
      staleTime
    });
  }, [queryKey, staleTime]);

  const executeQuery = useCallback(async (isRetry = false) => {
    if (!enabled) return;
    
    // Check cache first
    const cachedData = checkCache();
    if (cachedData && !isRetry) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        isLoading: false,
        isError: false,
        error: null,
        isStale: false,
        lastFetched: Date.now()
      }));
      onSuccess?.(cachedData);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      ...(isRetry ? {} : { isError: false, error: null })
    }));

    try {
      const data = await queryFn();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setCache(data);
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        isError: false,
        error: null,
        isStale: false,
        lastFetched: Date.now()
      }));

      retryCountRef.current = 0;
      onSuccess?.(data);
      
    } catch (error: any) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: errorObj
      }));

      onError?.(errorObj);

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          executeQuery(true);
        }, retryDelay * retryCountRef.current);
      }
    }
  }, [enabled, queryFn, checkCache, setCache, onSuccess, onError, retry, retryDelay]);

  const refetch = useCallback(() => {
    executeQuery(false);
  }, [executeQuery]);

  const invalidate = useCallback(() => {
    queryCache.delete(queryKey);
    setState(prev => ({ ...prev, isStale: true }));
  }, [queryKey]);

  useEffect(() => {
    executeQuery();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeQuery]);

  // Cleanup cache on unmount
  useEffect(() => {
    const cleanup = setTimeout(() => {
      queryCache.delete(queryKey);
    }, cacheTime);

    return () => clearTimeout(cleanup);
  }, [queryKey, cacheTime]);

  return {
    ...state,
    refetch,
    invalidate,
    isCached: !!checkCache()
  };
}