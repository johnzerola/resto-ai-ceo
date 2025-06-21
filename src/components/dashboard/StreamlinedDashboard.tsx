import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MobileOptimizedLayout } from "@/components/mobile/MobileOptimizedLayout";
import { MobileButton } from "@/components/mobile/MobileButton";
import { SystemHealthDashboard } from "@/components/audit/SystemHealthDashboard";

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
      id: "audit", 
      label: "Auditoria", 
      icon: Activity,
      description: "Saúde do sistema"
    }
  ];

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Modern Header */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  RestaurIA CEO
                </h1>
                <p className="text-slate-600 text-xs lg:text-sm">
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
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs lg:text-sm"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Contents */}
                <div className="mt-6">
                  <TabsContent value="overview" className="space-y-6">
                    {/* Quick Access Cards - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {quickAccessCards.map((card, index) => (
                        <Link key={index} to={card.href} className="block">
                          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                            <CardContent className="p-4 lg:p-6">
                              <div className="flex items-start gap-4">
                                <div className={`${card.iconBg} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                                  <card.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${card.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm lg:text-base group-hover:text-blue-600 transition-colors">
                                    {card.title}
                                  </h3>
                                  <p className="text-xs lg:text-sm text-slate-600 mt-1">
                                    {card.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* Dashboard Metrics - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                Vendas Hoje
                              </p>
                              <p className="text-xl lg:text-2xl font-bold text-blue-900">
                                R$ {dashboardMetrics.todaysSales.toFixed(2)}
                              </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                                Ticket Médio
                              </p>
                              <p className="text-xl lg:text-2xl font-bold text-green-900">
                                R$ {dashboardMetrics.averageTicket.toFixed(2)}
                              </p>
                            </div>
                            <Target className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                                Metas
                              </p>
                              <p className="text-xl lg:text-2xl font-bold text-purple-900">
                                {dashboardMetrics.completedGoals}/{dashboardMetrics.totalGoals}
                              </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                                Taxa Conclusão
                              </p>
                              <p className="text-xl lg:text-2xl font-bold text-orange-900">
                                {dashboardMetrics.goalCompletionRate.toFixed(1)}%
                              </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-6">
                    <div className="text-center py-12">
                      <Calculator className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Módulo de Precificação</h3>
                      <p className="text-muted-foreground mb-6">
                        Acesse as ferramentas de precificação inteligente
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/ficha-tecnica-inteligente-completa">
                          <MobileButton className="w-full sm:w-auto">
                            Ficha Técnica Inteligente
                          </MobileButton>
                        </Link>
                        <Link to="/configuracoes">
                          <MobileButton variant="outline" className="w-full sm:w-auto">
                            Configurações
                          </MobileButton>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sync" className="space-y-6">
                    <div className="text-center py-12">
                      <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Sincronização em Tempo Real</h3>
                      <p className="text-muted-foreground mb-6">
                        Dados atualizados automaticamente
                      </p>
                      <MobileButton>
                        Ver Status de Sincronização
                      </MobileButton>
                    </div>
                  </TabsContent>

                  <TabsContent value="audit" className="space-y-6">
                    <SystemHealthDashboard />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}
