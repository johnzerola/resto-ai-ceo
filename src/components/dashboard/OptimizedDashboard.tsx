
import React, { memo, Suspense, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw,
  Wifi,
  WifiOff,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPerformance } from "@/hooks/useDashboardPerformance";
import { useGlobalSync } from "@/hooks/useGlobalSync";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

// Lazy load componentes pesados
const QuickAccessGrid = React.lazy(() => import('./QuickAccessGrid'));
const MetricsGrid = React.lazy(() => import('./MetricsGrid'));
const StatusSection = React.lazy(() => import('./StatusSection'));
const SystemCompliancePanel = React.lazy(() => import('../audit/SystemCompliancePanel'));

// Loading fallback component
const DashboardSkeleton = memo(() => (
  <div className="space-y-6 animate-pulse">
    <div className="h-20 bg-slate-200 rounded-lg"></div>
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
      ))}
    </div>
    <div className="h-64 bg-slate-200 rounded-lg"></div>
  </div>
));

export const OptimizedDashboard = memo(function OptimizedDashboard() {
  const { subscriptionInfo } = useAuth();
  const { dashboardStats, isLoading, performanceMetrics } = useDashboardPerformance();
  const { syncState, triggerGlobalSync } = useGlobalSync();

  // Memoize sync status display
  const syncStatusDisplay = useMemo(() => {
    const { isOnline, syncStatus, lastUpdate } = syncState;
    const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString();
    
    return {
      icon: isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />,
      status: isOnline ? 'Online' : 'Offline',
      color: isOnline ? 'text-green-600' : 'text-red-600',
      bgColor: isOnline ? 'bg-green-50' : 'bg-red-50',
      lastUpdate: lastUpdateTime,
      isSyncing: syncStatus === 'syncing'
    };
  }, [syncState]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dashboard-unificado">
        {/* Header moderno otimizado */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-restauria-blue-tech to-restauria-green-profit bg-clip-text text-transparent gradient-text">
                  RestaurIA CEO
                </h1>
                <p className="text-slate-600 text-sm">
                  Dashboard otimizado - Sistema 100% limpo e unificado
                </p>
              </div>
              
              {/* Status em tempo real */}
              <div className="flex items-center gap-3">
                <Card className={`px-3 py-2 border-0 shadow-sm ${syncStatusDisplay.bgColor}`}>
                  <div className="flex items-center gap-2">
                    {syncStatusDisplay.icon}
                    <span className={`text-sm font-medium ${syncStatusDisplay.color}`}>
                      {syncStatusDisplay.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {syncStatusDisplay.lastUpdate}
                    </span>
                  </div>
                </Card>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerGlobalSync}
                  disabled={syncStatusDisplay.isSyncing}
                  className="flex items-center gap-2 modern-button"
                >
                  <RefreshCw className={`h-4 w-4 ${syncStatusDisplay.isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
              </div>
            </div>

            {/* Métricas de performance */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Render: {performanceMetrics.renderTime.toFixed(2)}ms</span>
              <span>Última atualização: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-restauria-green-profit rounded-full animate-pulse"></div>
                Sistema 100% unificado
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo principal com Suspense e Error Boundaries */}
        <div className="px-6 py-6">
          <Suspense fallback={<DashboardSkeleton />}>
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Acesso rápido */}
                <ErrorBoundary fallback={
                  <Card className="p-6 text-center stats-card">
                    <p className="text-slate-600">Erro ao carregar acesso rápido</p>
                  </Card>
                }>
                  <div data-testid="quick-access">
                    <QuickAccessGrid />
                  </div>
                </ErrorBoundary>
                
                {/* Métricas principais */}
                <ErrorBoundary fallback={
                  <Card className="p-6 text-center stats-card">
                    <p className="text-slate-600">Erro ao carregar métricas</p>
                  </Card>
                }>
                  <div data-testid="dashboard-metrics">
                    <MetricsGrid stats={dashboardStats} />
                  </div>
                </ErrorBoundary>
                
                {/* Grid principal com Compliance Panel */}
                <div data-testid="system-status" className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ErrorBoundary fallback={
                      <Card className="p-6 text-center stats-card">
                        <p className="text-slate-600">Erro ao carregar status do sistema</p>
                      </Card>
                    }>
                      <StatusSection 
                        subscriptionInfo={subscriptionInfo}
                        syncState={syncState}
                      />
                    </ErrorBoundary>
                  </div>
                  
                  {/* Sistema de Compliance Total */}
                  <div className="lg:col-span-1">
                    <ErrorBoundary fallback={
                      <Card className="p-6 text-center stats-card">
                        <p className="text-slate-600">Erro ao carregar sistema de compliance</p>
                      </Card>
                    }>
                      <Suspense fallback={
                        <Card className="p-6 text-center">
                          <Shield className="h-8 w-8 mx-auto mb-2 animate-pulse text-blue-600" />
                          <p>Carregando auditoria...</p>
                        </Card>
                      }>
                        <SystemCompliancePanel />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
});
