
import { FinancialData, CMVCategory } from "@/types/financial-data";

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
