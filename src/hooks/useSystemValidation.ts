
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  completionPercentage: number;
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
        
        if (!config.markup_padrao || config.markup_padrao < 100) {
          warnings.push('Markup padrão muito baixo (recomendado: 250% ou mais)');
        }

        if (!config.margem_lucro_esperada || config.margem_lucro_esperada < 15) {
          warnings.push('Margem de lucro muito baixa (recomendado: 20% ou mais)');
        }

        if (!config.receita_mensal_esperada || config.receita_mensal_esperada === 0) {
          missingFields.push('Meta de receita mensal');
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

      // Calcular percentual de conclusão
      const totalFields = 7; // Total de campos essenciais
      const completedFields = totalFields - missingFields.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      setValidation({
        isValid: missingFields.length === 0,
        missingFields,
        warnings,
        completionPercentage
      });

      // Mostrar alertas se necessário
      if (missingFields.length > 0) {
        toast.warning(`${missingFields.length} configuração(ões) essencial(is) faltando`);
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

  return {
    validation,
    isLoading,
    revalidate: validateSystemConfiguration
  };
}
