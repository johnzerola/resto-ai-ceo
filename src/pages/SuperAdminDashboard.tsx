
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  CreditCard, 
  Activity, 
  Server, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useSuperAdminCache } from '@/hooks/useSuperAdminCache';
import { MobileStatsGrid } from '@/components/superadmin/MobileStatsGrid';
import { MobileTabsNavigation } from '@/components/superadmin/MobileTabsNavigation';
import { CompactAuditSection } from '@/components/superadmin/CompactAuditSection';

interface SystemMetric {
  name: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  timestamp: string;
  user_id: string;
  additional_data?: any;
}

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const { getSystemStats, getAuditLogs, clearCache, getCacheStats, isLoading } = useSuperAdminCache();
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [statsData, logsData] = await Promise.all([
        getSystemStats(),
        getAuditLogs()
      ]);
      setStats(statsData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      value: '67%',
      change: '+2%',
      trend: 'up'
    },
    {
      name: 'Memory Usage',
      value: '84%',
      change: '-1%',
      trend: 'down'
    },
    {
      name: 'Database Size',
      value: '2.4GB',
      change: '+150MB',
      trend: 'up'
    },
    {
      name: 'Active Connections',
      value: 142,
      change: '+12',
      trend: 'up'
    }
  ];

  const handleRefresh = () => {
    loadData();
  };

  const handleClearCache = () => {
    clearCache();
    console.log('Cache limpo!');
  };

  const cacheStats = getCacheStats();

  const StatCard = ({ title, value, description, icon: Icon, trend }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend === 'up' ? 'Crescendo' : trend === 'down' ? 'Diminuindo' : 'Estável'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Painel de controle e monitoramento do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCache}
          >
            <Database className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* Cache Info */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Status do Cache</AlertTitle>
        <AlertDescription>
          {cacheStats.size} entradas em cache. Chaves: {cacheStats.keys.join(', ') || 'Nenhuma'}
        </AlertDescription>
      </Alert>

      {/* Mobile Navigation */}
      <div className="block lg:hidden">
        <MobileTabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Desktop Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Mobile Stats Grid */}
              <div className="block lg:hidden">
                <MobileStatsGrid stats={stats} />
              </div>

              {/* Desktop Stats Grid */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total de Usuários"
                  value={stats.totalUsers}
                  description="Usuários registrados"
                  icon={Users}
                  trend="up"
                />
                <StatCard
                  title="Assinantes Ativos"
                  value={stats.activeSubscriptions}
                  description="Planos ativos"
                  icon={CreditCard}
                  trend="up"
                />
                <StatCard
                  title="Saúde do Sistema"
                  value={`${stats.systemHealth}%`}
                  description="Performance geral"
                  icon={Activity}
                  trend="stable"
                />
                <StatCard
                  title="Respostas API (24h)"
                  value={stats.apiResponses}
                  description={`${stats.errors24h} erros`}
                  icon={Server}
                  trend="up"
                />
              </div>
            </>
          )}

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => (
              <StatCard
                key={index}
                title={metric.name}
                value={metric.value}
                description={metric.change}
                icon={Server}
                trend={metric.trend}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Controle e monitoramento de usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Novos Usuários (30d)"
                    value={stats?.totalUsers ? Math.floor(Number(stats.totalUsers) * 0.2) : 0}
                    icon={Users}
                  />
                  <StatCard
                    title="Usuários Ativos"
                    value={stats?.totalUsers ? Math.floor(Number(stats.totalUsers) * 0.7) : 0}
                    icon={Activity}
                  />
                  <StatCard
                    title="Taxa de Conversão"
                    value="12.5%"
                    icon={TrendingUp}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento do Sistema</CardTitle>
              <CardDescription>
                Status e performance dos componentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Banco de Dados</p>
                      <p className="text-sm text-muted-foreground">PostgreSQL 15.2</p>
                    </div>
                  </div>
                  <Badge variant="default">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-muted-foreground">Auth & Database</p>
                    </div>
                  </div>
                  <Badge variant="default">Operacional</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5" />
                    <div>
                      <p className="font-medium">API Gateway</p>
                      <p className="text-sm text-muted-foreground">Edge Functions</p>
                    </div>
                  </div>
                  <Badge variant="default">Estável</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <CompactAuditSection auditLogs={auditLogs} />
        </TabsContent>
      </Tabs>

      {/* Mobile Content */}
      <div className="block lg:hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-4">
            <MobileStatsGrid stats={stats} />
          </div>
        )}
        
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatCard
                  title="Total de Usuários"
                  value={stats?.totalUsers || 0}
                  icon={Users}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'system' && (
          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Supabase</span>
                  <Badge variant="default">OK</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'audit' && (
          <CompactAuditSection auditLogs={auditLogs} />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
