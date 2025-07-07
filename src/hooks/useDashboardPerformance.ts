
import { useDashboardData } from './useOptimizedQueries';

// DEPRECATED: Este hook foi substituído pelo useDashboardData que se conecta ao Supabase
// Mantido apenas para compatibilidade com código legado

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
  // Redirecionar para o hook otimizado que usa Supabase
  const { data, isLoading, error } = useDashboardData();
  
  // Converter dados do Supabase para o formato legado
  const dashboardStats: DashboardStats = {
    totalRevenue: data?.metrics?.receita_total || 0,
    totalExpenses: 0, // Será calculado quando implementarmos despesas
    netProfit: data?.metrics?.lucro_bruto || 0,
    activeGoals: 0, // Será implementado quando conectarmos goals
    completedGoals: 0,
    inventoryItems: 0, // Será implementado quando conectarmos insumos
    todaySales: 0, // Será calculado com filtro de data
    averageTicket: 0,
    profitMargin: data?.metrics?.margem_bruta_percentual || 0,
    monthlyGrowth: 0, // Será calculado com histórico
    inventoryValue: 0
  };

  const performanceMetrics = {
    renderTime: 0,
    lastUpdate: new Date().toISOString()
  };

  return {
    dashboardStats,
    isLoading,
    performanceMetrics
  };
}
