import React from 'react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';

export function SecurityDashboard() {
  const { 
    issues, 
    isValidating, 
    runFullValidation, 
    cleanupLocalStorage,
    hasErrors,
    hasWarnings 
  } = useSecurityValidation();

  const getSecurityStatus = () => {
    if (hasErrors) return { icon: ShieldAlert, text: 'Problemas Críticos', variant: 'destructive' as const };
    if (hasWarnings) return { icon: ShieldAlert, text: 'Avisos', variant: 'secondary' as const };
    return { icon: ShieldCheck, text: 'Seguro', variant: 'default' as const };
  };

  const status = getSecurityStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Painel de Segurança Multi-Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <status.icon className="h-5 w-5" />
            <span className="font-medium">Status: </span>
            <Badge variant={status.variant}>{status.text}</Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={runFullValidation}
              disabled={isValidating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validando...' : 'Validar'}
            </Button>
            
            <Button 
              onClick={cleanupLocalStorage}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>

        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Problemas Encontrados:</h4>
            {issues.map((issue, index) => (
              <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{issue.component}:</span> {issue.message}
                    </div>
                    <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                      {issue.type}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {issues.length === 0 && !isValidating && (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              ✅ Todos os testes de segurança passaram. O isolamento multi-tenant está funcionando corretamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">Validações Realizadas:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Isolamento de dados no localStorage por usuário</li>
            <li>Funcionamento das políticas RLS (Row Level Security)</li>
            <li>Verificação de vazamento de dados entre usuários</li>
            <li>Validação de queries com filtros adequados</li>
            <li>Integridade das tabelas sensíveis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}