
import React, { memo, Suspense, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPerformance } from "@/hooks/useDashboardPerformance";
import { useGlobalSync } from "@/hooks/useGlobalSync";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const QuickAccessGrid = React.lazy(() => import('./QuickAccessGrid'));
const MetricsGrid = React.lazy(() => import('./MetricsGrid'));

const DashboardSkeleton = memo(() => (
  <div className="space-y-4 sm:space-y-6 animate-pulse">
    <div className="h-16 sm:h-20 bg-slate-200 rounded-lg"></div>
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 sm:h-24 bg-slate-200 rounded-lg"></div>
      ))}
    </div>
    <div className="h-48 sm:h-64 bg-slate-200 rounded-lg"></div>
  </div>
));

export const OptimizedDashboard = memo(function OptimizedDashboard() {
  const { subscriptionInfo } = useAuth();
  const { dashboardStats, isLoading, performanceMetrics } = useDashboardPerformance();
  const { syncState, triggerGlobalSync } = useGlobalSync();

  const syncStatusDisplay = useMemo(() => {
    const { isOnline, syncStatus, lastUpdate } = syncState;
    const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString();
    
    return {
      icon: isOnline ? <Wifi className="h-3 w-3 sm:h-4 sm:w-4" /> : <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />,
      status: isOnline ? 'Online' : 'Offline',
      color: isOnline ? 'text-green-600' : 'text-red-600',
      bgColor: isOnline ? 'bg-green-50' : 'bg-red-50',
      lastUpdate: lastUpdateTime,
      isSyncing: syncStatus === 'syncing'
    };
  }, [syncState]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-restauria-blue-tech to-restauria-green-profit bg-clip-text text-transparent">
                  RestaurIA CEO
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Dashboard inteligente para gestão completa do seu restaurante
                </p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Card className={`px-2 sm:px-3 py-1.5 sm:py-2 border-0 shadow-sm ${syncStatusDisplay.bgColor}`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {syncStatusDisplay.icon}
                    <span className={`text-xs sm:text-sm font-medium ${syncStatusDisplay.color}`}>
                      {syncStatusDisplay.status}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {syncStatusDisplay.lastUpdate}
                    </span>
                  </div>
                </Card>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerGlobalSync}
                  disabled={syncStatusDisplay.isSyncing}
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${syncStatusDisplay.isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sincronizar</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs text-slate-500">
              <span>Render: {performanceMetrics.renderTime.toFixed(2)}ms</span>
              <span className="hidden sm:inline">Última atualização: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}</span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-restauria-green-profit rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Sistema otimizado e unificado</span>
                <span className="sm:hidden">Sistema OK</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <Suspense fallback={<DashboardSkeleton />}>
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <ErrorBoundary fallback={
                  <Card className="p-4 sm:p-6 text-center">
                    <p className="text-slate-600 text-sm">Erro ao carregar acesso rápido</p>
                  </Card>
                }>
                  <div data-testid="quick-access">
                    <QuickAccessGrid />
                  </div>
                </ErrorBoundary>
                
                <ErrorBoundary fallback={
                  <Card className="p-4 sm:p-6 text-center">
                    <p className="text-slate-600 text-sm">Erro ao carregar métricas</p>
                  </Card>
                }>
                  <div data-testid="dashboard-metrics">
                    <MetricsGrid stats={dashboardStats} />
                  </div>
                </ErrorBoundary>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
});
