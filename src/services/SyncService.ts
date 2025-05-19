
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SYNC_EVENT = 'syncModules';

// Interface para status de sincronização
export interface SyncStatus {
  lastSync: string | null;
  inProgress: boolean;
}

// Função para iniciar sincronização (adicionada para resolver o erro)
export async function startSync(source: string) {
  return syncModules({}, source);
}

// Função para sincronizar dados entre módulos
export async function syncModules(data: any, source: string) {
  try {
    // Disparar evento antes da sincronização
    const startEvent = new CustomEvent(`${SYNC_EVENT}Start`, {
      detail: {
        source,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(startEvent);
    
    // Atualizar status de sincronização no localStorage
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: null,
      inProgress: true
    }));
    
    // Com Supabase, não precisamos sincronizar manualmente os dados
    // pois eles já estão armazenados no banco de dados
    
    // Em vez disso, podemos calcular métricas financeiras se necessário
    
    // Simular um pequeno atraso para a UI
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Evento de sincronização concluída
    const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        success: true
      }
    });
    window.dispatchEvent(completeEvent);
    
    // Atualizar status de sincronização
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: new Date().toISOString(),
      inProgress: false
    }));
    
    // Evento financeiro específico para atualizar componentes que dependem desses dados
    window.dispatchEvent(new Event('financialDataUpdated'));
    
    return true;
  } catch (error) {
    console.error('Erro durante sincronização:', error);
    
    // Evento de falha de sincronização
    const failEvent = new CustomEvent(`${SYNC_EVENT}Fail`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        error
      }
    });
    window.dispatchEvent(failEvent);
    
    // Atualizar status de sincronização
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: localStorage.getItem('lastSync'),
      inProgress: false
    }));
    
    toast.error('Erro ao sincronizar dados');
    return false;
  }
}

// Função para obter o status de sincronização
export function getSyncStatus(): SyncStatus {
  const status = localStorage.getItem('syncStatus');
  if (status) {
    return JSON.parse(status);
  }
  return {
    lastSync: null,
    inProgress: false
  };
}
