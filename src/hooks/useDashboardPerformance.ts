import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeGoals: number;
  completedGoals: number;
  inventoryItems: number;
  todaySales: number;
  averageTicket: number;
}

export function useDashboardPerformance() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeGoals: 0,
    completedGoals: 0,
    inventoryItems: 0,
    todaySales: 0,
    averageTicket: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      const startTime = performance.now();
      setIsLoading(true);

      try {
        // Load financial data from localStorage
        const cashFlowData = localStorage.getItem('cashFlowEntries');
        const financialData = cashFlowData ? JSON.parse(cashFlowData) : [];

        // Load goals data
        const goalsData = localStorage.getItem('goals');
        const goals = goalsData ? JSON.parse(goalsData) : [];

        // Load inventory data
        const inventoryData = localStorage.getItem('inventoryItems');
        const inventory = inventoryData ? JSON.parse(inventoryData) : [];

        // Calculate metrics
        const totalRevenue = financialData
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);

        const totalExpenses = financialData
          .filter((entry: any) => entry.type === 'expense')
          .reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);

        const activeGoals = goals.filter((goal: any) => !goal.completed).length;
        const completedGoals = goals.filter((goal: any) => goal.completed).length;

        // Calculate today's sales
        const today = new Date().toISOString().split('T')[0];
        const todaySales = financialData
          .filter((entry: any) => entry.type === 'income' && entry.date === today)
          .reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);

        // Calculate average ticket (simple estimation)
        const totalSalesEntries = financialData.filter((entry: any) => entry.type === 'income').length;
        const averageTicket = totalSalesEntries > 0 ? totalRevenue / totalSalesEntries : 0;

        setDashboardStats({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          activeGoals,
          completedGoals,
          inventoryItems: inventory.length,
          todaySales,
          averageTicket
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep default values on error
      } finally {
        const endTime = performance.now();
        setPerformanceMetrics({
          renderTime: endTime - startTime,
          lastUpdate: new Date().toISOString()
        });
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Listen for data updates
    const handleDataUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('financialDataUpdated', handleDataUpdate);
    window.addEventListener('goalsUpdated', handleDataUpdate);
    window.addEventListener('inventoryUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('financialDataUpdated', handleDataUpdate);
      window.removeEventListener('goalsUpdated', handleDataUpdate);
      window.removeEventListener('inventoryUpdated', handleDataUpdate);
    };
  }, []);

  return {
    dashboardStats,
    isLoading,
    performanceMetrics
  };
}
