
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap,
  MessageSquare
} from 'lucide-react';
import { MonitoringService, SystemMetrics } from '@/services/MonitoringService';
import { DataMigrationService } from '@/services/DataMigrationService';
import { N8nWebhookService } from '@/services/N8nWebhookService';

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical' | 'loading'>('loading');
  const [healthDetails, setHealthDetails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, healthData] = await Promise.all([
        MonitoringService.getSystemMetrics(),
        MonitoringService.getSystemHealth()
      ]);

      setMetrics(metricsData);
      setHealthStatus(healthData.status);
      setHealthDetails(healthData.details);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setHealthStatus('critical');
      setHealthDetails(['Erro ao carregar dados do sistema']);
    } finally {
      setIsLoading(false);
    }
  };

  const runDataMigration = async () => {
    setMigrationStatus('Executando migração...');
    try {
      const result = await DataMigrationService.migrateSubscribersToNewFormat();
      if (result.success) {
        setMigrationStatus(`Migração concluída: ${result.migratedCount} registros migrados`);
      } else {
        setMigrationStatus(`Migração com erros: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setMigrationStatus(`Erro na migração: ${error}`);
    }
  };

  const testWebhookConnection = async () => {
    try {
      const result = await N8nWebhookService.testConnection();
      setWebhookStatus(result);
    } catch (error) {
      setWebhookStatus({ success: false, message: `Erro no teste: ${error}` });
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'bg-green-500 hover:bg-green-600';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando métricas do sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dashboard de Monitoramento
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>
                {healthStatus === 'loading' ? 'Carregando' : 
                 healthStatus === 'healthy' ? 'Sistema Saudável' :
                 healthStatus === 'warning' ? 'Atenção Necessária' : 'Estado Crítico'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {healthDetails.map((detail, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {detail}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button size="sm" onClick={runDataMigration} variant="outline">
              Executar Migração
            </Button>
            <Button size="sm" onClick={testWebhookConnection} variant="outline">
              Testar Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold">{metrics.activeSubscriptions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uso IA Hoje</p>
                  <p className="text-2xl font-bold">{metrics.dailyAIUsage}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Erro</p>
                  <p className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</p>
                </div>
                <Zap className={`h-8 w-8 ${metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição de planos */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.planDistribution).map(([plan, count]) => {
                const percentage = (count / metrics.totalUsers) * 100;
                return (
                  <div key={plan} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{plan}</span>
                      <span>{count} usuários ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status de migração e webhooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {migrationStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Status da Migração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{migrationStatus}</p>
            </CardContent>
          </Card>
        )}

        {webhookStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Status dos Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {webhookStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <p className="text-sm">{webhookStatus.message}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
