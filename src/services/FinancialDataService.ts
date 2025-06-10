
import { dataService } from './DataService';
import { financialValueSchema } from '@/utils/validation';

export interface RestaurantFinancialData {
  id?: string;
  date: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
  payment_method?: string;
  status?: string;
  restaurant_id?: string;
  created_at?: string;
  // Campos calculados para compatibilidade
  revenue?: number;
  expenses?: number;
  profit?: number;
  daily_sales?: number;
  average_ticket?: number;
}

export class FinancialDataService {
  static async getRestaurantFinancialData(restaurantId: string): Promise<RestaurantFinancialData[]> {
    const data = await dataService.query<RestaurantFinancialData>('cash_flow', {
      filters: { restaurant_id: restaurantId },
      orderBy: { column: 'date', ascending: false },
      useCache: true,
      cacheTtl: 30000 // 30 segundos para dados financeiros
    });

    // Transformar dados para adicionar campos calculados
    return data.map(item => ({
      ...item,
      revenue: item.type === 'income' ? item.amount : 0,
      expenses: item.type === 'expense' ? item.amount : 0,
      profit: item.type === 'income' ? item.amount : -item.amount,
      daily_sales: item.type === 'income' ? item.amount : 0,
      average_ticket: item.type === 'income' ? item.amount : 0
    }));
  }

  static async addFinancialEntry(
    restaurantId: string, 
    entry: Omit<RestaurantFinancialData, 'id' | 'created_at' | 'restaurant_id'>
  ): Promise<RestaurantFinancialData | null> {
    // Validate amount
    const validAmount = financialValueSchema.parse(entry.amount);
    
    return dataService.insert<RestaurantFinancialData>('cash_flow', {
      ...entry,
      amount: validAmount,
      restaurant_id: restaurantId
    });
  }

  static async updateFinancialEntry(
    id: string,
    updates: Partial<RestaurantFinancialData>
  ): Promise<RestaurantFinancialData | null> {
    // Validate amount if provided
    if (updates.amount !== undefined) {
      updates.amount = financialValueSchema.parse(updates.amount);
    }
    
    return dataService.update<RestaurantFinancialData>('cash_flow', id, updates);
  }

  static async deleteFinancialEntry(id: string): Promise<boolean> {
    return dataService.delete('cash_flow', id);
  }

  // Analytics methods
  static calculateMonthlyTotals(data: RestaurantFinancialData[]): {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    averageDailyRevenue: number;
  } {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const totalRevenue = monthlyData
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = monthlyData
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const averageDailyRevenue = totalRevenue / daysInMonth;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      averageDailyRevenue
    };
  }

  // Backward compatibility functions for existing components
  static getFinancialData(): any {
    // Return mock data structure for compatibility
    return {
      cashFlow: [],
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      cmvCategories: []
    };
  }

  static updateFinancialData(data: any): void {
    // Dispatch event for backward compatibility
    window.dispatchEvent(new CustomEvent('financialDataUpdated', { detail: data }));
  }

  static dispatchFinancialDataEvent(data: any): void {
    // Dispatch event for module integration
    window.dispatchEvent(new CustomEvent('financialDataUpdated', { detail: data }));
  }
}
