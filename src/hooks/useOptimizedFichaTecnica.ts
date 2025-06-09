
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from './useDebounce';
import { useMemoizedCalculations } from './useMemoizedCalculations';
import { ValidationService, RateLimiter } from '@/services/ValidationService';
import { toast } from 'sonner';

interface Ingrediente {
  insumo_id: string;
  nome_insumo: string;
  quantidade_bruta: number;
  quantidade_liquida: number;
  fator_correcao: number;
  preco_unitario: number;
  custo_total: number;
  unidade_medida: string;
}

interface PratoForm {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes: string;
  margem_seguranca: number;
}

export function useOptimizedFichaTecnica() {
  const { currentRestaurant } = useAuth();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [prato, setPrato] = useState<PratoForm>({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: '',
    margem_seguranca: 10
  });
  const [configuracoes] = useState({
    markup_padrao: 250,
    despesa_fixa_mensal: 0,
    total_pratos_vendidos_mensal: 1000
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debounce para cálculos automáticos
  const debouncedIngredientes = useDebounce(ingredientes, 300);
  const debouncedRendimento = useDebounce(prato.rendimento_porcoes, 300);
  const debouncedMargem = useDebounce(prato.margem_seguranca, 300);

  // Cálculos memoizados
  const calculos = useMemoizedCalculations(
    debouncedIngredientes,
    debouncedRendimento,
    debouncedMargem,
    configuracoes
  );

  // Atualizar ingrediente com validação
  const atualizarIngrediente = useCallback((index: number, campo: keyof Ingrediente, valor: any) => {
    try {
      // Rate limiting para evitar spam
      if (!RateLimiter.canPerformAction('update_ingredient', 10, 1000)) {
        toast.error('Muitas atualizações. Aguarde um momento.');
        return;
      }

      const novosIngredientes = [...ingredientes];
      const ingrediente = novosIngredientes[index];
      
      // Validação de entrada
      if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
        if (!ValidationService.validateFinancialValue(Number(valor))) {
          toast.error('Valor inválido');
          return;
        }
      }

      // Atualizar valor
      novosIngredientes[index] = { ...ingrediente, [campo]: valor };

      // Recalcular campos dependentes
      if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
        const ing = novosIngredientes[index];
        ing.quantidade_liquida = ing.quantidade_bruta * ing.fator_correcao;
        ing.custo_total = ing.quantidade_liquida * ing.preco_unitario;
      }

      if (campo === 'quantidade_liquida') {
        novosIngredientes[index].custo_total = Number(valor) * ingrediente.preco_unitario;
      }

      setIngredientes(novosIngredientes);
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      toast.error('Erro ao atualizar ingrediente');
    }
  }, [ingredientes]);

  // Salvar com validação completa
  const salvarFichaTecnica = useCallback(async () => {
    if (!currentRestaurant?.id) {
      toast.error('Restaurante não selecionado');
      return false;
    }

    // Rate limiting para salvamento
    if (!RateLimiter.canPerformAction('save_ficha', 5, 60000)) {
      toast.error('Limite de salvamentos excedido. Aguarde 1 minuto.');
      return false;
    }

    // Validação do prato
    try {
      ValidationService.PratoSchema.parse({
        ...prato,
        restaurant_id: currentRestaurant.id
      });
    } catch (error) {
      toast.error('Dados do prato inválidos');
      return false;
    }

    // Validação dos ingredientes
    if (ingredientes.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return false;
    }

    for (const ing of ingredientes) {
      try {
        ValidationService.IngredienteSchema.parse({
          quantidade_bruta: ing.quantidade_bruta,
          fator_correcao: ing.fator_correcao,
          insumo_id: ing.insumo_id,
          prato_id: 'temp' // Será substituído
        });
      } catch (error) {
        toast.error('Dados de ingrediente inválidos');
        return false;
      }
    }

    setIsLoading(true);

    try {
      // Sanitizar dados de entrada
      const pratoLimpo = {
        ...prato,
        nome_prato: ValidationService.sanitizeInput(prato.nome_prato),
        categoria: ValidationService.sanitizeInput(prato.categoria || ''),
        observacoes: ValidationService.sanitizeInput(prato.observacoes || ''),
        restaurant_id: currentRestaurant.id
      };

      // Salvar usando transaction para garantir consistência
      const { data: pratoData, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          ...pratoLimpo,
          custo_total: calculos.custo_total,
          custo_por_porcao: calculos.custo_por_porcao,
          preco_sugerido: calculos.preco_sugerido,
          lucro_estimado: calculos.lucro_estimado,
          margem_percentual: calculos.margem_percentual,
          status_viabilidade: calculos.status_viabilidade
        })
        .select()
        .single();

      if (pratoError) throw pratoError;

      // Salvar ingredientes
      const ingredientesData = ingredientes.map(ing => ({
        prato_id: pratoData.id,
        insumo_id: ing.insumo_id,
        quantidade_bruta: ing.quantidade_bruta,
        quantidade_liquida: ing.quantidade_liquida,
        fator_correcao: ing.fator_correcao,
        custo_total: ing.custo_total
      }));

      const { error: ingredientesError } = await supabase
        .from('ingredientes_por_prato')
        .insert(ingredientesData);

      if (ingredientesError) throw ingredientesError;

      toast.success('Ficha técnica salva com sucesso!');
      
      // Limpar formulário
      setPrato({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: '',
        margem_seguranca: 10
      });
      setIngredientes([]);

      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentRestaurant, prato, ingredientes, calculos]);

  return {
    ingredientes,
    setIngredientes,
    prato,
    setPrato,
    calculos,
    isLoading,
    atualizarIngrediente,
    salvarFichaTecnica
  };
}
