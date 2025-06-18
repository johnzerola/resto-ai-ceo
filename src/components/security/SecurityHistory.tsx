
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getUserSecurityHistory } from '@/utils/enhanced-auth-utils';

interface SecurityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  metadata: any;
}

export function SecurityHistory() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSecurityHistory();
  }, []);

  const loadSecurityHistory = async () => {
    try {
      const history = await getUserSecurityHistory(20);
      // Transform the data to match our SecurityLog interface
      const transformedLogs: SecurityLog[] = history.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        type: log.type,
        message: log.message,
        severity: (['info', 'warning', 'error'].includes(log.severity) ? log.severity : 'info') as 'info' | 'warning' | 'error',
        metadata: log.metadata
      }));
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success':
      case 'account_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'login_failed':
      case 'suspicious_activity_detected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'password_changed':
      case 'user_registration':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      login_success: 'Login Bem-sucedido',
      login_failed: 'Tentativa de Login Falhou',
      account_created: 'Conta Criada',
      password_changed: 'Senha Alterada',
      user_registration: 'Registro de Usuário',
      suspicious_activity_detected: 'Atividade Suspeita',
    };
    return labels[type] || type;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando histórico de segurança...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Histórico de Segurança
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas atividades de segurança da sua conta
        </p>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade de segurança registrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEventIcon(log.type)}
                      <span className="font-medium">
                        {getEventLabel(log.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(log.severity)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.metadata?.email && `Email: ${log.metadata.email}`}
                      {log.metadata?.error_message && ` - ${log.metadata.error_message}`}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
