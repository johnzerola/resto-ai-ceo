import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { securityService, SecurityEvent } from "@/services/SecurityService";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, AlertTriangle, Eye, Download, Activity } from "lucide-react";
import { toast } from "sonner";

export function SecurityDashboard() {
  const { user } = useAuth();
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [dataAccessLogs, setDataAccessLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    setSecurityLogs(securityService.getSecurityLogs());
    setDataAccessLogs(securityService.getDataAccessLogs());
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const exportSecurityReport = () => {
    const report = {
      user: userName,
      exportDate: new Date().toISOString(),
      securityEvents: securityLogs.filter(log => log.userId === user?.id),
      dataAccessEvents: dataAccessLogs.filter(log => log.userId === user?.id),
      summary: {
        totalEvents: securityLogs.length,
        failedLogins: securityLogs.filter(log => log.eventType === 'failed_login').length,
        dataAccesses: dataAccessLogs.length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_seguranca_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Relatório de segurança exportado!");
  };

  const getEventTypeBadge = (eventType: SecurityEvent['eventType']) => {
    const eventConfig = {
      login: { color: "bg-green-100 text-green-800", text: "Login" },
      logout: { color: "bg-blue-100 text-blue-800", text: "Logout" },
      failed_login: { color: "bg-red-100 text-red-800", text: "Login Falhado" },
      data_access: { color: "bg-purple-100 text-purple-800", text: "Acesso a Dados" },
      data_export: { color: "bg-orange-100 text-orange-800", text: "Exportação" },
      permission_denied: { color: "bg-red-100 text-red-800", text: "Permissão Negada" }
    };

    const config = eventConfig[eventType];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // Estatísticas de segurança
  const securityStats = {
    totalEvents: securityLogs.length,
    failedLogins: securityLogs.filter(log => log.eventType === 'failed_login').length,
    successfulLogins: securityLogs.filter(log => log.eventType === 'login').length,
    dataAccesses: dataAccessLogs.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Painel de Segurança</h2>
          <p className="text-muted-foreground">Monitore a segurança e atividades da sua conta</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSecurityReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Estatísticas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{securityStats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Logins Bem-sucedidos</p>
                <p className="text-2xl font-bold">{securityStats.successfulLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tentativas Falhadas</p>
                <p className="text-2xl font-bold">{securityStats.failedLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Acessos a Dados</p>
                <p className="text-2xl font-bold">{securityStats.dataAccesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log de Eventos de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Segurança Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {securityLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Evento</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Endereço IP</TableHead>
                  <TableHead>Dispositivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getEventTypeBadge(log.eventType)}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.userAgent?.split(' ')[0] || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum evento de segurança registrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Log de Acesso a Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Acesso a Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {dataAccessLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Dados</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataAccessLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.dataType}</TableCell>
                    <TableCell>
                      <Badge variant={log.action === 'read' ? 'secondary' : 'default'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum acesso a dados registrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
