
import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target,
  Package,
  Users,
  Clock,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyGrowth: number;
  activeGoals: number;
  inventoryValue: number;
  completedGoals: number;
}

interface MetricsGridProps {
  stats: DashboardStats;
}

const MetricsGrid = memo(function MetricsGrid({ stats }: MetricsGridProps) {
  const metrics = useMemo(() => [
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: `+${stats.monthlyGrowth.toFixed(1)}%`,
      changeType: stats.monthlyGrowth >= 0 ? "positive" : "negative",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Lucro Líquido", 
      value: `R$ ${stats.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      change: `${stats.profitMargin.toFixed(1)}% margem`,
      changeType: stats.netProfit >= 0 ? "positive" : "negative",
      color: stats.netProfit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: stats.netProfit >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Metas Ativas",
      value: stats.activeGoals.toString(),
      icon: Target,
      change: `${stats.completedGoals} concluídas`,
      changeType: "neutral",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Valor do Estoque",
      value: `R$ ${stats.inventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Package,
      change: "Atualizado",
      changeType: "neutral",
      color: "text-purple-600", 
      bgColor: "bg-purple-50 dark:bg-purple-950",
    }
  ], [stats]);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-1.5 sm:p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-xl lg:text-2xl font-bold">
              {metric.value}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{metric.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

export default MetricsGrid;
