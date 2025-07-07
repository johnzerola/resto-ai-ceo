import React, { memo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Activity,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { formatCurrency } from '@/lib/utils';
const PerformanceCharts = React.lazy(() => import('@/components/restaurant/PerformanceCharts').then(module => ({ default: module.PerformanceCharts })));

const StatCard = memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  description 
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-700">
        {title}
      </CardTitle>
      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {value}
      </div>
      {change && (
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
          <span className={`text-xs ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-slate-600'
          }`}>
            {change}
          </span>
        </div>
      )}
      {description && (
        <p className="text-xs text-slate-600 mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
));

const AlertsSection = memo(({ alerts }: { alerts: any[] }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Alertas Importantes
      </h3>
      <div className="grid gap-3">
        {alerts.slice(0, 3).map((alert) => (
          <Alert key={alert.id} className={`border-l-4 ${
            alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
            alert.type === 'warning' ? 'border-l-amber-500 bg-amber-50' :
            'border-l-blue-500 bg-blue-50'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">{alert.title}</div>
              <div className="text-sm text-slate-600 mt-1">{alert.message}</div>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
});

const QuickActionsGrid = memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Button variant="outline" className="h-20 flex-col gap-2" asChild>
      <a href="/fluxo-de-caixa">
        <DollarSign className="h-6 w-6" />
        <span className="text-xs">Fluxo de Caixa</span>
      </a>
    </Button>
    <Button variant="outline" className="h-20 flex-col gap-2" asChild>
      <a href="/metas">
        <Target className="h-6 w-6" />
        <span className="text-xs">Metas</span>
      </a>
    </Button>
    <Button variant="outline" className="h-20 flex-col gap-2" asChild>
      <a href="/estoque">
        <Package className="h-6 w-6" />
        <span className="text-xs">Estoque</span>
      </a>
    </Button>
    <Button variant="outline" className="h-20 flex-col gap-2" asChild>
      <a href="/dre">
        <BarChart3 className="h-6 w-6" />
        <span className="text-xs">Relatórios</span>
      </a>
    </Button>
  </div>
));

export const UnifiedDashboard = memo(function UnifiedDashboard() {
  const { 
    stats, 
    alerts, 
    restaurant,
    isLoading, 
    error, 
    refreshData 
  } = useOptimizedDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erro ao Carregar Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={refreshData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Dashboard Unificado
                  </h1>
                  <p className="text-slate-600 text-xs lg:text-sm">
                    {restaurant.restaurantName}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(stats.revenue)}
            change={`+${stats.monthlyGrowth.toFixed(1)}%`}
            trend="up"
            icon={DollarSign}
            description={`${stats.todaySales > 0 ? formatCurrency(stats.todaySales) : 'R$ 0,00'} hoje`}
          />
          
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(stats.profit)}
            change={`${stats.profitMargin.toFixed(1)}% margem`}
            trend={stats.profit >= 0 ? 'up' : 'down'}
            icon={TrendingUp}
            description="Receitas - Despesas"
          />
          
          <StatCard
            title="Metas Ativas"
            value={stats.activeGoals.toString()}
            change={`${stats.completedGoals} concluídas`}
            trend="neutral"
            icon={Target}
            description="Objetivos em andamento"
          />
          
          <StatCard
            title="Itens em Estoque"
            value={stats.inventoryItems.toString()}
            change={formatCurrency(stats.inventoryValue)}
            trend="neutral"
            icon={Package}
            description="Valor total do estoque"
          />
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <AlertsSection alerts={alerts} />
        )}

        {/* Performance Charts */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Performance
            </CardTitle>
            <CardDescription>
              Acompanhe o desempenho financeiro do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="h-[300px] animate-pulse bg-slate-100 rounded-lg flex items-center justify-center">
                <LoadingSpinner text="Carregando gráficos..." />
              </div>
            }>
              <PerformanceCharts />
            </Suspense>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActionsGrid />
          </CardContent>
        </Card>
      </div>
    </div>
  );
});