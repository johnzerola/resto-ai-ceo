
// Tipos para dados financeiros do sistema

/**
 * Interface para dados financeiros compartilhados entre DRE, CMV e Fluxo de Caixa
 */
export interface FinancialData {
  lastUpdate: string;
  revenue: {
    foodSales: number;
    beverageSales: number;
    deliverySales: number;
    otherSales: number;
    total: number;
  };
  costs: {
    foodCost: number;
    beverageCost: number;
    packagingCost: number;
    otherCosts: number;
    total: number;
  };
  cmvCategories: CMVCategory[];
  // Propriedades para o sistema de metas
  profitMargin: number;
  previousProfitMargin: number;
  cmvPercentage: number;
  targetCMV: number;
  revenueGrowth: number;
}

/**
 * Interface para uma categoria de CMV
 */
export interface CMVCategory {
  name: string;
  sales: number;
  cost: number;
  cmvPercentage: number;
  color: string;
}

/**
 * Mapeamento de categorias de fluxo de caixa para categorias financeiras
 */
export interface CategoryMapping {
  type: "income" | "expense";
  category: string;
}

/**
 * Tipo para o dicionário de mapeamentos de categoria
 */
export type CategoryMappings = {
  [key: string]: CategoryMapping;
};
