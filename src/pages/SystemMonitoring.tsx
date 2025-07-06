
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { MonitoringDashboard } from "@/components/admin/MonitoringDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function SystemMonitoring() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ModernLayout>
    );
  }

  // Verificar se o usuário tem permissão de admin (você pode ajustar essa lógica)
  const isAdmin = user?.email === 'admin@restauria.com' || user?.email?.includes('admin');

  if (!isAdmin) {
    return (
      <ModernLayout>
        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o painel de monitoramento do sistema.
            </p>
          </CardContent>
        </Card>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento do Sistema</h1>
          <p className="text-muted-foreground">
            Dashboard completo de métricas, alertas e status do sistema RestaurIA.
          </p>
        </div>
        
        <MonitoringDashboard />
      </div>
    </ModernLayout>
  );
}
