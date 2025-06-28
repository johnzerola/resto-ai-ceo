
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertaService, AlertaSistema } from '@/services/AlertaService';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, CheckCircle, TrendingDown, Brain, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function AlertCenter() {
  const { currentRestaurant } = useAuth();
  const [alertas, setAlertas] = useState<AlertaSistema[]>([]);
  const [analisePreditiva, setAnalisePreditiva] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDados();
    }
  }, [currentRestaurant]);

  const carregarDados = async () => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      // Carregar alertas ativos
      const alertasAtivos = await AlertaService.getAlertasAtivos(currentRestaurant.id);
      setAlertas(alertasAtivos);

      // Gerar alertas automáticos
      await AlertaService.gerarAlertasAutomaticos(currentRestaurant.id);

      // Análise preditiva
      const analise = await AlertaService.analisarRiscosProativos(currentRestaurant.id);
      setAnalisePreditiva(analise);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolverAlerta = async (alertaId: string) => {
    const sucesso = await AlertaService.resolverAlerta(alertaId);
    if (sucesso) {
      await carregarDados();
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return '🚨';
      case 'alta': return '⚠️';
      case 'media': return '⚡';
      case 'baixa': return 'ℹ️';
      default: return '';
    }
  };

  const getRiscoColor = (probabilidade: number) => {
    if (probabilidade > 70) return 'text-red-600';
    if (probabilidade > 40) return 'text-orange-600';
    if (probabilidade > 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Central de Alertas</h2>
          <p className="text-muted-foreground">
            Monitoramento inteligente do seu restaurante
          </p>
        </div>
        <Button onClick={carregarDados} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Análise Preditiva MIT */}
      {analisePreditiva && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Análise Preditiva MIT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Probabilidade de Problemas</span>
                <span className={`text-lg font-bold ${getRiscoColor(analisePreditiva.probabilidade_problemas)}`}>
                  {analisePreditiva.probabilidade_problemas.toFixed(0)}%
                </span>
              </div>

              {analisePreditiva.riscos_identificados.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">🔍 Riscos Identificados:</h4>
                  <div className="space-y-1">
                    {analisePreditiva.riscos_identificados.map((risco: string, index: number) => (
                      <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        {risco}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analisePreditiva.acoes_preventivas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">🎯 Ações Preventivas:</h4>
                  <div className="space-y-1">
                    {analisePreditiva.acoes_preventivas.map((acao: string, index: number) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                        {acao}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas Ativos ({alertas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                🎉 Nenhum alerta ativo! Seu restaurante está funcionando bem.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div 
                  key={alerta.id} 
                  className={`p-4 rounded-lg border ${getPrioridadeColor(alerta.prioridade)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getPrioridadeIcon(alerta.prioridade)}
                        </span>
                        <h4 className="font-semibold">{alerta.titulo}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alerta.prioridade.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{alerta.mensagem}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {alerta.data_criacao && new Date(alerta.data_criacao).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alerta.id && resolverAlerta(alerta.id)}
                    >
                      Resolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Críticos: {alertas.filter(a => a.prioridade === 'critica').length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Alta Prioridade: {alertas.filter(a => a.prioridade === 'alta').length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Risco Geral: {analisePreditiva?.probabilidade_problemas?.toFixed(0) || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
