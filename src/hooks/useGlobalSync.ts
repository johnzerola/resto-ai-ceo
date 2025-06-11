
import { useState, useEffect } from 'react';

export interface SyncState {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastUpdate: string;
}

export function useGlobalSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    syncStatus: 'idle',
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({
        ...prev,
        isOnline: true,
        lastUpdate: new Date().toISOString()
      }));
    };

    const handleOffline = () => {
      setSyncState(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    const handleDataUpdate = () => {
      setSyncState(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString()
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('financialDataUpdated', handleDataUpdate);
    window.addEventListener('goalsUpdated', handleDataUpdate);
    window.addEventListener('inventoryUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('financialDataUpdated', handleDataUpdate);
      window.removeEventListener('goalsUpdated', handleDataUpdate);
      window.removeEventListener('inventoryUpdated', handleDataUpdate);
    };
  }, []);

  return { syncState };
}
