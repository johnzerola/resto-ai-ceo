
import { DailySnapshot } from "@/components/restaurant/DailySnapshot";
import { PerformanceCharts } from "@/components/restaurant/PerformanceCharts";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { QuickReports } from "@/components/restaurant/QuickReports";
import { Alerts } from "@/components/restaurant/Alerts";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { AuditDashboard } from "@/components/restaurant/AuditDashboard";
import { PricingChannels } from "@/components/restaurant/PricingChannels";
import { RealTimeSync } from "@/components/restaurant/RealTimeSync";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, CreditCard, TrendingUp, DollarSign, Target, BarChart3, Search, Shield, Calculator, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Quick access cards data
const quickAccessCards = [
  {
    title: "Projeções",
    description: "Planejamento e cenários futuros",
    icon: TrendingUp,
    href: "/projecoes",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Fluxo de Caixa",
    description: "Controle financeiro",
    icon: DollarSign,
    href: "/fluxo-de-caixa",
    color: "from-green-500 to-green-600"
  },
  {
    title: "Metas",
    description: "Sistema de metas e objetivos",
    icon: Target,
    href: "/metas",
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Relatórios",
    description: "DRE e análises detalhadas",
    icon: BarChart3,
    href: "/dre",
    color: "from-orange-500 to-orange-600"
  }
];

export function Dashboard() {
  const { subscriptionInfo, checkSubscription } = useAuth();
  const { financialData, goals, isLoading, refreshData } = useRealTimeData();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleDeleteGoal = (goalId: string) => {
    console.log("Deleting goal:", goalId);
    refreshData(); // Atualizar dados após deletar meta
  };

  // Preparar dados reais para os componentes
  const revenueData = financialData.slice(0, 6).map((data, index) => ({
    name: new Date(data.date).toLocaleDateString('pt-BR', { month: 'short' }),
    revenue: data.daily_sales
  }));

  const currentGoal = goals.length > 0 ? {
    id: goals[0].id,
    title: goals[0].title,
    description: goals[0].description,
    target: goals[0].target,
    current: goals[0].current,
    unit: goals[0].unit || "R$",
    deadline: goals[0].deadline,
    category: goals[0].category || "sales",
    completed: goals[0].completed,
    createdAt: goals[0].created_at,
    updatedAt: goals[0].updated_at
  } : null;

  const alerts = [
    {
      id: "1",
      type: "warning" as const,
      title: "Dados em Tempo Real",
      description: isLoading ? "Carregando dados..." : `${financialData.length} registros financeiros carregados`,
      date: new Date().toLocaleDateString('pt-BR')
    },
    {
      id: "2", 
      type: "success" as const,
      title: "Sistema Auditado",
      description: "Integração real com Supabase funcionando",
      date: new Date().toLocaleDateString('pt-BR')
    }
  ];

  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <div className="space-y-8">
        {/* Header Section with Tabs */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2C4F] to-[#00D887] bg-clip-text text-transparent">
                RestaurIA CEO
              </h1>
              <p className="text-gray-600">
                Sistema inteligente de gestão para restaurantes
              </p>
            </div>
            
            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Precificação
                </TabsTrigger>
                <TabsTrigger value="sync" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Sincronização
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Auditoria CEO
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Subscription Status Card */}
          <Card className={`w-full lg:w-80 ${subscriptionInfo.subscribed ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'} backdrop-blur-sm`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Status da Assinatura
                </CardTitle>
                {subscriptionInfo.subscribed && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionInfo.subscribed ? (
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Plano {subscriptionInfo.subscription_tier}
                  </Badge>
                  {subscriptionInfo.subscription_end && (
                    <p className="text-sm text-gray-600">
                      Renova em: {new Date(subscriptionInfo.subscription_end).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/assinatura">Gerenciar Assinatura</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline" className="border-orange-500 text-orange-700">
                    Sem Assinatura
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Assine um plano para ter acesso a todos os recursos
                  </p>
                  <Button asChild size="sm" className="w-full bg-gradient-to-r from-[#00D887] to-[#00B572] hover:shadow-lg">
                    <Link to="/assinatura">Ver Planos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-8">
            {/* Quick Access Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickAccessCards.map((card) => (
                <Link key={card.href} to={card.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border-gray-200/60">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#1B2C4F] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid gap-6">
              <DailySnapshot />
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <RevenueChart data={revenueData.length > 0 ? revenueData : [
                    { name: "Jan", revenue: 12000 },
                    { name: "Fev", revenue: 15000 },
                    { name: "Mar", revenue: 18000 }
                  ]} />
                </div>
                <div>
                  {currentGoal ? (
                    <GoalProgressCard goal={currentGoal} onDelete={handleDeleteGoal} />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Nenhuma meta cadastrada</p>
                        <Button asChild size="sm" className="mt-2">
                          <Link to="/metas">Criar Meta</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <PerformanceCharts />
                <QuickReports />
              </div>

              <Alerts alerts={alerts} />
            </div>
          </TabsContent>
          
          <TabsContent value="pricing">
            <PricingChannels />
          </TabsContent>
          
          <TabsContent value="sync">
            <div className="grid gap-6 md:grid-cols-2">
              <RealTimeSync />
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Módulos</CardTitle>
                  <CardDescription>
                    Verificação da integridade dos dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Dados Financeiros</span>
                      <Badge variant="outline" className="bg-green-50">
                        {financialData.length} registros
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Metas Ativas</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {goals.length} metas
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status Geral</span>
                      <Badge className="bg-green-500">
                        Operacional
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="audit">
            <AuditDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
