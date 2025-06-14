
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calculator,
  Target,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarginAnalysis {
  pratoId: string;
  nomePrato: string;
  margemAtual: number;
  margemIdeal: number;
  status: 'saudavel' | 'atencao' | 'critico';
  recomendacoes: string[];
  custoTotal: number;
  precoSugerido: number;
  precoAtual: number;
}

interface AutomaticMarginAnalysisProps {
  restaurantId: string;
}

export function AutomaticMarginAnalysis({ restaurantId }: AutomaticMarginAnalysisProps) {
  const [analyses, setAnalyses] = useState<MarginAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadMarginAnalyses();
    }
  }, [restaurantId]);

  const loadMarginAnalyses = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os pratos do restaurante
      const { data: pratos, error } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      const analysisResults: MarginAnalysis[] = [];

      for (const prato of pratos || []) {
        // Calcular custos usando a função do banco
        const { data: custos, error: custosError } = await supabase
          .rpc('calcular_custos_prato', { prato_uuid: prato.id });

        if (custosError) {
          console.error('Erro ao calcular custos:', custosError);
          continue;
        }

        const custoData = custos[0];
        if (!custoData) continue;

        const margemAtual = custoData.margem_percentual || 0;
        const margemIdeal = 35; // Margem ideal padrão
        const precoAtual = prato.preco_praticado || custoData.preco_sugerido;

        let status: 'saudavel' | 'atencao' | 'critico' = 'saudavel';
        const recomendacoes: string[] = [];

        if (margemAtual < 15) {
          status = 'critico';
          recomendacoes.push('Margem muito baixa - considere revisar custos ou aumentar preço');
        } else if (margemAtual < 25) {
          status = 'atencao';
          recomendacoes.push('Margem abaixo do ideal - oportunidade de otimização');
        }

        if (precoAtual < custoData.preco_sugerido * 0.9) {
          recomendacoes.push('Preço atual está abaixo do sugerido');
        }

        if (custoData.status_viabilidade === 'prejuizo') {
          status = 'critico';
          recomendacoes.push('ATENÇÃO: Produto gerando prejuízo');
        }

        analysisResults.push({
          pratoId: prato.id,
          nomePrato: prato.nome_prato,
          margemAtual,
          margemIdeal,
          status,
          recomendacoes,
          custoTotal: custoData.custo_total,
          precoSugerido: custoData.preco_sugerido,
          precoAtual
        });
      }

      // Ordenar por status (crítico primeiro)
      analysisResults.sort((a, b) => {
        const statusOrder = { critico: 0, atencao: 1, saudavel: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setAnalyses(analysisResults);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast.error('Erro ao carregar análises de margem');
    } finally {
      setIsLoading(false);
    }
  };

  const runAutomaticOptimization = async () => {
    setIsAnalyzing(true);
    try {
      let optimizedCount = 0;

      for (const analysis of analyses) {
        if (analysis.status === 'critico' || analysis.status === 'atencao') {
          // Sugerir novo preço com margem ideal
          const novoPreco = analysis.custoTotal / (1 - (analysis.margemIdeal / 100));
          
          // Atualizar preço sugerido no banco (não o praticado automaticamente)
          await supabase
            .from('pratos')
            .update({ 
              preco_sugerido: novoPreco,
              updated_at: new Date().toISOString()
            })
            .eq('id', analysis.pratoId);

          optimizedCount++;
        }
      }

      await loadMarginAnalyses(); // Recarregar dados
      toast.success(`${optimizedCount} produtos otimizados automaticamente!`);
    } catch (error) {
      console.error('Erro na otimização:', error);
      toast.error('Erro durante a otimização automática');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-500 text-white';
      case 'atencao': return 'bg-yellow-500 text-black';
      case 'saudavel': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critico': return <AlertTriangle className="h-4 w-4" />;
      case 'atencao': return <TrendingDown className="h-4 w-4" />;
      case 'saudavel': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const healthyCount = analyses.filter(a => a.status === 'saudavel').length;
  const warningCount = analyses.filter(a => a.status === 'atencao').length;
  const criticalCount = analyses.filter(a => a.status === 'critico').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Analisando margens...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo das análises */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Analisado</p>
                <p className="text-2xl font-bold">{analyses.length}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saudáveis</p>
                <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análise Automática de Margem
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={loadMarginAnalyses} 
                variant="outline"
                disabled={isLoading}
              >
                Atualizar Análise
              </Button>
              <Button 
                onClick={runAutomaticOptimization}
                disabled={isAnalyzing || analyses.length === 0}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {isAnalyzing ? 'Otimizando...' : 'Otimizar Automaticamente'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {(criticalCount > 0 || warningCount > 0) && (
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {criticalCount > 0 && `${criticalCount} produtos críticos encontrados. `}
                {warningCount > 0 && `${warningCount} produtos precisam de atenção. `}
                Considere executar a otimização automática.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Lista de análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analyses.map((analysis) => (
          <Card key={analysis.pratoId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{analysis.nomePrato}</CardTitle>
                <Badge className={getStatusColor(analysis.status)}>
                  {getStatusIcon(analysis.status)}
                  <span className="ml-1 capitalize">{analysis.status}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Métricas principais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Margem Atual</p>
                  <p className="text-xl font-bold">{analysis.margemAtual.toFixed(1)}%</p>
                  <Progress 
                    value={analysis.margemAtual} 
                    className="mt-1"
                    max={50}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Margem Ideal</p>
                  <p className="text-xl font-bold text-blue-600">{analysis.margemIdeal}%</p>
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Custo Total</p>
                  <p className="font-medium">R$ {analysis.custoTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Preço Atual</p>
                  <p className="font-medium">R$ {analysis.precoAtual.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Preço Sugerido</p>
                  <p className="font-medium text-green-600">R$ {analysis.precoSugerido.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Diferença</p>
                  <p className={`font-medium ${analysis.precoSugerido > analysis.precoAtual ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.precoSugerido > analysis.precoAtual ? '+' : ''}
                    R$ {(analysis.precoSugerido - analysis.precoAtual).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Recomendações */}
              {analysis.recomendacoes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recomendações:</p>
                  <ul className="text-sm space-y-1">
                    {analysis.recomendacoes.map((rec, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {analyses.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma análise disponível</p>
            <p className="text-muted-foreground">
              Adicione pratos ao seu cardápio para começar a análise automática de margem.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
