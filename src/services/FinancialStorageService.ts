
import { toast } from "sonner";
import { FinancialData } from "@/types/financial-data";
import { createEmptyFinancialData, dispatchFinancialDataEvent } from "@/utils/financial-utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Obter dados financeiros do localStorage ou criar novos para usuário novo
 */
export async function getFinancialData(): Promise<FinancialData> {
  try {
    // Verificar se o usuário está autenticado
    const { data: session } = await supabase.auth.getSession();
    const isNewUser = localStorage.getItem('isNewUser') === 'true';

    // Para usuário novo ou não autenticado, retornar dados vazios
    if (isNewUser || !session?.session) {
      return createEmptyFinancialData();
    }

    // Tentar obter dados do localStorage
    const savedData = localStorage.getItem("financialData");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      return createEmptyFinancialData();
    }
  } catch (error) {
    console.error("Erro ao obter dados financeiros:", error);
    toast.error("Erro ao carregar dados financeiros");
    return createEmptyFinancialData();
  }
}

/**
 * Salvar dados financeiros no localStorage e sincronizar com outros módulos
 */
export function saveFinancialData(data: FinancialData): void {
  try {
    // Salvar no localStorage
    localStorage.setItem("financialData", JSON.stringify({
      ...data,
      lastUpdate: new Date().toISOString()
    }));
    
    // Notificar outros componentes da atualização
    dispatchFinancialDataEvent();
    
    // Obter dados de configuração do restaurante para sincronizar
    const restaurantDataStr = localStorage.getItem("restaurantData");
    if (restaurantDataStr) {
      const restaurantData = JSON.parse(restaurantDataStr);
      
      // Atualizar restaurantData com valores financeiros relevantes
      restaurantData.lastFinancialUpdate = new Date().toISOString();
      restaurantData.cmvPercentage = data.cmvPercentage || 0;
      restaurantData.profitMargin = data.profitMargin || 0;
      
      // Salvar dados atualizados do restaurante
      localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
    }
    
  } catch (error) {
    console.error("Erro ao salvar dados financeiros:", error);
    toast.error("Erro ao salvar dados financeiros");
  }
}

/**
 * Sincronizar dados financeiros com configurações do restaurante
 */
export async function syncFinancialWithConfig(): Promise<void> {
  try {
    const restaurantDataStr = localStorage.getItem("restaurantData");
    const financialData = await getFinancialData();
    
    if (restaurantDataStr) {
      const restaurantData = JSON.parse(restaurantDataStr);
      
      // Aplicar configurações do restaurante aos dados financeiros
      if (restaurantData.targetFoodCost) {
        financialData.targetCMV = restaurantData.targetFoodCost;
      }
      
      // Atualizar outros dados relevantes
      if (restaurantData.averageMonthlyRevenue) {
        // Usar como base para projeções
      }
      
      // Salvar dados financeiros atualizados
      saveFinancialData(financialData);
      
      toast.success("Dados financeiros sincronizados com configurações");
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados financeiros:", error);
    toast.error("Erro ao sincronizar dados financeiros");
  }
}

/**
 * Limpar todos os dados financeiros (para novos usuários)
 */
export function clearFinancialData(): void {
  try {
    localStorage.setItem("financialData", JSON.stringify(createEmptyFinancialData()));
    dispatchFinancialDataEvent();
    toast.success("Dados financeiros reiniciados");
  } catch (error) {
    console.error("Erro ao limpar dados financeiros:", error);
    toast.error("Erro ao limpar dados financeiros");
  }
}
