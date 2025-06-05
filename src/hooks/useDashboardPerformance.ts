
import { useState, useEffect } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { getFinancialData } from '@/services/FinancialStorageService';

export interface DashboardStats {
  todaysSales: number;
  averageTicket: number;
  totalGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
}

export function useDashboardPerformance() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todaysSales: 0,
    averageTicket: 0,
    totalGoals: 0,
    completedGoals: 0,
    goalCompletionRate: 0
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    dataLoadTime: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { financialData, goals, refreshData } = useRealTimeData();

  const calculateDashboardStats = async () => {
    const startTime = performance.now();
    
    try {
      // Buscar dados do fluxo de caixa do localStorage (key correta)
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      const cashFlowEntries = cashFlowData ? JSON.parse(cashFlowData) : [];
      
      // Calcular vendas de hoje baseado no fluxo de caixa
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = cashFlowEntries.filter((entry: any) => 
        entry.date === today && entry.type === 'income' && entry.status === 'completed'
      );
      
      const todaysSales = todayEntries.reduce((total: number, entry: any) => total + entry.amount, 0);
      
      // Calcular ticket médio
      const todayCustomers = todayEntries.length || 1; // Evitar divisão por zero
      const averageTicket = todaysSales / todayCustomers;
      
      // Buscar metas
      const goalsData = localStorage.getItem('goals');
      const goalsArray = goalsData ? JSON.parse(goalsData) : [];
      const totalGoals = goalsArray.length;
      const completedGoals = goalsArray.filter((goal: any) => goal.isCompleted).length;
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      
      const stats: DashboardStats = {
        todaysSales,
        averageTicket,
        totalGoals,
        completedGoals,
        goalCompletionRate
      };
      
      setDashboardStats(stats);
      
      const endTime = performance.now();
      setPerformanceMetrics({
        renderTime: endTime - startTime,
        dataLoadTime: endTime - startTime
      });
      
      console.log('Dashboard stats updated:', stats);
      console.log('Today entries found:', todayEntries);
    } catch (error) {
      console.error('Erro ao calcular estatísticas do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateDashboardStats();
    
    // Escutar mudanças no fluxo de caixa e metas
    const handleDataUpdate = () => {
      console.log('Dados atualizados, recalculando dashboard...');
      calculateDashboardStats();
    };

    // Listeners para atualizações (key correta para fluxo de caixa)
    window.addEventListener('cashFlowUpdated', handleDataUpdate);
    window.addEventListener('goalsUpdated', handleDataUpdate);
    window.addEventListener('financialDataUpdated', handleDataUpdate);
    
    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cashFlowEntries' || e.key === 'goals') {
        handleDataUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(calculateDashboardStats, 30000);
    
    return () => {
      window.removeEventListener('cashFlowUpdated', handleDataUpdate);
      window.removeEventListener('goalsUpdated', handleDataUpdate);
      window.removeEventListener('financialDataUpdated', handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    dashboardStats,
    performanceMetrics,
    isLoading,
    refreshData: calculateDashboardStats
  };
}
