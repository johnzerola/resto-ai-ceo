
import React, { memo, Suspense, useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardPerformance } from "@/hooks/useDashboardPerformance";
import { useGlobalSync } from "@/hooks/useGlobalSync";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const QuickAccessGrid = React.lazy(() => import('./QuickAccessGrid'));
const MetricsGrid = React.lazy(() => import('./MetricsGrid'));

const DashboardSkeleton = memo(() => (
  <div className="space-y-4 sm:space-y-6 animate-pulse p-6">
    <div className="h-16 sm:h-20 bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-sm"></div>
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 sm:h-24 bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-sm"></div>
      ))}
    </div>
    <div className="h-48 sm:h-64 bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-sm"></div>
  </div>
));

export const OptimizedDashboard = memo(function OptimizedDashboard() {
  const { subscriptionInfo } = useAuth();
  const { dashboardStats, isLoading, performanceMetrics } = useDashboardPerformance();
  const { syncState } = useGlobalSync();
  const [currentTime, setCurrentTime] = useState(new Date());

  console.log('OptimizedDashboard rendering...', { isLoading, subscriptionInfo });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const syncStatusDisplay = useMemo(() => {
    const { isOnline, syncStatus, lastUpdate } = syncState;
    const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString();
    
    return {
      icon: isOnline ? <Wifi className="h-3 w-3 sm:h-4 sm:w-4" /> : <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />,
      status: isOnline ? 'Online' : 'Offline',
      color: isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: isOnline ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30',
      lastUpdate: lastUpdateTime,
      isSyncing: syncStatus === 'syncing'
    };
  }, [syncState]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="border-b border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  RestaurIA CEO
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
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
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {currentTime.toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              </div>
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
                  <Card className="p-4 sm:p-6 text-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Erro ao carregar acesso rápido</p>
                  </Card>
                }>
                  <div data-testid="quick-access">
                    <QuickAccessGrid />
                  </div>
                </ErrorBoundary>
                
                <ErrorBoundary fallback={
                  <Card className="p-4 sm:p-6 text-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Erro ao carregar métricas</p>
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
