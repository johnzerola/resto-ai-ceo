import React, { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileScrollContainer } from "@/components/layout/MobileScrollContainer";
import { 
  Calculator, 
  Plus, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Package,
  RotateCcw,
  FileText,
  Eye
} from "lucide-react";
import { toast } from 'sonner';
import { useFichaTecnicaFixed } from "@/hooks/useFichaTecnicaFixed";
import { NovaFichaTecnicaTab } from "./tabs/NovaFichaTecnicaTab";
import { IngredientesTab } from "./tabs/IngredientesTab";
import { ResultadosTab } from "./tabs/ResultadosTab";
import { FichasSalvasTab } from "./tabs/FichasSalvasTab";

// Componente de status memoizado para evitar re-renders
const StatusBadge = memo(({ condition, trueText, falseText }: {
  condition: boolean;
  trueText: string;
  falseText: string;
}) => (
  <Badge variant={condition ? "default" : "secondary"}>
    {condition ? trueText : falseText}
  </Badge>
));

StatusBadge.displayName = 'StatusBadge';

// Componente de preview memoizado
const PreviewResultados = memo(({ 
  resultados, 
  configuracaoAvancada, 
  isVisible 
}: {
  resultados: any;
  configuracaoAvancada: any;
  isVisible: boolean;
}) => {
  if (!isVisible || !resultados) return null;

  return (
    <Card className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview dos Resultados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="font-medium text-gray-600">Custo Total</div>
            <div className="text-lg font-bold text-red-600">
              R$ {resultados.cmv_estimado_valor.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600">Preço Sugerido</div>
            <div className="text-lg font-bold text-green-600">
              R$ {resultados.preco_sugerido.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600">Margem Líquida</div>
            <div className={`text-lg font-bold ${
              resultados.margem_liquida >= configuracaoAvancada.meta_lucro_percentual 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {resultados.margem_liquida.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600">Status</div>
            <Badge 
              className={`text-xs ${
                resultados.status_viabilidade === 'saudavel' 
                  ? 'bg-green-100 text-green-800' 
                  : resultados.status_viabilidade === 'atencao'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {resultados.status_viabilidade === 'saudavel' ? '✅ OK' :
               resultados.status_viabilidade === 'atencao' ? '⚠️ Atenção' : '🚨 Problema'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PreviewResultados.displayName = 'PreviewResultados';

export function FichaTecnicaFixed() {
  const {
    // Estado
    dadosPrato,
    ingredientes,
    resultados,
    configuracaoAvancada,
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
    validarFormulario
  } = useFichaTecnicaFixed();

  const [abaAtiva, setAbaAtiva] = useState('nova');
  const [showProgress, setShowProgress] = useState(false);

  // Memoizar condições para evitar re-renders desnecessários (corrigido)
  const conditions = useMemo(() => {
    const validacao = validarFormulario();
    return {
      hasBasicData: Boolean(dadosPrato.nome_prato?.trim()),
      hasIngredients: ingredientes.length > 0,
      hasResults: Boolean(resultados),
      canNavigateToIngredients: Boolean(dadosPrato.nome_prato?.trim() && dadosPrato.categoria),
      canNavigateToResults: validacao.temIngredientesParaCalcular || false,
      canSave: validacao.tudoValido && Boolean(resultados) && (resultados?.lucro_estimado_valor || 0) >= 0
    };
  }, [dadosPrato.nome_prato, dadosPrato.categoria, ingredientes.length, resultados, validarFormulario]);

  // Navegação entre abas com validação memoizada
  const navegarParaAba = useMemo(() => (aba: string) => {
    if (aba === 'ingredientes' && !conditions.canNavigateToIngredients) {
      toast.error('Preencha os dados básicos do prato primeiro');
      return;
    }
    
    if (aba === 'resultados' && !conditions.canNavigateToResults) {
      toast.error('Adicione pelo menos um ingrediente');
      return;
    }
    
    setAbaAtiva(aba);
  }, [conditions.canNavigateToIngredients, conditions.canNavigateToResults]);

  // Salvar com feedback completo
  const handleSalvar = useMemo(() => async () => {
    console.log('💾 Iniciando salvamento completo...');
    
    // 🚨 VALIDAÇÃO CRÍTICA ANTES DE SALVAR
    if (resultados && resultados.lucro_estimado_valor < 0) {
      toast.error('❌ BLOQUEADO: Não é possível salvar prato com prejuízo!', {
        description: 'Ajuste o preço para que seja maior que o custo'
      });
      return;
    }

    setShowProgress(true);
    
    try {
      const sucesso = await salvarFicha();
      if (sucesso) {
        toast.success('🎉 Ficha técnica salva com sucesso!', {
          description: 'Todos os dados foram salvos corretamente'
        });
        setAbaAtiva('salvas');
      }
    } catch (error) {
      console.error('Erro no salvamento:', error);
    } finally {
      setShowProgress(false);
    }
  }, [resultados, salvarFicha]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4">
      {/* Header com Controles */}
      <div className="text-center space-y-4 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          🧠 Ficha Técnica Inteligente - Sistema Corrigido
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Sistema otimizado com controle de prejuízo e sincronização perfeita
        </p>
        
        {/* Barra de Status Otimizada */}
        <div className="flex justify-center gap-3 text-xs">
          <StatusBadge 
            condition={conditions.hasBasicData} 
            trueText="✅ Dados Básicos" 
            falseText="⏳ Dados Básicos" 
          />
          <StatusBadge 
            condition={conditions.hasIngredients} 
            trueText="✅ Ingredientes" 
            falseText="⏳ Ingredientes" 
          />
          <StatusBadge 
            condition={conditions.hasResults} 
            trueText="✅ Resultados" 
            falseText="⏳ Resultados" 
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={limparTudo}
            size="sm"
            className="min-w-[100px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          
          <Button 
            onClick={handleSalvar}
            disabled={!conditions.canSave || isSaving || showProgress}
            className={`min-w-[120px] ${
              conditions.canSave 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving || showProgress ? 'Salvando...' : 'Salvar Ficha'}
          </Button>
        </div>
      </div>

      {/* Sistema de Abas Integrado */}
      <Card className="border-2 border-blue-200">
        <Tabs value={abaAtiva} onValueChange={navegarParaAba} className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger 
                value="nova" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-blue-100"
              >
                <Package className="h-4 w-4" />
                <span className="text-xs">Nova Ficha</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="ingredientes" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-green-100"
                disabled={!conditions.canNavigateToIngredients}
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Ingredientes</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="resultados" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-purple-100"
                disabled={!conditions.canNavigateToResults}
              >
                <Calculator className="h-4 w-4" />
                <span className="text-xs">Resultados</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="salvas" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-orange-100"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Fichas Salvas</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-0">
            <MobileScrollContainer maxHeight="75vh">
              {/* Aba 1: Nova Ficha Técnica */}
              <TabsContent value="nova" className="mt-0 p-4">
                <NovaFichaTecnicaTab
                  dadosPrato={dadosPrato}
                  configuracaoAvancada={configuracaoAvancada}
                  resultados={resultados}
                  onAtualizarDados={atualizarDadosPrato}
                  onAtualizarConfig={atualizarConfiguracao}
                  onProximo={() => navegarParaAba('ingredientes')}
                  errors={errors}
                />
              </TabsContent>

              {/* Aba 2: Ingredientes */}
              <TabsContent value="ingredientes" className="mt-0 p-4">
                <IngredientesTab
                  ingredientes={ingredientes}
                  onAdicionar={adicionarIngrediente}
                  onAtualizar={atualizarIngrediente}
                  onRemover={removerIngrediente}
                  onProximo={() => navegarParaAba('resultados')}
                  onVoltar={() => navegarParaAba('nova')}
                  errors={errors}
                />
              </TabsContent>

              {/* Aba 3: Resultados */}
              <TabsContent value="resultados" className="mt-0 p-4">
                <ResultadosTab
                  dadosPrato={dadosPrato}
                  ingredientes={ingredientes}
                  resultados={resultados}
                  configuracaoAvancada={configuracaoAvancada}
                  isCalculating={isCalculating}
                  onRecalcular={calcularResultados}
                  onSalvar={handleSalvar}
                  onVoltar={() => navegarParaAba('ingredientes')}
                  isSaving={isSaving || showProgress}
                />
              </TabsContent>

              {/* Aba 4: Fichas Salvas */}
              <TabsContent value="salvas" className="mt-0 p-4">
                <FichasSalvasTab />
              </TabsContent>
            </MobileScrollContainer>
          </CardContent>
        </Tabs>
      </Card>

      {/* Alertas Globais de Validação */}
      {errors.length > 0 && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Problemas encontrados:</strong>
            <ul className="mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 🚨 ALERTA CRÍTICO DE PREJUÍZO */}
      {resultados && resultados.lucro_estimado_valor < 0 && (
        <Alert className="mt-4 border-red-500 bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>🚨 ALERTA CRÍTICO: PREJUÍZO DETECTADO!</strong>
            <p className="mt-2">
              Este prato gerará prejuízo de <strong>R$ {Math.abs(resultados.lucro_estimado_valor).toFixed(2)}</strong>.
              <br />
              <strong>Preço mínimo seguro: R$ {(resultados.cmv_estimado_valor * 1.1).toFixed(2)}</strong>
            </p>
            <p className="mt-2 text-sm">
              ❌ Salvamento bloqueado até ajustar o preço acima do custo.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview dos Resultados em Tempo Real */}
      <PreviewResultados 
        resultados={resultados}
        configuracaoAvancada={configuracaoAvancada}
        isVisible={abaAtiva !== 'resultados'}
      />
    </div>
  );
}