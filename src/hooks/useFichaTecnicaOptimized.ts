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
  meta_lucro_percentual?: number;
  despesas_fixas_mensais?: number;
  despesas_variaveis_mensais?: number;
  markup_personalizado?: number;
  canal_venda?: string;
  preco_concorrente?: number;
}

interface ConfiguracaoAvancada {
  meta_lucro_percentual: number;
  despesas_fixas_mensais: number;
  despesas_variaveis_mensais: number;
  markup_personalizado: number;
  canal_venda: string;
  preco_concorrente: number;
}

export function useFichaTecnicaOptimized() {
  const { currentRestaurant } = useAuth();
  const [ingredientes, setIngredientes] = useState<IngredienteOptimizado[]>([]);
  const [resultados, setResultados] = useState<ResultadosOptimizados | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<any[]>([]);
  const [precoDesejado, setPrecoDesejado] = useState<number>(0);
  
  // Estados para configurações avançadas
  const [configuracaoAvancada, setConfiguracaoAvancada] = useState<ConfiguracaoAvancada>({
    meta_lucro_percentual: 30,
    despesas_fixas_mensais: 0,
    despesas_variaveis_mensais: 0,
    markup_personalizado: 250,
    canal_venda: 'balcao',
    preco_concorrente: 0
  });

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

  // Calcular resultados avançado considerando TODOS os fatores
  const calcularResultados = useCallback(async (precoFinal?: number, dadosPrato?: DadosPrato) => {
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
    console.log('🧮 Iniciando cálculo avançado para', ingredientesValidos.length, 'ingredientes');
    console.log('📊 Configuração avançada:', configuracaoAvancada);

    try {
      // Calcular custo base dos ingredientes
      const custoIngredientes = ingredientesValidos.reduce((total, ing) => total + ing.custo_total, 0);
      
      // Calcular despesas fixas por prato (despesa mensal / meta de pratos por mês)
      const metaPratosMes = 1000; // Padrão - pode vir de configuração
      const despesaFixaPorPrato = configuracaoAvancada.despesas_fixas_mensais > 0 
        ? configuracaoAvancada.despesas_fixas_mensais / metaPratosMes 
        : 0;
      
      // Calcular despesas variáveis (percentual sobre custo)
      const despesaVariavel = custoIngredientes * (configuracaoAvancada.despesas_variaveis_mensais / 100);
      
      // Custo total real
      const custoTotal = custoIngredientes + despesaFixaPorPrato + despesaVariavel;
      
      // Calcular preço baseado no canal
      const taxaCanal = configuracaoAvancada.canal_venda === 'ifood' ? 0.15 : 
                      configuracaoAvancada.canal_venda === 'uber_eats' ? 0.12 : 0;
      
      // Preço sugerido considerando markup personalizado
      const markupFinal = configuracaoAvancada.markup_personalizado || 250;
      let precoSugerido = custoTotal * (markupFinal / 100);
      
      // Ajustar para taxa do canal (se delivery)
      if (taxaCanal > 0) {
        precoSugerido = precoSugerido / (1 - taxaCanal);
      }
      
      // Usar preço informado ou calculado
      const precoFinalCalculo = precoFinal || precoDesejado || precoSugerido;
      
      // Calcular métricas finais
      const lucroEstimado = precoFinalCalculo - custoTotal;
      const margemBruta = precoFinalCalculo > 0 ? (lucroEstimado / precoFinalCalculo) * 100 : 0;
      const margemLiquida = margemBruta - (taxaCanal * 100) - 15; // -15% impostos aproximado
      
      // Determinar status de viabilidade
      let statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
      const metaLucro = configuracaoAvancada.meta_lucro_percentual;
      
      if (margemLiquida < 0) {
        statusViabilidade = 'prejuizo';
      } else if (margemLiquida < metaLucro) {
        statusViabilidade = 'atencao';
      }
      
      // Gerar alertas contextuais
      const alertas: string[] = [];
      
      if (margemLiquida < 0) {
        alertas.push('🚨 PREJUÍZO: Margem líquida negativa! Revise custos ou aumente o preço.');
      }
      
      if (margemLiquida < metaLucro && margemLiquida >= 0) {
        alertas.push(`⚠️ Meta de lucro não atingida. Atual: ${margemLiquida.toFixed(1)}%, Meta: ${metaLucro}%`);
      }
      
      if (configuracaoAvancada.preco_concorrente > 0) {
        if (precoFinalCalculo > configuracaoAvancada.preco_concorrente * 1.2) {
          alertas.push('💰 Preço 20% acima da concorrência. Considere revisar.');
        } else if (precoFinalCalculo < configuracaoAvancada.preco_concorrente * 0.8) {
          alertas.push('📈 Oportunidade: Preço abaixo da concorrência, pode aumentar margem.');
        }
      }
      
      if (custoIngredientes / precoFinalCalculo > 0.35) {
        alertas.push('📊 CMV alto (>35%). Revise receita ou fornecedores.');
      }

      const resultadosProcessados: ResultadosOptimizados = {
        cmv_estimado_percentual: precoFinalCalculo > 0 ? (custoTotal / precoFinalCalculo) * 100 : 0,
        cmv_estimado_valor: custoTotal,
        lucro_estimado_valor: lucroEstimado,
        lucro_estimado_percentual: margemBruta,
        margem_bruta: margemBruta,
        margem_liquida: margemLiquida,
        preco_sugerido: precoSugerido,
        status_viabilidade: statusViabilidade,
        alertas: alertas
      };

      console.log('✅ Resultados avançados processados:', resultadosProcessados);
      setResultados(resultadosProcessados);

    } catch (error) {
      console.error('❌ Erro ao calcular resultados avançados:', error);
      toast.error('Erro ao calcular resultados da ficha técnica');
    } finally {
      setIsCalculating(false);
    }
  }, [currentRestaurant, ingredientes, precoDesejado, configuracaoAvancada]);

  // Salvar ficha técnica completa com todos os campos
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
      console.log('💾 Salvando com configurações avançadas:', {
        dadosPrato,
        configuracaoAvancada,
        resultados
      });

      // Salvar prato com todas as configurações
      const pratoCompleto = {
        nome_prato: dadosPrato.nome_prato,
        categoria: dadosPrato.categoria,
        rendimento_porcoes: dadosPrato.rendimento_porcoes,
        observacoes: dadosPrato.observacoes || '',
        restaurant_id: currentRestaurant.id,
        custo_total: resultados?.cmv_estimado_valor || 0,
        preco_sugerido: resultados?.preco_sugerido || 0,
        preco_praticado: precoDesejado || resultados?.preco_sugerido || 0,
        lucro_estimado: resultados?.lucro_estimado_valor || 0,
        margem_percentual: resultados?.margem_liquida || 0,
        status_viabilidade: resultados?.status_viabilidade || 'saudavel',
        
        // Novos campos de configuração avançada
        meta_lucro_percentual: configuracaoAvancada.meta_lucro_percentual,
        despesas_fixas_mensais: configuracaoAvancada.despesas_fixas_mensais,
        despesas_variaveis_mensais: configuracaoAvancada.despesas_variaveis_mensais,
        markup_personalizado: configuracaoAvancada.markup_personalizado,
        canal_venda: configuracaoAvancada.canal_venda,
        preco_concorrente: configuracaoAvancada.preco_concorrente
      };

      const { data: prato, error: pratoError } = await supabase
        .from('pratos')
        .insert(pratoCompleto)
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

      toast.success('🎉 Ficha técnica completa salva com sucesso!', {
        description: `Prato "${dadosPrato.nome_prato}" com precificação inteligente`
      });
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar ficha técnica completa:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    }
  }, [currentRestaurant, ingredientes, resultados, precoDesejado, configuracaoAvancada]);

  // Limpar formulário
  const limparFormulario = useCallback(() => {
    setIngredientes([]);
    setResultados(null);
    setPrecoDesejado(0);
  }, []);

  // Atualizar configuração avançada
  const atualizarConfiguracao = useCallback((campo: keyof ConfiguracaoAvancada, valor: any) => {
    setConfiguracaoAvancada(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Limpar formulário expandido
  const limparFormularioCompleto = useCallback(() => {
    setIngredientes([]);
    setResultados(null);
    setPrecoDesejado(0);
    setConfiguracaoAvancada({
      meta_lucro_percentual: 30,
      despesas_fixas_mensais: 0,
      despesas_variaveis_mensais: 0,
      markup_personalizado: 250,
      canal_venda: 'balcao',
      preco_concorrente: 0
    });
  }, []);

  return {
    // Estado
    ingredientes,
    resultados,
    isCalculating,
    insumosDisponiveis,
    precoDesejado,
    configuracaoAvancada,
    
    // Setters
    setIngredientes,
    setPrecoDesejado,
    atualizarConfiguracao,
    
    // Ações
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    calcularResultados,
    salvarFichaTecnica,
    limparFormulario: limparFormularioCompleto,
    carregarInsumos
  };
}