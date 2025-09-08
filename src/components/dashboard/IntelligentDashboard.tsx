import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Award,
  Trophy,
  Star,
  CheckCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Sparkles
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { FinancialIntelligenceCenter } from "./FinancialIntelligenceCenter";
import { PriorityActionCenter } from "./PriorityActionCenter";
import { GameficationProgress } from "./GameficationProgress";
import { AIForecastingWidget } from "./AIForecastingWidget";

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  priority: "high" | "medium" | "low";
  size: "small" | "medium" | "large";
  category: "financial" | "operational" | "strategic";
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "financial-intelligence",
    title: "🧠 Central de Inteligência Financeira",
    component: FinancialIntelligenceCenter,
    priority: "high",
    size: "large",
    category: "financial"
  },
  {
    id: "priority-actions",
    title: "🎯 Centro de Ações Prioritárias",
    component: PriorityActionCenter,
    priority: "high",
    size: "medium",
    category: "operational"
  },
  {
    id: "gamification",
    title: "🏆 Progressão & Conquistas",
    component: GameficationProgress,
    priority: "medium",
    size: "medium",
    category: "strategic"
  },
  {
    id: "ai-forecasting",
    title: "📈 Previsões Inteligentes",
    component: AIForecastingWidget,
    priority: "high",
    size: "large",
    category: "strategic"
  }
];

export function IntelligentDashboard() {
  const { currentRestaurant } = useAuth();
  const dashboardData = useDashboardData();
  const { isLoading } = dashboardData;
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [activeTab, setActiveTab] = useState("overview");
  const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);

  useEffect(() => {
    // Gerar insights personalizados baseados nos dados
    generatePersonalizedInsights();
  }, [dashboardData]);

  const generatePersonalizedInsights = () => {
    const insights = [
      "💡 Seu CMV melhorou 12% esta semana!",
      "⚡ Pizza Margherita é seu produto mais lucrativo",
      "📊 Sexta-feira gera 23% mais receita que outros dias",
      "🎯 Você está apenas R$ 340 da sua meta mensal!",
      "🔥 Delivery cresceu 45% no último mês"
    ];
    setPersonalizedInsights(insights);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const renderDashboardMetrics = () => {
    const metrics = [
      {
        title: "Revenue Impact Score",
        value: "847",
        change: "+23%",
        trend: "up",
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600",
        description: "Índice de impacto na receita"
      },
      {
        title: "Efficiency Index",
        value: "92%",
        change: "+8%", 
        trend: "up",
        icon: Zap,
        color: "from-blue-500 to-blue-600",
        description: "Índice de eficiência operacional"
      },
      {
        title: "Profit Velocity",
        value: "R$ 1.2k",
        change: "+15%",
        trend: "up",
        icon: Target,
        color: "from-purple-500 to-purple-600",
        description: "Velocidade de geração de lucro/dia"
      },
      {
        title: "Risk Score",
        value: "18",
        change: "-12%",
        trend: "down",
        icon: AlertTriangle,
        color: "from-orange-500 to-orange-600",
        description: "Índice de risco financeiro (menor é melhor)"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-lg`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <Badge variant={metric.trend === "up" ? "default" : "destructive"} className="text-xs">
                  {metric.trend === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPersonalizedInsights = () => (
    <Card className="mb-8 border-0 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Insights Personalizados</CardTitle>
            <CardDescription>Descobertas exclusivas para seu negócio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalizedInsights.map((insight, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border hover:shadow-md transition-all">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Carregando inteligência financeira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header Revolucionário */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Dashboard Inteligente
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Powered by AI • {currentRestaurant?.name || "RestaurIA"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Eye className="h-3 w-3 mr-1" />
                Monitoramento 24/7
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 h-12">
                <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  Inteligência
                </TabsTrigger>
                <TabsTrigger value="gamification" className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4" />
                  Conquistas
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  {renderDashboardMetrics()}
                  {renderPersonalizedInsights()}
                  
                  {/* Widgets Drag & Drop */}
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="dashboard-widgets">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                          {widgets.map((widget, index) => (
                            <Draggable key={widget.id} draggableId={widget.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${snapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-all duration-200`}
                                >
                                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                    <CardHeader className="pb-4">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{widget.title}</CardTitle>
                                        <Badge variant="outline" className="text-xs">
                                          {widget.category}
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <widget.component />
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </TabsContent>

                <TabsContent value="intelligence" className="space-y-6">
                  <FinancialIntelligenceCenter />
                </TabsContent>

                <TabsContent value="gamification" className="space-y-6">
                  <GameficationProgress />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}