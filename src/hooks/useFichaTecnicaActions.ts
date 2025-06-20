
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface IngredienteInteligente {
  id: string;
  insumo_id: string;
  nome_insumo: string;
  quantidade_bruta: number;
  quantidade_liquida: number;
  fator_correcao: number;
  preco_unitario: number;
  custo_total: number;
  unidade_medida: string;
}

interface MetasLucro {
  meta_lucro_percentual: number;
  meta_lucro_valor: number;
  meta_cmv_percentual: number;
  tipo_meta: 'percentual' | 'valor' | 'cmv';
}

export function useFichaTecnicaActions() {
  const { currentRestaurant } = useAuth();
  const [metasLucro, setMetasLucro] = useState<MetasLucro>({
    meta_lucro_percentual: 30,
    meta_lucro_valor: 0,
    meta_cmv_percentual: 30,
    tipo_meta: 'percentual'
  });
  const [precoDesejado, setPrecoDesejado] = useState<number>(0);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<any[]>([]);

  // Adicionar ingrediente
  const adicionarIngrediente = useCallback(() => {
    const novoIngrediente: IngredienteInteligente = {
      id: Date.now().toString(),
      insumo_id: '',
      nome_insumo: '',
      quantidade_bruta: 0,
      quantidade_liquida: 0,
      fator_correcao: 1,
      preco_unitario: 0,
      custo_total: 0,
      unidade_medida: 'g'
    };
    return novoIngrediente;
  }, []);

  // Atualizar ingrediente
  const atualizarIngrediente = useCallback((ingredientes: IngredienteInteligente[], id: string, campo: keyof IngredienteInteligente, valor: any) => {
    return ingredientes.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        
        if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
          updated.quantidade_liquida = updated.quantidade_bruta * updated.fator_correcao;
          updated.custo_total = updated.quantidade_liquida * updated.preco_unitario;
        } else if (campo === 'preco_unitario') {
          updated.custo_total = updated.quantidade_liquida * Number(valor);
        } else if (campo === 'quantidade_liquida') {
          updated.custo_total = Number(valor) * updated.preco_unitario;
        }
        
        return updated;
      }
      return ing;
    });
  }, []);

  // Salvar ficha técnica
  const salvarFichaTecnica = useCallback(async (
    ingredientes: IngredienteInteligente[],
    resultados: any,
    dadosPrato: {
      nome_prato: string;
      categoria: string;
      rendimento_porcoes: number;
      observacoes?: string;
    }
  ) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) {
      toast.error('Dados incompletos para salvar a ficha técnica');
      return false;
    }

    try {
      const { data: prato, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          ...dadosPrato,
          restaurant_id: currentRestaurant.id,
          custo_total: resultados?.cmv_estimado_valor || 0,
          preco_sugerido: resultados?.preco_sugerido || 0,
          preco_praticado: precoDesejado || resultados?.preco_sugerido || 0,
          lucro_estimado: resultados?.lucro_estimado_valor || 0,
          margem_percentual: resultados?.margem_liquida || 0,
          status_viabilidade: resultados?.status_viabilidade || 'saudavel'
        })
        .select()
        .single();

      if (pratoError) throw pratoError;

      const ingredientesData = ingredientes.map(ing => ({
        prato_id: prato.id,
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
      return true;
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, precoDesejado]);

  // Carregar insumos disponíveis
  useEffect(() => {
    if (currentRestaurant?.id) {
      const carregarInsumos = async () => {
        const { data, error } = await supabase
          .from('insumos')
          .select('*')
          .eq('restaurant_id', currentRestaurant.id);
        
        if (!error && data) {
          setInsumosDisponiveis(data);
        }
      };
      carregarInsumos();
    }
  }, [currentRestaurant]);

  return {
    metasLucro,
    setMetasLucro,
    precoDesejado,
    setPrecoDesejado,
    insumosDisponiveis,
    adicionarIngrediente,
    atualizarIngrediente,
    salvarFichaTecnica
  };
}
