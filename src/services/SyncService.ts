
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getFinancialData, saveFinancialData } from "./FinancialStorageService";
import { createEmptyFinancialData } from "@/utils/financial-utils";

export const SYNC_EVENT = 'syncModules';

// Interface for synchronization status
export interface SyncStatus {
  lastSync: string | null;
  inProgress: boolean;
}

// Interface for synchronization log
export interface SyncLog {
  timestamp: string;
  source: string;
  success: boolean;
  details?: any;
}

// Function to initialize data for new users
export async function initializeNewUserData(userId?: string): Promise<boolean> {
  try {
    console.log("Initializing data for new user");
    
    // Reset financial data to empty state
    saveFinancialData(createEmptyFinancialData());
    
    // Reset cash flow data
    localStorage.setItem("cashFlow", JSON.stringify([]));
    
    // Reset goals data
    localStorage.setItem("goals", JSON.stringify([]));
    
    // Get user information if available
    if (userId) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // Store basic restaurant data if exists
      if (userData) {
        const restaurantData = {
          businessName: userData.name ? `Restaurante de ${userData.name}` : "Meu Restaurante",
          targetFoodCost: 30,
          targetBeverageCost: 25,
          isNewUser: true,
          lastFinancialUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('restaurantData', JSON.stringify(restaurantData));
      }
    }
    
    // Event to notify app that user data has been initialized
    window.dispatchEvent(new CustomEvent('newUserInitialized'));
    
    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return false;
  }
}

// Function to start synchronization
export async function startSync(source: string): Promise<boolean> {
  return syncModules({}, source);
}

// Function to synchronize data between modules
export async function syncModules(data: any, source: string): Promise<boolean> {
  try {
    // Dispatch event before synchronization
    const startEvent = new CustomEvent(`${SYNC_EVENT}Start`, {
      detail: {
        source,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(startEvent);
    
    // Update synchronization status in localStorage
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: null,
      inProgress: true
    }));
    
    // Log start of synchronization
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: { status: 'started' }
    });
    
    // Synchronize configuration data with financial data
    const restaurantData = localStorage.getItem('restaurantData');
    if (restaurantData) {
      const config = JSON.parse(restaurantData);
      
      // Update financial data with configuration values
      const financialData = await getFinancialData();
      
      // Apply target values from configuration
      if (config.targetFoodCost) {
        financialData.targetCMV = config.targetFoodCost;
      }
      
      // Save updated financial data
      saveFinancialData(financialData);
    }
    
    // With Supabase, we don't need to manually synchronize data
    // as it's already stored in the database
    
    // Simulate a small delay for the UI
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check data consistency (simulated)
    const consistency = await checkDataConsistency();
    
    // Event for synchronization completion
    const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        success: true,
        consistency
      }
    });
    window.dispatchEvent(completeEvent);
    
    // Update synchronization status
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: new Date().toISOString(),
      inProgress: false
    }));
    
    // Log completion of synchronization
    addSyncLog({
      timestamp: new Date().toISOString(),
      source,
      success: true,
      details: { 
        status: 'completed',
        consistency
      }
    });
    
    // Financial event to update components that depend on this data
    window.dispatchEvent(new Event('financialDataUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error during synchronization:', error);
    
    // Event for synchronization failure
    const failEvent = new CustomEvent(`${SYNC_EVENT}Fail`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        error
      }
    });
    window.dispatchEvent(failEvent);
    
    // Update synchronization status
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: localStorage.getItem('lastSync'),
      inProgress: false
    }));
    
    // Log synchronization failure
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

// Function to get synchronization status
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

// Function to add synchronization log
function addSyncLog(log: SyncLog): void {
  try {
    // Get existing logs
    const existingLogsString = localStorage.getItem('syncLogs');
    let logs: SyncLog[] = [];
    
    if (existingLogsString) {
      logs = JSON.parse(existingLogsString);
    }
    
    // Add new log
    logs.unshift(log);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    
    // Save updated logs
    localStorage.setItem('syncLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error adding synchronization log:', error);
  }
}

// Function to get synchronization logs
export function getSyncLogs(): SyncLog[] {
  try {
    const logs = localStorage.getItem('syncLogs');
    if (logs) {
      return JSON.parse(logs);
    }
    return [];
  } catch (error) {
    console.error('Error getting synchronization logs:', error);
    return [];
  }
}

// Function to check data consistency
async function checkDataConsistency(): Promise<{ status: string, details?: any }> {
  // In a real implementation, this method would check
  // if local data is synchronized with Supabase
  
  // For now, we return a simulated result
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
