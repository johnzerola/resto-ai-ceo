import { toast } from "sonner";
import { FinancialData } from "@/types/financial-data";
import { supabase } from "@/integrations/supabase/client";
import { createEmptyFinancialData, dispatchFinancialDataEvent } from "@/utils/financial-utils";

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

export async function saveFinancialData(data: FinancialData): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('Usuário não autenticado, não é possível salvar dados');
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
    
    // Trigger sync with Supabase cash_flow table
    await syncCashFlowWithSupabase(session.user.id, data);
    
  } catch (error) {
    console.error("Erro ao salvar dados financeiros:", error);
  }
}

// New function to sync with Supabase - Removido referências a expenses e income
async function syncCashFlowWithSupabase(userId: string, data: FinancialData): Promise<void> {
  try {
    // Get restaurant ID for the user
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (restaurantError || !restaurants || restaurants.length === 0) {
      console.log('Nenhum restaurante encontrado para sincronização');
      return;
    }

    const restaurantId = restaurants[0].id;

    // Sync basic financial data without expenses/income arrays
    console.log('Sincronização básica dos dados financeiros concluída');
  } catch (error) {
    console.error('Erro na sincronização com Supabase:', error);
  }
}

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

export async function migrateUserFinancialData(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('Nenhum usuário autenticado para migração');
      return;
    }

    const userKey = `financialData_${session.user.id}`;
    
    if (localStorage.getItem(userKey)) {
      return; // Já migrado
    }
    
    // Criar dados vazios para novos usuários
    const emptyData = createEmptyFinancialData();
    localStorage.setItem(userKey, JSON.stringify(emptyData));
    console.log('Dados financeiros inicializados para usuário:', session.user.id);
  } catch (error) {
    console.error("Erro na migração de dados financeiros:", error);
    // Não lançar erro, apenas logar
  }
}

export async function getCashFlowEntries(): Promise<any[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('Usuário não autenticado, retornando dados vazios de fluxo de caixa');
      return [];
    }

    // First try to get from Supabase (most up-to-date)
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', session.user.id)
      .limit(1);

    if (restaurants && restaurants.length > 0) {
      const { data: supabaseEntries } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurants[0].id)
        .order('date', { ascending: false });

      if (supabaseEntries && supabaseEntries.length > 0) {
        // Convert to expected format
        const formattedEntries = supabaseEntries.map(entry => ({
          id: entry.id,
          date: entry.date,
          description: entry.description,
          category: entry.category,
          amount: entry.amount,
          type: entry.type,
          status: entry.status || 'completed',
          paymentMethod: entry.payment_method,
          notes: entry.documento
        }));
        
        // Also update localStorage for offline access
        const userKey = `cashFlowEntries_${session.user.id}`;
        localStorage.setItem(userKey, JSON.stringify(formattedEntries));
        
        console.log('Dados de fluxo de caixa carregados do Supabase para usuário:', session.user.id, 'Total:', formattedEntries.length);
        return formattedEntries;
      }
    }

    // Fallback to localStorage if Supabase doesn't have data
    const userKey = `cashFlowEntries_${session.user.id}`;
    const savedData = localStorage.getItem(userKey);
    
    if (savedData) {
      try {
        const entries = JSON.parse(savedData);
        console.log('Dados de fluxo de caixa carregados do localStorage para usuário:', session.user.id, 'Total:', entries.length);
        return entries;
      } catch (parseError) {
        console.warn('Erro ao fazer parse dos dados de fluxo de caixa, retornando dados vazios:', parseError);
        localStorage.setItem(userKey, JSON.stringify([]));
        return [];
      }
    } else {
      console.log('Nenhum dado de fluxo de caixa encontrado para usuário:', session.user.id, 'criando array vazio');
      localStorage.setItem(userKey, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error("Erro ao obter dados de fluxo de caixa:", error);
    return [];
  }
}

export async function saveCashFlowEntries(entries: any[]): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('Usuário não autenticado, não é possível salvar dados de fluxo de caixa');
      return;
    }

    // Save to localStorage first (immediate)
    const userKey = `cashFlowEntries_${session.user.id}`;
    localStorage.setItem(userKey, JSON.stringify(entries));
    
    // Then sync to Supabase (background)
    try {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .limit(1);

      if (restaurants && restaurants.length > 0) {
        const restaurantId = restaurants[0].id;
        
        // Convert entries to Supabase format and upsert
        for (const entry of entries) {
          await supabase
            .from('cash_flow')
            .upsert({
              id: entry.id,
              restaurant_id: restaurantId,
              type: entry.type,
              amount: entry.amount,
              date: entry.date,
              description: entry.description,
              category: entry.category,
              payment_method: entry.paymentMethod,
              status: entry.status || 'completed',
              documento: entry.notes,
              impacta_dre: true,
              impacta_cmv: entry.category?.includes('insumo') || false
            });
        }
        
        console.log('Dados sincronizados com Supabase');
      }
    } catch (supabaseError) {
      console.warn('Erro ao sincronizar com Supabase, mas dados salvos localmente:', supabaseError);
    }
    
    console.log('Dados de fluxo de caixa salvos para usuário:', session.user.id, 'Total entries:', entries.length);
    
    // Disparar evento para atualização da UI
    window.dispatchEvent(new CustomEvent('cashFlowUpdated', { detail: entries }));
    
  } catch (error) {
    console.error("Erro ao salvar dados de fluxo de caixa:", error);
  }
}

// Enhanced function to calculate DRE with improved categorization
export async function calculateEnhancedDRE(restaurantId: string): Promise<any> {
  try {
    const { data: cashFlowData, error } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('impacta_dre', true);

    if (error) throw error;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyData = cashFlowData?.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    }) || [];

    const receita_bruta = monthlyData
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

    const cmv = monthlyData
      .filter(entry => entry.type === 'expense' && entry.impacta_cmv)
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

    const despesas_operacionais = monthlyData
      .filter(entry => entry.type === 'expense' && !entry.impacta_cmv)
      .reduce((sum, entry) => sum + (entry.amount || 0), 0);

    const lucro_bruto = receita_bruta - cmv;
    const resultado_liquido = lucro_bruto - despesas_operacionais;
    
    const margem_bruta = receita_bruta > 0 ? (lucro_bruto / receita_bruta) * 100 : 0;
    const margem_liquida = receita_bruta > 0 ? (resultado_liquido / receita_bruta) * 100 : 0;

    return {
      receita_bruta,
      cmv,
      lucro_bruto,
      despesas_operacionais,
      resultado_liquido,
      margem_bruta,
      margem_liquida,
      entries_count: monthlyData.length
    };
  } catch (error) {
    console.error('Erro ao calcular DRE:', error);
    return {
      receita_bruta: 0,
      cmv: 0,
      lucro_bruto: 0,
      despesas_operacionais: 0,
      resultado_liquido: 0,
      margem_bruta: 0,
      margem_liquida: 0,
      entries_count: 0
    };
  }
}
