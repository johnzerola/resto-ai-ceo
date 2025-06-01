
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRealTimeData } from './useRealTimeData';

export function useDashboardPerformance() {
  const { financialData, goals, isLoading } = useRealTimeData();
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    lastUpdate: Date.now()
  });

  // Memoized calculations to prevent unnecessary re-renders
  const dashboardStats = useMemo(() => {
    const startTime = performance.now();
    
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.completed).length;
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    const stats = {
      todaysSales: financialData.length > 0 ? financialData[0]?.daily_sales || 0 : 0,
      averageTicket: financialData.length > 0 ? financialData[0]?.average_ticket || 0 : 0,
      totalGoals,
      completedGoals,
      goalCompletionRate,
      cmvPercentage: financialData.length > 0 ? financialData[0]?.cmv_percentage || 0 : 0,
      profitMargin: financialData.length > 0 ? financialData[0]?.profit_margin || 0 : 0
    };

    const endTime = performance.now();
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime: endTime - startTime
    }));

    return stats;
  }, [financialData, goals]);

  // Optimized data refresh callback
  const refreshDashboard = useCallback(() => {
    setPerformanceMetrics(prev => ({
      ...prev,
      lastUpdate: Date.now()
    }));
  }, []);

  // Auto-refresh every 5 minutes for better UX
  useEffect(() => {
    const interval = setInterval(refreshDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshDashboard]);

  return {
    dashboardStats,
    isLoading,
    performanceMetrics,
    refreshDashboard
  };
}
