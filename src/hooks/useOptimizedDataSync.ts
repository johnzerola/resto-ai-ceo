
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  dataConsistency: 'healthy' | 'warning' | 'error';
}

export function useOptimizedDataSync() {
  const { currentRestaurant } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    isSyncing: false,
    dataConsistency: 'healthy'
  });

  // Monitor de conexão otimizado
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncAllModules(); // Auto-sync ao voltar online
    };
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronização completa de todos os módulos
  const syncAllModules = useCallback(async () => {
    if (!currentRestaurant?.id || !syncStatus.isOnline) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // 1. Buscar configurações do restaurante
      const { data: config, error: configError } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // 2. Sincronizar configurações com todos os módulos
      if (config) {
        // Atualizar ficha técnica com configurações
        await supabase
          .from('pratos')
          .update({
            margem_seguranca: config.perda_media_percentual || 10
          })
          .eq('restaurant_id', currentRestaurant.id)
          .is('margem_seguranca', null);

        // Recalcular CMV de todos os pratos
        const { data: pratos } = await supabase
          .from('pratos')
          .select('id')
          .eq('restaurant_id', currentRestaurant.id);

        if (pratos) {
          const promises = pratos.map(prato => 
            supabase.rpc('calcular_cmv_inteligente', { 
              prato_uuid: prato.id 
            }).catch(err => console.warn(`Erro ao recalcular prato ${prato.id}:`, err))
          );
          
          await Promise.allSettled(promises);
        }

        // Atualizar cash flow com configurações
        await supabase
          .from('cash_flow')
          .update({
            centro_custo: 'operacional'
          })
          .eq('restaurant_id', currentRestaurant.id)
          .is('centro_custo', null);
      }

      // 3. Validar consistência dos dados
      const consistency = await validateDataConsistency();
      
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        dataConsistency: consistency
      }));

      // Emitir evento de sincronização completa
      window.dispatchEvent(new CustomEvent('dataSync:complete', {
        detail: { 
          timestamp: new Date().toISOString(),
          consistency
        }
      }));

      toast.success('Dados sincronizados com sucesso');

    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncStatus(prev => ({ ...prev, dataConsistency: 'error' }));
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [currentRestaurant, syncStatus.isOnline]);

  // Validar consistência dos dados
  const validateDataConsistency = useCallback(async (): Promise<'healthy' | 'warning' | 'error'> => {
    if (!currentRestaurant?.id) return 'error';

    try {
      // Verificar se há configurações básicas
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (!config) return 'error';

      // Verificar pratos sem ingredientes
      const { data: pratosSemIngredientes } = await supabase
        .from('pratos')
        .select(`
          id, nome_prato,
          ingredientes_por_prato!left(id)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .is('ingredientes_por_prato.id', null);

      // Verificar ingredientes sem preço
      const { data: ingredientesSemPreco } = await supabase
        .from('insumos')
        .select('id')
        .eq('restaurant_id', currentRestaurant.id)
        .or('preco_unitario.is.null,preco_unitario.eq.0');

      const hasIssues = (pratosSemIngredientes && pratosSemIngredientes.length > 0) ||
                       (ingredientesSemPreco && ingredientesSemPreco.length > 0);

      return hasIssues ? 'warning' : 'healthy';

    } catch (error) {
      console.error('Erro na validação:', error);
      return 'error';
    }
  }, [currentRestaurant]);

  // Auto-sincronização inteligente (a cada 5 minutos se online)
  useEffect(() => {
    if (!syncStatus.isOnline || !currentRestaurant?.id) return;

    const interval = setInterval(syncAllModules, 300000);
    return () => clearInterval(interval);
  }, [syncAllModules, syncStatus.isOnline, currentRestaurant]);

  return {
    syncStatus,
    syncAllModules,
    validateDataConsistency
  };
}
