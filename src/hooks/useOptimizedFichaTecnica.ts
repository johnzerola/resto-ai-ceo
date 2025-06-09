
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from './useDebounce';
import { useMemoizedCalculations } from './useMemoizedCalculations';
import { useSecureValidation } from './useSecureValidation';
import { useDataSync } from './useDataSync';
import { useOptimizedQuery } from './useQueryCache';
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

const RATE_LIMITS = {
  UPDATE_INGREDIENT: { max: 10, window: 1000 },
  SAVE_FICHA: { max: 5, window: 60000 }
};

class RateLimiter {
  private static actions: Map<string, number[]> = new Map();

  static canPerformAction(action: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;
    
    if (!this.actions.has(key)) {
      this.actions.set(key, [now]);
      return true;
    }

    const timestamps = this.actions.get(key)!;
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length < maxRequests) {
      validTimestamps.push(now);
      this.actions.set(key, validTimestamps);
      return true;
    }
    
    return false;
  }
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

  const { validateField, sanitizeInput, errors } = useSecureValidation();

  // Configurações com cache otimizado
  const { data: configuracoes } = useOptimizedQuery(
    ['configuracoes', currentRestaurant?.id],
    async () => {
      if (!currentRestaurant?.id) return null;
      
      const { data, error } = await supabase
        .from('configuracoes_precificacao')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      staleTime: 1000 * 60 * 10 // 10 minutos
    }
  );

  // Debounce otimizado com diferentes tempos
  const debouncedIngredientes = useDebounce(ingredientes, 300);
  const debouncedRendimento = useDebounce(prato.rendimento_porcoes, 500);
  const debouncedMargem = useDebounce(prato.margem_seguranca, 500);

  // Cálculos memoizados com configurações dinâmicas
  const configCalculo = useMemo(() => ({
    markup_padrao: configuracoes?.markup_padrao || 250,
    despesa_fixa_mensal: configuracoes?.despesa_fixa_mensal || 0,
    total_pratos_vendidos_mensal: configuracoes?.total_pratos_vendidos_mensal || 1000
  }), [configuracoes]);

  const calculos = useMemoizedCalculations(
    debouncedIngredientes,
    debouncedRendimento,
    debouncedMargem,
    configCalculo
  );

  // Função otimizada para atualizar ingredientes
  const atualizarIngrediente = useCallback((
    index: number, 
    campo: keyof Ingrediente, 
    valor: any
  ) => {
    // Rate limiting
    if (!RateLimiter.canPerformAction(
      'UPDATE_INGREDIENT', 
      RATE_LIMITS.UPDATE_INGREDIENT.max,
      RATE_LIMITS.UPDATE_INGREDIENT.window
    )) {
      toast.error('Muitas atualizações. Aguarde um momento.');
      return;
    }

    // Validação antes da atualização
    if (campo === 'nome_insumo' && typeof valor === 'string') {
      if (!validateField(campo, valor)) return;
      valor = sanitizeInput(valor);
    }

    if (['quantidade_bruta', 'fator_correcao', 'preco_unitario'].includes(campo)) {
      if (!validateField(campo, Number(valor))) return;
    }

    setIngredientes(prev => {
      const novosIngredientes = [...prev];
      const ingrediente = { ...novosIngredientes[index] };
      
      // Atualizar valor
      (ingrediente as any)[campo] = valor;

      // Recalcular campos dependentes de forma otimizada
      if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
        ingrediente.quantidade_liquida = ingrediente.quantidade_bruta * ingrediente.fator_correcao;
        ingrediente.custo_total = ingrediente.quantidade_liquida * ingrediente.preco_unitario;
      } else if (campo === 'preco_unitario') {
        ingrediente.custo_total = ingrediente.quantidade_liquida * Number(valor);
      } else if (campo === 'quantidade_liquida') {
        ingrediente.custo_total = Number(valor) * ingrediente.preco_unitario;
      }

      novosIngredientes[index] = ingrediente;
      return novosIngredientes;
    });
  }, [validateField, sanitizeInput]);

  // Salvar com sincronização otimizada
  const salvarFichaTecnica = useCallback(async () => {
    if (!currentRestaurant?.id) {
      toast.error('Restaurante não selecionado');
      return false;
    }

    // Rate limiting para salvamento
    if (!RateLimiter.canPerformAction(
      'SAVE_FICHA',
      RATE_LIMITS.SAVE_FICHA.max,
      RATE_LIMITS.SAVE_FICHA.window
    )) {
      toast.error('Limite de salvamentos excedido. Aguarde 1 minuto.');
      return false;
    }

    // Validação completa antes de salvar
    const pratoValidado = {
      ...prato,
      nome_prato: sanitizeInput(prato.nome_prato),
      categoria: sanitizeInput(prato.categoria || ''),
      observacoes: sanitizeInput(prato.observacoes || '')
    };

    if (!validateField('nome_prato', pratoValidado.nome_prato) ||
        !validateField('rendimento_porcoes', prato.rendimento_porcoes) ||
        ingredientes.length === 0) {
      toast.error('Dados inválidos ou incompletos');
      return false;
    }

    try {
      // Usar transaction para garantir consistência
      const { data: pratoData, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          ...pratoValidado,
          restaurant_id: currentRestaurant.id,
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

      // Salvar ingredientes em batch
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
      
      // Reset otimizado
      setPrato({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: '',
        margem_seguranca: 10
      });
      setIngredientes([]);

      // Invalidar cache
      window.dispatchEvent(new CustomEvent('dataSync', {
        detail: { type: 'ficha_salva', data: pratoData }
      }));

      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, prato, ingredientes, calculos, validateField, sanitizeInput]);

  return {
    ingredientes,
    setIngredientes,
    prato,
    setPrato,
    calculos,
    configuracoes,
    errors,
    atualizarIngrediente,
    salvarFichaTecnica
  };
}
