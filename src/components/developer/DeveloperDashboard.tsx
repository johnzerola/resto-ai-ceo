import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code2, 
  Database, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Monitor,
  Zap,
  Bug,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface SystemMetric {
  id: string;
  metric_type: string;
  metric_value: any;
  timestamp: string;
}

export function DeveloperDashboard() {
  const { isDeveloper, loading } = useUserRole();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);

  useEffect(() => {
    if (!isDeveloper) return;

    fetchSystemMetrics();
    fetchActiveUsers();
    fetchErrorLogs();
    calculatePerformanceScore();
  }, [isDeveloper]);

  const fetchSystemMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const { count, error } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setActiveUsers(count || 0);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('severity', 'error')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      setErrorCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    }
  };

  const calculatePerformanceScore = () => {
    // Simulate performance calculation
    const score = Math.floor(Math.random() * 20) + 80;
    setPerformanceScore(score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDeveloper) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div className="space-y-4">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Esta área é exclusiva para desenvolvedores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel do Desenvolvedor
          </h1>
          <p className="text-muted-foreground">
            Monitore o sistema e ferramentas de desenvolvimento
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Sistema Online
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bug className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Erros (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{performanceScore}%</p>
                <p className="text-sm text-muted-foreground">Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.length}</p>
                <p className="text-sm text-muted-foreground">Métricas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">
            <Monitor className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Settings className="h-4 w-4 mr-2" />
            Ferramentas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{metric.metric_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {JSON.stringify(metric.metric_value)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saúde do Banco de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">Conexões Ativas</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Queries/min</p>
                  <p className="text-2xl font-bold text-blue-600">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tempo de Carregamento</span>
                  <Badge className="bg-green-100 text-green-800">1.2s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uso de Memória</span>
                  <Badge className="bg-yellow-100 text-yellow-800">65%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Hit Rate</span>
                  <Badge className="bg-green-100 text-green-800">94%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Code2 className="h-4 w-4 mr-2" />
                  Abrir Query Builder
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Tester</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Testar APIs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}