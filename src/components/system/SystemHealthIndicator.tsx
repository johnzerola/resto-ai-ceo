
import { AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemAudit } from "@/hooks/useSystemAudit";

export function SystemHealthIndicator() {
  const { 
    auditResults, 
    isAuditing, 
    lastAuditTime, 
    performAudit, 
    getSystemStatus,
    getCriticalIssues,
    getWarnings 
  } = useSystemAudit();

  const systemStatus = getSystemStatus();
  const criticalIssues = getCriticalIssues();
  const warnings = getWarnings();

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'Sistema Saudável';
      case 'warning':
        return 'Avisos Detectados';
      case 'error':
        return 'Erros Críticos';
      default:
        return 'Status Desconhecido';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          Saúde do Sistema
          <Badge variant="outline" className={`ml-auto ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticalIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Erros Críticos:</h4>
            <ul className="text-xs space-y-1">
              {criticalIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-600">Avisos:</h4>
            <ul className="text-xs space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {lastAuditTime ? 
              `Última verificação: ${new Date(lastAuditTime).toLocaleString('pt-BR')}` : 
              'Nunca verificado'
            }
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={performAudit}
            disabled={isAuditing}
          >
            {isAuditing ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>

        {auditResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Componentes Verificados:</h4>
            <div className="grid grid-cols-1 gap-1">
              {auditResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-gray-50">
                  <span>{result.component}</span>
                  <Badge 
                    variant="outline" 
                    className={
                      result.status === 'healthy' ? 'border-green-500 text-green-700' :
                      result.status === 'warning' ? 'border-yellow-500 text-yellow-700' :
                      'border-red-500 text-red-700'
                    }
                  >
                    {result.status === 'healthy' ? 'OK' : 
                     result.status === 'warning' ? 'Aviso' : 'Erro'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
