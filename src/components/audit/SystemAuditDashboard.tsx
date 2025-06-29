
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  RefreshCw
} from "lucide-react";
import { AuditService, AuditLog } from "@/services/AuditService";
import { useAuth } from "@/contexts/AuthContext";

export function SystemAuditDashboard() {
  const { currentRestaurant } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthcheck, setHealthcheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAuditData = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const [logs, health] = await Promise.all([
        AuditService.getAuditLogs(currentRestaurant.id, 50),
        AuditService.performHealthcheck(currentRestaurant.id)
      ]);

      setAuditLogs(logs);
      setHealthcheck(health);
    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [currentRestaurant]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="default" className="bg-green-600">Criado</Badge>;
      case 'update':
        return <Badge variant="secondary">Atualizado</Badge>;
      case 'delete':
        return <Badge variant="destructive">Excluído</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getTableBadge = (tableName: string) => {
    const tableMap: { [key: string]: { name: string; color: string } } = {
      cash_flow: { name: 'Fluxo de Caixa', color: 'bg-blue-600' },
      contas_a_pagar: { name: 'Contas a Pagar', color: 'bg-red-600' },
      contas_a_receber: { name: 'Contas a Receber', color: 'bg-green-600' },
      pratos: { name: 'Pratos', color: 'bg-purple-600' },
      insumos: { name: 'Insumos', color: 'bg-orange-600' }
    };

    const table = tableMap[tableName] || { name: tableName, color: 'bg-gray-600' };
    
    return (
      <Badge variant="outline" className={`${table.color} text-white`}>
        {table.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Auditoria do Sistema</h2>
        </div>
        <Button onClick={loadAuditData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* System Health */}
      {healthcheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium">Sistema</p>
                <p className="text-xs text-muted-foreground">Operacional</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium">{healthcheck.tables_count}</p>
                <p className="text-xs text-muted-foreground">Tabelas Conectadas</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium">{healthcheck.cash_flow_records}</p>
                <p className="text-xs text-muted-foreground">Registros Fluxo</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm font-medium">
                  {new Date(healthcheck.timestamp).toLocaleTimeString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">Última Verificação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Atividade Recente</TabsTrigger>
          <TabsTrigger value="critical">Alterações Críticas</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Últimas 50 Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(log.action)}
                          {getTableBadge(log.table_name)}
                        </div>
                        <p className="text-sm font-medium">
                          {AuditService.formatLogAction(log)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </p>
                        {log.record_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {log.record_id.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum log de auditoria encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alterações Críticas (Exclusões)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.filter(log => log.action === 'delete').length > 0 ? (
                  auditLogs
                    .filter(log => log.action === 'delete')
                    .map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getActionBadge(log.action)}
                            {getTableBadge(log.table_name)}
                          </div>
                          <p className="text-sm font-medium text-red-800">
                            {AuditService.formatLogAction(log)}
                          </p>
                          <p className="text-xs text-red-600">
                            {formatTimestamp(log.timestamp)}
                          </p>
                          {log.old_values && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-red-700">
                                Ver dados excluídos
                              </summary>
                              <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma exclusão registrada</p>
                    <p className="text-xs text-muted-foreground">Seus dados estão seguros!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
