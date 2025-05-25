
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { monitoringService, UptimeRecord, PerformanceMetric, Alert } from "@/services/MonitoringService";
import { supportChatService } from "@/services/SupportChatService";
import { 
  Activity, 
  Server, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  MessageSquare,
  Play,
  Pause
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export function MonitoringDashboard() {
  const [uptimeRecords, setUptimeRecords] = useState<UptimeRecord[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [loadTestRunning, setLoadTestRunning] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setUptimeRecords(monitoringService.getUptimeRecords());
    setPerformanceMetrics(monitoringService.getPerformanceMetrics());
    setAlerts(monitoringService.getAlerts());
  };

  const runLoadTest = async () => {
    setLoadTestRunning(true);
    try {
      await monitoringService.runLoadTest(5, 15);
      loadData();
    } finally {
      setLoadTestRunning(false);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      monitoringService.stopMonitoring();
    } else {
      monitoringService.startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const resolveAlert = (alertId: string) => {
    monitoringService.resolveAlert(alertId);
    loadData();
  };

  // Estatísticas
  const uptime = monitoringService.calculateUptime();
  const avgResponseTime = monitoringService.getAverageResponseTime();
  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const supportStats = supportChatService.getStats();

  // Dados para gráficos
  const uptimeChartData = uptimeRecords.slice(-24).map(record => ({
    time: new Date(record.timestamp).toLocaleTimeString(),
    responseTime: Math.round(record.responseTime),
    status: record.status === 'up' ? 1 : 0
  }));

  const performanceChartData = performanceMetrics.slice(-20).map(metric => ({
    time: new Date(metric.timestamp).toLocaleTimeString(),
    value: Math.round(metric.value),
    metric: metric.metric
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento e Performance</h2>
          <p className="text-muted-foreground">
            Dashboard em tempo real do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isMonitoring ? "destructive" : "default"}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isMonitoring ? 'Pausar' : 'Iniciar'} Monitoramento
          </Button>
          <Button 
            onClick={runLoadTest} 
            disabled={loadTestRunning}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {loadTestRunning ? 'Testando...' : 'Teste de Carga'}
          </Button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{uptime}%</p>
                <p className="text-xs text-green-600">
                  {uptime >= 99.5 ? '✓ Meta atingida' : '⚠ Abaixo da meta'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo de Resposta</p>
                <p className="text-2xl font-bold">{avgResponseTime}ms</p>
                <p className="text-xs text-blue-600">
                  {avgResponseTime < 2000 ? '✓ Meta atingida' : '⚠ Acima da meta'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-xs text-orange-600">
                  {criticalAlerts.length} críticos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Suporte</p>
                <p className="text-2xl font-bold">{supportStats.open}</p>
                <p className="text-xs text-purple-600">
                  tickets abertos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uptimeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Tempo (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#16a34a" 
                  fill="#16a34a" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Ativos */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Ativos ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.slice(0, 5).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge className={getAlertColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5" />
                <span>Aplicação Web</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5" />
                <span>Monitoramento</span>
              </div>
              <Badge className={isMonitoring ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {isMonitoring ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Pausado
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span>Chat de Suporte</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Uptime */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uptime (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {uptimeRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo de Resposta</TableHead>
                  <TableHead>Endpoint</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uptimeRecords.slice(-10).reverse().map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status === 'up' ? 'Online' : 
                         record.status === 'down' ? 'Offline' : 'Degradado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{Math.round(record.responseTime)}ms</TableCell>
                    <TableCell className="font-mono text-sm">{record.endpoint}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Aguardando dados de monitoramento...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
