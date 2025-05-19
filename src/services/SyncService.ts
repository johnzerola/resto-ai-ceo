
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SYNC_EVENT = 'syncModules';

// Interface for sync status
export interface SyncStatus {
  lastSync: string | null;
  inProgress: boolean;
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
    
    // Update sync status in localStorage
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: null,
      inProgress: true
    }));
    
    // With Supabase, we don't need to manually sync data
    // as it's already stored in the database
    
    // Simulate a small delay for the UI
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Event for sync completion
    const completeEvent = new CustomEvent(`${SYNC_EVENT}Complete`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        success: true
      }
    });
    window.dispatchEvent(completeEvent);
    
    // Update sync status
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: new Date().toISOString(),
      inProgress: false
    }));
    
    // Financial event to update components that depend on this data
    window.dispatchEvent(new Event('financialDataUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error during synchronization:', error);
    
    // Event for sync failure
    const failEvent = new CustomEvent(`${SYNC_EVENT}Fail`, {
      detail: {
        source,
        timestamp: new Date().toISOString(),
        error
      }
    });
    window.dispatchEvent(failEvent);
    
    // Update sync status
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: localStorage.getItem('lastSync'),
      inProgress: false
    }));
    
    toast.error('Error synchronizing data');
    return false;
  }
}

// Function to get sync status
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
