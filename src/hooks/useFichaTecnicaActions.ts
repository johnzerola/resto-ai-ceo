
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

  // Adicionar ingrediente com validação
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

  // Atualizar ingrediente com cálculos automáticos
  const atualizarIngrediente = useCallback((ingredientes: IngredienteInteligente[], id: string, campo: keyof IngredienteInteligente, valor: any) => {
    return ingredientes.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        
        // Recalcular campos dependentes
        if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
          updated.quantidade_liquida = Number(updated.quantidade_bruta) * Number(updated.fator_correcao);
          updated.custo_total = updated.quantidade_liquida * Number(updated.preco_unitario);
        } else if (campo === 'preco_unitario') {
          updated.custo_total = Number(updated.quantidade_liquida) * Number(valor);
        } else if (campo === 'quantidade_liquida') {
          updated.custo_total = Number(valor) * Number(updated.preco_unitario);
        }
        
        // Validações básicas
        if (updated.quantidade_bruta < 0) updated.quantidade_bruta = 0;
        if (updated.quantidade_liquida < 0) updated.quantidade_liquida = 0;
        if (updated.fator_correcao < 0) updated.fator_correcao = 1;
        if (updated.preco_unitario < 0) updated.preco_unitario = 0;
        
        return updated;
      }
      return ing;
    });
  }, []);

  // Salvar ficha técnica com validações completas
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
    if (!currentRestaurant?.id) {
      toast.error('Nenhum restaurante selecionado');
      return false;
    }

    if (ingredientes.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return false;
    }

    if (!dadosPrato.nome_prato?.trim()) {
      toast.error('Nome do prato é obrigatório');
      return false;
    }

    if (dadosPrato.rendimento_porcoes <= 0) {
      toast.error('Rendimento deve ser maior que zero');
      return false;
    }

    // Validar ingredientes
    const ingredientesInvalidos = ingredientes.filter(ing => 
      !ing.insumo_id || 
      !ing.nome_insumo || 
      ing.quantidade_bruta <= 0 || 
      ing.preco_unitario <= 0
    );

    if (ingredientesInvalidos.length > 0) {
      toast.error('Verifique os dados dos ingredientes');
      return false;
    }

    try {
      // Salvar prato
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

      // Salvar ingredientes
      const ingredientesData = ingredientes.map(ing => ({
        prato_id: prato.id,
        insumo_id: ing.insumo_id,
        quantidade_bruta: Number(ing.quantidade_bruta),
        quantidade_liquida: Number(ing.quantidade_liquida),
        fator_correcao: Number(ing.fator_correcao),
        custo_total: Number(ing.custo_total)
      }));

      const { error: ingredientesError } = await supabase
        .from('ingredientes_por_prato')
        .insert(ingredientesData);

      if (ingredientesError) throw ingredientesError;

      // Salvar metas se definidas
      if (precoDesejado > 0) {
        await supabase
          .from('precos_desejados_por_produto')
          .insert({
            prato_id: prato.id,
            restaurant_id: currentRestaurant.id,
            preco_desejado: precoDesejado,
            margem_desejada: metasLucro.meta_lucro_percentual,
            tipo_meta: metasLucro.tipo_meta
          });
      }

      toast.success('Ficha técnica salva com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, precoDesejado, metasLucro]);

  // Carregar insumos disponíveis
  useEffect(() => {
    if (currentRestaurant?.id) {
      const carregarInsumos = async () => {
        try {
          const { data, error } = await supabase
            .from('insumos')
            .select('*')
            .eq('restaurant_id', currentRestaurant.id)
            .order('nome');
          
          if (error) throw error;
          setInsumosDisponiveis(data || []);
        } catch (error) {
          console.error('Erro ao carregar insumos:', error);
          toast.error('Erro ao carregar insumos');
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
