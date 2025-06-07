
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BreakEvenAnalysisProps {
  breakEvenPrice: number;
  suggestedPrice: number;
  monthlySales: number;
  fixedCosts: number;
  variableCostPerUnit: number;
  model: string;
}

export function BreakEvenAnalysis({
  breakEvenPrice,
  suggestedPrice,
  monthlySales,
  fixedCosts,
  variableCostPerUnit,
  model
}: BreakEvenAnalysisProps) {
  
  // Calculate break-even quantity
  const contributionMargin = suggestedPrice - variableCostPerUnit;
  const breakEvenQuantity = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  
  // Safety margin
  const safetyMargin = ((suggestedPrice - breakEvenPrice) / suggestedPrice) * 100;
  
  // Monthly analysis
  const monthlyRevenue = suggestedPrice * monthlySales;
  const monthlyVariableCosts = variableCostPerUnit * monthlySales;
  const monthlyContribution = monthlyRevenue - monthlyVariableCosts;
  const monthlyProfit = monthlyContribution - fixedCosts;
  
  const getSafetyLevel = () => {
    if (safetyMargin >= 30) return { level: "Excelente", color: "bg-green-500", description: "Margem de segurança muito boa" };
    if (safetyMargin >= 20) return { level: "Boa", color: "bg-blue-500", description: "Margem de segurança adequada" };
    if (safetyMargin >= 10) return { level: "Moderada", color: "bg-yellow-500", description: "Margem de segurança baixa" };
    return { level: "Crítica", color: "bg-red-500", description: "Margem de segurança insuficiente" };
  };

  const safetyLevel = getSafetyLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Análise de Ponto de Equilíbrio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Preço Break-Even</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(breakEvenPrice)}
              {model === "buffet_peso" && <span className="text-sm">/kg</span>}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Quantidade Break-Even</p>
            <p className="text-xl font-bold text-purple-600">
              {breakEvenQuantity.toLocaleString()}
              <span className="text-sm text-muted-foreground">
                /{model === "buffet_peso" ? "kg" : "unid"}/mês
              </span>
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Margem de Segurança</p>
              <Badge className={`${safetyLevel.color} text-white`}>
                {safetyLevel.level}
              </Badge>
            </div>
            <p className="text-xl font-bold text-purple-600">
              {safetyMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Safety Analysis */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-700" />
            <h4 className="font-medium text-purple-900">Análise de Segurança</h4>
          </div>
          <p className="text-sm text-purple-700 mb-3">{safetyLevel.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-800 font-medium">Cenário Atual (mensal):</p>
              <div className="space-y-1 text-purple-700">
                <p>• Receita: {formatCurrency(monthlyRevenue)}</p>
                <p>• Custos Variáveis: {formatCurrency(monthlyVariableCosts)}</p>
                <p>• Custos Fixos: {formatCurrency(fixedCosts)}</p>
                <p className="font-medium">• Lucro: {formatCurrency(monthlyProfit)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-purple-800 font-medium">Recomendações:</p>
              <div className="space-y-1 text-purple-700 text-xs">
                {safetyMargin < 20 && (
                  <>
                    <p>• Aumente preços ou reduza custos</p>
                    <p>• Monitore vendas diariamente</p>
                  </>
                )}
                {safetyMargin >= 20 && safetyMargin < 30 && (
                  <>
                    <p>• Mantenha controle de custos</p>
                    <p>• Considere estratégias de crescimento</p>
                  </>
                )}
                {safetyMargin >= 30 && (
                  <>
                    <p>• Margem excelente para crescimento</p>
                    <p>• Considere investir em qualidade</p>
                  </>
                )}
                <p>• Revise custos fixos trimestralmente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Comparação Visual</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs w-20">Break-Even:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(breakEvenPrice / suggestedPrice) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(breakEvenPrice)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs w-20">Preço Atual:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                {formatCurrency(suggestedPrice)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
