
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface SmartAlertsProps {
  margin: number;
  suggestedPrice: number;
  currentPrice?: number;
  breakEvenUnits: number;
  monthlySales: number;
  totalCostPerUnit: number;
}

export function SmartAlerts({
  margin,
  suggestedPrice,
  currentPrice,
  breakEvenUnits,
  monthlySales,
  totalCostPerUnit
}: SmartAlertsProps) {
  
  const alerts = [];

  // Alert de margem baixa
  if (margin < 10) {
    alerts.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Margem Crítica',
      message: `Margem de ${margin.toFixed(1)}% está abaixo do recomendado (mín. 15%). Risco alto de prejuízo.`,
      suggestion: 'Considere reduzir custos ou aumentar preços gradualmente.'
    });
  } else if (margin < 15) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Margem Baixa',
      message: `Margem de ${margin.toFixed(1)}% pode ser otimizada. Ideal acima de 15%.`,
      suggestion: 'Analise oportunidades de redução de custos ou ajuste de preços.'
    });
  }

  // Alert de break-even
  const breakEvenPercentage = (breakEvenUnits / monthlySales) * 100;
  if (breakEvenPercentage > 80) {
    alerts.push({
      type: 'error',
      icon: TrendingDown,
      title: 'Ponto de Equilíbrio Alto',
      message: `Precisa vender ${breakEvenPercentage.toFixed(0)}% da capacidade só para empatar.`,
      suggestion: 'Reavalie sua estrutura de custos para reduzir o risco operacional.'
    });
  } else if (breakEvenPercentage > 60) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Ponto de Equilíbrio Elevado',
      message: `Break-even em ${breakEvenPercentage.toFixed(0)}% da capacidade.`,
      suggestion: 'Monitore de perto o volume de vendas para garantir lucratividade.'
    });
  }

  // Alert de diferença de preço
  if (currentPrice) {
    const priceVariation = ((suggestedPrice - currentPrice) / currentPrice) * 100;
    if (Math.abs(priceVariation) > 20) {
      alerts.push({
        type: 'warning',
        icon: priceVariation > 0 ? TrendingUp : TrendingDown,
        title: 'Grande Variação de Preço',
        message: `Preço sugerido é ${Math.abs(priceVariation).toFixed(1)}% ${priceVariation > 0 ? 'maior' : 'menor'} que o atual.`,
        suggestion: 'Implemente mudanças gradualmente para não impactar a clientela.'
      });
    }
  }

  // Alert de custo alto
  const markupMultiplier = suggestedPrice / totalCostPerUnit;
  if (markupMultiplier < 2) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Markup Baixo',
      message: `Markup de apenas ${markupMultiplier.toFixed(1)}x sobre o custo.`,
      suggestion: 'Considere renegociar com fornecedores ou otimizar receitas.'
    });
  }

  // Sugestões positivas
  if (margin >= 20) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Excelente Margem',
      message: `Margem de ${margin.toFixed(1)}% está muito boa! Parabéns.`,
      suggestion: 'Mantenha o controle de custos e monitore a satisfação dos clientes.'
    });
  }

  if (breakEvenPercentage < 40) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Break-even Saudável',
      message: `Ponto de equilíbrio em apenas ${breakEvenPercentage.toFixed(0)}% da capacidade.`,
      suggestion: 'Ótima margem de segurança operacional!'
    });
  }

  // Sugestões de otimização
  const optimizations = [];

  if (margin < 15) {
    optimizations.push('Negocie melhores preços com fornecedores');
    optimizations.push('Revise receitas para reduzir desperdício');
    optimizations.push('Considere ajustar porções para otimizar custos');
  }

  if (markupMultiplier < 2.5) {
    optimizations.push('Explore ingredientes alternativos mais econômicos');
    optimizations.push('Implemente controle rigoroso de estoque');
  }

  if (optimizations.length > 0) {
    alerts.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Oportunidades de Otimização',
      message: 'Identifiquei algumas oportunidades de melhoria:',
      suggestion: optimizations.join(' • ')
    });
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Alertas Inteligentes e Sugestões
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise automática e recomendações para otimização
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p>Tudo parece estar em ordem! Seus parâmetros estão dentro dos padrões recomendados.</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <Alert key={index} className={getAlertColor(alert.type)}>
                <IconComponent className={`h-4 w-4 ${getIconColor(alert.type)}`} />
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}>
                      {alert.title}
                    </Badge>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    💡 {alert.suggestion}
                  </p>
                </AlertDescription>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
