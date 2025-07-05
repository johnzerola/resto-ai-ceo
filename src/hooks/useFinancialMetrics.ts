import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FinancialMetrics {
  cmv_valor: number;
  cmv_percentual: number;
  receita_total: number;
  despesas_operacionais: number;
  lucro_bruto: number;
  margem_bruta_percentual: number;
}

export function useFinancialMetrics() {
  const { currentRestaurant } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    cmv_valor: 0,
    cmv_percentual: 0,
    receita_total: 0,
    despesas_operacionais: 0,
    lucro_bruto: 0,
    margem_bruta_percentual: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadMetrics = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('calcular_metricas_financeiras', {
          restaurant_uuid: currentRestaurant.id
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMetrics(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas financeiras:', error);
      toast.error('Erro ao calcular métricas financeiras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [currentRestaurant]);

  return {
    metrics,
    isLoading,
    reloadMetrics: loadMetrics
  };
}