import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DashboardStats, 
  FinancialData, 
  GoalData, 
  InventoryItem,
  BusinessProfile,
  AlertData 
} from '@/types/dashboard';
import { toast } from 'sonner';

// Cache para evitar refetch desnecessário
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const dataCache = new Map<string, { data: any; timestamp: number }>();

const getCachedData = (key: string) => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  dataCache.set(key, { data, timestamp: Date.now() });
};

export function useDashboardData() {
  const { currentRestaurant } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeGoals: 0,
    completedGoals: 0,
    inventoryItems: 0,
    todaySales: 0,
    averageTicket: 0,
    profitMargin: 0,
    monthlyGrowth: 0,
    inventoryValue: 0
  });
  
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialData = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    const cacheKey = `financial_${currentRestaurant.id}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      setFinancialData(cached);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('date', { ascending: false })
        .limit(100); // Limitar para os últimos 100 registros

      if (error) throw error;

      const typedData: FinancialData[] = data?.map(item => ({
        id: item.id,
        type: item.type as 'income' | 'expense',
        amount: item.amount,
        date: item.date,
        category: item.category,
        description: item.description,
        restaurant_id: item.restaurant_id
      })) || [];

      setFinancialData(typedData);
      setCachedData(cacheKey, typedData);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError('Erro ao carregar dados financeiros');
      toast.error('Erro ao carregar dados financeiros');
    }
  }, [currentRestaurant?.id]);

  const loadGoals = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (error) throw error;

      const typedData: GoalData[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        target: item.target,
        current: item.current || 0,
        completed: item.completed || false,
        deadline: item.deadline,
        description: item.description,
        restaurant_id: item.restaurant_id
      })) || [];

      setGoals(typedData);
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
      setError('Erro ao carregar metas');
      toast.error('Erro ao carregar metas');
    }
  }, [currentRestaurant?.id]);

  const loadInventory = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (error) throw error;

      const typedData: InventoryItem[] = data?.map(item => ({
        id: item.id,
        name: item.nome,
        quantity: item.estoque_atual || 0,
        minStock: item.estoque_minimo || 0,
        cost_per_unit: item.preco_unitario || 0,
        unit: item.unidade_medida,
        category: item.categoria,
        restaurant_id: item.restaurant_id
      })) || [];

      setInventory(typedData);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
      setError('Erro ao carregar estoque');
      toast.error('Erro ao carregar estoque');
    }
  }, [currentRestaurant?.id]);

  const loadBusinessProfile = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBusinessProfile({
          id: data.id,
          restaurant_id: data.restaurant_id,
          owner_name: data.owner_name,
          cnpj: data.cnpj,
          average_monthly_revenue: data.average_monthly_revenue,
          average_ticket: data.average_ticket,
          desired_profit_margin: data.desired_profit_margin,
          fixed_monthly_costs: data.fixed_monthly_costs,
          variable_monthly_costs: data.variable_monthly_costs,
          weekly_operating_days: data.weekly_operating_days,
          daily_operating_hours: data.daily_operating_hours
        });
      }
    } catch (err) {
      console.error('Erro ao carregar perfil empresarial:', err);
      // Não mostra erro para perfil empresarial pois pode não existir
    }
  }, [currentRestaurant?.id]);

  const loadAlerts = useCallback(async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('resolvido', false)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      const typedData: AlertData[] = data?.map(item => ({
        id: item.id,
        type: item.prioridade === 'alta' ? 'error' : item.prioridade === 'media' ? 'warning' : 'info',
        title: item.titulo,
        message: item.mensagem,
        priority: item.prioridade as 'high' | 'medium' | 'low',
        restaurant_id: item.restaurant_id,
        created_at: item.data_criacao,
        resolved: item.resolvido
      })) || [];

      setAlerts(typedData);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      // Não mostra erro para alertas
    }
  }, [currentRestaurant?.id]);

  const calculateDashboardStats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];

    // Filtrar dados do mês atual
    const monthlyData = financialData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const totalRevenue = monthlyData
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpenses = monthlyData
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const activeGoals = goals.filter(goal => !goal.completed).length;
    const completedGoals = goals.filter(goal => goal.completed).length;

    // Vendas de hoje
    const todaySales = financialData
      .filter(entry => entry.type === 'income' && entry.date === today)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Ticket médio
    const totalSalesEntries = financialData.filter(entry => entry.type === 'income').length;
    const averageTicket = totalSalesEntries > 0 ? totalRevenue / totalSalesEntries : 0;

    // Valor do inventário
    const inventoryValue = inventory.reduce((sum, item) => {
      return sum + (item.quantity * item.cost_per_unit);
    }, 0);

    // Crescimento mensal baseado em dados reais
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const previousMonthData = financialData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === previousMonth && entryDate.getFullYear() === previousYear;
    });
    
    const previousRevenue = previousMonthData
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const monthlyGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      activeGoals,
      completedGoals,
      inventoryItems: inventory.length,
      todaySales,
      averageTicket,
      profitMargin,
      monthlyGrowth,
      inventoryValue
    };
  }, [financialData, goals, inventory]);

  // Atualizar stats quando calculado
  useEffect(() => {
    setDashboardStats(calculateDashboardStats);
  }, [calculateDashboardStats]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadFinancialData(),
        loadGoals(),
        loadInventory(),
        loadBusinessProfile(),
        loadAlerts()
      ]);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Erro ao atualizar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [loadFinancialData, loadGoals, loadInventory, loadBusinessProfile, loadAlerts]);

  useEffect(() => {
    if (currentRestaurant?.id) {
      refreshData();
    }
  }, [currentRestaurant?.id, refreshData]);

  return {
    dashboardStats,
    financialData,
    goals,
    inventory,
    businessProfile,
    alerts,
    isLoading,
    error,
    refreshData
  };
}