import { render, screen } from '@testing-library/react';
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
    
    expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    render(<UnifiedDashboard />);
    
    expect(screen.getByText('Receita do Mês')).toBeInTheDocument();
    expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
    expect(screen.getByText('Metas Ativas')).toBeInTheDocument();
    expect(screen.getByText('Itens em Estoque')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    render(<UnifiedDashboard />);
    
    // Verifica se os valores monetários são formatados corretamente
    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });

  it('should show quick actions section', () => {
    render(<UnifiedDashboard />);
    
    expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Fluxo de Caixa')).toBeInTheDocument();
    expect(screen.getByText('Metas')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });
});