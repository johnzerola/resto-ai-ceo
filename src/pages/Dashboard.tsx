
import { Layout } from "@/components/restaurant/Layout";
import { DailySnapshot } from "@/components/restaurant/DailySnapshot";
import { PerformanceCharts } from "@/components/restaurant/PerformanceCharts";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { QuickReports } from "@/components/restaurant/QuickReports";
import { Alerts } from "@/components/restaurant/Alerts";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";

export function Dashboard() {
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
                <RevenueChart />
              </div>
              <div>
                <GoalProgressCard />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <PerformanceCharts />
              <QuickReports />
            </div>

            <Alerts />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
