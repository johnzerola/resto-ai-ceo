
import { FinancialData, CMVCategory } from "@/types/financial-data";
import { supabase } from '@/integrations/supabase/client';

/**
 * Criar dados financeiros vazios
 */
export function createEmptyFinancialData(): FinancialData {
  return {
    lastUpdate: new Date().toISOString(),
    revenue: {
      foodSales: 0,
      beverageSales: 0,
      deliverySales: 0,
      otherSales: 0,
      total: 0
    },
    costs: {
      foodCost: 0,
      beverageCost: 0,
      packagingCost: 0,
      otherCosts: 0,
      total: 0
    },
    cmvCategories: [],
    profitMargin: 0,
    previousProfitMargin: 0,
    cmvPercentage: 0,
    targetCMV: 0,
    revenueGrowth: 0
  };
}

/**
 * Disparar evento de atualização de dados financeiros
 */
export function dispatchFinancialDataEvent(): void {
  window.dispatchEvent(new Event('financialDataUpdated'));
}

/**
 * Calcular CMV percentual
 */
export function calculateCMVPercentage(totalCosts: number, totalRevenue: number): number {
  if (totalRevenue === 0) return 0;
  return (totalCosts / totalRevenue) * 100;
}

/**
 * Calcular margem de lucro
 */
export function calculateProfitMargin(totalRevenue: number, totalCosts: number): number {
  if (totalRevenue === 0) return 0;
  return ((totalRevenue - totalCosts) / totalRevenue) * 100;
}

/**
 * Calcular lucro líquido
 */
export function calculateNetProfit(totalRevenue: number, totalCosts: number): number {
  return totalRevenue - totalCosts;
}

/**
 * Calcular categorias de CMV
 */
export function calculateCMVCategories(revenue: FinancialData['revenue'], costs: FinancialData['costs']): CMVCategory[] {
  const categories: CMVCategory[] = [];
  
  if (revenue.foodSales > 0) {
    categories.push({
      name: "Alimentos",
      sales: revenue.foodSales,
      cost: costs.foodCost,
      cmvPercentage: calculateCMVPercentage(costs.foodCost, revenue.foodSales),
      color: "#8884d8"
    });
  }
  
  if (revenue.beverageSales > 0) {
    categories.push({
      name: "Bebidas",
      sales: revenue.beverageSales,
      cost: costs.beverageCost,
      cmvPercentage: calculateCMVPercentage(costs.beverageCost, revenue.beverageSales),
      color: "#82ca9d"
    });
  }
  
  if (revenue.deliverySales > 0) {
    categories.push({
      name: "Delivery",
      sales: revenue.deliverySales,
      cost: costs.packagingCost,
      cmvPercentage: calculateCMVPercentage(costs.packagingCost, revenue.deliverySales),
      color: "#ffc658"
    });
  }
  
  if (revenue.otherSales > 0) {
    categories.push({
      name: "Outros",
      sales: revenue.otherSales,
      cost: costs.otherCosts,
      cmvPercentage: calculateCMVPercentage(costs.otherCosts, revenue.otherSales),
      color: "#ff7300"
    });
  }
  
  return categories;
}

/**
 * Validar dados financeiros
 */
export function validateFinancialData(data: Partial<FinancialData>): string[] {
  const errors: string[] = [];
  
  if (data.revenue?.total !== undefined && data.revenue.total < 0) {
    errors.push('A receita não pode ser negativa');
  }
  
  if (data.costs?.total !== undefined && data.costs.total < 0) {
    errors.push('Os custos não podem ser negativos');
  }
  
  return errors;
}

/**
 * Formatar valores monetários
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formatar percentuais
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export const createDefaultFinancialCategories = async (restaurantId: string) => {
  try {
    // Verificar se já existem categorias para este restaurante
    const { data: existingCategories, error: checkError } = await supabase
      .from('categorias_financeiras')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (checkError) throw checkError;

    // Se já existem categorias, não criar novamente
    if (existingCategories && existingCategories.length > 0) {
      return;
    }

    // Categorias padrão
    const categoriasPadrao = [
      // Categorias de despesa que impactam CMV
      { nome: 'Ingredientes', tipo: 'despesa', impacta_cmv: true, impacta_dre: true, cor: '#ef4444', icone: 'utensils' },
      { nome: 'Alimentos', tipo: 'despesa', impacta_cmv: true, impacta_dre: true, cor: '#f97316', icone: 'apple' },
      { nome: 'Bebidas', tipo: 'despesa', impacta_cmv: true, impacta_dre: true, cor: '#3b82f6', icone: 'coffee' },
      { nome: 'Insumos', tipo: 'despesa', impacta_cmv: true, impacta_dre: true, cor: '#8b5cf6', icone: 'package' },
      { nome: 'Embalagens', tipo: 'despesa', impacta_cmv: true, impacta_dre: true, cor: '#06b6d4', icone: 'box' },
      
      // Categorias de despesa operacional (não impactam CMV)
      { nome: 'Aluguel', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#64748b', icone: 'home' },
      { nome: 'Funcionários', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#10b981', icone: 'users' },
      { nome: 'Marketing', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#f59e0b', icone: 'megaphone' },
      { nome: 'Delivery', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#84cc16', icone: 'truck' },
      { nome: 'Equipamentos', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#6366f1', icone: 'settings' },
      { nome: 'Impostos', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#dc2626', icone: 'file-text' },
      { nome: 'Manutenção', tipo: 'despesa', impacta_cmv: false, impacta_dre: true, cor: '#7c3aed', icone: 'wrench' },
      
      // Categorias de receita
      { nome: 'Vendas Balcão', tipo: 'receita', impacta_cmv: false, impacta_dre: true, cor: '#22c55e', icone: 'store' },
      { nome: 'Vendas Delivery', tipo: 'receita', impacta_cmv: false, impacta_dre: true, cor: '#3b82f6', icone: 'bike' },
      { nome: 'Vendas iFood', tipo: 'receita', impacta_cmv: false, impacta_dre: true, cor: '#f59e0b', icone: 'smartphone' },
      { nome: 'Vendas Uber Eats', tipo: 'receita', impacta_cmv: false, impacta_dre: true, cor: '#000000', icone: 'car' },
      { nome: 'Outras Receitas', tipo: 'receita', impacta_cmv: false, impacta_dre: true, cor: '#8b5cf6', icone: 'plus-circle' }
    ];

    const { error } = await supabase
      .from('categorias_financeiras')
      .insert(
        categoriasPadrao.map(cat => ({
          restaurant_id: restaurantId,
          ...cat,
          ativa: true
        }))
      );

    if (error) throw error;
    
    console.log('Categorias financeiras padrão criadas para o restaurante:', restaurantId);
  } catch (error) {
    console.error('Erro ao criar categorias financeiras padrão:', error);
    throw error;
  }
};
