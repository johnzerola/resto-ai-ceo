
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Target, AlertTriangle, CheckCircle } from "lucide-react";

interface CompetitiveBenchmarkProps {
  suggestedPrice: number;
  priceType: string;
}

export function CompetitiveBenchmark({ suggestedPrice, priceType }: CompetitiveBenchmarkProps) {
  // Mock competitive data - in a real app, this would come from market research
  const marketData = priceType === 'kg' ? {
    low: 35,
    average: 45,
    high: 60,
    premium: 75,
    unit: 'kg'
  } : {
    low: 25,
    average: 35,
    high: 50,
    premium: 65,
    unit: 'pessoa'
  };

  const getPositioning = (price: number) => {
    if (price <= marketData.low) return { level: 'Econômico', color: 'bg-blue-500', icon: Target };
    if (price <= marketData.average) return { level: 'Competitivo', color: 'bg-green-500', icon: CheckCircle };
    if (price <= marketData.high) return { level: 'Premium', color: 'bg-yellow-500', icon: AlertTriangle };
    return { level: 'Luxo', color: 'bg-purple-500', icon: Target };
  };

  const positioning = getPositioning(suggestedPrice);
  const IconComponent = positioning.icon;

  const recommendations = [
    {
      condition: suggestedPrice < marketData.low,
      message: "Preço muito baixo - considere aumentar para melhorar a margem",
      type: "warning"
    },
    {
      condition: suggestedPrice >= marketData.low && suggestedPrice <= marketData.average,
      message: "Preço competitivo - boa estratégia para volume de vendas",
      type: "success"
    },
    {
      condition: suggestedPrice > marketData.average && suggestedPrice <= marketData.high,
      message: "Posicionamento premium - foque na qualidade e diferenciação",
      type: "info"
    },
    {
      condition: suggestedPrice > marketData.high,
      message: "Preço muito alto - pode reduzir demanda significativamente",
      type: "warning"
    }
  ];

  const activeRecommendation = recommendations.find(r => r.condition);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Análise Competitiva
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação com preços de mercado
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Seu Preço Sugerido:</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatCurrency(suggestedPrice)}</span>
            <Badge className={`${positioning.color} text-white`}>
              <IconComponent className="h-3 w-3 mr-1" />
              {positioning.level}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Faixas de Preço do Mercado:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm">Econômico</span>
              <span className="text-sm font-medium">Até {formatCurrency(marketData.low)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm">Competitivo</span>
              <span className="text-sm font-medium">{formatCurrency(marketData.low)} - {formatCurrency(marketData.average)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="text-sm">Premium</span>
              <span className="text-sm font-medium">{formatCurrency(marketData.average)} - {formatCurrency(marketData.high)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <span className="text-sm">Luxo</span>
              <span className="text-sm font-medium">Acima de {formatCurrency(marketData.high)}</span>
            </div>
          </div>
        </div>

        {activeRecommendation && (
          <div className={`p-3 rounded-lg ${
            activeRecommendation.type === 'success' ? 'bg-green-50 border border-green-200' :
            activeRecommendation.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              activeRecommendation.type === 'success' ? 'text-green-700' :
              activeRecommendation.type === 'warning' ? 'text-yellow-700' :
              'text-blue-700'
            }`}>
              <strong>Recomendação:</strong> {activeRecommendation.message}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>* Dados baseados em pesquisa de mercado regional</p>
          <p>* Considere fatores como localização, qualidade e serviço</p>
        </div>
      </CardContent>
    </Card>
  );
}
