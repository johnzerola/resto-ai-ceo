
import { toast } from "sonner";
import { FinancialData } from "@/types/financial-data";
import { supabase } from "@/integrations/supabase/client";
import { createEmptyFinancialData, dispatchFinancialDataEvent } from "@/utils/financial-utils";

/**
 * Obter dados financeiros específicos do usuário autenticado
 */
export async function getFinancialData(): Promise<FinancialData> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('Usuário não autenticado, retornando dados vazios');
      return createEmptyFinancialData();
    }

    const userKey = `financialData_${session.user.id}`;
    const savedData = localStorage.getItem(userKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Dados financeiros carregados para usuário:', session.user.id);
        return parsedData;
      } catch (parseError) {
        console.warn('Erro ao fazer parse dos dados financeiros, criando novos:', parseError);
        const emptyData = createEmptyFinancialData();
        localStorage.setItem(userKey, JSON.stringify(emptyData));
        return emptyData;
      }
    } else {
      console.log('Criando novos dados financeiros para usuário:', session.user.id);
      const emptyData = createEmptyFinancialData();
      localStorage.setItem(userKey, JSON.stringify(emptyData));
      return emptyData;
    }
  } catch (error) {
    console.error("Erro ao obter dados financeiros:", error);
    return createEmptyFinancialData();
  }
}

/**
 * Salvar dados financeiros específicos do usuário autenticado
 */
export async function saveFinancialData(data: FinancialData): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('Usuário não autenticado, não é possível salvar dados');
      return;
    }

    const userKey = `financialData_${session.user.id}`;
    const dataToSave = {
      ...data,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem(userKey, JSON.stringify(dataToSave));
    console.log('Dados financeiros salvos para usuário:', session.user.id);
    
    dispatchFinancialDataEvent();
    await syncWithRestaurantData(data);
    
  } catch (error) {
    console.error("Erro ao salvar dados financeiros:", error);
  }
}

/**
 * Sincronizar dados financeiros com configurações do restaurante
 */
export async function syncFinancialWithConfig(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    const userRestaurantKey = `restaurantData_${session.user.id}`;
    const restaurantDataStr = localStorage.getItem(userRestaurantKey);
    const financialData = await getFinancialData();
    
    if (restaurantDataStr) {
      try {
        const restaurantData = JSON.parse(restaurantDataStr);
        
        restaurantData.lastFinancialUpdate = new Date().toISOString();
        restaurantData.cmvPercentage = financialData.cmvPercentage || 0;
        restaurantData.profitMargin = financialData.profitMargin || 0;
        
        localStorage.setItem(userRestaurantKey, JSON.stringify(restaurantData));
      } catch (error) {
        console.error("Erro ao processar dados do restaurante:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados financeiros com configurações:", error);
  }
}

/**
 * Sincronizar dados financeiros com configurações do restaurante
 */
async function syncWithRestaurantData(financialData: FinancialData): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    const userRestaurantKey = `restaurantData_${session.user.id}`;
    const restaurantDataStr = localStorage.getItem(userRestaurantKey);
    
    if (restaurantDataStr) {
      try {
        const restaurantData = JSON.parse(restaurantDataStr);
        
        restaurantData.lastFinancialUpdate = new Date().toISOString();
        restaurantData.cmvPercentage = financialData.cmvPercentage || 0;
        restaurantData.profitMargin = financialData.profitMargin || 0;
        
        localStorage.setItem(userRestaurantKey, JSON.stringify(restaurantData));
      } catch (error) {
        console.error("Erro ao processar dados do restaurante para sincronização:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao sincronizar dados financeiros com restaurante:", error);
  }
}

/**
 * Limpar dados financeiros do usuário atual
 */
export async function clearFinancialData(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('Usuário não autenticado');
      return;
    }

    const userKey = `financialData_${session.user.id}`;
    const emptyData = createEmptyFinancialData();
    
    localStorage.setItem(userKey, JSON.stringify(emptyData));
    dispatchFinancialDataEvent();
    
    console.log('Dados financeiros limpos para usuário:', session.user.id);
    toast.success("Dados financeiros reiniciados");
  } catch (error) {
    console.error("Erro ao limpar dados financeiros:", error);
  }
}

/**
 * Migrar dados antigos para o novo formato com isolamento por usuário
 */
export async function migrateUserFinancialData(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      // If no user, just return without error
      console.log('Nenhum usuário autenticado para migração');
      return;
    }

    const userKey = `financialData_${session.user.id}`;
    
    // Verificar se já existem dados específicos do usuário
    if (localStorage.getItem(userKey)) {
      return; // Já migrado
    }
    
    // Criar dados vazios para novos usuários
    const emptyData = createEmptyFinancialData();
    localStorage.setItem(userKey, JSON.stringify(emptyData));
    console.log('Dados financeiros inicializados para usuário:', session.user.id);
  } catch (error) {
    console.error("Erro na migração de dados financeiros:", error);
    // Don't throw error, just log it
  }
}
