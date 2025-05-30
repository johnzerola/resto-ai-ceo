
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, TrendingUp } from "lucide-react";

interface Recommendation {
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  suggestion: string;
}

interface SmartAlertsProps {
  recommendations: Recommendation[];
}

export function SmartAlerts({ recommendations }: SmartAlertsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-green-800 mb-2">Configuração Otimizada!</h3>
            <p className="text-sm text-green-600">
              Suas configurações estão dentro dos parâmetros recomendados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas Inteligentes
          <Badge className="ml-2">{recommendations.length}</Badge>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Recomendações baseadas em melhores práticas do setor
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <Alert key={index} className={getAlertClass(rec.type)}>
            <div className="flex items-start gap-3">
              {getIcon(rec.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge className={`${getBadgeClass(rec.type)} text-white text-xs`}>
                    {rec.type.toUpperCase()}
                  </Badge>
                </div>
                <AlertDescription className="mb-2">
                  {rec.description}
                </AlertDescription>
                <div className={`p-3 rounded-md mt-2 ${
                  rec.type === 'success' ? 'bg-green-100' :
                  rec.type === 'warning' ? 'bg-yellow-100' :
                  rec.type === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <p className={`text-sm font-medium ${
                    rec.type === 'success' ? 'text-green-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    rec.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    💡 Sugestão: {rec.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </Alert>
        ))}

        {/* Additional industry insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🎯 Dicas Adicionais do Setor</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Monitore a concorrência semanalmente para ajustar preços</li>
            <li>• Considere promoções estratégicas em dias de menor movimento</li>
            <li>• Teste diferentes faixas de preço com pequenos ajustes (+/- 5%)</li>
            <li>• Mantenha margem mínima de 20% para sustentabilidade</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
