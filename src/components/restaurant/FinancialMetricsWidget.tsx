import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Calculator 
} from "lucide-react";
import { useFinancialMetrics } from "@/hooks/useFinancialMetrics";

export function FinancialMetricsWidget() {
  const { metrics, isLoading } = useFinancialMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCMVStatus = (percentage: number) => {
    if (percentage <= 30) return { color: "bg-green-100 text-green-800", label: "Ótimo" };
    if (percentage <= 35) return { color: "bg-yellow-100 text-yellow-800", label: "Bom" };
    if (percentage <= 40) return { color: "bg-orange-100 text-orange-800", label: "Atenção" };
    return { color: "bg-red-100 text-red-800", label: "Crítico" };
  };

  const getMarginStatus = (percentage: number) => {
    if (percentage >= 20) return { color: "bg-green-100 text-green-800", label: "Excelente" };
    if (percentage >= 15) return { color: "bg-yellow-100 text-yellow-800", label: "Bom" };
    if (percentage >= 10) return { color: "bg-orange-100 text-orange-800", label: "Regular" };
    return { color: "bg-red-100 text-red-800", label: "Baixo" };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cmvStatus = getCMVStatus(metrics.cmv_percentual);
  const marginStatus = getMarginStatus(metrics.margem_bruta_percentual);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Receita Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.receita_total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mês atual
            </p>
          </CardContent>
        </Card>

        {/* CMV */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-blue-600" />
              CMV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics.cmv_valor)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">
                {metrics.cmv_percentual.toFixed(1)}%
              </span>
              <Badge className={cmvStatus.color}>
                {cmvStatus.label}
              </Badge>
            </div>
            <Progress 
              value={Math.min(metrics.cmv_percentual, 50)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        {/* Lucro Bruto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Lucro Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.lucro_bruto >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(metrics.lucro_bruto)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">
                {metrics.margem_bruta_percentual.toFixed(1)}%
              </span>
              <Badge className={marginStatus.color}>
                {marginStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Despesas Operacionais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Despesas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.despesas_operacionais)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Salários, marketing, aluguel
            </p>
          </CardContent>
        </Card>

        {/* Resultado Líquido */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Resultado Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (metrics.lucro_bruto - metrics.despesas_operacionais) >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatCurrency(metrics.lucro_bruto - metrics.despesas_operacionais)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lucro bruto - despesas operacionais
            </p>
          </CardContent>
        </Card>

        {/* Meta CMV */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Meta CMV (≤30%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {metrics.cmv_percentual.toFixed(1)}%
              </span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Meta: 30%
                </div>
                <div className={`text-xs ${metrics.cmv_percentual <= 30 ? "text-green-600" : "text-red-600"}`}>
                  {metrics.cmv_percentual <= 30 ? "✓ Atingida" : "⚠ Acima"}
                </div>
              </div>
            </div>
            <Progress 
              value={(metrics.cmv_percentual / 50) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}