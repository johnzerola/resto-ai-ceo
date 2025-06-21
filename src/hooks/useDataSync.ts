
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

export function useDataSync() {
  const { currentRestaurant } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false
  });

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronizar configurações com todos os módulos
  const syncConfigurationsToModules = useCallback(async () => {
    if (!currentRestaurant?.id || !syncStatus.isOnline) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Buscar configurações atualizadas
      const { data: config, error: configError } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (config) {
        // Atualizar pratos com configurações padrão
        const { error: pratosError } = await supabase
          .from('pratos')
          .update({
            margem_seguranca: config.perda_media_percentual || 5
          })
          .eq('restaurant_id', currentRestaurant.id)
          .is('margem_seguranca', null);

        if (pratosError) console.warn('Erro ao sincronizar pratos:', pratosError);

        // Recalcular custos dos pratos usando função existente
        const { data: pratos } = await supabase
          .from('pratos')
          .select('id')
          .eq('restaurant_id', currentRestaurant.id);

        if (pratos) {
          for (const prato of pratos) {
            try {
              await supabase.rpc('calcular_cmv_inteligente', { prato_uuid: prato.id });
            } catch (error) {
              console.warn(`Erro ao recalcular prato ${prato.id}:`, error);
            }
          }
        }
      }

      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        pendingChanges: 0 
      }));

      // Emitir evento de sincronização completa
      window.dispatchEvent(new CustomEvent('dataSync:complete', {
        detail: { timestamp: new Date().toISOString() }
      }));

    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [currentRestaurant, syncStatus.isOnline]);

  // Validar integridade dos dados
  const validateDataIntegrity = useCallback(async () => {
    if (!currentRestaurant?.id) return [];

    const issues: string[] = [];

    try {
      // Verificar se há configurações básicas
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (!config) {
        issues.push('Configurações básicas do restaurante não encontradas');
      } else {
        if (!config.markup_padrao || config.markup_padrao <= 100) {
          issues.push('Markup padrão muito baixo ou não configurado');
        }
        
        if (!config.margem_lucro_esperada || config.margem_lucro_esperada <= 0) {
          issues.push('Margem de lucro esperada não configurada');
        }
      }

      // Verificar pratos sem ingredientes
      const { data: pratosSemIngredientes } = await supabase
        .from('pratos')
        .select(`
          id, nome_prato,
          ingredientes_por_prato!left(id)
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .is('ingredientes_por_prato.id', null);

      if (pratosSemIngredientes && pratosSemIngredientes.length > 0) {
        issues.push(`${pratosSemIngredientes.length} prato(s) sem ingredientes cadastrados`);
      }

      // Verificar ingredientes sem preço
      const { data: ingredientesSemPreco } = await supabase
        .from('insumos')
        .select('id, nome')
        .eq('restaurant_id', currentRestaurant.id)
        .or('preco_unitario.is.null,preco_unitario.eq.0');

      if (ingredientesSemPreco && ingredientesSemPreco.length > 0) {
        issues.push(`${ingredientesSemPreco.length} ingrediente(s) sem preço definido`);
      }

    } catch (error) {
      console.error('Erro na validação de integridade:', error);
      issues.push('Erro ao validar integridade dos dados');
    }

    return issues;
  }, [currentRestaurant]);

  // Auto-sincronização periódica
  useEffect(() => {
    if (!syncStatus.isOnline || !currentRestaurant?.id) return;

    const interval = setInterval(() => {
      syncConfigurationsToModules();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [syncConfigurationsToModules, syncStatus.isOnline, currentRestaurant]);

  return {
    syncStatus,
    syncConfigurationsToModules,
    validateDataIntegrity
  };
}
