
import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Activity, Target, BarChart3 } from "lucide-react";

interface MetricsGridProps {
  stats: {
    todaysSales: number;
    averageTicket: number;
    totalGoals: number;
    completedGoals: number;
    goalCompletionRate: number;
  };
}

const MetricsGrid = memo(({ stats }: MetricsGridProps) => {
  const metrics = [
    {
      label: "Vendas Hoje",
      value: `R$ ${stats.todaysSales.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Ticket Médio",
      value: `R$ ${stats.averageTicket.toLocaleString('pt-BR')}`,
      icon: Activity,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Metas Ativas",
      value: stats.totalGoals.toString(),
      icon: Target,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Taxa de Sucesso",
      value: `${stats.goalCompletionRate.toFixed(1)}%`,
      icon: BarChart3,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="stats-card glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
              <div>
                <p className="stats-label">{metric.label}</p>
                <p className="stats-value">
                  {metric.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

export default MetricsGrid;
