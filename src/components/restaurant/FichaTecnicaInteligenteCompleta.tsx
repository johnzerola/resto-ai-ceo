
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileScrollContainer } from "@/components/layout/MobileScrollContainer";
import { MobileFriendlyInput } from "@/components/ui/mobile-friendly-input";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Percent,
  Package,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from 'sonner';
import { useFichaTecnicaOptimized } from "@/hooks/useFichaTecnicaOptimized";

export function FichaTecnicaInteligenteCompleta() {
  const {
    ingredientes,
    resultados,
    isCalculating,
    insumosDisponiveis,
    precoDesejado,
    configuracaoAvancada,
    setPrecoDesejado,
    atualizarConfiguracao,
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    calcularResultados,
    salvarFichaTecnica,
    limparFormulario
  } = useFichaTecnicaOptimized();

  const [prato, setPrato] = useState({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: ''
  });

  const [mostrarAvancado, setMostrarAvancado] = useState(false);

  // Adicionar novo ingrediente
  const handleAdicionarIngrediente = () => {
    adicionarIngrediente();
  };

  // Atualizar ingrediente com debounce e validação
  const handleAtualizarIngrediente = (id: string, campo: string, valor: any) => {
    // Se está selecionando um insumo, buscar os dados completos
    if (campo === 'insumo_id' && valor) {
      const insumoSelecionado = insumosDisponiveis.find(ins => ins.id === valor);
      if (insumoSelecionado) {
        atualizarIngrediente(id, 'insumo_id', valor);
        atualizarIngrediente(id, 'nome_insumo', insumoSelecionado.nome);
        atualizarIngrediente(id, 'preco_unitario', insumoSelecionado.preco_unitario);
        atualizarIngrediente(id, 'unidade_medida', insumoSelecionado.unidade_medida);
        return;
      }
    }

    // Para outros campos, usar a função padrão
    atualizarIngrediente(id, campo as any, valor);
  };

  // Remover ingrediente
  const handleRemoverIngrediente = (id: string) => {
    removerIngrediente(id);
  };

  // Calcular automaticamente quando dados mudarem
  useEffect(() => {
    if (ingredientes.length > 0 && ingredientes.some(ing => ing.custo_total > 0)) {
      const timer = setTimeout(() => {
        console.log('🧮 Trigger automático de cálculo com configuração avançada');
        calcularResultados(precoDesejado || undefined, {
          ...prato,
          ...configuracaoAvancada
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ingredientes, precoDesejado, configuracaoAvancada, prato, calcularResultados]);

  // Salvar ficha com validações robustas
  const handleSalvar = async () => {
    console.log('🚀 Iniciando salvamento da ficha técnica...');
    
    // Validações obrigatórias
    if (!prato.nome_prato?.trim()) {
      toast.error('Nome do prato é obrigatório');
      return;
    }

    if (!prato.categoria?.trim()) {
      toast.error('Categoria do prato é obrigatória');
      return;
    }

    if (prato.rendimento_porcoes <= 0) {
      toast.error('Rendimento deve ser maior que zero');
      return;
    }

    if (ingredientes.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return;
    }

    // Validar cada ingrediente
    const ingredientesInvalidos = ingredientes.filter(ing => 
      !ing.insumo_id || 
      !ing.nome_insumo || 
      ing.quantidade_bruta <= 0 ||
      ing.preco_unitario <= 0
    );

    if (ingredientesInvalidos.length > 0) {
      toast.error(`${ingredientesInvalidos.length} ingrediente(s) com dados incompletos. Verifique os campos.`);
      return;
    }

    // Calcular resultados se não tiver
    if (!resultados) {
      console.log('⏳ Calculando resultados antes de salvar...');
      await calcularResultados(precoDesejado || undefined, {
        ...prato,
        ...configuracaoAvancada
      });
      
      // Dar um tempo para o cálculo processar
      setTimeout(() => {
        if (resultados) {
          handleSalvar(); // Tentar salvar novamente com resultados
        } else {
          toast.error('Erro ao calcular resultados. Tente novamente.');
        }
      }, 1000);
      return;
    }

    console.log('💾 Salvando ficha técnica completa:', { 
      prato, 
      configuracaoAvancada, 
      ingredientes, 
      resultados 
    });
    
    const dadosCompletos = {
      ...prato,
      ...configuracaoAvancada
    };
    
    const sucesso = await salvarFichaTecnica(dadosCompletos);
    if (sucesso) {
      handleLimparTudo();
      toast.success('🎉 Ficha técnica salva com sucesso!', {
        description: 'Todos os dados foram sincronizados automaticamente'
      });
    }
  };

  // Limpar formulário
  const handleLimparTudo = () => {
    setPrato({
      nome_prato: '',
      categoria: '',
      rendimento_porcoes: 1,
      observacoes: ''
    });
    limparFormulario();
  };

  // Funções de estilo
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'bg-green-100 text-green-800 border-green-200';
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prejuizo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saudavel': return <CheckCircle className="h-4 w-4" />;
      case 'atencao': return <AlertTriangle className="h-4 w-4" />;
      case 'prejuizo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  // Validar se todos os campos obrigatórios estão preenchidos
  const isFormularioValido = () => {
    const pratoValido = prato.nome_prato?.trim() && prato.categoria && prato.rendimento_porcoes > 0;
    const ingredientesValidos = ingredientes.length > 0 && 
      ingredientes.every(ing => 
        ing.insumo_id && 
        ing.nome_insumo && 
        ing.quantidade_bruta > 0 &&
        ing.preco_unitario > 0
      );
    
    console.log('🔍 Validação formulário:', { 
      pratoValido, 
      ingredientesValidos, 
      ingredientesCount: ingredientes.length,
      resultados: !!resultados 
    });
    
    return pratoValido && ingredientesValidos;
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4">
      {/* Header Simplificado */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          🧠 Ficha Técnica Inteligente
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Calcule automaticamente CMV, lucro e preço ideal
        </p>
        
        {/* Botões de Ação Sempre Visíveis */}
        <div className="flex justify-center gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={handleLimparTudo}
            size="sm"
            className="min-w-[100px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
            <Button 
              onClick={handleSalvar}
              disabled={!isFormularioValido() || isCalculating}
              className="bg-green-600 hover:bg-green-700 min-w-[120px]"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Salvar Ficha'}
            </Button>
        </div>
      </div>

      <MobileScrollContainer maxHeight="85vh">
        <div className="space-y-4 sm:space-y-6">
          {/* Informações Básicas do Prato */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Dados do Prato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <MobileFriendlyInput
                    label="Nome do Prato"
                    value={prato.nome_prato}
                    onChange={(value) => setPrato(prev => ({...prev, nome_prato: value}))}
                    placeholder="Ex: Hambúrguer Artesanal"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria" className="text-sm font-medium">
                    Categoria
                  </Label>
                  <Select value={prato.categoria} onValueChange={(value) => setPrato(prev => ({...prev, categoria: value}))}>
                    <SelectTrigger className="mt-1 h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">🥗 Entrada</SelectItem>
                      <SelectItem value="prato_principal">🍽️ Prato Principal</SelectItem>
                      <SelectItem value="sobremesa">🍰 Sobremesa</SelectItem>
                      <SelectItem value="bebida">🥤 Bebida</SelectItem>
                      <SelectItem value="lanche">🍔 Lanche</SelectItem>
                      <SelectItem value="acompanhamento">🍟 Acompanhamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <MobileFriendlyInput
                    label="Quantas porções rende?"
                    value={prato.rendimento_porcoes}
                    onChange={(value) => setPrato(prev => ({...prev, rendimento_porcoes: Math.max(1, Number(value))}))}
                    type="number"
                    helpText="Número de porções que a receita produz"
                  />
                </div>
              </div>

              {/* Campo Preço Desejado em destaque */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <MobileFriendlyInput
                  label="💰 Qual preço você quer cobrar? (Opcional)"
                  value={precoDesejado || ''}
                  onChange={(value) => setPrecoDesejado(Number(value))}
                  type="number"
                  placeholder="Ex: 25.90"
                  helpText="Se informar, calculamos se vale a pena cobrar esse preço"
                />
              </div>

              {/* Seção de Configurações Avançadas - SEMPRE VISÍVEL */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    🎯 Configurações de Precificação
                  </CardTitle>
                  <p className="text-sm text-purple-600">
                    Configure suas metas e parâmetros para precificação inteligente
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <MobileFriendlyInput
                        label="🎯 Meta de Lucro (%)"
                        value={configuracaoAvancada.meta_lucro_percentual}
                        onChange={(value) => atualizarConfiguracao('meta_lucro_percentual', Number(value))}
                        type="number"
                        placeholder="30"
                        helpText="Margem de lucro desejada"
                      />
                    </div>
                    
                    <div>
                      <MobileFriendlyInput
                        label="🏢 Despesas Fixas/Mês (R$)"
                        value={configuracaoAvancada.despesas_fixas_mensais}
                        onChange={(value) => atualizarConfiguracao('despesas_fixas_mensais', Number(value))}
                        type="number"
                        placeholder="5000"
                        helpText="Aluguel, salários, etc."
                      />
                    </div>
                    
                    <div>
                      <MobileFriendlyInput
                        label="📊 Despesas Variáveis (%)"
                        value={configuracaoAvancada.despesas_variaveis_mensais}
                        onChange={(value) => atualizarConfiguracao('despesas_variaveis_mensais', Number(value))}
                        type="number"
                        placeholder="10"
                        helpText="% sobre custo dos ingredientes"
                      />
                    </div>
                    
                    <div>
                      <MobileFriendlyInput
                        label="🔢 Markup Personalizado (%)"
                        value={configuracaoAvancada.markup_personalizado}
                        onChange={(value) => atualizarConfiguracao('markup_personalizado', Number(value))}
                        type="number"
                        placeholder="250"
                        helpText="Multiplicador para preço sugerido"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-purple-700">
                        🚀 Canal de Venda
                      </Label>
                      <Select 
                        value={configuracaoAvancada.canal_venda} 
                        onValueChange={(value) => atualizarConfiguracao('canal_venda', value)}
                      >
                        <SelectTrigger className="mt-1 h-12 bg-white">
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balcao">🍽️ Balcão/Presencial</SelectItem>
                          <SelectItem value="ifood">🛵 iFood (15% taxa)</SelectItem>
                          <SelectItem value="uber_eats">🚗 Uber Eats (12% taxa)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-purple-600 mt-1">
                        Taxas são consideradas no cálculo
                      </p>
                    </div>
                    
                    <div>
                      <MobileFriendlyInput
                        label="🏆 Preço Concorrente (R$)"
                        value={configuracaoAvancada.preco_concorrente || ''}
                        onChange={(value) => atualizarConfiguracao('preco_concorrente', Number(value))}
                        type="number"
                        placeholder="20.00"
                        helpText="Preço da concorrência para comparação"
                      />
                    </div>
                  </div>
                  
                  {/* Preview em tempo real */}
                  {resultados && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">📊 Preview dos Resultados:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Preço Sugerido:</span>
                          <span className="font-bold text-green-600 ml-2">
                            R$ {resultados.preco_sugerido.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Margem Líquida:</span>
                          <span className={`font-bold ml-2 ${resultados.margem_liquida >= configuracaoAvancada.meta_lucro_percentual ? 'text-green-600' : 'text-red-600'}`}>
                            {resultados.margem_liquida.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campos Avançados (Colapsáveis) */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarAvancado(!mostrarAvancado)}
                  className="text-gray-600"
                >
                  {mostrarAvancado ? 'Ocultar' : 'Mostrar'} opções avançadas
                </Button>
                
                {mostrarAvancado && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor="observacoes" className="text-sm font-medium">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={prato.observacoes}
                      onChange={(e) => setPrato(prev => ({...prev, observacoes: e.target.value}))}
                      placeholder="Observações sobre preparo, alergênicos, etc."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Ingredientes */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5" />
                  Ingredientes ({ingredientes.length})
                </CardTitle>
                <Button 
                  onClick={handleAdicionarIngrediente} 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ingredientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum ingrediente adicionado</p>
                  <p className="text-sm">Clique em "Adicionar" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredientes.map((ingrediente) => (
                    <div key={ingrediente.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                      {/* Nome do Ingrediente - Mobile first */}
                      <div className="w-full">
                        <Label className="text-xs font-medium text-gray-700">Ingrediente</Label>
                        <Select 
                          value={ingrediente.insumo_id} 
                          onValueChange={(value) => {
                            const insumo = insumosDisponiveis.find(i => i.id === value);
                            if (insumo) {
                              handleAtualizarIngrediente(ingrediente.id, 'insumo_id', value);
                              handleAtualizarIngrediente(ingrediente.id, 'nome_insumo', insumo.nome);
                              handleAtualizarIngrediente(ingrediente.id, 'preco_unitario', insumo.preco_unitario);
                              handleAtualizarIngrediente(ingrediente.id, 'unidade_medida', insumo.unidade_medida);
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 bg-white">
                            <SelectValue placeholder="Escolher ingrediente" />
                          </SelectTrigger>
                          <SelectContent>
                            {insumosDisponiveis.map((insumo) => (
                              <SelectItem key={insumo.id} value={insumo.id}>
                                <div className="flex flex-col">
                                  <span>{insumo.nome}</span>
                                  <span className="text-xs text-gray-500">
                                    R$ {insumo.preco_unitario?.toFixed(2)}/{insumo.unidade_medida}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Grid responsivo para outros campos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <MobileFriendlyInput
                            label={`Quantidade (${ingrediente.unidade_medida || 'g'})`}
                            value={ingrediente.quantidade_bruta || ''}
                            onChange={(value) => {
                              const novaQuantidade = Number(value);
                              console.log('📊 Atualizando quantidade:', novaQuantidade);
                              handleAtualizarIngrediente(ingrediente.id, 'quantidade_bruta', novaQuantidade);
                            }}
                            type="number"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <MobileFriendlyInput
                            label="Fator Correção"
                            value={ingrediente.fator_correcao || ''}
                            onChange={(value) => handleAtualizarIngrediente(ingrediente.id, 'fator_correcao', Number(value))}
                            type="number"
                            placeholder="1.0"
                            helpText="1.0 = sem perda, 1.1 = 10% perda"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium text-gray-700">Custo Total</Label>
                          <div className="h-12 bg-green-50 border rounded-md flex items-center px-3 mt-2">
                            <span className="text-sm font-medium text-green-700">
                              R$ {ingrediente.custo_total?.toFixed(2) || '0,00'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoverIngrediente(ingrediente.id)}
                            className="h-12 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados da Análise */}
          {resultados && (
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Resultado da Análise
                  {resultados.status_viabilidade && (
                    <Badge className={`ml-2 ${getStatusColor(resultados.status_viabilidade)}`}>
                      {getStatusIcon(resultados.status_viabilidade)}
                      <span className="ml-1 capitalize">
                        {resultados.status_viabilidade === 'saudavel' ? 'Lucrativo' : 
                         resultados.status_viabilidade === 'atencao' ? 'Atenção' : 'Prejuízo'}
                      </span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cards de Métricas Principais - Responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Custo Real (CMV)</span>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-blue-900">
                      R$ {resultados.cmv_estimado_valor?.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-700">
                      {resultados.cmv_estimado_percentual?.toFixed(1)}% do preço de venda
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Lucro Estimado</span>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-green-900">
                      R$ {resultados.lucro_estimado_valor?.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">
                      {resultados.lucro_estimado_percentual?.toFixed(1)}% de margem
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 p-4 rounded-lg border border-purple-200 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Preço Sugerido</span>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-purple-900">
                      R$ {resultados.preco_sugerido?.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-700">
                      Margem líquida: {resultados.margem_liquida?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Alertas e Recomendações */}
                {resultados.alertas && resultados.alertas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800 mb-3">⚠️ Alertas Importantes:</h4>
                    {resultados.alertas.map((alerta, index) => (
                      <Alert key={index} className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          {alerta}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação - Sempre Visíveis e Funcionais */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={handleLimparTudo}
              className="sm:w-auto w-full h-12"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
            
            <Button 
              onClick={handleSalvar}
              disabled={!isFormularioValido() || isCalculating}
              className="bg-green-600 hover:bg-green-700 sm:w-auto w-full h-12"
            >
              <Save className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Salvar Ficha Técnica'}
            </Button>
          </div>

          {/* Ajuda Visual para Usuários Leigos */}
          {ingredientes.length === 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-3">💡 Como usar:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                  <li>Preencha o nome do seu prato</li>
                  <li>Adicione todos os ingredientes que usa</li>
                  <li>Informe a quantidade de cada ingrediente</li>
                  <li>Se quiser, coloque o preço que pretende cobrar</li>
                  <li>O sistema calcula automaticamente se vale a pena!</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileScrollContainer>
    </div>
  );
}
