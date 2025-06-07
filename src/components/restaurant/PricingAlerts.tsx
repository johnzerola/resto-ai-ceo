
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp } from "lucide-react";

interface PricingAlertsProps {
  foodCostPercentage: number;
  profitMargin: number;
  suggestedPrice: number;
  model: string;
  breakEvenPrice: number;
}

export function PricingAlerts({ 
  foodCostPercentage, 
  profitMargin, 
  suggestedPrice, 
  model,
  breakEvenPrice 
}: PricingAlertsProps) {
  const alerts = [];

  // Food Cost Alerts
  if (foodCostPercentage > 35) {
    alerts.push({
      type: "error" as const,
      icon: AlertTriangle,
      title: "Food Cost Crítico",
      message: `${foodCostPercentage.toFixed(1)}% está muito alto! Recomendado: máximo 35%`,
      suggestion: "Reduza custos de ingredientes ou aumente preços",
      priority: 1
    });
  } else if (foodCostPercentage > 30) {
    alerts.push({
      type: "warning" as const,
      icon: TrendingUp,
      title: "Food Cost Elevado",
      message: `${foodCostPercentage.toFixed(1)}% está no limite superior`,
      suggestion: "Monitore de perto e considere otimizações",
      priority: 2
    });
  } else if (foodCostPercentage < 20) {
    alerts.push({
      type: "info" as const,
      icon: TrendingDown,
      title: "Food Cost Baixo",
      message: `${foodCostPercentage.toFixed(1)}% - Você pode ter margem para melhorar qualidade`,
      suggestion: "Considere ingredientes premium ou aumente porções",
      priority: 3
    });
  }

  // Profit Margin Alerts
  if (profitMargin < 15) {
    alerts.push({
      type: "error" as const,
      icon: AlertTriangle,
      title: "Margem Insustentável",
      message: `${profitMargin.toFixed(1)}% é muito baixa para sustentabilidade`,
      suggestion: "Aumente preços ou reduza custos operacionais",
      priority: 1
    });
  } else if (profitMargin < 20) {
    alerts.push({
      type: "warning" as const,
      icon: Info,
      title: "Margem Baixa",
      message: `${profitMargin.toFixed(1)}% - Recomendado mínimo: 20%`,
      suggestion: "Considere ajustes para maior sustentabilidade",
      priority: 2
    });
  }

  // Price Positioning Alerts
  if (model === "rodizio" && suggestedPrice > 80) {
    alerts.push({
      type: "warning" as const,
      icon: TrendingUp,
      title: "Preço Premium",
      message: "Preço acima de R$ 80 requer estratégia de diferenciação",
      suggestion: "Garanta qualidade excepcional e ambiente diferenciado",
      priority: 2
    });
  }

  if (model === "buffet_peso" && suggestedPrice > 60) {
    alerts.push({
      type: "warning" as const,
      icon: TrendingUp,
      title: "Preço Elevado para Buffet",
      message: "Preço/kg acima de R$ 60 pode reduzir demanda",
      suggestion: "Analise concorrência e valor percebido",
      priority: 2
    });
  }

  // Break-even Alert
  if (suggestedPrice < breakEvenPrice * 1.1) {
    alerts.push({
      type: "error" as const,
      icon: AlertTriangle,
      title: "Próximo do Break-Even",
      message: "Preço muito próximo do ponto de equilíbrio",
      suggestion: "Aumente margem para cobrir imprevistos",
      priority: 1
    });
  }

  // Success Alert
  if (foodCostPercentage >= 25 && foodCostPercentage <= 30 && profitMargin >= 25) {
    alerts.push({
      type: "success" as const,
      icon: CheckCircle,
      title: "Precificação Ideal",
      message: "Sua precificação está dentro dos padrões ideais!",
      suggestion: "Continue monitorando custos e demanda",
      priority: 4
    });
  }

  // Sort by priority
  alerts.sort((a, b) => a.priority - b.priority);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Análise Inteligente</h4>
      {alerts.map((alert, index) => {
        const IconComponent = alert.icon;
        const alertClass = {
          error: "border-red-200 bg-red-50",
          warning: "border-yellow-200 bg-yellow-50",
          info: "border-blue-200 bg-blue-50",
          success: "border-green-200 bg-green-50"
        };

        const iconClass = {
          error: "text-red-600",
          warning: "text-yellow-600",
          info: "text-blue-600",
          success: "text-green-600"
        };

        const badgeClass = {
          error: "bg-red-100 text-red-800",
          warning: "bg-yellow-100 text-yellow-800",
          info: "bg-blue-100 text-blue-800",
          success: "bg-green-100 text-green-800"
        };

        return (
          <Alert key={index} className={alertClass[alert.type]}>
            <div className="flex items-start gap-3">
              <IconComponent className={`h-4 w-4 mt-0.5 ${iconClass[alert.type]}`} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <Badge className={badgeClass[alert.type]}>
                    {alert.type === 'error' ? 'Crítico' : 
                     alert.type === 'warning' ? 'Atenção' : 
                     alert.type === 'info' ? 'Informação' : 'Sucesso'}
                  </Badge>
                </div>
                <AlertDescription className="text-xs">
                  {alert.message}
                </AlertDescription>
                <p className="text-xs font-medium mt-1">
                  💡 {alert.suggestion}
                </p>
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
