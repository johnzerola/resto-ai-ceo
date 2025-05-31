
import { DailySnapshot } from "@/components/restaurant/DailySnapshot";
import { PerformanceCharts } from "@/components/restaurant/PerformanceCharts";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { QuickReports } from "@/components/restaurant/QuickReports";
import { Alerts } from "@/components/restaurant/Alerts";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

// Sample data for components
const sampleRevenueData = [
  { name: "Jan", revenue: 12000 },
  { name: "Fev", revenue: 15000 },
  { name: "Mar", revenue: 18000 },
  { name: "Abr", revenue: 20000 },
  { name: "Mai", revenue: 19000 },
  { name: "Jun", revenue: 22000 },
];

const sampleGoal = {
  id: "1",
  title: "Meta de Vendas Mensais",
  description: "Aumentar as vendas mensais do restaurante",
  target: 50000,
  current: 32000,
  unit: "R$",
  deadline: new Date("2024-12-31").toISOString(),
  category: "sales" as const,
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleAlerts = [
  {
    id: "1",
    type: "warning" as const,
    title: "Estoque Baixo",
    description: "Alguns ingredientes estão com estoque baixo",
    date: new Date().toLocaleDateString('pt-BR')
  },
  {
    id: "2",
    type: "success" as const,
    title: "Meta Atingida",
    description: "Parabéns! Você atingiu 80% da meta mensal",
    date: new Date().toLocaleDateString('pt-BR')
  }
];

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

  useEffect(() => {
    // Check subscription status when dashboard loads
    checkSubscription();
  }, []);

  const handleDeleteGoal = (goalId: string) => {
    console.log("Deleting goal:", goalId);
  };

  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2C4F] to-[#00D887] bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Visão geral do seu negócio e métricas importantes
            </p>
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
              <RevenueChart data={sampleRevenueData} />
            </div>
            <div>
              <GoalProgressCard goal={sampleGoal} onDelete={handleDeleteGoal} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <PerformanceCharts />
            <QuickReports />
          </div>

          <Alerts alerts={sampleAlerts} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
