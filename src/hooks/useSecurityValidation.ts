import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityIssue {
  type: 'error' | 'warning';
  message: string;
  component: string;
}

export function useSecurityValidation() {
  const { user, currentRestaurant } = useAuth();
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateUserIsolation = async (): Promise<SecurityIssue[]> => {
    const foundIssues: SecurityIssue[] = [];

    if (!user?.id) {
      foundIssues.push({
        type: 'error',
        message: 'Usuário não autenticado',
        component: 'useSecurityValidation'
      });
      return foundIssues;
    }

    try {
      // Verificar se existe dados de outros usuários no localStorage
      const localStorageKeys = Object.keys(localStorage);
      const problematicKeys = localStorageKeys.filter(key => {
        // Verificar chaves que não têm prefixo de usuário
        return !key.includes(user.id) && (
          key.includes('ficha_tecnica') ||
          key.includes('technicalSheets') ||
          key.includes('financialData') ||
          key.includes('restaurantData')
        );
      });

      if (problematicKeys.length > 0) {
        foundIssues.push({
          type: 'error',
          message: `Encontradas ${problematicKeys.length} chaves localStorage sem isolamento por usuário: ${problematicKeys.join(', ')}`,
          component: 'localStorage'
        });
      }

      // Verificar se RLS está funcionando tentando acessar dados sem filtro
      if (currentRestaurant?.id) {
        const { data: cashFlowTest, error } = await supabase
          .from('cash_flow')
          .select('id, restaurant_id')
          .neq('restaurant_id', currentRestaurant.id)
          .limit(1);

        if (cashFlowTest && cashFlowTest.length > 0) {
          foundIssues.push({
            type: 'error',
            message: 'RLS falhou: conseguiu acessar dados de outro restaurante na tabela cash_flow',
            component: 'RLS-cash_flow'
          });
        }

        const { data: goalTest } = await supabase
          .from('goals')
          .select('id, restaurant_id')
          .neq('restaurant_id', currentRestaurant.id)
          .limit(1);

        if (goalTest && goalTest.length > 0) {
          foundIssues.push({
            type: 'error',
            message: 'RLS falhou: conseguiu acessar dados de outro restaurante na tabela goals',
            component: 'RLS-goals'
          });
        }
      }

    } catch (error) {
      console.error('Erro na validação de segurança:', error);
      foundIssues.push({
        type: 'warning',
        message: `Erro durante validação: ${error}`,
        component: 'validation'
      });
    }

    return foundIssues;
  };

  const validateAllQueries = async (): Promise<SecurityIssue[]> => {
    const foundIssues: SecurityIssue[] = [];

    if (!currentRestaurant?.id) {
      foundIssues.push({
        type: 'warning',
        message: 'Nenhum restaurante selecionado para validação',
        component: 'restaurant-context'
      });
      return foundIssues;
    }

    try {
      // Verificar queries essenciais que devem ter filtro por restaurant_id
      const tablesQueries = [
        () => supabase.from('cash_flow').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('goals').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('insumos').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('pratos').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('movimentacao_estoque').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('audit_logs').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('business_profiles').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1),
        () => supabase.from('configuracoes_restaurante').select('id, restaurant_id').eq('restaurant_id', currentRestaurant.id).limit(1)
      ];

      const tableNames = ['cash_flow', 'goals', 'insumos', 'pratos', 'movimentacao_estoque', 'audit_logs', 'business_profiles', 'configuracoes_restaurante'];

      for (let i = 0; i < tablesQueries.length; i++) {
        try {
          const { data, error } = await tablesQueries[i]();

          if (error) {
            foundIssues.push({
              type: 'warning',
              message: `Erro ao testar tabela ${tableNames[i]}: ${error.message}`,
              component: `table-${tableNames[i]}`
            });
          }
        } catch (tableError) {
          foundIssues.push({
            type: 'warning',
            message: `Erro ao acessar tabela ${tableNames[i]}: ${tableError}`,
            component: `table-${tableNames[i]}`
          });
        }
      }

    } catch (error) {
      foundIssues.push({
        type: 'error',
        message: `Erro na validação de queries: ${error}`,
        component: 'query-validation'
      });
    }

    return foundIssues;
  };

  const runFullValidation = async () => {
    setIsValidating(true);
    
    try {
      const isolationIssues = await validateUserIsolation();
      const queryIssues = await validateAllQueries();
      
      const allIssues = [...isolationIssues, ...queryIssues];
      setIssues(allIssues);

      if (allIssues.length === 0) {
        toast.success('✅ Validação de segurança: Nenhum problema encontrado');
      } else {
        const errorCount = allIssues.filter(i => i.type === 'error').length;
        const warningCount = allIssues.filter(i => i.type === 'warning').length;
        
        if (errorCount > 0) {
          toast.error(`❌ Encontrados ${errorCount} problemas críticos de segurança`);
        } else {
          toast.warning(`⚠️ Encontrados ${warningCount} avisos de segurança`);
        }
      }

    } catch (error) {
      toast.error('Erro durante validação de segurança');
      console.error('Erro na validação:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const cleanupLocalStorage = () => {
    if (!user?.id) return;

    const keys = Object.keys(localStorage);
    let cleanedCount = 0;

    keys.forEach(key => {
      if (!key.includes(user.id) && (
        key.includes('ficha_tecnica') ||
        key.includes('technicalSheets') ||
        key.includes('financialData') ||
        key.includes('restaurantData')
      )) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      toast.success(`Limpeza concluída: ${cleanedCount} chaves removidas`);
    } else {
      toast.info('Nenhuma chave problemática encontrada');
    }
  };

  useEffect(() => {
    if (user?.id && currentRestaurant?.id) {
      // Executar validação automática após 2 segundos
      const timer = setTimeout(() => {
        runFullValidation();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user?.id, currentRestaurant?.id]);

  return {
    issues,
    isValidating,
    runFullValidation,
    cleanupLocalStorage,
    hasErrors: issues.some(i => i.type === 'error'),
    hasWarnings: issues.some(i => i.type === 'warning')
  };
}