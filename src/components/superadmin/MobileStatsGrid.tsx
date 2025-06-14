
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BarChart3, 
  Activity, 
  Zap, 
  AlertTriangle 
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  systemHealth: number;
  apiResponses: number;
  errors24h: number;
}

interface MobileStatsGridProps {
  stats: SystemStats;
}

export const MobileStatsGrid = memo(function MobileStatsGrid({ stats }: MobileStatsGridProps) {
  const statsConfig = [
    {
      title: "Usuários",
      value: stats.totalUsers,
      icon: Users,
      description: "Total registrados",
      color: "text-blue-600"
    },
    {
      title: "Assinaturas",
      value: stats.activeSubscriptions,
      icon: BarChart3,
      description: "Pagantes ativos",
      color: "text-green-600"
    },
    {
      title: "Sistema",
      value: `${stats.systemHealth}%`,
      icon: Activity,
      description: "Saúde do sistema",
      color: "text-green-600",
      showProgress: true,
      progressValue: Number(stats.systemHealth)
    },
    {
      title: "APIs 24h",
      value: stats.apiResponses,
      icon: Zap,
      description: "Chamadas processadas",
      color: "text-purple-600"
    },
    {
      title: "Erros 24h",
      value: stats.errors24h,
      icon: AlertTriangle,
      description: "Incidentes",
      color: stats.errors24h > 5 ? "text-red-600" : "text-green-600"
    }
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.showProgress && (
                <Progress 
                  value={Number(stat.progressValue)} 
                  className="h-1 mt-2" 
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
