
// Serviço para gerenciar a integração entre Fluxo de Caixa, DRE e CMV

import { toast } from "sonner";
import { CashFlowEntry } from "@/components/restaurant/CashFlowOverview";
import { FinancialData } from "@/types/financial-data";
import { categoryMappings } from "@/config/category-mappings";
import { calculateCMVCategories } from "@/utils/financial-utils";
import { getFinancialData, saveFinancialData } from "@/services/FinancialStorageService";

// Reexportamos as funções necessárias para manter compatibilidade com o código existente
export { getFinancialData, saveFinancialData } from "@/services/FinancialStorageService";
export { dispatchFinancialDataEvent } from "@/utils/financial-utils";
export type { FinancialData } from "@/types/financial-data";

/**
 * Função para atualizar dados financeiros com base em entradas de fluxo de caixa
 */
export async function updateFinancialData(entries: CashFlowEntry[]): Promise<void> {
  try {
    // Recuperar dados financeiros existentes ou inicializar
    const existingData = await getFinancialData();
    
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
    updatedData.cmvCategories = calculateCMVCategories(updatedData.revenue, updatedData.costs);
    
    // Salvar dados atualizados
    saveFinancialData(updatedData);
    
    console.log("Dados financeiros atualizados com base no fluxo de caixa:", updatedData);
    
  } catch (error) {
    console.error("Erro ao atualizar dados financeiros:", error);
    toast.error("Erro ao atualizar dados financeiros");
  }
}
