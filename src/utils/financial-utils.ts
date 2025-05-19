
import { FinancialData, CMVCategory } from "@/types/financial-data";

/**
 * Cria um objeto FinancialData inicial com valores zerados
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
 * Calcula as categorias de CMV com base nos dados de receita e custos
 */
export function calculateCMVCategories(revenue: FinancialData["revenue"], costs: FinancialData["costs"]): CMVCategory[] {
  return [
    {
      name: "Pratos Principais",
      sales: revenue.foodSales * 0.7,
      cost: costs.foodCost * 0.7,
      cmvPercentage: revenue.foodSales > 0 
        ? (costs.foodCost * 0.7) / (revenue.foodSales * 0.7) * 100 
        : 0,
      color: "#4f46e5"
    },
    {
      name: "Entradas",
      sales: revenue.foodSales * 0.15,
      cost: costs.foodCost * 0.15,
      cmvPercentage: revenue.foodSales > 0 
        ? (costs.foodCost * 0.15) / (revenue.foodSales * 0.15) * 100 
        : 0,
      color: "#16a34a"
    },
    {
      name: "Sobremesas",
      sales: revenue.foodSales * 0.15,
      cost: costs.foodCost * 0.15,
      cmvPercentage: revenue.foodSales > 0 
        ? (costs.foodCost * 0.15) / (revenue.foodSales * 0.15) * 100 
        : 0,
      color: "#ea580c"
    },
    {
      name: "Bebidas Alcoólicas",
      sales: revenue.beverageSales * 0.7,
      cost: costs.beverageCost * 0.7,
      cmvPercentage: revenue.beverageSales > 0 
        ? (costs.beverageCost * 0.7) / (revenue.beverageSales * 0.7) * 100 
        : 0,
      color: "#dc2626"
    },
    {
      name: "Bebidas Não Alcoólicas",
      sales: revenue.beverageSales * 0.3,
      cost: costs.beverageCost * 0.3,
      cmvPercentage: revenue.beverageSales > 0 
        ? (costs.beverageCost * 0.3) / (revenue.beverageSales * 0.3) * 100 
        : 0,
      color: "#0ea5e9"
    }
  ];
}

/**
 * Evento personalizado para notificar atualizações nos dados financeiros
 */
export function dispatchFinancialDataEvent(): void {
  const event = new CustomEvent("financialDataUpdated");
  window.dispatchEvent(event);
}
