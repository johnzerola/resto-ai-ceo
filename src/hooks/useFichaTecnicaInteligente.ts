import { useState, useEffect, useCallback } from 'react';
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

interface ResultadosCalculados {
  cmv_estimado_percentual: number;
  cmv_estimado_valor: number;
  lucro_estimado_valor: number;
  lucro_estimado_percentual: number;
  margem_bruta: number;
  margem_liquida: number;
  preco_sugerido: number;
  status_viabilidade: 'saudavel' | 'atencao' | 'prejuizo';
  alertas: string[];
}

export function useFichaTecnicaInteligente() {
  const { currentRestaurant } = useAuth();
  const [ingredientes, setIngredientes] = useState<IngredienteInteligente[]>([]);
  const [metasLucro, setMetasLucro] = useState<MetasLucro>({
    meta_lucro_percentual: 30,
    meta_lucro_valor: 0,
    meta_cmv_percentual: 30,
    tipo_meta: 'percentual'
  });
  const [precoDesejado, setPrecoDesejado] = useState<number>(0);
  const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular resultados automaticamente usando a função do banco
  const calcularResultados = useCallback(async (pratoId?: string, precoFinal?: number) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) return;

    setIsCalculating(true);
    try {
      // Se não temos um prato salvo, criar temporário para cálculo
      let pratoIdParaCalculo = pratoId;
      
      if (!pratoIdParaCalculo) {
        // Criar prato temporário para cálculo
        const { data: pratoTemp, error } = await supabase
          .from('pratos')
          .insert({
            nome_prato: 'Cálculo Temporário',
            restaurant_id: currentRestaurant.id,
            categoria: 'temp',
            rendimento_porcoes: 1,
            margem_seguranca: 10
          })
          .select()
          .single();

        if (error) throw error;
        pratoIdParaCalculo = pratoTemp.id;

        // Inserir ingredientes temporários
        const ingredientesData = ingredientes.map(ing => ({
          prato_id: pratoIdParaCalculo,
          insumo_id: ing.insumo_id,
          quantidade_bruta: ing.quantidade_bruta,
          quantidade_liquida: ing.quantidade_liquida,
          fator_correcao: ing.fator_correcao,
          custo_total: ing.custo_total
        }));

        await supabase
          .from('ingredientes_por_prato')
          .insert(ingredientesData);
      }

      // Chamar função de cálculo inteligente
      const { data: resultadosCalculo, error: calcError } = await supabase
        .rpc('calcular_cmv_inteligente', {
          prato_uuid: pratoIdParaCalculo,
          preco_final: precoFinal || precoDesejado || null
        });

      if (calcError) throw calcError;

      if (resultadosCalculo && resultadosCalculo.length > 0) {
        const resultado = resultadosCalculo[0];
        
        // Converter status para o tipo correto
        const statusViabilidade = resultado.status_viabilidade as 'saudavel' | 'atencao' | 'prejuizo';
        
        // Converter alertas JSON para array de strings
        let alertasArray: string[] = [];
        if (resultado.alertas) {
          try {
            if (Array.isArray(resultado.alertas)) {
              alertasArray = resultado.alertas.map(item => String(item));
            } else if (typeof resultado.alertas === 'string') {
              const parsed = JSON.parse(resultado.alertas);
              alertasArray = Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
            }
          } catch (e) {
            console.warn('Erro ao processar alertas:', e);
            alertasArray = [];
          }
        }

        setResultados({
          cmv_estimado_percentual: resultado.cmv_estimado_percentual,
          cmv_estimado_valor: resultado.cmv_estimado_valor,
          lucro_estimado_valor: resultado.lucro_estimado_valor,
          lucro_estimado_percentual: resultado.lucro_estimado_percentual,
          margem_bruta: resultado.margem_bruta,
          margem_liquida: resultado.margem_liquida,
          preco_sugerido: resultado.preco_sugerido,
          status_viabilidade: statusViabilidade,
          alertas: alertasArray
        });
      }

      // Limpar prato temporário se foi criado
      if (!pratoId && pratoIdParaCalculo) {
        await supabase
          .from('pratos')
          .delete()
          .eq('id', pratoIdParaCalculo);
      }

    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      toast.error('Erro ao calcular resultados da ficha técnica');
    } finally {
      setIsCalculating(false);
    }
  }, [currentRestaurant, ingredientes, precoDesejado]);

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
    setIngredientes(prev => [...prev, novoIngrediente]);
  }, []);

  // Atualizar ingrediente
  const atualizarIngrediente = useCallback((id: string, campo: keyof IngredienteInteligente, valor: any) => {
    setIngredientes(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        
        // Recalcular custos automaticamente
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
    }));
  }, []);

  // Remover ingrediente
  const removerIngrediente = useCallback((id: string) => {
    setIngredientes(prev => prev.filter(ing => ing.id !== id));
  }, []);

  // Salvar ficha técnica completa
  const salvarFichaTecnica = useCallback(async (dadosPrato: {
    nome_prato: string;
    categoria: string;
    rendimento_porcoes: number;
    observacoes?: string;
  }) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) {
      toast.error('Dados incompletos para salvar a ficha técnica');
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
        quantidade_bruta: ing.quantidade_bruta,
        quantidade_liquida: ing.quantidade_liquida,
        fator_correcao: ing.fator_correcao,
        custo_total: ing.custo_total
      }));

      const { error: ingredientesError } = await supabase
        .from('ingredientes_por_prato')
        .insert(ingredientesData);

      if (ingredientesError) throw ingredientesError;

      // Salvar metas de lucro
      const { error: metasError } = await supabase
        .from('metas_lucro_individual')
        .insert({
          prato_id: prato.id,
          restaurant_id: currentRestaurant.id,
          meta_lucro_percentual: metasLucro.meta_lucro_percentual,
          meta_lucro_valor: metasLucro.meta_lucro_valor,
          meta_cmv_percentual: metasLucro.meta_cmv_percentual,
          tipo_meta: metasLucro.tipo_meta
        });

      if (metasError) throw metasError;

      // Salvar resultados estimados
      if (resultados) {
        const { error: resultadosError } = await supabase
          .from('resultados_estimados_por_receita')
          .insert({
            prato_id: prato.id,
            restaurant_id: currentRestaurant.id,
            cmv_estimado_percentual: resultados.cmv_estimado_percentual,
            cmv_estimado_valor: resultados.cmv_estimado_valor,
            lucro_estimado_valor: resultados.lucro_estimado_valor,
            lucro_estimado_percentual: resultados.lucro_estimado_percentual,
            margem_bruta: resultados.margem_bruta,
            margem_liquida: resultados.margem_liquida,
            preco_sugerido: resultados.preco_sugerido,
            status_analise: resultados.status_viabilidade,
            alertas: JSON.stringify(resultados.alertas)
          });

        if (resultadosError) throw resultadosError;
      }

      toast.success('Ficha técnica salva com sucesso!');
      
      // Reset
      setIngredientes([]);
      setPrecoDesejado(0);
      setResultados(null);
      setMetasLucro({
        meta_lucro_percentual: 30,
        meta_lucro_valor: 0,
        meta_cmv_percentual: 30,
        tipo_meta: 'percentual'
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, ingredientes, metasLucro, precoDesejado, resultados]);

  // Carregar insumos disponíveis
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<any[]>([]);
  
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

  // Recalcular quando ingredientes mudarem
  useEffect(() => {
    if (ingredientes.length > 0) {
      const timer = setTimeout(() => {
        calcularResultados();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ingredientes, precoDesejado, calcularResultados]);

  return {
    ingredientes,
    metasLucro,
    setMetasLucro,
    precoDesejado,
    setPrecoDesejado,
    resultados,
    isCalculating,
    insumosDisponiveis,
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    calcularResultados,
    salvarFichaTecnica
  };
}
