
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Activity, 
  Target, 
  BarChart3
} from "lucide-react";
import { DashboardStats } from '@/hooks/useDashboardPerformance';

interface MetricsGridProps {
  stats: DashboardStats;
}

export default function MetricsGrid({ stats }: MetricsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-600">Vendas Hoje</p>
                <p className="text-sm sm:text-lg font-bold text-slate-900 truncate">
                  {formatCurrency(stats.todaySales)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-100">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-600">Ticket Médio</p>
                <p className="text-sm sm:text-lg font-bold text-slate-900 truncate">
                  {formatCurrency(stats.averageTicket)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-600">Metas Ativas</p>
                <p className="text-sm sm:text-lg font-bold text-slate-900">
                  {stats.activeGoals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-600">Lucro Líquido</p>
                <p className="text-sm sm:text-lg font-bold text-slate-900 truncate">
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Section */}
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Status do Sistema</h3>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium">Dados Financeiros</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                Sincronizado
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium">Metas</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {stats.activeGoals + stats.completedGoals} metas
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium">Sistema</span>
              <Badge className="bg-green-500 text-white text-xs">
                Operacional
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
