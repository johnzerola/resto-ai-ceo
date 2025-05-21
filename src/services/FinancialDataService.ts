
// Serviço para gerenciar a integração entre Fluxo de Caixa, DRE e CMV

import { toast } from "sonner";
import { CashFlowEntry } from "@/components/restaurant/CashFlowOverview";
import { FinancialData } from "@/types/financial-data";
import { categoryMappings } from "@/config/category-mappings";
import { calculateCMVCategories } from "@/utils/financial-utils";
import { getFinancialData, saveFinancialData } from "@/services/FinancialStorageService";
import { Payment } from "@/services/PaymentService";
import { syncGoalsWithFinancialData } from "@/services/GoalsService";
import { startSync } from "@/services/SyncService";

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
    await saveFinancialData(updatedData);
    
    // Sincronizar com outros módulos
    await syncAllModules("cashFlow");
    
    console.log("Dados financeiros atualizados com base no fluxo de caixa:", updatedData);
    
  } catch (error) {
    console.error("Erro ao atualizar dados financeiros:", error);
    toast.error("Erro ao atualizar dados financeiros");
  }
}

/**
 * Função para atualizar dados financeiros com base em pagamentos
 */
export async function updateFinancialDataFromPayments(payments: Payment[]): Promise<void> {
  try {
    // Recuperar dados financeiros existentes
    const existingData = await getFinancialData();
    
    // Clone para não modificar diretamente
    const updatedData: FinancialData = {
      ...existingData,
      lastUpdate: new Date().toISOString()
    };
    
    // Processar apenas pagamentos concluídos/pagos
    const completedPayments = payments.filter(payment => payment.status === "paid");
    
    let revenueTotal = 0;
    let costTotal = 0;
    
    // Processar pagamentos por categoria
    completedPayments.forEach(payment => {
      if (payment.type === "income") {
        // Atualizar receitas com base na categoria
        switch(payment.category) {
          case "food":
            updatedData.revenue.foodSales += payment.amount;
            break;
          case "beverage":
            updatedData.revenue.beverageSales += payment.amount;
            break;
          case "sales":
            // Dividir proporcionalmente entre food e outros
            updatedData.revenue.foodSales += payment.amount * 0.7;
            updatedData.revenue.otherSales += payment.amount * 0.3;
            break;
          default:
            updatedData.revenue.otherSales += payment.amount;
        }
        
        revenueTotal += payment.amount;
      } else if (payment.type === "expense") {
        // Processar despesas
        // No CMV, apenas insumos são considerados, conforme solicitado
        if (payment.category === "food") {
          updatedData.costs.foodCost += payment.amount;
        } else if (payment.category === "beverage") {
          updatedData.costs.beverageCost += payment.amount;
        } else if (payment.category === "supplies") {
          updatedData.costs.packagingCost += payment.amount;
        } else {
          updatedData.costs.otherCosts += payment.amount;
        }
        
        costTotal += payment.amount;
      }
    });
    
    // Recalcular totais finais
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
    
    // Recalcular CMV apenas para insumos (food, beverage, supplies)
    updatedData.cmvCategories = calculateCMVCategories(updatedData.revenue, updatedData.costs);
    
    // Calcular margens e percentuais
    if (updatedData.revenue.total > 0) {
      updatedData.previousProfitMargin = updatedData.profitMargin || 0;
      updatedData.profitMargin = ((updatedData.revenue.total - updatedData.costs.total) / updatedData.revenue.total) * 100;
      
      // Calcular percentual de CMV
      const cmvTotal = updatedData.costs.foodCost + updatedData.costs.beverageCost + updatedData.costs.packagingCost;
      updatedData.cmvPercentage = (cmvTotal / updatedData.revenue.total) * 100;
    }
    
    // Salvar dados atualizados
    await saveFinancialData(updatedData);
    
    // Sincronizar com outros módulos
    await syncAllModules("payments");
    
    console.log("Dados financeiros atualizados com base em pagamentos:", updatedData);
    
  } catch (error) {
    console.error("Erro ao atualizar dados financeiros de pagamentos:", error);
    toast.error("Erro ao atualizar dados financeiros");
  }
}

/**
 * Função para sincronizar todos os módulos
 */
export async function syncAllModules(source: string): Promise<void> {
  try {
    // Sincronizar metas com dados financeiros
    await syncGoalsWithFinancialData();
    
    // Atualizar dados de configuração
    await syncFinancialWithConfig();
    
    // Iniciar sincronização geral
    await startSync(source);
    
    // Notificar sistema sobre atualização
    dispatchFinancialDataEvent();
    
  } catch (error) {
    console.error("Erro ao sincronizar módulos:", error);
  }
}
