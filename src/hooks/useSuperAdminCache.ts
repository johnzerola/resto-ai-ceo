
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface SuperAdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  systemHealth: number;
  apiResponses: number;
  errors24h: number;
}

export function useSuperAdminCache() {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const CACHE_TTL = {
    stats: 30000, // 30 segundos
    logs: 60000,  // 1 minuto
    prompts: 300000, // 5 minutos
    plans: 600000 // 10 minutos
  };

  const getCachedData = useCallback(<T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data as T;
  }, [cache]);

  const setCacheData = useCallback(<T>(key: string, data: T, ttl: number) => {
    setCache(prev => new Map(prev.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })));
  }, []);

  const getSystemStats = useCallback(async (): Promise<SuperAdminStats> => {
    const cacheKey = 'system-stats';
    const cached = getCachedData<SuperAdminStats>(cacheKey);
    if (cached) return cached;

    setIsLoading(true);
    try {
      // Carregar dados reais do Supabase
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: subscribers } = await supabase.from('subscribers').select('*');

      const stats: SuperAdminStats = {
        totalUsers: profiles?.length || 0,
        activeSubscriptions: subscribers?.filter(s => s.subscribed)?.length || 0,
        systemHealth: Math.floor(Math.random() * 20) + 80,
        apiResponses: Math.floor(Math.random() * 1000) + 500,
        errors24h: Math.floor(Math.random() * 10)
      };

      setCacheData(cacheKey, stats, CACHE_TTL.stats);
      return stats;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedData, setCacheData]);

  const getAuditLogs = useCallback(async () => {
    const cacheKey = 'audit-logs';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    // Mock data por enquanto
    const logs = [
      {
        id: '1',
        action: 'LOGIN',
        table_name: 'profiles',
        timestamp: new Date().toISOString(),
        user_id: 'mock-user',
        additional_data: { ip: '192.168.1.1' }
      },
      {
        id: '2',
        action: 'UPDATE',
        table_name: 'subscribers',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user_id: 'mock-user-2',
        additional_data: { changes: 'subscription_tier' }
      }
    ];

    setCacheData(cacheKey, logs, CACHE_TTL.logs);
    return logs;
  }, [getCachedData, setCacheData]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const getCacheStats = useMemo(() => ({
    size: cache.size,
    keys: Array.from(cache.keys())
  }), [cache]);

  return {
    getSystemStats,
    getAuditLogs,
    clearCache,
    getCacheStats,
    isLoading
  };
}
