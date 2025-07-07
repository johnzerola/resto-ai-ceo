import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

// Hook otimizado que combina dados do dashboard com memoização inteligente
export function useOptimizedDashboard() {
  const { currentRestaurant, isLoading: authLoading } = useAuth();
  const { 
    dashboardStats, 
    alerts, 
    isLoading: dataLoading, 
    error, 
    refreshData 
  } = useDashboardData();

  // Memoizar dados críticos para evitar recálculos
  const optimizedStats = useMemo(() => ({
    revenue: dashboardStats.totalRevenue,
    profit: dashboardStats.netProfit,
    profitMargin: dashboardStats.profitMargin,
    todaySales: dashboardStats.todaySales,
    activeGoals: dashboardStats.activeGoals,
    completedGoals: dashboardStats.completedGoals,
    inventoryItems: dashboardStats.inventoryItems,
    inventoryValue: dashboardStats.inventoryValue,
    monthlyGrowth: dashboardStats.monthlyGrowth
  }), [
    dashboardStats.totalRevenue,
    dashboardStats.netProfit,
    dashboardStats.profitMargin,
    dashboardStats.todaySales,
    dashboardStats.activeGoals,
    dashboardStats.completedGoals,
    dashboardStats.inventoryItems,
    dashboardStats.inventoryValue,
    dashboardStats.monthlyGrowth
  ]);

  // Memoizar alertas críticos (apenas os 3 primeiros)
  const criticalAlerts = useMemo(() => 
    alerts.slice(0, 3).map(alert => ({
      id: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      priority: alert.priority
    })), [alerts]
  );

  // Status de loading otimizado
  const isLoading = authLoading || dataLoading;

  // Status do restaurante memoizado
  const restaurantStatus = useMemo(() => ({
    hasRestaurant: !!currentRestaurant,
    restaurantName: currentRestaurant?.name || 'Lucraí CEO',
    restaurantId: currentRestaurant?.id
  }), [currentRestaurant?.id, currentRestaurant?.name]);

  return {
    stats: optimizedStats,
    alerts: criticalAlerts,
    restaurant: restaurantStatus,
    isLoading,
    error,
    refreshData
  };
}