
// DEPRECATED: This hook is replaced by useDashboardData for better type safety and error handling
// This file is kept for backward compatibility but should not be used in new components

import { useDashboardData } from './useDashboardData';

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeGoals: number;
  completedGoals: number;
  inventoryItems: number;
  todaySales: number;
  averageTicket: number;
  profitMargin: number;
  monthlyGrowth: number;
  inventoryValue: number;
}

export function useDashboardPerformance() {
  const { dashboardStats, isLoading } = useDashboardData();
  
  return {
    dashboardStats,
    isLoading,
    performanceMetrics: {
      renderTime: 0,
      lastUpdate: new Date().toISOString()
    }
  };
}
