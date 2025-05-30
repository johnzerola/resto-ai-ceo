
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp } from "lucide-react";

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

  // Análise de margem
  if (margin < 10) {
    alerts.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Margem Crítica',
      message: `Margem de ${margin.toFixed(1)}% está muito baixa. Recomenda-se mínimo de 15% para sustentabilidade.`,
      priority: 1
    });
  } else if (margin < 15) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Margem Baixa',
      message: `Margem de ${margin.toFixed(1)}% pode ser otimizada. Considere revisar custos ou preços.`,
      priority: 2
    });
  } else if (margin > 30) {
    alerts.push({
      type: 'info',
      icon: Info,
      title: 'Margem Alta',
      message: `Margem de ${margin.toFixed(1)}% está excelente, mas verifique se não está afetando a competitividade.`,
      priority: 3
    });
  }

  // Análise de ponto de equilíbrio
  const breakEvenPercentage = (breakEvenUnits / monthlySales) * 100;
  if (breakEvenPercentage > 80) {
    alerts.push({
      type: 'error',
      icon: TrendingDown,
      title: 'Ponto de Equilíbrio Alto',
      message: `Necessário vender ${breakEvenPercentage.toFixed(1)}% da capacidade para não ter prejuízo. Risco alto.`,
      priority: 1
    });
  } else if (breakEvenPercentage > 60) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Ponto de Equilíbrio Moderado',
      message: `Ponto de equilíbrio em ${breakEvenPercentage.toFixed(1)}% da capacidade. Monitore vendas de perto.`,
      priority: 2
    });
  } else {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Ponto de Equilíbrio Saudável',
      message: `Ponto de equilíbrio em ${breakEvenPercentage.toFixed(1)}% da capacidade. Boa margem de segurança.`,
      priority: 3
    });
  }

  // Análise de variação de preço
  if (currentPrice) {
    const priceVariation = ((suggestedPrice - currentPrice) / currentPrice) * 100;
    if (Math.abs(priceVariation) > 20) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Grande Variação de Preço',
        message: `Mudança de ${priceVariation.toFixed(1)}% no preço pode impactar significativamente a demanda.`,
        priority: 2
      });
    }
  }

  // Análise de custo unitário
  const costPercentage = (totalCostPerUnit / suggestedPrice) * 100;
  if (costPercentage > 70) {
    alerts.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Custo Alto',
      message: `Custos representam ${costPercentage.toFixed(1)}% do preço. Considere otimizar processos.`,
      priority: 2
    });
  }

  // Ordenar alertas por prioridade
  alerts.sort((a, b) => a.priority - b.priority);

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getAlertTextStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'success':
        return 'text-green-700';
      default:
        return 'text-blue-700';
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas Inteligentes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análises e recomendações baseadas nos dados inseridos
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Todos os indicadores estão dentro dos parâmetros recomendados!</p>
          </div>
        ) : (
          alerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <Alert key={index} className={getAlertStyle(alert.type)}>
                <div className="flex items-start gap-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${getAlertTextStyle(alert.type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${getAlertTextStyle(alert.type)}`}>
                        {alert.title}
                      </h4>
                      <Badge className={`${getBadgeStyle(alert.type)} text-white text-xs`}>
                        {alert.type === 'error' ? 'Crítico' : 
                         alert.type === 'warning' ? 'Atenção' :
                         alert.type === 'success' ? 'Positivo' : 'Info'}
                      </Badge>
                    </div>
                    <AlertDescription className={getAlertTextStyle(alert.type)}>
                      {alert.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            );
          })
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Dicas Gerais:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Monitore custos semanalmente para ajustes rápidos</li>
            <li>• Teste preços gradualmente para medir impacto na demanda</li>
            <li>• Considere ofertas especiais para aumentar volume</li>
            <li>• Analise concorrência regularmente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
