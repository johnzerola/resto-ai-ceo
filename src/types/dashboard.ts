// Dashboard types - replacing all `any` types with proper interfaces

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

export interface FinancialData {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  description?: string;
  restaurant_id?: string;
}

export interface GoalData {
  id: string;
  title: string;
  target: number;
  current: number;
  completed: boolean;
  deadline?: string;
  description?: string;
  restaurant_id?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  cost_per_unit: number;
  unit: string;
  category?: string;
  restaurant_id?: string;
}

export interface ChartDataPoint {
  date: string;
  atual: number;
  anterior: number;
  name: string;
}

export interface MonthlyChartData {
  month: string;
  atual: number;
  anterior: number;
  name: string;
}

export interface ComparisonMetrics {
  currentTotal: number;
  previousTotal: number;
  percentageDiff: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  lastUpdate: string;
}

export interface SyncState {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastUpdate: string;
}

export interface BusinessProfile {
  id: string;
  restaurant_id: string;
  owner_name?: string;
  cnpj?: string;
  average_monthly_revenue?: number;
  average_ticket?: number;
  desired_profit_margin?: number;
  fixed_monthly_costs?: number;
  variable_monthly_costs?: number;
  weekly_operating_days?: number;
  daily_operating_hours?: string;
}

export interface ForecastData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: number;
}

export interface AlertData {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  restaurant_id?: string;
  created_at: string;
  resolved?: boolean;
}