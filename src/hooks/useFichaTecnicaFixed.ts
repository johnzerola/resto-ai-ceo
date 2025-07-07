import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDebounce } from './useDebounce';

// Interfaces principais
interface DadosPrato {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes: string;
  preco_desejado: number;
}

interface ConfiguracaoAvancada {
  meta_lucro_percentual: number;
  despesas_fixas_mensais: number;
  despesas_variaveis_mensais: number;
  markup_personalizado: number;
  canal_venda: string;
  preco_concorrente: number;
}

interface IngredienteCompleto {
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

interface ValidacaoStatus {
  dadosBasicosValidos: boolean;
  ingredientesValidos: boolean;
  tudoValido: boolean;
}

// Hook principal corrigido e otimizado
export function useFichaTecnicaFixed() {
  const { currentRestaurant } = useAuth();
  const isInitialized = useRef(false);
  
  // Estados principais com inicialização controlada
  const [dadosPrato, setDadosPrato] = useState<DadosPrato>({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: '',
    preco_desejado: 0
  });

  const [configuracaoAvancada, setConfiguracaoAvancada] = useState<ConfiguracaoAvancada>({
    meta_lucro_percentual: 30,
    despesas_fixas_mensais: 0,
    despesas_variaveis_mensais: 0,
    markup_personalizado: 250,
    canal_venda: 'balcao',
    preco_concorrente: 0
  });

  const [ingredientes, setIngredientes] = useState<IngredienteCompleto[]>([]);
  const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Debounced values para evitar cálculos desnecessários
  const debouncedIngredientes = useDebounce(ingredientes, 800);
  const debouncedRendimento = useDebounce(dadosPrato.rendimento_porcoes, 500);
  const debouncedPrecoDesejado = useDebounce(dadosPrato.preco_desejado, 500);

  // Recuperar dados do localStorage na inicialização
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedDados = localStorage.getItem('ficha_tecnica_dados_prato');
        const savedConfig = localStorage.getItem('ficha_tecnica_configuracao');
        const savedIngredientes = localStorage.getItem('ficha_tecnica_ingredientes');

        if (savedDados) {
          setDadosPrato(JSON.parse(savedDados));
        }
        if (savedConfig) {
          setConfiguracaoAvancada(JSON.parse(savedConfig));
        }
        if (savedIngredientes) {
          setIngredientes(JSON.parse(savedIngredientes));
        }
      } catch (error) {
        console.error('Erro ao recuperar dados do localStorage:', error);
      }
      isInitialized.current = true;
    }
  }, []);

  // Persistir dados no localStorage de forma controlada
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('ficha_tecnica_dados_prato', JSON.stringify(dadosPrato));
    }
  }, [dadosPrato]);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('ficha_tecnica_configuracao', JSON.stringify(configuracaoAvancada));
    }
  }, [configuracaoAvancada]);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('ficha_tecnica_ingredientes', JSON.stringify(ingredientes));
    }
  }, [ingredientes]);

  // Carregar insumos uma única vez
  const carregarInsumos = useCallback(async () => {
    if (!currentRestaurant?.id) return;
    
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
  }, [currentRestaurant?.id]);

  // Carregar insumos automaticamente
  useEffect(() => {
    if (currentRestaurant?.id && insumosDisponiveis.length === 0) {
      carregarInsumos();
    }
  }, [currentRestaurant?.id, carregarInsumos, insumosDisponiveis.length]);

  // Validações com memoização
  const validarFormulario = useCallback((): ValidacaoStatus => {
    const errosEncontrados: string[] = [];

    // Validar dados básicos
    if (!dadosPrato.nome_prato?.trim()) {
      errosEncontrados.push('Nome do prato é obrigatório');
    }
    if (!dadosPrato.categoria) {
      errosEncontrados.push('Categoria é obrigatória');
    }
    if (dadosPrato.rendimento_porcoes <= 0) {
      errosEncontrados.push('Rendimento deve ser maior que zero');
    }

    const dadosBasicosValidos = errosEncontrados.length === 0;

    // Validar ingredientes
    if (ingredientes.length === 0) {
      errosEncontrados.push('Adicione pelo menos um ingrediente');
    }

    const ingredientesInvalidos = ingredientes.filter(ing => 
      !ing.insumo_id || 
      !ing.nome_insumo || 
      ing.quantidade_bruta <= 0 ||
      ing.preco_unitario <= 0
    );

    if (ingredientesInvalidos.length > 0) {
      errosEncontrados.push(`${ingredientesInvalidos.length} ingrediente(s) com dados incompletos`);
    }

    const ingredientesValidos = ingredientes.length > 0 && ingredientesInvalidos.length === 0;

    setErrors(errosEncontrados);

    return {
      dadosBasicosValidos,
      ingredientesValidos,
      tudoValido: dadosBasicosValidos && ingredientesValidos
    };
  }, [dadosPrato, ingredientes]);

  // Calcular resultados com condições de parada
  const calcularResultados = useCallback(() => {
    if (!currentRestaurant?.id || debouncedIngredientes.length === 0) {
      setResultados(null);
      return;
    }

    const ingredientesValidos = debouncedIngredientes.filter(ing => 
      ing.insumo_id && ing.quantidade_bruta > 0 && ing.preco_unitario > 0
    );

    if (ingredientesValidos.length === 0) {
      setResultados(null);
      return;
    }

    setIsCalculating(true);

    try {
      // Calcular custo base dos ingredientes
      const custoIngredientes = ingredientesValidos.reduce((total, ing) => total + ing.custo_total, 0);
      
      // Calcular despesas fixas por prato
      const metaPratosMes = 1000;
      const despesaFixaPorPrato = configuracaoAvancada.despesas_fixas_mensais > 0 
        ? configuracaoAvancada.despesas_fixas_mensais / metaPratosMes 
        : 0;
      
      // Calcular despesas variáveis
      const despesaVariavel = custoIngredientes * (configuracaoAvancada.despesas_variaveis_mensais / 100);
      
      // Custo total real
      const custoTotal = custoIngredientes + despesaFixaPorPrato + despesaVariavel;
      
      // Calcular preço baseado no canal
      const taxaCanal = configuracaoAvancada.canal_venda === 'ifood' ? 0.15 : 
                      configuracaoAvancada.canal_venda === 'uber_eats' ? 0.12 : 0;
      
      // Preço sugerido
      const markupFinal = configuracaoAvancada.markup_personalizado || 250;
      let precoSugerido = custoTotal * (markupFinal / 100);
      
      // Ajustar para taxa do canal
      if (taxaCanal > 0) {
        precoSugerido = precoSugerido / (1 - taxaCanal);
      }
      
      // Usar preço desejado ou calculado
      const precoFinal = debouncedPrecoDesejado > 0 ? debouncedPrecoDesejado : precoSugerido;
      
      // 🚨 VALIDAÇÃO CRÍTICA: NUNCA PERMITIR PREÇO ABAIXO DO CUSTO
      const precoMinimo = custoTotal * 1.1; // Margem mínima de 10%
      const alertas: string[] = [];

      if (precoFinal < custoTotal) {
        alertas.push('🚨 ERRO CRÍTICO: Preço de venda menor que o custo de produção!');
      } else if (precoFinal < precoMinimo) {
        alertas.push('⚠️ Preço muito próximo do custo - margem de segurança baixa');
      }
      
      // Calcular métricas finais
      const lucroEstimado = precoFinal - custoTotal;
      const margemBruta = precoFinal > 0 ? (lucroEstimado / precoFinal) * 100 : 0;
      const margemLiquida = margemBruta - (taxaCanal * 100) - 15; // -15% impostos
      
      // Status de viabilidade
      let statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
      if (margemLiquida < 0) {
        statusViabilidade = 'prejuizo';
        alertas.push('🚨 PREJUÍZO: Margem líquida negativa!');
      } else if (margemLiquida < configuracaoAvancada.meta_lucro_percentual) {
        statusViabilidade = 'atencao';
        alertas.push(`⚠️ Meta de lucro não atingida. Atual: ${margemLiquida.toFixed(1)}%`);
      }
      
      // Gerar alertas adicionais
      if (configuracaoAvancada.preco_concorrente > 0) {
        if (precoFinal > configuracaoAvancada.preco_concorrente * 1.2) {
          alertas.push('💰 Preço 20% acima da concorrência');
        } else if (precoFinal < configuracaoAvancada.preco_concorrente * 0.8) {
          alertas.push('📈 Oportunidade: preço abaixo da concorrência');
        }
      }

      const resultadosCalculados: ResultadosCalculados = {
        cmv_estimado_percentual: precoFinal > 0 ? (custoTotal / precoFinal) * 100 : 0,
        cmv_estimado_valor: custoTotal,
        lucro_estimado_valor: lucroEstimado,
        lucro_estimado_percentual: margemBruta,
        margem_bruta: margemBruta,
        margem_liquida: margemLiquida,
        preco_sugerido: precoSugerido,
        status_viabilidade: statusViabilidade,
        alertas: alertas
      };

      setResultados(resultadosCalculados);

    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      toast.error('Erro ao calcular resultados');
    } finally {
      setIsCalculating(false);
    }
  }, [
    currentRestaurant?.id,
    debouncedIngredientes,
    debouncedRendimento,
    debouncedPrecoDesejado,
    configuracaoAvancada
  ]);

  // Auto-calcular quando ingredientes mudarem (com debounce)
  useEffect(() => {
    if (isInitialized.current && debouncedIngredientes.length > 0) {
      calcularResultados();
    }
  }, [debouncedIngredientes, calcularResultados]);

  // Funções de atualização com callbacks estáveis
  const atualizarDadosPrato = useCallback((campo: keyof DadosPrato, valor: any) => {
    setDadosPrato(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const atualizarConfiguracao = useCallback((campo: keyof ConfiguracaoAvancada, valor: any) => {
    setConfiguracaoAvancada(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const adicionarIngrediente = useCallback(() => {
    const novoIngrediente: IngredienteCompleto = {
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  const atualizarIngrediente = useCallback((id: string, campo: keyof IngredienteCompleto, valor: any) => {
    setIngredientes(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        
        // Se está selecionando um insumo, buscar os dados completos
        if (campo === 'insumo_id' && valor) {
          const insumoSelecionado = insumosDisponiveis.find(ins => ins.id === valor);
          if (insumoSelecionado) {
            updated.nome_insumo = insumoSelecionado.nome;
            updated.preco_unitario = insumoSelecionado.preco_unitario;
            updated.unidade_medida = insumoSelecionado.unidade_medida;
          }
        }
        
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
  }, [insumosDisponiveis]);

  const removerIngrediente = useCallback((id: string) => {
    setIngredientes(prev => prev.filter(ing => ing.id !== id));
  }, []);

  // Salvar ficha completa
  const salvarFicha = useCallback(async () => {
    if (!currentRestaurant?.id) {
      toast.error('Nenhum restaurante selecionado');
      return false;
    }

    const validacao = validarFormulario();
    if (!validacao.tudoValido) {
      toast.error('Corrija os problemas antes de salvar');
      return false;
    }

    // 🚨 BLOQUEIO CRÍTICO: NUNCA SALVAR PREÇO ABAIXO DO CUSTO
    if (resultados && resultados.lucro_estimado_valor < 0) {
      toast.error('❌ Não é possível salvar com preço abaixo do custo!');
      return false;
    }

    setIsSaving(true);
    
    try {
      // Preparar dados do prato
      const pratoCompleto = {
        nome_prato: dadosPrato.nome_prato,
        categoria: dadosPrato.categoria,
        rendimento_porcoes: dadosPrato.rendimento_porcoes,
        observacoes: dadosPrato.observacoes || '',
        restaurant_id: currentRestaurant.id,
        custo_total: resultados?.cmv_estimado_valor || 0,
        custo_por_porcao: (resultados?.cmv_estimado_valor || 0) / Math.max(dadosPrato.rendimento_porcoes, 1),
        preco_sugerido: resultados?.preco_sugerido || 0,
        preco_praticado: dadosPrato.preco_desejado || resultados?.preco_sugerido || 0,
        lucro_estimado: resultados?.lucro_estimado_valor || 0,
        margem_percentual: resultados?.margem_liquida || 0,
        status_viabilidade: resultados?.status_viabilidade || 'saudavel',
        meta_lucro_percentual: configuracaoAvancada.meta_lucro_percentual,
        despesas_fixas_mensais: configuracaoAvancada.despesas_fixas_mensais,
        despesas_variaveis_mensais: configuracaoAvancada.despesas_variaveis_mensais,
        markup_personalizado: configuracaoAvancada.markup_personalizado,
        canal_venda: configuracaoAvancada.canal_venda,
        preco_concorrente: configuracaoAvancada.preco_concorrente
      };

      // Salvar prato
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

      toast.success('✅ Ficha técnica salva com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentRestaurant, dadosPrato, ingredientes, configuracaoAvancada, resultados, validarFormulario]);

  // Limpar tudo
  const limparTudo = useCallback(() => {
    setDadosPrato({
      nome_prato: '',
      categoria: '',
      rendimento_porcoes: 1,
      observacoes: '',
      preco_desejado: 0
    });
    setConfiguracaoAvancada({
      meta_lucro_percentual: 30,
      despesas_fixas_mensais: 0,
      despesas_variaveis_mensais: 0,
      markup_personalizado: 250,
      canal_venda: 'balcao',
      preco_concorrente: 0
    });
    setIngredientes([]);
    setResultados(null);
    setErrors([]);
    
    // Limpar localStorage
    localStorage.removeItem('ficha_tecnica_dados_prato');
    localStorage.removeItem('ficha_tecnica_configuracao');
    localStorage.removeItem('ficha_tecnica_ingredientes');
    
    toast.success('Ficha técnica limpa com sucesso!');
  }, []);

  return {
    // Estado
    dadosPrato,
    ingredientes,
    resultados,
    configuracaoAvancada,
    insumosDisponiveis,
    isCalculating,
    isSaving,
    errors,
    
    // Ações
    atualizarDadosPrato,
    atualizarConfiguracao,
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    calcularResultados,
    salvarFicha,
    limparTudo,
    validarFormulario,
    carregarInsumos
  };
}