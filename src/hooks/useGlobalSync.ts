
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeData } from './useRealTimeData';

interface GlobalSyncState {
  lastUpdate: number;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingUpdates: number;
}

export function useGlobalSync() {
  const { currentRestaurant } = useAuth();
  const { refreshData } = useRealTimeData();
  const [syncState, setSyncState] = useState<GlobalSyncState>({
    lastUpdate: Date.now(),
    isOnline: navigator.onLine,
    syncStatus: 'idle',
    pendingUpdates: 0
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global sync trigger
  const triggerGlobalSync = useCallback(async () => {
    if (!currentRestaurant?.id || !syncState.isOnline) return;

    setSyncState(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      await refreshData();
      setSyncState(prev => ({ 
        ...prev, 
        syncStatus: 'idle',
        lastUpdate: Date.now(),
        pendingUpdates: 0
      }));
      
      // Notify all components of successful sync
      window.dispatchEvent(new CustomEvent('globalSyncComplete'));
    } catch (error) {
      setSyncState(prev => ({ ...prev, syncStatus: 'error' }));
      console.error('Global sync failed:', error);
    }
  }, [currentRestaurant?.id, syncState.isOnline, refreshData]);

  // Auto-sync every 2 minutes
  useEffect(() => {
    const interval = setInterval(triggerGlobalSync, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [triggerGlobalSync]);

  return {
    syncState,
    triggerGlobalSync
  };
}
