
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryCache } from './useQueryCache';

interface SyncOptions {
  syncInterval?: number;
  maxRetries?: number;
  onConflict?: (local: any, remote: any) => any;
}

export function useDataSync<T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  saveFn: (data: T) => Promise<void>,
  options: SyncOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const { getCachedData, setCachedData, invalidateQueries } = useQueryCache();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const {
    syncInterval = 30000, // 30 segundos
    maxRetries = 3,
    onConflict
  } = options;

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);
    
    try {
      // Verificar cache primeiro
      const cachedData = getCachedData(queryKey) as T | undefined;
      if (cachedData) {
        setData(cachedData);
      }

      // Buscar dados remotos
      const remoteData = await fetchFn();
      
      // Verificar conflitos se há dados em cache
      if (cachedData && onConflict) {
        const resolvedData = onConflict(cachedData, remoteData);
        setData(resolvedData);
        setCachedData(queryKey, resolvedData);
      } else {
        setData(remoteData);
        setCachedData(queryKey, remoteData);
      }
      
      setLastSync(new Date());
      retryCountRef.current = 0;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSyncError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [queryKey, fetchFn, getCachedData, setCachedData, onConflict]);

  // Salvar dados
  const saveData = useCallback(async (newData: T) => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      await saveFn(newData);
      setData(newData);
      setCachedData(queryKey, newData);
      setLastSync(new Date());
      
      // Invalidar queries relacionadas
      invalidateQueries(queryKey);
      
      // Disparar evento para outros componentes
      window.dispatchEvent(new CustomEvent('dataSync', {
        detail: { queryKey, data: newData }
      }));
      
      retryCountRef.current = 0;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      setSyncError(error instanceof Error ? error.message : 'Erro ao salvar');
      
      // Tentar novamente se não excedeu o limite
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => saveData(newData), 1000 * retryCountRef.current);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [saveFn, queryKey, setCachedData, invalidateQueries, maxRetries]);

  // Sincronização automática
  const startAutoSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      loadData();
      startAutoSync(); // Reagendar
    }, syncInterval);
  }, [loadData, syncInterval]);

  const stopAutoSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
  }, []);

  // Inicializar
  useEffect(() => {
    loadData();
    startAutoSync();
    
    return () => {
      stopAutoSync();
    };
  }, [loadData, startAutoSync, stopAutoSync]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isSyncing,
    lastSync,
    syncError,
    saveData,
    refreshData: loadData,
    startAutoSync,
    stopAutoSync
  };
}
