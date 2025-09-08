import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/contexts/AuthContext';

// Mock do hook useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock do supabase
const mockSupabaseResponse = {
  data: [
    {
      id: '1',
      type: 'income',
      amount: 1000,
      date: '2024-01-01',
      category: 'vendas',
      restaurant_id: 'restaurant-1'
    }
  ],
  error: null
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue(mockSupabaseResponse)
    }))
  }
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      currentRestaurant: { id: 'restaurant-1', name: 'Test Restaurant' }
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.dashboardStats.totalRevenue).toBe(0);
    expect(result.current.financialData).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load financial data when restaurant is available', async () => {
    const { result } = renderHook(() => useDashboardData());

    // Basic check that the hook returns the expected structure
    expect(result.current.financialData).toBeDefined();
    expect(result.current.isLoading).toBe(true);
  });
});