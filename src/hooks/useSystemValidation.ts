
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  completionPercentage: number;
  financialSummary?: {
    totalReceivable: number;
    totalPayable: number;
    balance: number;
  };
}

export function useSystemValidation() {
  const { currentRestaurant } = useAuth();
  const [validation, setValidation] = useState<SystemValidationResult>({
    isValid: false,
    missingFields: [],
    warnings: [],
    completionPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateSystemConfiguration = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      // Verificar configurações básicas
      const { data: config, error: configError } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      const missingFields: string[] = [];
      const warnings: string[] = [];

      // Validar campos essenciais
      if (!config) {
        missingFields.push('Configurações básicas do restaurante');
      } else {
        if (!config.despesas_fixas_mensais || config.despesas_fixas_mensais === 0) {
          missingFields.push('Despesas fixas mensais');
        }
        
        if (!config.markup_padrao || config.markup_padrao < 150) {
          warnings.push('Markup padrão muito baixo (recomendado: 250% ou mais)');
        }

        if (!config.margem_lucro_esperada || config.margem_lucro_esperada < 15) {
          warnings.push('Margem de lucro muito baixa (recomendado: 25% ou mais)');
        }

        if (!config.receita_mensal_esperada || config.receita_mensal_esperada === 0) {
          missingFields.push('Meta de receita mensal');
        }

        if (!config.custo_medio_por_prato || config.custo_medio_por_prato === 0) {
          warnings.push('Custo médio por prato não definido');
        }
      }

      // Verificar se há insumos cadastrados
      const { data: insumos, error: insumosError } = await supabase
        .from('insumos')
        .select('id')
        .eq('restaurant_id', currentRestaurant.id)
        .limit(1);

      if (insumosError) throw insumosError;

      if (!insumos || insumos.length === 0) {
        missingFields.push('Cadastro de insumos/ingredientes');
      }

      // Verificar se há pratos cadastrados
      const { data: pratos, error: pratosError } = await supabase
        .from('pratos')
        .select('id')
        .eq('restaurant_id', currentRestaurant.id)
        .limit(1);

      if (pratosError) throw pratosError;

      if (!pratos || pratos.length === 0) {
        warnings.push('Nenhum prato cadastrado ainda');
      }

      // Verificar unidades de medida
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades_medida')
        .select('id')
        .limit(1);

      if (unidadesError) throw unidadesError;

      if (!unidades || unidades.length === 0) {
        warnings.push('Sistema de unidades de medida precisa ser configurado');
      }

      // Buscar resumo financeiro usando cash_flow
      let financialSummary;
      try {
        const [cashFlowExpenses, cashFlowIncome] = await Promise.all([
          supabase
            .from('cash_flow')
            .select('amount')
            .eq('restaurant_id', currentRestaurant.id)
            .eq('type', 'expense')
            .in('status', ['pending', 'null']),
          supabase
            .from('cash_flow')
            .select('amount')
            .eq('restaurant_id', currentRestaurant.id)
            .eq('type', 'income')
            .in('status', ['pending', 'null'])
        ]);

        const totalPayable = cashFlowExpenses.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
        const totalReceivable = cashFlowIncome.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

        financialSummary = {
          totalReceivable,
          totalPayable,
          balance: totalReceivable - totalPayable
        };
      } catch (error) {
        console.warn('Erro ao buscar resumo financeiro:', error);
      }

      // Calcular percentual de conclusão
      const totalFields = 8; // Total de campos essenciais
      const completedFields = totalFields - missingFields.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      const newValidation = {
        isValid: missingFields.length === 0,
        missingFields,
        warnings,
        completionPercentage,
        financialSummary
      };

      setValidation(newValidation);

      // Mostrar alertas se necessário
      if (missingFields.length > 0) {
        toast.warning(`${missingFields.length} configuração(ões) essencial(is) faltando`);
      } else if (warnings.length === 0) {
        toast.success('Sistema configurado com sucesso! 🎉');
      }

    } catch (error) {
      console.error('Erro na validação do sistema:', error);
      toast.error('Erro ao validar configurações do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant?.id) {
      validateSystemConfiguration();
    }
  }, [currentRestaurant]);

  // Revalidar quando houver mudanças importantes
  useEffect(() => {
    const handleDataChange = () => {
      setTimeout(validateSystemConfiguration, 1000);
    };

    window.addEventListener('dataSync:complete', handleDataChange);
    window.addEventListener('financialDataUpdated', handleDataChange);

    return () => {
      window.removeEventListener('dataSync:complete', handleDataChange);
      window.removeEventListener('financialDataUpdated', handleDataChange);
    };
  }, []);

  return {
    validation,
    isLoading,
    revalidate: validateSystemConfiguration
  };
}
