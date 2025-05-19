
import { toast } from "sonner";
import { dispatchFinancialDataEvent } from "./FinancialDataService";
import { addSystemAlert } from "./ModuleIntegrationService";

// Interface para status de sincronização
export interface SyncStatus {
  lastSync: string;
  isSync: boolean;
  modules: {
    cashFlow: boolean;
    inventory: boolean;
    dre: boolean;
    cmv: boolean;
    fichaTecnica: boolean;
    configuracoes: boolean;
  };
}

// Status inicial de sincronização
let syncStatus: SyncStatus = {
  lastSync: new Date().toISOString(),
  isSync: false,
  modules: {
    cashFlow: true,
    inventory: true,
    dre: true,
    cmv: true,
    fichaTecnica: true,
    configuracoes: true
  }
};

// Event para sincronização
export const SYNC_EVENT = "moduleSyncEvent";

/**
 * Iniciar sincronização entre módulos
 * @param source Módulo que iniciou a sincronização
 * @param target Módulos de destino (opcionais, se não informados sincroniza todos)
 */
export function startSync(source: string, target?: string[]) {
  syncStatus.isSync = true;
  
  // Criar e disparar evento
  const event = new CustomEvent(SYNC_EVENT, { 
    detail: { 
      source, 
      target,
      timestamp: new Date().toISOString()
    }
  });
  
  window.dispatchEvent(event);
  
  // Notificar UI sobre início da sincronização
  console.log(`Sincronização iniciada por: ${source}`);
  
  // Simular tempo de processamento (remover em produção)
  setTimeout(() => {
    completeSync(source, target);
  }, 800);
}

/**
 * Finalizar sincronização
 */
export function completeSync(source: string, target?: string[]) {
  syncStatus.isSync = false;
  syncStatus.lastSync = new Date().toISOString();
  
  // Atualizar status dos módulos
  if (target) {
    target.forEach(module => {
      if (module in syncStatus.modules) {
        syncStatus.modules[module as keyof typeof syncStatus.modules] = true;
      }
    });
  } else {
    // Se não especificado, atualiza todos
    Object.keys(syncStatus.modules).forEach(key => {
      syncStatus.modules[key as keyof typeof syncStatus.modules] = true;
    });
  }
  
  // Disparar evento de finalização
  const event = new CustomEvent(`${SYNC_EVENT}Complete`, { 
    detail: { 
      source, 
      timestamp: new Date().toISOString() 
    } 
  });
  
  window.dispatchEvent(event);
  console.log(`Sincronização finalizada: ${source}`);
}

/**
 * Obter status atual de sincronização
 */
export function getSyncStatus(): SyncStatus {
  return {...syncStatus};
}

/**
 * Sincronizar dados entre módulos
 * @param data Dados a serem sincronizados
 * @param source Módulo de origem
 */
export function syncModules(data: any, source: string) {
  try {
    startSync(source);
    
    // Se a origem for as configurações, sincronizar com todos os módulos
    if (source === 'configuracoes') {
      // Atualizar configurações nos módulos relevantes
      updateModulesFromConfig();
    }
    
    // Disparar evento financeiro para atualizar DRE e CMV
    dispatchFinancialDataEvent();
    
    // Disparar evento para atualizar estoque (se aplicável)
    if (data?.inventory || source === 'inventory') {
      const event = new CustomEvent("inventoryUpdated");
      window.dispatchEvent(event);
    }
    
    // Disparar evento para atualizar ficha técnica (se aplicável)
    if (source === 'configuracoes') {
      const event = new CustomEvent("recipesConfigUpdated");
      window.dispatchEvent(event);
    }
    
    // Notificar usuário sobre sincronização
    toast.success("Dados sincronizados com sucesso", {
      description: `Todos os módulos foram atualizados com os dados mais recentes`,
      duration: 3000
    });
    
    // Registrar log
    console.log(`Sincronização concluída - Origem: ${source}`, data);
    
    return true;
  } catch (error) {
    console.error("Erro durante sincronização:", error);
    
    // Adicionar alerta ao sistema
    addSystemAlert({
      type: "error",
      title: "Erro de Sincronização",
      description: `Falha ao sincronizar dados do módulo ${source}`,
      date: new Date().toLocaleString()
    });
    
    toast.error("Falha na sincronização de dados", {
      description: "Tente novamente ou contate o suporte"
    });
    
    return false;
  }
}

/**
 * Atualizar todos os módulos com as configurações mais recentes
 */
function updateModulesFromConfig() {
  try {
    // Obter dados das configurações
    const configData = localStorage.getItem("restaurantData");
    if (!configData) return;
    
    const config = JSON.parse(configData);
    
    // Atualizar informações para cálculos de ficha técnica
    // Estas configurações são usadas no cálculo de preços sugeridos
    const techSheetConfig = {
      fixedExpenses: config.fixedExpenses,
      variableExpenses: config.variableExpenses,
      desiredProfitMargin: config.desiredProfitMargin,
      targetFoodCost: config.targetFoodCost,
      targetBeverageCost: config.targetBeverageCost
    };
    
    // Salvar configurações específicas para a ficha técnica
    localStorage.setItem("techSheetConfig", JSON.stringify(techSheetConfig));
    
    // Atualizar informações para o DRE/CMV
    const dreConfig = {
      laborCostPercentage: config.laborCostPercentage,
      occupancyCostPercentage: config.occupancyCostPercentage,
      targetFoodCost: config.targetFoodCost,
      targetBeverageCost: config.targetBeverageCost
    };
    
    localStorage.setItem("dreConfig", JSON.stringify(dreConfig));
    
    console.log("Configurações atualizadas em todos os módulos", config);
    
  } catch (error) {
    console.error("Erro ao atualizar módulos com configurações:", error);
  }
}

