import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  DollarSign,
  Percent,
  Eye,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Flame,
  Shield,
  Activity,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FinancialAlert {
  id: string;
  type: "critical" | "warning" | "opportunity";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action: string;
  value?: string;
}

interface BottleneckAnalysis {
  category: string;
  impact: number;
  description: string;
  recommendation: string;
  color: string;
}

export function FinancialIntelligenceCenter() {
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis[]>([]);
  const [benchmark, setBenchmark] = useState<any>({});
  const [profitVelocity, setProfitVelocity] = useState<any[]>([]);

  useEffect(() => {
    generateIntelligentAlerts();
    analyzeBottlenecks();
    calculateBenchmarks();
    generateProfitVelocity();
  }, []);

  const generateIntelligentAlerts = () => {
    const intelligentAlerts: FinancialAlert[] = [
      {
        id: "1",
        type: "critical",
        title: "🚨 Produto X gerando prejuízo há 3 dias",
        description: "Pizza Portuguesa está com margem negativa de -8.5% devido ao aumento do custo da linguiça",
        impact: "high",
        action: "Ajustar preço de R$ 28 para R$ 32 ou substituir ingrediente",
        value: "-R$ 156/dia"
      },
      {
        id: "2", 
        type: "warning",
        title: "⚠️ 35% das despesas em delivery",
        description: "Taxa do iFood/UberEats está impactando significativamente a margem. Considere renegociar contratos",
        impact: "high",
        action: "Renegociar taxa de 15% para 12% ou criar canal próprio",
        value: "Economia potencial: R$ 890/mês"
      },
      {
        id: "3",
        type: "opportunity", 
        title: "🎯 Oportunidade de aumento",
        description: "Hambúrguer Especial pode ter preço aumentado em 18% sem perda de demanda",
        impact: "medium",
        action: "Testar aumento gradual de R$ 22 para R$ 26",
        value: "+R$ 340/mês"
      },
      {
        id: "4",
        type: "warning",
        title: "📊 CMV acima da meta",
        description: "CMV atual de 38% está 8 pontos acima da meta de 30%",
        impact: "high", 
        action: "Revisar custos dos 3 principais ingredientes",
        value: "Impacto: -R$ 1.2k/mês"
      }
    ];
    setAlerts(intelligentAlerts);
  };

  const analyzeBottlenecks = () => {
    const analysis: BottleneckAnalysis[] = [
      {
        category: "Custos de Ingredientes",
        impact: 85,
        description: "Farinha e queijo representam 45% dos custos variáveis",
        recommendation: "Buscar fornecedores alternativos ou compra em maior volume",
        color: "#ef4444"
      },
      {
        category: "Taxas de Delivery",
        impact: 72,
        description: "15.5% da receita vai para apps de delivery",
        recommendation: "Implementar programa de fidelidade próprio",
        color: "#f97316"
      },
      {
        category: "Desperdício",
        impact: 58,
        description: "8% de perda média nos ingredientes perecíveis",
        recommendation: "Melhorar controle de validade e porcionamento",
        color: "#eab308"
      },
      {
        category: "Mão de Obra",
        impact: 45,
        description: "Produtividade 23% abaixo do benchmark do setor",
        recommendation: "Treinamento em técnicas de produção enxuta",
        color: "#22c55e"
      }
    ];
    setBottlenecks(analysis);
  };

  const calculateBenchmarks = () => {
    setBenchmark({
      cmv: { atual: 38, meta: 30, setor: 32 },
      margem: { atual: 28, meta: 35, setor: 30 },
      ticket: { atual: 45, meta: 50, setor: 42 },
      produtividade: { atual: 78, meta: 90, setor: 85 }
    });
  };

  const generateProfitVelocity = () => {
    const data = [
      { day: "Seg", atual: 280, potencial: 420, meta: 400 },
      { day: "Ter", atual: 320, potencial: 480, meta: 450 },
      { day: "Qua", atual: 290, potencial: 435, meta: 400 },
      { day: "Qui", atual: 380, potencial: 570, meta: 500 },
      { day: "Sex", atual: 520, potencial: 780, meta: 650 },
      { day: "Sab", atual: 650, potencial: 975, meta: 800 },
      { day: "Dom", atual: 480, potencial: 720, meta: 600 }
    ];
    setProfitVelocity(data);
  };

  const renderAlertCard = (alert: FinancialAlert) => {
    const alertConfig = {
      critical: { bg: "from-red-50 to-red-100", border: "border-red-200", icon: AlertTriangle, iconColor: "text-red-600" },
      warning: { bg: "from-yellow-50 to-yellow-100", border: "border-yellow-200", icon: Eye, iconColor: "text-yellow-600" },
      opportunity: { bg: "from-green-50 to-green-100", border: "border-green-200", icon: TrendingUp, iconColor: "text-green-600" }
    }[alert.type];

    return (
      <Card key={alert.id} className={`border-0 bg-gradient-to-r ${alertConfig.bg} ${alertConfig.border} shadow-sm hover:shadow-md transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 bg-white rounded-lg shadow-sm`}>
              <alertConfig.icon className={`h-5 w-5 ${alertConfig.iconColor}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Impacto {alert.impact}
                </Badge>
                {alert.value && (
                  <span className="text-xs font-semibold text-foreground">{alert.value}</span>
                )}
              </div>
              <p className="text-xs font-medium text-primary mt-2">💡 {alert.action}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBottleneckAnalysis = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Detector de Gargalos</CardTitle>
            <CardDescription>Análise automática dos principais limitadores de lucro</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bottlenecks.map((bottleneck, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{bottleneck.category}</span>
                <span className="text-sm text-muted-foreground">{bottleneck.impact}% impacto</span>
              </div>
              <Progress value={bottleneck.impact} className="h-2" />
              <p className="text-xs text-muted-foreground">{bottleneck.description}</p>
              <p className="text-xs font-medium text-primary">🎯 {bottleneck.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderBenchmarking = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Benchmarking Automático</CardTitle>
            <CardDescription>Comparação com médias do setor gastronômico</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(benchmark).map(([key, values]: [string, any]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key}</span>
                <div className="flex items-center gap-1">
                  {values.atual > values.setor ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs font-semibold">
                    {Math.abs(values.atual - values.setor).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Atual: {values.atual}%</span>
                  <span className="text-muted-foreground">Meta: {values.meta}%</span>
                </div>
                <Progress value={(values.atual / values.meta) * 100} className="h-1" />
                <p className="text-xs text-muted-foreground">Setor: {values.setor}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderProfitVelocity = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Velocidade de Lucro</CardTitle>
            <CardDescription>Análise do potencial vs realizado por dia</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitVelocity}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `R$ ${value}`,
                  name === 'atual' ? 'Lucro Atual' : name === 'potencial' ? 'Potencial' : 'Meta'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="atual" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="potencial" 
                stroke="#06b6d4" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Potencial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header da Central de Inteligência */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Central de Inteligência Financeira
            </h2>
            <p className="text-muted-foreground text-sm">IA analisando seu negócio em tempo real</p>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas Proativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map(renderAlertCard)}
        </div>
      </div>

      {/* Análises Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderBottleneckAnalysis()}
        {renderBenchmarking()}
      </div>

      {/* Velocidade de Lucro */}
      <div className="grid grid-cols-1 gap-6">
        {renderProfitVelocity()}
      </div>
    </div>
  );
}