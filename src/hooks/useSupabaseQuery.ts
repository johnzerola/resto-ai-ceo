
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  onError?: (error: Error) => void;
}

export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true, refetchOnMount = true, onError } = options;

  const refetch = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast.error('Erro ao carregar dados', {
          description: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && refetchOnMount) {
      refetch();
    }
  }, [enabled, refetchOnMount]);

  return {
    data,
    loading,
    error,
    refetch
  };
}
