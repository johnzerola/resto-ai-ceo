import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ServerCrash,
  ShieldAlert,
  Cpu,
  Memory,
  Network,
  Database,
  FileText,
  BarChart3,
  AlertTriangle,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StatusSistema = () => {
  const [systemStatus, setSystemStatus] = useState({
    cpuUsage: 65,
    memoryUsage: 40,
    networkLatency: 25,
    databaseStatus: "online",
    securityStatus: "ok",
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Simulação de dados do sistema
    const intervalId = setInterval(() => {
      setSystemStatus((prevStatus) => ({
        cpuUsage: Math.min(95, prevStatus.cpuUsage + Math.floor(Math.random() * 10) - 3),
        memoryUsage: Math.min(80, prevStatus.memoryUsage + Math.floor(Math.random() * 8) - 2),
        networkLatency: Math.max(5, prevStatus.networkLatency + Math.floor(Math.random() * 5) - 1),
        databaseStatus: prevStatus.databaseStatus === "offline" ? "online" : prevStatus.databaseStatus,
        securityStatus: prevStatus.securityStatus === "warning" ? "ok" : prevStatus.securityStatus,
      }));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ProtectedRoute requiredRole={UserRole.MANAGER}>
      <ModernLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Status do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde e performance do sistema
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Utilização da CPU</CardTitle>
                  <CardDescription>
                    Uso atual dos processadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{systemStatus.cpuUsage}%</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {systemStatus.cpuUsage > 80
                      ? "Alto uso da CPU detectado"
                      : "Uso normal da CPU"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilização da Memória</CardTitle>
                  <CardDescription>
                    Uso atual da memória RAM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{systemStatus.memoryUsage}%</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {systemStatus.memoryUsage > 70
                      ? "Alto uso de memória detectado"
                      : "Uso normal de memória"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latência da Rede</CardTitle>
                  <CardDescription>
                    Tempo de resposta da rede
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{systemStatus.networkLatency}ms</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {systemStatus.networkLatency > 100
                      ? "Alta latência detectada"
                      : "Latência normal"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Banco de Dados</CardTitle>
                  <CardDescription>
                    Estado atual da conexão com o banco de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStatus.databaseStatus === "online" ? "Online" : "Offline"}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {systemStatus.databaseStatus === "offline"
                      ? "Banco de dados está offline"
                      : "Banco de dados operacional"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status de Segurança</CardTitle>
                <CardDescription>
                  Estado geral da segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemStatus.securityStatus === "ok" ? (
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-green-500" />
                    <span>Sistema seguro</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Atenção: Problemas de segurança detectados</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Desempenho</CardTitle>
                <CardDescription>
                  Gráficos e dados sobre o desempenho do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4" />
                    <span>CPU: {systemStatus.cpuUsage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Memory className="h-4 w-4" />
                    <span>Memória: {systemStatus.memoryUsage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>Rede: {systemStatus.networkLatency}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>
                  Últimos eventos registrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  <li>[INFO] Sistema inicializado</li>
                  <li>[WARN] Alto uso da CPU detectado</li>
                  <li>[ERROR] Falha na conexão com o banco de dados</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default StatusSistema;
