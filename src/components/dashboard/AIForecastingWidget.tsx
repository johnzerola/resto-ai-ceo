import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Clock,
  Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface Forecast {
  period: string;
  predicted: number;
  confidence: number;
  scenarios: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
}

interface SeasonalityInsight {
  period: string;
  trend: "up" | "down" | "stable";
  impact: number;
  recommendation: string;
}

interface AIInsight {
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: "revenue" | "cost" | "customer" | "market";
}

export function AIForecastingWidget() {
  const [salesForecast, setSalesForecast] = useState<Forecast[]>([]);
  const [demandForecast, setDemandForecast] = useState<any[]>([]);
  const [seasonalityInsights, setSeasonalityInsights] = useState<SeasonalityInsight[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState("sales");

  useEffect(() => {
    generateSalesForecast();
    generateDemandForecast();
    generateSeasonalityInsights();
    generateAIInsights();
  }, []);

  const generateSalesForecast = () => {
    const forecast: Forecast[] = [
      {
        period: "Próxima Semana",
        predicted: 8400,
        confidence: 85,
        scenarios: { pessimistic: 7200, realistic: 8400, optimistic: 9600 }
      },
      {
        period: "Próximo Mês",
        predicted: 34500,
        confidence: 78,
        scenarios: { pessimistic: 29000, realistic: 34500, optimistic: 40000 }
      },
      {
        period: "Próximos 3 Meses",
        predicted: 115000,
        confidence: 65,
        scenarios: { pessimistic: 95000, realistic: 115000, optimistic: 135000 }
      }
    ];
    setSalesForecast(forecast);
  };

  const generateDemandForecast = () => {
    const products = [
      { name: "Pizza Margherita", current: 45, predicted: 52, trend: "up" },
      { name: "Hambúrguer Especial", current: 38, predicted: 41, trend: "up" },
      { name: "Lasanha Bolonhesa", current: 28, predicted: 25, trend: "down" },
      { name: "Salada Caesar", current: 22, predicted: 29, trend: "up" },
      { name: "Refrigerantes", current: 85, predicted: 78, trend: "down" }
    ];
    setDemandForecast(products);
  };

  const generateSeasonalityInsights = () => {
    const insights: SeasonalityInsight[] = [
      {
        period: "Dezembro",
        trend: "up",
        impact: 45,
        recommendation: "Aumentar estoque de ingredientes festivos em 40%"
      },
      {
        period: "Janeiro",
        trend: "down",
        impact: -28,
        recommendation: "Focar em pratos saudáveis e promoções"
      },
      {
        period: "Sexta-feira",
        trend: "up",
        impact: 62,
        recommendation: "Ampliar equipe e preparar ingredientes extras"
      },
      {
        period: "Segunda-feira",
        trend: "down",
        impact: -18,
        recommendation: "Otimizar custos e focar em limpeza/manutenção"
      }
    ];
    setSeasonalityInsights(insights);
  };

  const generateAIInsights = () => {
    const insights: AIInsight[] = [
      {
        title: "Padrão de Crescimento Identificado",
        description: "Vendas crescem 23% nas sextas-feiras quando chove. Considere campanhas específicas.",
        confidence: 92,
        impact: "high",
        category: "revenue"
      },
      {
        title: "Oportunidade de Cross-sell",
        description: "Clientes que pedem pizza têm 78% de chance de pedir refrigerante. Crie combos.",
        confidence: 87,
        impact: "medium",
        category: "revenue"
      },
      {
        title: "Risco de Churn de Clientes",
        description: "15 clientes não fizeram pedidos há 3 semanas. Envie ofertas personalizadas.",
        confidence: 83,
        impact: "high",
        category: "customer"
      },
      {
        title: "Otimização de Estoque",
        description: "Queijo mozzarella desperdiça 12% semanalmente. Ajuste pedidos em 8%.",
        confidence: 90,
        impact: "medium",
        category: "cost"
      }
    ];
    setAiInsights(insights);
  };

  const scenarioData = salesForecast.map(item => ({
    period: item.period,
    pessimistic: item.scenarios.pessimistic,
    realistic: item.scenarios.realistic,
    optimistic: item.scenarios.optimistic
  }));

  const renderSalesForecast = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {salesForecast.map((forecast, index) => (
          <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{forecast.period}</h4>
                <Badge variant="secondary" className="text-xs">
                  {forecast.confidence}% confiança
                </Badge>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                R$ {forecast.predicted.toLocaleString()}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Pessimista:</span>
                  <span>R$ {forecast.scenarios.pessimistic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">Otimista:</span>
                  <span>R$ {forecast.scenarios.optimistic.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Cenários de Previsão</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString()}`, '']} />
                <Area 
                  type="monotone" 
                  dataKey="optimistic" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="realistic" 
                  stackId="2"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Area 
                  type="monotone" 
                  dataKey="pessimistic" 
                  stackId="3"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDemandForecast = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Previsão de Demanda por Produto</h4>
          <div className="space-y-4">
            {demandForecast.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    product.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium text-sm">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Atual</p>
                    <p className="font-semibold text-sm">{product.current}/semana</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Previsto</p>
                    <p className={`font-semibold text-sm ${
                      product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.predicted}/semana
                    </p>
                  </div>
                  <Badge variant={product.trend === 'up' ? "default" : "destructive"} className="text-xs">
                    {product.trend === 'up' ? '+' : ''}{product.predicted - product.current}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSeasonality = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {seasonalityInsights.map((insight, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{insight.period}</h4>
                <div className="flex items-center gap-2">
                  {insight.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  )}
                  <Badge variant={insight.trend === 'up' ? "default" : "destructive"} className="text-xs">
                    {insight.impact > 0 ? '+' : ''}{insight.impact}%
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{insight.recommendation}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAIInsights = () => (
    <div className="space-y-4">
      {aiInsights.map((insight, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.category === 'revenue' ? 'bg-green-100' :
                  insight.category === 'cost' ? 'bg-red-100' :
                  insight.category === 'customer' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <Brain className={`h-4 w-4 ${
                    insight.category === 'revenue' ? 'text-green-600' :
                    insight.category === 'cost' ? 'text-red-600' :
                    insight.category === 'customer' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'default'} className="text-xs">
                  {insight.impact} impact
                </Badge>
                <span className="text-xs text-muted-foreground">{insight.confidence}% confiança</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Previsões Inteligentes
            </h2>
            <p className="text-muted-foreground text-sm">IA prevendo seu futuro financeiro</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted h-12">
          <TabsTrigger value="sales" className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Demanda
          </TabsTrigger>
          <TabsTrigger value="seasonality" className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Sazonalidade
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="sales">{renderSalesForecast()}</TabsContent>
          <TabsContent value="demand">{renderDemandForecast()}</TabsContent>
          <TabsContent value="seasonality">{renderSeasonality()}</TabsContent>
          <TabsContent value="insights">{renderAIInsights()}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}