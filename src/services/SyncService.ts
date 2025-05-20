
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SYNC_EVENT = 'syncModules';

// Interface para status de sincronização
export interface SyncStatus {
  lastSync: string | null;
  inProgress: boolean;
}

// Interface para log de sincronização
export interface SyncLog {
  timestamp: string;
  source: string;
  success: boolean;
  details?: any;
}

// Função para iniciar sincronização
export async function startSync(source: string): Promise<boolean> {
  return syncModules({}, source);
}

// Função para sincronizar dados entre módulos
export async function syncModules(data: any, source: string): Promise<boolean> {
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
    
    // Registrar início da sincronização nos logs
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: { status: 'started' }
    });
    
    // Com o Supabase, não precisamos sincronizar dados manualmente
    // pois já estão armazenados no banco de dados
    
    // Simular um pequeno atraso para a UI
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar consistência de dados (simulado)
    const consistency = await checkDataConsistency();
    
    // Evento para conclusão da sincronização
    const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        success: true,
        consistency
      }
    });
    window.dispatchEvent(completeEvent);
    
    // Atualizar status de sincronização
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: new Date().toISOString(),
      inProgress: false
    }));
    
    // Registrar conclusão da sincronização nos logs
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: { 
        status: 'completed',
        consistency
      }
    });
    
    // Evento financeiro para atualizar componentes que dependem desses dados
    window.dispatchEvent(new Event('financialDataUpdated'));
    
    return true;
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    
    // Evento para falha na sincronização
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
    
    // Registrar falha na sincronização nos logs
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: false,
      details: { 
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      }
    });
    
    toast.error('Erro ao sincronizar dados');
    return false;
  }
}

// Função para obter status de sincronização
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

// Função para adicionar log de sincronização
function addSyncLog(log: SyncLog): void {
  try {
    // Obter logs existentes
    const existingLogsString = localStorage.getItem('syncLogs');
    let logs: SyncLog[] = [];
    
    if (existingLogsString) {
      logs = JSON.parse(existingLogsString);
    }
    
    // Adicionar novo log
    logs.unshift(log);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    
    // Salvar logs atualizados
    localStorage.setItem('syncLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Erro ao adicionar log de sincronização:', error);
  }
}

// Função para obter logs de sincronização
export function getSyncLogs(): SyncLog[] {
  try {
    const logs = localStorage.getItem('syncLogs');
    if (logs) {
      return JSON.parse(logs);
    }
    return [];
  } catch (error) {
    console.error('Erro ao obter logs de sincronização:', error);
    return [];
  }
}

// Função para verificar consistência de dados
async function checkDataConsistency(): Promise<{ status: string, details?: any }> {
  // Em uma implementação real, este método verificaria
  // se os dados locais estão sincronizados com o Supabase
  
  // Por enquanto, retornamos um resultado simulado
  return {
    status: 'consistent',
    details: {
      checkedTables: [
        { name: 'profiles', status: 'ok' },
        { name: 'restaurants', status: 'ok' },
        { name: 'inventory', status: 'ok' },
        { name: 'cash_flow', status: 'ok' }
      ]
    }
  };
}
