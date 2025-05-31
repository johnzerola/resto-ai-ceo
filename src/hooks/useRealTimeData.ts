
import { useState, useEffect } from 'react';
import { SupabaseDataService, RestaurantFinancialData } from '@/services/SupabaseDataService';
import { useAuth } from '@/contexts/AuthContext';

export function useRealTimeData() {
  const { currentRestaurant } = useAuth();
  const [financialData, setFinancialData] = useState<RestaurantFinancialData[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refreshData = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const [financial, inventory, goalsData] = await Promise.all([
        SupabaseDataService.getRestaurantFinancialData(currentRestaurant.id),
        SupabaseDataService.getInventoryData(currentRestaurant.id),
        SupabaseDataService.getRestaurantGoals(currentRestaurant.id)
      ]);

      setFinancialData(financial);
      setInventoryData(inventory);
      setGoals(goalsData);
      setLastSync(new Date().toISOString());
      
      console.log('Dados atualizados:', { financial: financial.length, inventory: inventory.length, goals: goalsData.length });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Listener para sincronização automática
    const handleDataSync = () => {
      refreshData();
    };

    window.addEventListener('dataSync', handleDataSync);
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(refreshData, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('dataSync', handleDataSync);
      clearInterval(interval);
    };
  }, [currentRestaurant?.id]);

  return {
    financialData,
    inventoryData,
    goals,
    isLoading,
    lastSync,
    refreshData
  };
}
