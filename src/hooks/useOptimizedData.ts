
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/DataService';

interface UseOptimizedDataOptions<T> {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  useCache?: boolean;
  cacheTtl?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOptimizedData<T>(options: UseOptimizedDataOptions<T>) {
  const { currentRestaurant } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Add restaurant filter automatically if not present
  const filters = {
    ...options.filters,
    ...(currentRestaurant?.id && !options.filters?.restaurant_id && {
      restaurant_id: currentRestaurant.id
    })
  };

  const fetchData = useCallback(async () => {
    if (!currentRestaurant?.id && !options.filters?.restaurant_id) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await dataService.query<T>(options.table, {
        ...options,
        filters
      });
      
      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error(`Erro ao carregar ${options.table}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant?.id, options.table, JSON.stringify(filters)]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return;

    const interval = setInterval(fetchData, options.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, options.autoRefresh, options.refreshInterval]);

  // Listen for data updates
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.table === options.table) {
        fetchData();
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, [fetchData, options.table]);

  const insertItem = useCallback(async (item: Partial<T>): Promise<T | null> => {
    const result = await dataService.insert<T>(options.table, {
      ...item,
      ...(currentRestaurant?.id && { restaurant_id: currentRestaurant.id })
    });
    
    if (result) {
      // Trigger refresh
      fetchData();
      // Notify other components
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: { table: options.table, action: 'insert', data: result }
      }));
    }
    
    return result;
  }, [options.table, currentRestaurant?.id, fetchData]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    const result = await dataService.update<T>(options.table, id, updates);
    
    if (result) {
      // Update local state optimistically
      setData(prev => prev.map(item => 
        (item as any).id === id ? result : item
      ));
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: { table: options.table, action: 'update', data: result }
      }));
    }
    
    return result;
  }, [options.table]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    const success = await dataService.delete(options.table, id);
    
    if (success) {
      // Update local state optimistically
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: { table: options.table, action: 'delete', id }
      }));
    }
    
    return success;
  }, [options.table]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh: fetchData,
    insertItem,
    updateItem,
    deleteItem
  };
}
