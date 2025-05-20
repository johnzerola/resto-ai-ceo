import { toast } from "sonner";

/**
 * Evento de sincronização
 */
export const SYNC_EVENT = 'syncData';

/**
 * Status inicial da sincronização
 */
const initialSyncStatus = {
  lastSync: null,
  inProgress: false
};

/**
 * Obter status da sincronização do localStorage
 */
export function getSyncStatus() {
  try {
    const savedStatus = localStorage.getItem("syncStatus");
    return savedStatus ? JSON.parse(savedStatus) : initialSyncStatus;
  } catch (error) {
    console.error("Erro ao obter status de sincronização:", error);
    return initialSyncStatus;
  }
}

/**
 * Definir status da sincronização no localStorage
 */
export function setSyncStatus(status: any) {
  try {
    localStorage.setItem("syncStatus", JSON.stringify(status));
  } catch (error) {
    console.error("Erro ao salvar status de sincronização:", error);
  }
}

/**
 * Logs de sincronização
 */
const initialSyncLogs: any[] = [];

/**
 * Obter logs de sincronização do localStorage
 */
export function getSyncLogs() {
  try {
    const savedLogs = localStorage.getItem("syncLogs");
    return savedLogs ? JSON.parse(savedLogs) : initialSyncLogs;
  } catch (error) {
    console.error("Erro ao obter logs de sincronização:", error);
    return initialSyncLogs;
  }
}

/**
 * Adicionar log de sincronização ao localStorage
 */
export function addSyncLog(log: any) {
  try {
    const logs = getSyncLogs();
    logs.unshift(log); // Adicionar no início para mostrar mais recentes primeiro
    localStorage.setItem("syncLogs", JSON.stringify(logs.slice(0, 10))); // Limitar a 10 logs
  } catch (error) {
    console.error("Erro ao adicionar log de sincronização:", error);
  }
}

/**
 * Iniciar sincronização
 */
export async function startSync(source: string): Promise<boolean> {
  try {
    // Verificar se já está em andamento
    const currentStatus = getSyncStatus();
    if (currentStatus.inProgress) {
      toast.info("Sincronização já está em andamento");
      return false;
    }
    
    // Registrar início da sincronização
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: {
        status: 'started'
      }
    });

    console.log("Sincronização iniciada");
    
    // Disparar evento de início de sincronização
    const startEvent = new CustomEvent(`${SYNC_EVENT}Started`, {
      detail: { source }
    });
    window.dispatchEvent(startEvent);
    
    // Atualizar status de sincronização
    setSyncStatus({
      lastSync: new Date().toISOString(),
      inProgress: true
    });
    
    // Simulação de sincronização (substituir por lógica real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Registrar conclusão da sincronização
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: {
        status: 'completed'
      }
    });
    
    // Atualizar status
    setSyncStatus({
      lastSync: new Date().toISOString(),
      inProgress: false
    });
    
    // Disparar evento de conclusão
    const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
      detail: { source, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(completeEvent);
    
    toast.success("Sincronização concluída com sucesso!");
    console.log("Sincronização concluída");
    return true;
  } catch (error) {
    console.error("Erro na sincronização:", error);
    
    // Registrar falha
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: false,
      details: {
        status: 'failed',
        error: String(error)
      }
    });
    
    // Restaurar status
    setSyncStatus({
      lastSync: getSyncStatus().lastSync,
      inProgress: false
    });
    
    toast.error("Falha na sincronização");
    return false;
  }
}

/**
 * Módulos suportados para sincronização
 */
export type SyncModule = 'cashFlow' | 'inventory' | 'recipes' | 'goals' | 'achievements' | 'payments';

/**
 * Sincronizar dados entre módulos
 */
export function syncModules(data: any, sourceModule: SyncModule) {
  try {
    const timestamp = new Date().toISOString();
    
    // Registrar início da sincronização
    addSyncLog({
      timestamp,
      source: sourceModule,
      success: true,
      details: {
        status: 'started',
        module: sourceModule
      }
    });

    console.log(`Sincronização iniciada: ${sourceModule}`);
    
    // Disparar evento de início de sincronização
    const startEvent = new CustomEvent(`${SYNC_EVENT}Started`, {
      detail: { module: sourceModule, timestamp }
    });
    window.dispatchEvent(startEvent);
    
    // Atualizar status de sincronização
    setSyncStatus({
      lastSync: timestamp,
      inProgress: true
    });
    
    // Executar sincronização específica por módulo
    let success = true;
    
    switch (sourceModule) {
      case 'cashFlow':
        // Sincronizar dados de fluxo de caixa com financeiros
        if (data) {
          // Converter dados para formato esperado pela função de atualização
          const entries = Array.isArray(data) ? data : 
            typeof data === 'string' ? JSON.parse(data) : [];
          
          // Atualizar dados financeiros
          import('./FinancialDataService')
            .then(({ updateFinancialData }) => {
              updateFinancialData(entries);
            });
        }
        break;
      
      case 'inventory':
        // Sincronizar estoque com receitas e produção
        // Implementação futura
        break;
        
      case 'recipes':
        // Sincronizar receitas com custos e CMV
        // Implementação futura
        break;
        
      case 'payments':
        // Sincronizar contas a pagar/receber com fluxo de caixa
        if (data) {
          const payments = Array.isArray(data) ? data :
            typeof data === 'string' ? JSON.parse(data) : [];
          
          // Implementar conversão de payments para cash_flow
          // para manter sincronização entre os módulos
        }
        break;
      
      default:
        console.log(`Módulo de sincronização não implementado: ${sourceModule}`);
    }
    
    // Finalizar sincronização
    setTimeout(() => {
      // Atualizar status
      setSyncStatus({
        lastSync: timestamp,
        inProgress: false
      });
      
      // Registrar conclusão da sincronização
      addSyncLog({
        timestamp: new Date().toISOString(),
        source: sourceModule,
        success,
        details: {
          status: success ? 'completed' : 'failed',
          module: sourceModule
        }
      });
      
      // Disparar evento de conclusão
      const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
        detail: { module: sourceModule, timestamp, success }
      });
      window.dispatchEvent(completeEvent);
      
      console.log(`Sincronização concluída: ${sourceModule}`);
    }, 1000); // Simulação de processamento assíncrono
    
    return true;
  } catch (error) {
    console.error("Erro na sincronização:", error);
    
    // Registrar falha
    addSyncLog({
      timestamp: new Date().toISOString(),
      source: sourceModule,
      success: false,
      details: {
        status: 'failed',
        error: String(error),
        module: sourceModule
      }
    });
    
    // Restaurar status
    setSyncStatus({
      lastSync: getSyncStatus().lastSync,
      inProgress: false
    });
    
    return false;
  }
}
