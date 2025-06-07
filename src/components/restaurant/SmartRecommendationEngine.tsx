
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { loadRestaurantConfig } from "@/utils/pricing-calculations";
import { useToast } from "@/components/ui/use-toast";

interface Recommendation {
  id: string;
  type: "critical" | "important" | "suggestion";
  category: "pricing" | "costs" | "operations" | "revenue";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: string;
  potentialGain?: number;
  priority: number;
}

interface BusinessMetrics {
  foodCostPercentage: number;
  profitMargin: number;
  monthlyRevenue: number;
  fixedCosts: number;
  averageTicket: number;
  breakEvenPoint: number;
}

export function SmartRecommendationEngine() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBusinessHealth = () => {
    setIsAnalyzing(true);
    
    // Carregar dados de configuração
    const config = loadRestaurantConfig();
    
    // Simular dados financeiros (em produção, viria do banco de dados)
    const currentMetrics: BusinessMetrics = {
      foodCostPercentage: 32, // Simulado - seria calculado dos dados reais
      profitMargin: 18,
      monthlyRevenue: config.averageMonthlyRevenue || 50000,
      fixedCosts: config.fixedExpenses || 15000,
      averageTicket: 35,
      breakEvenPoint: 1200 // Unidades vendidas para break-even
    };

    setMetrics(currentMetrics);

    // Gerar recomendações baseadas em IA
    const aiRecommendations = generateSmartRecommendations(currentMetrics, config);
    setRecommendations(aiRecommendations);
    
    setTimeout(() => setIsAnalyzing(false), 1500);
    
    toast({
      title: "Análise Concluída",
      description: `${aiRecommendations.length} recomendações geradas com base nos seus dados`,
    });
  };

  const generateSmartRecommendations = (metrics: BusinessMetrics, config: any): Recommendation[] => {
    const recs: Recommendation[] = [];

    // 1. Análise de Food Cost
    if (metrics.foodCostPercentage > 30) {
      recs.push({
        id: "food-cost-high",
        type: "critical",
        category: "costs",
        title: "Food Cost Crítico",
        description: `Seu food cost de ${metrics.foodCostPercentage.toFixed(1)}% está acima do recomendado (máx. 30%)`,
        impact: "high",
        actionable: "Renegocie fornecedores ou reduza porções em 10% nos pratos menos vendidos",
        potentialGain: metrics.monthlyRevenue * 0.05, // 5% de economia estimada
        priority: 1
      });
    }

    // 2. Análise de Margem de Lucro
    if (metrics.profitMargin < 20) {
      recs.push({
        id: "low-profit-margin",
        type: "critical",
        category: "pricing",
        title: "Margem de Lucro Baixa",
        description: `Margem de ${metrics.profitMargin.toFixed(1)}% está abaixo do ideal (mín. 20%)`,
        impact: "high",
        actionable: "Aumente preços em 8% nos pratos premium ou reduza custos operacionais",
        potentialGain: metrics.monthlyRevenue * 0.08,
        priority: 2
      });
    }

    // 3. Análise de Ticket Médio
    if (metrics.averageTicket < 40) {
      recs.push({
        id: "low-average-ticket",
        type: "important",
        category: "revenue",
        title: "Ticket Médio Baixo",
        description: `Ticket médio de ${formatCurrency(metrics.averageTicket)} pode ser otimizado`,
        impact: "medium",
        actionable: "Implemente upselling de bebidas e sobremesas para aumentar em 15%",
        potentialGain: (metrics.monthlyRevenue / metrics.averageTicket) * 6, // R$6 a mais por cliente
        priority: 3
      });
    }

    // 4. Análise de Break-Even
    const salesNeeded = metrics.fixedCosts / (metrics.averageTicket * 0.2); // Margem estimada
    if (metrics.breakEvenPoint > salesNeeded * 0.8) {
      recs.push({
        id: "break-even-risk",
        type: "important",
        category: "operations",
        title: "Ponto de Equilíbrio Alto",
        description: "Você precisa vender muito para cobrir os custos fixos",
        impact: "medium",
        actionable: "Negocie custos fixos (aluguel, seguros) ou aumente frequência de clientes",
        priority: 4
      });
    }

    // 5. Oportunidades de Crescimento
    if (metrics.profitMargin > 25 && metrics.foodCostPercentage < 28) {
      recs.push({
        id: "growth-opportunity",
        type: "suggestion",
        category: "revenue",
        title: "Oportunidade de Expansão",
        description: "Suas margens estão saudáveis para investir em crescimento",
        impact: "high",
        actionable: "Considere ampliar cardápio ou horário de funcionamento",
        potentialGain: metrics.monthlyRevenue * 0.25,
        priority: 5
      });
    }

    // 6. Otimização de Cardápio
    recs.push({
      id: "menu-optimization",
      type: "suggestion",
      category: "operations",
      title: "Otimização de Cardápio",
      description: "Analise pratos com baixa margem e alta popularidade",
      impact: "medium",
      actionable: "Remova 3 pratos menos rentáveis e promova os mais lucrativos",
      potentialGain: metrics.monthlyRevenue * 0.03,
      priority: 6
    });

    return recs.sort((a, b) => a.priority - b.priority);
  };

  useEffect(() => {
    analyzeBusinessHealth();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "important": return <Target className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical": return "border-red-200 bg-red-50";
      case "important": return "border-yellow-200 bg-yellow-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Motor de Recomendações Inteligente
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise automática com sugestões para maximizar lucros
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={analyzeBusinessHealth}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analisando..." : "Atualizar Análise"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Food Cost</p>
              <p className={`font-bold ${metrics.foodCostPercentage > 30 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.foodCostPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Margem</p>
              <p className={`font-bold ${metrics.profitMargin < 20 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="font-bold text-blue-600">
                {formatCurrency(metrics.averageTicket)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Break-Even</p>
              <p className="font-bold text-purple-600">
                {metrics.breakEvenPoint}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <Alert key={rec.id} className={getTypeColor(rec.type)}>
              <div className="flex items-start gap-3">
                {getTypeIcon(rec.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      {rec.potentialGain && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          +{formatCurrency(rec.potentialGain)}/mês
                        </Badge>
                      )}
                    </div>
                  </div>
                  <AlertDescription className="text-xs">
                    {rec.description}
                  </AlertDescription>
                  <div className="bg-white p-2 rounded border-l-4 border-blue-500">
                    <p className="text-xs font-medium text-blue-900">
                      💡 Ação Recomendada: {rec.actionable}
                    </p>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>

        {recommendations.length === 0 && !isAnalyzing && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Seu restaurante está operando dentro dos padrões ideais!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
