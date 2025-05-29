
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

    // Criar chave específica do usuário
    const userKey = `financialData_${session.user.id}`;
    const savedData = localStorage.getItem(userKey);
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log('Dados financeiros carregados para usuário:', session.user.id);
      return parsedData;
    } else {
      console.log('Criando novos dados financeiros para usuário:', session.user.id);
      const emptyData = createEmptyFinancialData();
      localStorage.setItem(userKey, JSON.stringify(emptyData));
      return emptyData;
    }
  } catch (error) {
    console.error("Erro ao obter dados financeiros:", error);
    toast.error("Erro ao carregar dados financeiros");
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
      toast.error("Você precisa estar logado para salvar dados");
      return;
    }

    // Criar chave específica do usuário
    const userKey = `financialData_${session.user.id}`;
    const dataToSave = {
      ...data,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem(userKey, JSON.stringify(dataToSave));
    console.log('Dados financeiros salvos para usuário:', session.user.id);
    
    // Notificar outros componentes da atualização
    dispatchFinancialDataEvent();
    
    // Sincronizar com dados do restaurante se existir
    await syncWithRestaurantData(data);
    
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    const userRestaurantKey = `restaurantData_${session.user.id}`;
    const restaurantDataStr = localStorage.getItem(userRestaurantKey);
    const financialData = await getFinancialData();
    
    if (restaurantDataStr) {
      const restaurantData = JSON.parse(restaurantDataStr);
      
      // Atualizar dados do restaurante com informações financeiras
      restaurantData.lastFinancialUpdate = new Date().toISOString();
      restaurantData.cmvPercentage = financialData.cmvPercentage || 0;
      restaurantData.profitMargin = financialData.profitMargin || 0;
      
      localStorage.setItem(userRestaurantKey, JSON.stringify(restaurantData));
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
      const restaurantData = JSON.parse(restaurantDataStr);
      
      // Atualizar dados do restaurante com informações financeiras
      restaurantData.lastFinancialUpdate = new Date().toISOString();
      restaurantData.cmvPercentage = financialData.cmvPercentage || 0;
      restaurantData.profitMargin = financialData.profitMargin || 0;
      
      localStorage.setItem(userRestaurantKey, JSON.stringify(restaurantData));
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
    toast.error("Erro ao limpar dados financeiros");
  }
}

/**
 * Migrar dados antigos para o novo formato com isolamento por usuário
 */
export async function migrateUserFinancialData(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    const userKey = `financialData_${session.user.id}`;
    const oldKey = 'financialData';
    
    // Verificar se já existem dados específicos do usuário
    if (localStorage.getItem(userKey)) {
      return; // Já migrado
    }
    
    // Verificar se existem dados antigos
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      try {
        const parsedOldData = JSON.parse(oldData);
        localStorage.setItem(userKey, JSON.stringify(parsedOldData));
        console.log('Dados financeiros migrados para usuário:', session.user.id);
      } catch (error) {
        console.error('Erro ao migrar dados antigos:', error);
        // Se houver erro, criar dados vazios
        localStorage.setItem(userKey, JSON.stringify(createEmptyFinancialData()));
      }
    } else {
      // Criar dados vazios se não houver dados antigos
      localStorage.setItem(userKey, JSON.stringify(createEmptyFinancialData()));
    }
  } catch (error) {
    console.error("Erro na migração de dados financeiros:", error);
  }
}
