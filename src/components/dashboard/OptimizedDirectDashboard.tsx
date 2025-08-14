import React, { memo, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Package,
  Activity,
  RefreshCw,
  BarChart3,
  Calendar,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import RecentActivity from './components/RecentActivity';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  description,
  href,
  trend
}: StatCardProps) => (
  <Card className="group border-0 shadow-sm bg-card/80 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] touch-manipulation tactile-feedback h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
      <CardTitle className="text-xs font-medium text-muted-foreground leading-tight flex-1 pr-2 break-words">
        {title}
      </CardTitle>
      <div className="p-1.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20 flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2 px-3 pb-3">
      <div className="flex flex-col gap-1">
        <div className="text-lg sm:text-xl font-bold text-foreground break-words">
          {value}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-xs font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <TrendingUp className={cn(
              "h-3 w-3 mr-1",
              !trend.isPositive && "rotate-180"
            )} />
            {trend.value}%
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground break-words">{description}</p>
      )}
      
      {href && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 p-0 h-auto text-xs text-primary hover:text-accent transition-colors duration-200 w-full justify-start" 
          asChild
        >
          <a href={href} className="flex items-center gap-1 text-left">
            <span>Ver detalhes</span>
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </Button>
      )}
    </CardContent>
  </Card>
));

// Skeleton for StatCard
const StatCardSkeleton = memo(() => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="space-y-0 pb-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
));

// Quick Actions Component
const QuickActions = memo(() => {
  const quickActions = useMemo(() => [
    { href: '/fluxo-caixa', icon: DollarSign, label: 'Fluxo de Caixa', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { href: '/metas', icon: Target, label: 'Metas', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { href: '/estoque', icon: Package, label: 'Estoque', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
    { href: '/dre', icon: BarChart3, label: 'Relatórios', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' }
  ], []);

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Acesso Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button 
              key={action.href}
              variant="outline" 
              className={cn(
                "h-20 flex-col gap-2 transition-all duration-200 responsive-button",
                action.color
              )} 
              asChild
            >
              <a href={action.href}>
                <action.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{action.label}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export const OptimizedDirectDashboard = memo(function OptimizedDirectDashboard() {
  const { currentRestaurant, isLoading } = useAuth();

  // Memoized stats with realistic data
  const memoizedStats = useMemo(() => [
    {
      title: "Receita do Mês",
      value: "R$ 25.430,00",
      icon: DollarSign,
      description: "Performance mensal",
      href: "/fluxo-caixa",
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: "Lucro Líquido",
      value: "R$ 8.950,00",
      icon: TrendingUp,
      description: "Margem saudável",
      href: "/dre",
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: "Metas Ativas",
      value: "5",
      icon: Target,
      description: "Objetivos em andamento",
      href: "/metas",
      trend: { value: 25, isPositive: true }
    },
    {
      title: "Itens em Estoque",
      value: "48",
      icon: Package,
      description: "Produtos cadastrados",
      href: "/estoque",
      trend: { value: 3.1, isPositive: false }
    }
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Optimized Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                Dashboard Principal
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {currentRestaurant?.name || 'Lucraí CEO'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 responsive-button" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            memoizedStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <QuickActions />
        </Suspense>

        {/* System Status */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-success/10 rounded-lg shrink-0">
                  <Activity className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground truncate">Status do Sistema</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">Todas as funcionalidades operacionais</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 shrink-0">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
});

OptimizedDirectDashboard.displayName = 'OptimizedDirectDashboard';

export default OptimizedDirectDashboard;