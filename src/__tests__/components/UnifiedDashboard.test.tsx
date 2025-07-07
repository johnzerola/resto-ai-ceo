import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';

// Mock do hook useDashboardData
vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(() => ({
    dashboardStats: {
      totalRevenue: 1000,
      totalExpenses: 500,
      netProfit: 500,
      activeGoals: 3,
      completedGoals: 2,
      inventoryItems: 10,
      todaySales: 200,
      averageTicket: 50,
      profitMargin: 50,
      monthlyGrowth: 10,
      inventoryValue: 5000
    },
    alerts: [],
    isLoading: false,
    error: null,
    refreshData: vi.fn()
  }))
}));

// Mock do hook useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    currentRestaurant: { id: '1', name: 'Test Restaurant' }
  }))
}));

describe('UnifiedDashboard', () => {
  it('should render dashboard header', () => {
    render(<UnifiedDashboard />);
    
    expect(document.body).toContainHTML('Dashboard Unificado');
  });

  it('should render all stat cards', () => {
    render(<UnifiedDashboard />);
    
    expect(document.body).toContainHTML('Receita do Mês');
    expect(document.body).toContainHTML('Lucro Líquido');
    expect(document.body).toContainHTML('Metas Ativas');
    expect(document.body).toContainHTML('Itens em Estoque');
  });

  it('should format currency values correctly', () => {
    render(<UnifiedDashboard />);
    
    // Verifica se os valores monetários são formatados corretamente
    expect(document.body).toContainHTML('R$');
  });

  it('should show quick actions section', () => {
    render(<UnifiedDashboard />);
    
    expect(document.body).toContainHTML('Ações Rápidas');
    expect(document.body).toContainHTML('Fluxo de Caixa');
    expect(document.body).toContainHTML('Metas');
    expect(document.body).toContainHTML('Estoque');
    expect(document.body).toContainHTML('Relatórios');
  });
});