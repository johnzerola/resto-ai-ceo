import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  DollarSign, 
  Percent,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calculator,
  ArrowLeft,
  Save,
  RefreshCw,
  Target,
  PieChart,
  Package
} from "lucide-react";

interface DadosPrato {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  preco_desejado: number;
}

interface IngredienteCompleto {
  custo_total: number;
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

interface ConfiguracaoAvancada {
  meta_lucro_percentual: number;
  canal_venda: string;
}

interface Props {
  dadosPrato: DadosPrato;
  ingredientes: IngredienteCompleto[];
  resultados: ResultadosCalculados | null;
  configuracaoAvancada: ConfiguracaoAvancada;
  isCalculating: boolean;
  onRecalcular: () => void;
  onSalvar: () => void;
  onVoltar: () => void;
  isSaving: boolean;
}

export function ResultadosTab({
  dadosPrato,
  ingredientes,
  resultados,
  configuracaoAvancada,
  isCalculating,
  onRecalcular,
  onSalvar,
  onVoltar,
  isSaving
}: Props) {
  
  const custoIngredientes = ingredientes.reduce((total, ing) => total + ing.custo_total, 0);
  const custoPorPorcao = custoIngredientes / dadosPrato.rendimento_porcoes;

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
      case 'saudavel': return <CheckCircle className="h-5 w-5" />;
      case 'atencao': return <AlertTriangle className="h-5 w-5" />;
      case 'prejuizo': return <AlertTriangle className="h-5 w-5" />;
      default: return <Calculator className="h-5 w-5" />;
    }
  };

  if (!resultados) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pronto para Calcular Resultados
          </h3>
          <p className="text-gray-600 mb-6">
            {ingredientes.length === 0 
              ? 'Adicione ingredientes na aba anterior para calcular os resultados'
              : 'Clique no botão abaixo para calcular os resultados financeiros da ficha técnica'
            }
          </p>
          
          {/* Informações sobre ingredientes se houver */}
          {ingredientes.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Ingredientes Encontrados: {ingredientes.length}</span>
                </div>
                <p className="text-xs">
                  💡 <strong>Dica:</strong> O sistema calculará com base nos ingredientes que possuem todos os dados completos.
                  Ingredientes incompletos serão ignorados no cálculo, mas ainda podem ser corrigidos depois.
                </p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={onRecalcular}
            disabled={isCalculating || ingredientes.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Calcular Resultados'}
          </Button>
        </div>
        
        <div className="flex justify-start">
          <Button variant="outline" onClick={onVoltar}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Análise Financeira Completa
        </h3>
        <p className="text-gray-600 mb-4">
          Resultados para: <strong>{dadosPrato.nome_prato}</strong>
        </p>
        
        <Badge className={`text-lg px-4 py-2 ${getStatusColor(resultados.status_viabilidade)}`}>
          {getStatusIcon(resultados.status_viabilidade)}
          <span className="ml-2">
            {resultados.status_viabilidade === 'saudavel' ? '✅ Prato Lucrativo' :
             resultados.status_viabilidade === 'atencao' ? '⚠️ Atenção Necessária' : 
             '🚨 Prejuízo Detectado'}
          </span>
        </Badge>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Custo Total</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              R$ {resultados.cmv_estimado_valor.toFixed(2)}
            </div>
            <div className="text-sm text-red-700">
              Por porção: R$ {custoPorPorcao.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Preço Sugerido</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              R$ {resultados.preco_sugerido.toFixed(2)}
            </div>
            <div className="text-sm text-green-700">
              Canal: {configuracaoAvancada.canal_venda}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Margem Líquida</span>
            </div>
            <div className={`text-2xl font-bold ${
              resultados.margem_liquida >= configuracaoAvancada.meta_lucro_percentual 
                ? 'text-green-900' 
                : 'text-red-900'
            }`}>
              {resultados.margem_liquida.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">
              Meta: {configuracaoAvancada.meta_lucro_percentual}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Lucro Estimado</span>
            </div>
            <div className={`text-2xl font-bold ${
              resultados.lucro_estimado_valor > 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              R$ {resultados.lucro_estimado_valor.toFixed(2)}
            </div>
            <div className="text-sm text-purple-700">
              Por porção
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Análise Detalhada de Custos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Composição de Custos
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CMV (% sobre preço final):</span>
                  <span className="font-medium">{resultados.cmv_estimado_percentual.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Margem Bruta:</span>
                  <span className="font-medium">{resultados.margem_bruta.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Margem Líquida (após impostos):</span>
                  <span className={`font-medium ${
                    resultados.margem_liquida > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {resultados.margem_liquida.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Comparação de Preços</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Preço Sugerido (Sistema):</span>
                  <span className="font-medium text-green-600">R$ {resultados.preco_sugerido.toFixed(2)}</span>
                </div>
                {dadosPrato.preco_desejado > 0 && (
                  <div className="flex justify-between">
                    <span>Preço Desejado (Você):</span>
                    <span className={`font-medium ${
                      dadosPrato.preco_desejado >= resultados.preco_sugerido ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {dadosPrato.preco_desejado.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Preço Mínimo (25% lucro):</span>
                  <span className="font-medium text-orange-600">
                    R$ {(resultados.cmv_estimado_valor * 1.25).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Recomendações - Melhorado */}
      {resultados.alertas.length > 0 && (
        <div className="space-y-3">
          {/* Alertas de Ingredientes Incompletos - Seção Separada */}
          {resultados.alertas.some(alerta => alerta.includes('incompleto')) && (
            <Alert className="border-2 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="text-yellow-800">
                  <strong>ℹ️ Informação sobre Ingredientes:</strong>
                  <div className="mt-2 p-3 bg-yellow-100 rounded-md text-sm">
                    {resultados.alertas
                      .filter(alerta => alerta.includes('incompleto') || alerta.includes('baseado em'))
                      .map((alerta, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{alerta}</span>
                        </div>
                      ))}
                    <div className="mt-2 text-xs text-yellow-700 border-t border-yellow-200 pt-2">
                      💡 <strong>Dica:</strong> Complete os dados dos ingredientes faltantes na aba "Ingredientes" para obter um cálculo mais preciso.
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Outros Alertas */}
          {resultados.alertas.filter(alerta => !alerta.includes('incompleto') && !alerta.includes('baseado em')).length > 0 && (
            <Alert className={`border-2 ${
              resultados.status_viabilidade === 'prejuizo' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                resultados.status_viabilidade === 'prejuizo' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <AlertDescription>
                <div className={`${
                  resultados.status_viabilidade === 'prejuizo' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  <strong>Alertas Importantes:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {resultados.alertas
                      .filter(alerta => !alerta.includes('incompleto') && !alerta.includes('baseado em'))
                      .map((alerta, index) => (
                        <li key={index}>{alerta}</li>
                      ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Recomendações */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            💡 Recomendações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">📈 Para Melhorar a Margem:</h5>
                <ul className="space-y-1 text-blue-700">
                  <li>• Negocie melhores preços com fornecedores</li>
                  <li>• Otimize as quantidades para reduzir perdas</li>
                  <li>• Considere ingredientes alternativos mais econômicos</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">💰 Estratégia de Preços:</h5>
                <ul className="space-y-1 text-blue-700">
                  <li>• Preço ideal para lucro: R$ {(resultados.cmv_estimado_valor * 2).toFixed(2)}</li>
                  <li>• Monitore preços da concorrência regularmente</li>
                  <li>• Considere promoções estratégicas em horários específicos</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onRecalcular}
            disabled={isCalculating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            Recalcular
          </Button>
          
          <Button 
            onClick={onSalvar}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Ficha'}
          </Button>
        </div>
      </div>
    </div>
  );
}