import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Calendar, DollarSign } from "lucide-react";

interface AIInsight {
  id: string;
  tipo: 'custo' | 'desperdicio' | 'cmv' | 'conta' | 'vendas';
  titulo: string;
  mensagem: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data: string;
}

export function AIBusinessAssistant() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = () => {
    setIsLoading(true);
    
    // Simular análise de dados para gerar insights automáticos
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        tipo: 'custo',
        titulo: 'Maior Custo Ontem',
        mensagem: 'Ingredientes representaram R$ 850 (45% dos gastos de ontem). Considere revisar fornecedores.',
        prioridade: 'media',
        data: ontem.toISOString().split('T')[0]
      },
      {
        id: '2',
        tipo: 'desperdicio',
        titulo: 'Desperdício Crítico',
        mensagem: 'Tomate teve 18% de desperdício este mês. Ajuste quantidade de compra ou cardápio.',
        prioridade: 'alta',
        data: hoje.toISOString().split('T')[0]
      },
      {
        id: '3',
        tipo: 'cmv',
        titulo: 'CMV Status',
        mensagem: 'Seu CMV está em 28%, dentro do ideal (30%). Parabéns, continue assim!',
        prioridade: 'baixa',
        data: hoje.toISOString().split('T')[0]
      },
      {
        id: '4',
        tipo: 'conta',
        titulo: 'Conta Vencendo',
        mensagem: 'Fornecedor XYZ vence amanhã (R$ 1.200). Lembre-se de efetuar o pagamento.',
        prioridade: 'alta',
        data: hoje.toISOString().split('T')[0]
      },
      {
        id: '5',
        tipo: 'vendas',
        titulo: 'Oportunidade de Vendas',
        mensagem: 'Hambúrguer Especial vendeu 25% mais que a média. Considere promover produtos similares.',
        prioridade: 'media',
        data: ontem.toISOString().split('T')[0]
      }
    ];

    setInsights(mockInsights);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getInsightIcon = (tipo: AIInsight['tipo']) => {
    switch (tipo) {
      case 'custo': return <DollarSign className="h-4 w-4" />;
      case 'desperdicio': return <AlertTriangle className="h-4 w-4" />;
      case 'cmv': return <TrendingUp className="h-4 w-4" />;
      case 'conta': return <Calendar className="h-4 w-4" />;
      case 'vendas': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (prioridade: AIInsight['prioridade']) => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baixa': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityText = (prioridade: AIInsight['prioridade']) => {
    switch (prioridade) {
      case 'alta': return '🔴 Urgente';
      case 'media': return '🟡 Atenção';
      case 'baixa': return '🟢 Info';
      default: return 'Normal';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Business Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Business Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Insights automáticos do seu negócio
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight) => (
            <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium truncate">
                    {insight.titulo}
                  </h4>
                  <Badge variant={getPriorityColor(insight.prioridade)} className="text-xs">
                    {getPriorityText(insight.prioridade)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.mensagem}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 Insights atualizados diariamente com base nos seus dados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}