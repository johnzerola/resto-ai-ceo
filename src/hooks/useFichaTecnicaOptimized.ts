import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface IngredienteOptimizado {
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

interface ResultadosOptimizados {
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

interface DadosPrato {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes?: string;
}

export function useFichaTecnicaOptimized() {
  const { currentRestaurant } = useAuth();
  const [ingredientes, setIngredientes] = useState<IngredienteOptimizado[]>([]);
  const [resultados, setResultados] = useState<ResultadosOptimizados | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<any[]>([]);
  const [precoDesejado, setPrecoDesejado] = useState<number>(0);

  // Carregar insumos disponíveis
  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarInsumos();
    }
  }, [currentRestaurant]);

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

  // Adicionar ingrediente
  const adicionarIngrediente = useCallback(() => {
    const novoIngrediente: IngredienteOptimizado = {
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

  // Atualizar ingrediente com recálculos automáticos
  const atualizarIngrediente = useCallback((id: string, campo: keyof IngredienteOptimizado, valor: any) => {
    setIngredientes(prev => prev.map(ing => {
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
        if (updated.fator_correcao <= 0) updated.fator_correcao = 1;
        if (updated.preco_unitario < 0) updated.preco_unitario = 0;
        
        return updated;
      }
      return ing;
    }));
  }, []);

  // Remover ingrediente
  const removerIngrediente = useCallback((id: string) => {
    setIngredientes(prev => prev.filter(ing => ing.id !== id));
  }, []);

  // Calcular resultados otimizado
  const calcularResultados = useCallback(async (precoFinal?: number) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) {
      console.log('❌ Condições insuficientes para cálculo');
      return;
    }

    // Validar ingredientes
    const ingredientesValidos = ingredientes.filter(ing => 
      ing.insumo_id && 
      ing.quantidade_bruta > 0 && 
      ing.preco_unitario > 0
    );

    if (ingredientesValidos.length === 0) {
      console.log('❌ Nenhum ingrediente válido para cálculo');
      return;
    }

    setIsCalculating(true);
    console.log('🧮 Iniciando cálculo otimizado para', ingredientesValidos.length, 'ingredientes');

    try {
      // Criar prato temporário
      const { data: pratoTemp, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          nome_prato: 'Cálculo Temporário ' + Date.now(),
          restaurant_id: currentRestaurant.id,
          categoria: 'temp',
          rendimento_porcoes: 1,
          margem_seguranca: 10
        })
        .select()
        .single();

      if (pratoError) throw pratoError;

      // Inserir ingredientes temporários
      const ingredientesData = ingredientesValidos.map(ing => ({
        prato_id: pratoTemp.id,
        insumo_id: ing.insumo_id,
        quantidade_bruta: Number(ing.quantidade_bruta),
        quantidade_liquida: Number(ing.quantidade_liquida) || Number(ing.quantidade_bruta) * Number(ing.fator_correcao || 1),
        fator_correcao: Number(ing.fator_correcao) || 1,
        custo_total: Number(ing.custo_total)
      }));

      const { error: ingredientesError } = await supabase
        .from('ingredientes_por_prato')
        .insert(ingredientesData);

      if (ingredientesError) throw ingredientesError;

      // Chamar função de cálculo
      const { data: resultadosCalculo, error: calcError } = await supabase
        .rpc('calcular_cmv_inteligente', {
          prato_uuid: pratoTemp.id,
          preco_final: precoFinal || precoDesejado || null
        });

      if (calcError) throw calcError;

      if (resultadosCalculo && resultadosCalculo.length > 0) {
        const resultado = resultadosCalculo[0];
        
        // Processar status com validação robusta
        let statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
        if (typeof resultado.status_viabilidade === 'string') {
          const statusValue = resultado.status_viabilidade.toLowerCase();
          if (['saudavel', 'atencao', 'prejuizo'].includes(statusValue)) {
            statusViabilidade = statusValue as 'saudavel' | 'atencao' | 'prejuizo';
          }
        }
        
        // Processar alertas com segurança
        let alertasArray: string[] = [];
        if (resultado.alertas) {
            try {
              if (Array.isArray(resultado.alertas)) {
                alertasArray = resultado.alertas.filter(item => item).map(item => String(item));
              } else if (typeof resultado.alertas === 'string') {
                const parsed = JSON.parse(resultado.alertas);
                if (Array.isArray(parsed)) {
                  alertasArray = parsed.filter(item => item).map(item => String(item));
                }
              }
          } catch (e) {
            console.warn('Erro ao processar alertas:', e);
            alertasArray = [];
          }
        }

        const resultadosProcessados = {
          cmv_estimado_percentual: Number(resultado.cmv_estimado_percentual) || 0,
          cmv_estimado_valor: Number(resultado.cmv_estimado_valor) || 0,
          lucro_estimado_valor: Number(resultado.lucro_estimado_valor) || 0,
          lucro_estimado_percentual: Number(resultado.lucro_estimado_percentual) || 0,
          margem_bruta: Number(resultado.margem_bruta) || 0,
          margem_liquida: Number(resultado.margem_liquida) || 0,
          preco_sugerido: Number(resultado.preco_sugerido) || 0,
          status_viabilidade: statusViabilidade,
          alertas: alertasArray
        };

        console.log('✅ Resultados processados:', resultadosProcessados);
        setResultados(resultadosProcessados);
      }

      // Limpar prato temporário
      await supabase
        .from('ingredientes_por_prato')
        .delete()
        .eq('prato_id', pratoTemp.id);
      
      await supabase
        .from('pratos')
        .delete()
        .eq('id', pratoTemp.id);

    } catch (error) {
      console.error('❌ Erro ao calcular resultados:', error);
      toast.error('Erro ao calcular resultados da ficha técnica');
    } finally {
      setIsCalculating(false);
    }
  }, [currentRestaurant, ingredientes, precoDesejado]);

  // Salvar ficha técnica otimizado
  const salvarFichaTecnica = useCallback(async (dadosPrato: DadosPrato) => {
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

      toast.success('Ficha técnica salva com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, ingredientes, resultados, precoDesejado]);

  // Limpar formulário
  const limparFormulario = useCallback(() => {
    setIngredientes([]);
    setResultados(null);
    setPrecoDesejado(0);
  }, []);

  return {
    // Estado
    ingredientes,
    resultados,
    isCalculating,
    insumosDisponiveis,
    precoDesejado,
    
    // Setters
    setIngredientes,
    setPrecoDesejado,
    
    // Ações
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    calcularResultados,
    salvarFichaTecnica,
    limparFormulario,
    carregarInsumos
  };
}