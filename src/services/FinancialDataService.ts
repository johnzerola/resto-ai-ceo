// Serviço para gerenciar a integração entre Fluxo de Caixa, DRE e CMV

import { toast } from "sonner";
import { CashFlowEntry } from "@/components/restaurant/CashFlowOverview";

// Interface para dados financeiros compartilhados
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
  cmvCategories: {
    name: string;
    sales: number;
    cost: number;
    cmvPercentage: number;
    color: string;
  }[];
  // Adicionando propriedades necessárias para o sistema de metas
  profitMargin?: number;
  previousProfitMargin?: number;
  cmvPercentage?: number;
  targetCMV?: number;
  revenueGrowth?: number;
}

// Mapeamento de categorias de fluxo de caixa para categorias financeiras
const categoryMappings = {
  // Receitas
  "Vendas": { type: "income", category: "foodSales" },
  "Delivery": { type: "income", category: "deliverySales" },
  "Eventos": { type: "income", category: "foodSales" },
  "Aplicativos": { type: "income", category: "deliverySales" },
  "Outras receitas": { type: "income", category: "otherSales" },
  
  // Despesas
  "Fornecedores": { type: "expense", category: "foodCost" },
  "Folha de pagamento": { type: "expense", category: "expense" },
  "Aluguel": { type: "expense", category: "expense" },
  "Utilidades": { type: "expense", category: "expense" },
  "Marketing": { type: "expense", category: "expense" },
  "Manutenção": { type: "expense", category: "expense" },
  "Impostos": { type: "expense", category: "expense" },
  "Outras despesas": { type: "expense", category: "otherCosts" },
};

// Função para atualizar dados financeiros com base em entradas de fluxo de caixa
export function updateFinancialData(entries: CashFlowEntry[]): void {
  try {
    // Recuperar dados financeiros existentes ou inicializar
    const existingData = getFinancialData();
    
    // Preparar dados atualizados
    const updatedData: FinancialData = {
      ...existingData,
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
      }
    };
    
    // Filtrar apenas transações concluídas
    const completedEntries = entries.filter(entry => entry.status === "completed");
    
    // Processar cada entrada para atualizar receitas e custos
    completedEntries.forEach(entry => {
      const mapping = categoryMappings[entry.category as keyof typeof categoryMappings];
      
      if (mapping && entry.type === "income") {
        // Atualizar receitas
        if (mapping.category === "foodSales") {
          updatedData.revenue.foodSales += entry.amount;
        } else if (mapping.category === "beverageSales") {
          updatedData.revenue.beverageSales += entry.amount;
        } else if (mapping.category === "deliverySales") {
          updatedData.revenue.deliverySales += entry.amount;
        } else if (mapping.category === "otherSales") {
          updatedData.revenue.otherSales += entry.amount;
        }
      } else if (mapping && entry.type === "expense") {
        // Atualizar custos
        if (mapping.category === "foodCost") {
          updatedData.costs.foodCost += entry.amount;
        } else if (mapping.category === "beverageCost") {
          updatedData.costs.beverageCost += entry.amount;
        } else if (mapping.category === "packagingCost") {
          updatedData.costs.packagingCost += entry.amount;
        } else if (mapping.category === "otherCosts") {
          updatedData.costs.otherCosts += entry.amount;
        }
      }
    });
    
    // Calcular totais
    updatedData.revenue.total = 
      updatedData.revenue.foodSales + 
      updatedData.revenue.beverageSales + 
      updatedData.revenue.deliverySales + 
      updatedData.revenue.otherSales;
      
    updatedData.costs.total = 
      updatedData.costs.foodCost + 
      updatedData.costs.beverageCost + 
      updatedData.costs.packagingCost + 
      updatedData.costs.otherCosts;
    
    // Atualizar categorias de CMV
    updatedData.cmvCategories = [
      {
        name: "Pratos Principais",
        sales: updatedData.revenue.foodSales * 0.7,
        cost: updatedData.costs.foodCost * 0.7,
        cmvPercentage: updatedData.revenue.foodSales > 0 
          ? (updatedData.costs.foodCost * 0.7) / (updatedData.revenue.foodSales * 0.7) * 100 
          : 0,
        color: "#4f46e5"
      },
      {
        name: "Entradas",
        sales: updatedData.revenue.foodSales * 0.15,
        cost: updatedData.costs.foodCost * 0.15,
        cmvPercentage: updatedData.revenue.foodSales > 0 
          ? (updatedData.costs.foodCost * 0.15) / (updatedData.revenue.foodSales * 0.15) * 100 
          : 0,
        color: "#16a34a"
      },
      {
        name: "Sobremesas",
        sales: updatedData.revenue.foodSales * 0.15,
        cost: updatedData.costs.foodCost * 0.15,
        cmvPercentage: updatedData.revenue.foodSales > 0 
          ? (updatedData.costs.foodCost * 0.15) / (updatedData.revenue.foodSales * 0.15) * 100 
          : 0,
        color: "#ea580c"
      },
      {
        name: "Bebidas Alcoólicas",
        sales: updatedData.revenue.beverageSales * 0.7,
        cost: updatedData.costs.beverageCost * 0.7,
        cmvPercentage: updatedData.revenue.beverageSales > 0 
          ? (updatedData.costs.beverageCost * 0.7) / (updatedData.revenue.beverageSales * 0.7) * 100 
          : 0,
        color: "#dc2626"
      },
      {
        name: "Bebidas Não Alcoólicas",
        sales: updatedData.revenue.beverageSales * 0.3,
        cost: updatedData.costs.beverageCost * 0.3,
        cmvPercentage: updatedData.revenue.beverageSales > 0 
          ? (updatedData.costs.beverageCost * 0.3) / (updatedData.revenue.beverageSales * 0.3) * 100 
          : 0,
        color: "#0ea5e9"
      }
    ];
    
    // Salvar dados atualizados
    saveFinancialData(updatedData);
    
    console.log("Dados financeiros atualizados com base no fluxo de caixa:", updatedData);
    
  } catch (error) {
    console.error("Erro ao atualizar dados financeiros:", error);
    toast.error("Erro ao atualizar dados financeiros");
  }
}

// Obter dados financeiros do localStorage
export function getFinancialData(): FinancialData {
  try {
    const savedData = localStorage.getItem("financialData");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
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
  } catch (error) {
    console.error("Erro ao obter dados financeiros:", error);
    toast.error("Erro ao carregar dados financeiros");
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
}

// Salvar dados financeiros no localStorage
function saveFinancialData(data: FinancialData): void {
  try {
    localStorage.setItem("financialData", JSON.stringify(data));
    dispatchFinancialDataEvent();
  } catch (error) {
    console.error("Erro ao salvar dados financeiros:", error);
    toast.error("Erro ao salvar dados financeiros");
  }
}

// Evento personalizado para notificar atualizações nos dados financeiros
export function dispatchFinancialDataEvent(): void {
  const event = new CustomEvent("financialDataUpdated");
  window.dispatchEvent(event);
}
