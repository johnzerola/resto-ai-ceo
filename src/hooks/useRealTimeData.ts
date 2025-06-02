
import { useState, useEffect } from 'react';
import { SupabaseDataService, RestaurantFinancialData } from '@/services/SupabaseDataService';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function useRealTimeData() {
  const { currentRestaurant } = useAuth();
  const { handleAsyncError } = useErrorHandler();
  const [financialData, setFinancialData] = useState<RestaurantFinancialData[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    if (!currentRestaurant?.id) {
      console.warn('Nenhum restaurante selecionado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const [financial, inventory, goalsData] = await Promise.all([
        handleAsyncError(
          () => SupabaseDataService.getRestaurantFinancialData(currentRestaurant.id),
          { 
            showToast: false, // Não mostrar toast para cada erro individual
            logError: true 
          }
        ),
        handleAsyncError(
          () => SupabaseDataService.getInventoryData(currentRestaurant.id),
          { showToast: false, logError: true }
        ),
        handleAsyncError(
          () => SupabaseDataService.getRestaurantGoals(currentRestaurant.id),
          { showToast: false, logError: true }
        )
      ]);

      // Atualizar estados mesmo se alguns dados falharam
      setFinancialData(financial || []);
      setInventoryData(inventory || []);
      setGoals(goalsData || []);
      setLastSync(new Date().toISOString());
      
      console.log('Dados atualizados:', { 
        financial: (financial || []).length, 
        inventory: (inventory || []).length, 
        goals: (goalsData || []).length 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Listener para sincronização automática
    const handleDataSync = () => {
      console.log('Evento de sincronização recebido');
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
    error,
    refreshData
  };
}
