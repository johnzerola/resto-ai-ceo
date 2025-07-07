import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MigrationStatus {
  isComplete: boolean;
  isRunning: boolean;
  error?: string;
  migratedItems: {
    cashFlow: number;
    goals: number;
    inventory: number;
  };
}

export function useDataMigration() {
  const { currentRestaurant } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<MigrationStatus>({
    isComplete: false,
    isRunning: false,
    migratedItems: { cashFlow: 0, goals: 0, inventory: 0 }
  });

  useEffect(() => {
    if (currentRestaurant && !status.isComplete && !status.isRunning) {
      checkAndMigrate();
    }
  }, [currentRestaurant]);

  const checkAndMigrate = async () => {
    if (!currentRestaurant) return;

    setStatus(prev => ({ ...prev, isRunning: true }));

    try {
      // Verificar se há dados no localStorage para migrar
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      const goalsData = localStorage.getItem('goals');
      const inventoryData = localStorage.getItem('inventoryItems');

      let migratedItems = { cashFlow: 0, goals: 0, inventory: 0 };

      // Migrar Cash Flow
      if (cashFlowData) {
        const entries = JSON.parse(cashFlowData);
        for (const entry of entries) {
          if (entry.amount && entry.type && entry.date) {
            const { error } = await supabase
              .from('cash_flow')
              .insert({
                restaurant_id: currentRestaurant.id,
                amount: entry.amount,
                type: entry.type,
                category: entry.category || 'outros',
                description: entry.description || 'Migrado do localStorage',
                date: entry.date,
                status: 'paid'
              });

            if (!error) {
              migratedItems.cashFlow++;
            }
          }
        }
        // Limpar localStorage após migração bem-sucedida
        localStorage.removeItem('cashFlowEntries');
      }

      // Migrar Goals
      if (goalsData) {
        const goals = JSON.parse(goalsData);
        for (const goal of goals) {
          if (goal.title && goal.target) {
            const { error } = await supabase
              .from('goals')
              .insert({
                restaurant_id: currentRestaurant.id,
                title: goal.title,
                description: goal.description || 'Meta migrada do localStorage',
                target: goal.target,
                current: goal.current || 0,
                deadline: goal.deadline,
                completed: goal.completed || false,
                category: goal.category || 'geral'
              });

            if (!error) {
              migratedItems.goals++;
            }
          }
        }
        localStorage.removeItem('goals');
      }

      // Migrar Inventory (se existir estrutura similar)
      if (inventoryData) {
        const inventory = JSON.parse(inventoryData);
        for (const item of inventory) {
          if (item.name && item.preco_unitario) {
            const { error } = await supabase
              .from('insumos')
              .insert({
                restaurant_id: currentRestaurant.id,
                nome: item.name,
                preco_unitario: item.preco_unitario || 0,
                preco_pago: item.cost_per_unit || item.preco_unitario || 0,
                volume_embalagem: 1,
                unidade_medida: item.unit || 'unidade',
                categoria: item.category || 'geral',
                estoque_atual: item.quantity || 0,
                estoque_minimo: item.minStock || 0
              });

            if (!error) {
              migratedItems.inventory++;
            }
          }
        }
        localStorage.removeItem('inventoryItems');
      }

      setStatus({
        isComplete: true,
        isRunning: false,
        migratedItems
      });

      // Mostrar resultado da migração
      const totalMigrated = migratedItems.cashFlow + migratedItems.goals + migratedItems.inventory;
      if (totalMigrated > 0) {
        toast({
          title: "Dados migrados com sucesso!",
          description: `${migratedItems.cashFlow} transações, ${migratedItems.goals} metas e ${migratedItems.inventory} itens de estoque foram transferidos para o banco de dados.`,
        });
      }

    } catch (error) {
      console.error('Erro durante migração:', error);
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        error: 'Erro ao migrar dados do localStorage'
      }));
    }
  };

  return {
    status,
    runMigration: checkAndMigrate
  };
}