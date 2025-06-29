
import { useState, useEffect } from 'react';
import { DeliveryRatesService, DeliveryRate } from '@/services/DeliveryRatesService';
import { useAuth } from '@/contexts/AuthContext';

export function useDeliveryRates() {
  const { currentRestaurant } = useAuth();
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRates = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const data = await DeliveryRatesService.getDeliveryRates(currentRestaurant.id);
      setRates(data);
    } catch (error) {
      console.error('Erro ao carregar taxas de delivery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRate = async (rate: Omit<DeliveryRate, 'id' | 'created_at' | 'updated_at'>) => {
    const success = await DeliveryRatesService.createDeliveryRate(rate);
    if (success) {
      await loadRates();
    }
    return success;
  };

  const updateRate = async (id: string, updates: Partial<DeliveryRate>) => {
    const success = await DeliveryRatesService.updateDeliveryRate(id, updates);
    if (success) {
      await loadRates();
    }
    return success;
  };

  const deleteRate = async (id: string) => {
    const success = await DeliveryRatesService.deleteDeliveryRate(id);
    if (success) {
      await loadRates();
    }
    return success;
  };

  useEffect(() => {
    loadRates();
  }, [currentRestaurant]);

  return {
    rates,
    isLoading,
    createRate,
    updateRate,
    deleteRate,
    reloadRates: loadRates
  };
}
