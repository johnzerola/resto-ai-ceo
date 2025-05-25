
import { Layout } from "@/components/restaurant/Layout";
import { DailySnapshot } from "@/components/restaurant/DailySnapshot";
import { PerformanceCharts } from "@/components/restaurant/PerformanceCharts";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { QuickReports } from "@/components/restaurant/QuickReports";
import { Alerts } from "@/components/restaurant/Alerts";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

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

export function Dashboard() {
  const handleDeleteGoal = (goalId: string) => {
    console.log("Deleting goal:", goalId);
  };

  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu negócio e métricas importantes
            </p>
          </div>

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

            <div className="grid gap-6 md:grid-cols-2">
              <PerformanceCharts />
              <QuickReports />
            </div>

            <Alerts alerts={sampleAlerts} />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
