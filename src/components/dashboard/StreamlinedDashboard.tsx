
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3,
  Calculator,
  Zap,
  Search,
  Crown,
  CreditCard,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeData } from "@/hooks/useRealTimeData";

// Optimized quick access cards with better visual hierarchy
const quickAccessCards = [
  {
    title: "Projeções",
    description: "Planejamento estratégico",
    icon: TrendingUp,
    href: "/projecoes",
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Fluxo de Caixa", 
    description: "Gestão financeira",
    icon: DollarSign,
    href: "/fluxo-de-caixa",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100", 
    iconColor: "text-green-600"
  },
  {
    title: "Metas",
    description: "Objetivos e resultados",
    icon: Target,
    href: "/metas", 
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Relatórios",
    description: "Análises detalhadas",
    icon: BarChart3,
    href: "/dre",
    gradient: "from-orange-500 to-orange-600", 
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600"
  }
];

export function StreamlinedDashboard() {
  const { subscriptionInfo, checkSubscription } = useAuth();
  const { financialData, goals, isLoading } = useRealTimeData();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkSubscription();
  }, []);

  // Memoized calculations for performance
  const dashboardMetrics = useMemo(() => {
    const todaysSales = financialData.length > 0 ? financialData[0]?.daily_sales || 0 : 0;
    const averageTicket = financialData.length > 0 ? financialData[0]?.average_ticket || 0 : 0;
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.completed).length;

    return {
      todaysSales,
      averageTicket,
      totalGoals,
      completedGoals,
      goalCompletionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    };
  }, [financialData, goals]);

  const tabConfig = [
    { 
      id: "overview", 
      label: "Visão Geral", 
      icon: LayoutDashboard,
      description: "Dashboard principal"
    },
    { 
      id: "pricing", 
      label: "Precificação", 
      icon: Calculator,
      description: "Gestão de preços"
    },
    { 
      id: "sync", 
      label: "Tempo Real", 
      icon: Zap,
      description: "Dados em tempo real"
    },
    { 
      id: "analytics", 
      label: "Análises", 
      icon: Search,
      description: "Insights avançados"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Modern Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                RestaurIA CEO
              </h1>
              <p className="text-slate-600 text-sm">
                Sistema inteligente de gestão empresarial
              </p>
            </div>
            
            {/* Subscription Status */}
            <Card className={`w-full lg:w-72 border-0 shadow-sm ${
              subscriptionInfo.subscribed 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                : 'bg-gradient-to-r from-orange-50 to-amber-50'
            }`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Plano</span>
                  </div>
                  {subscriptionInfo.subscribed && <Crown className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="mt-1">
                  <Badge 
                    variant={subscriptionInfo.subscribed ? "default" : "secondary"}
                    className={subscriptionInfo.subscribed ? "bg-green-500" : "bg-orange-500"}
                  >
                    {subscriptionInfo.subscribed ? `Plano ${subscriptionInfo.subscription_tier}` : 'Sem Assinatura'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 h-12">
                {tabConfig.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Quick Access Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickAccessCards.map((card) => (
                <Link key={card.href} to={card.href} className="group">
                  <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                          <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-600 truncate">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Vendas Hoje</p>
                      <p className="text-lg font-bold text-slate-900">
                        R$ {dashboardMetrics.todaysSales.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Ticket Médio</p>
                      <p className="text-lg font-bold text-slate-900">
                        R$ {dashboardMetrics.averageTicket.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Metas Ativas</p>
                      <p className="text-lg font-bold text-slate-900">
                        {dashboardMetrics.totalGoals}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Taxa de Sucesso</p>
                      <p className="text-lg font-bold text-slate-900">
                        {dashboardMetrics.goalCompletionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Section */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status do Sistema</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real dos módulos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Dados Financeiros</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {financialData.length} registros
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Metas Cadastradas</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {goals.length} metas
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Sistema</span>
                    <Badge className="bg-green-500 text-white">
                      Operacional
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-0">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Módulo de Precificação</CardTitle>
                <CardDescription>
                  Gerencie estratégias de preços por canal de venda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">
                    Funcionalidade de precificação inteligente em desenvolvimento
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/simulador">Usar Simulador de Preços</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="mt-0">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sincronização em Tempo Real</CardTitle>
                <CardDescription>
                  Dados atualizados automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Conexão Ativa</span>
                    </div>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-2">Última Sincronização</h4>
                      <p className="text-sm text-slate-600">
                        {isLoading ? 'Carregando...' : 'Agora mesmo'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-2">Frequência</h4>
                      <p className="text-sm text-slate-600">A cada 5 minutos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Análises Avançadas</CardTitle>
                <CardDescription>
                  Insights detalhados do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">
                    Módulo de análises avançadas será implementado em breve
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/dre">Ver Relatórios DRE</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
