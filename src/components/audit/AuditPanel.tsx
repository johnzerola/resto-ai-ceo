
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useInterfaceAudit } from '@/hooks/useInterfaceAudit';

const AuditPanel = memo(() => {
  const { auditResult, runAudit, isHealthy } = useInterfaceAudit();

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isOk: boolean, label: string) => {
    return (
      <Badge variant={isOk ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(isOk)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Auditoria de Interface
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runAudit}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Executar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Geral */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium">Status Geral</span>
            {getStatusBadge(isHealthy, isHealthy ? 'Saudável' : 'Problemas Detectados')}
          </div>

          {/* Menus Duplicados */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <span className="text-sm font-medium">Menus Duplicados</span>
              {auditResult.duplicateMenus.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {auditResult.duplicateMenus.join(', ')}
                </p>
              )}
            </div>
            {getStatusBadge(auditResult.duplicateMenus.length === 0, 
              auditResult.duplicateMenus.length === 0 ? 'OK' : `${auditResult.duplicateMenus.length} encontrados`
            )}
          </div>

          {/* Rotas Inválidas */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <span className="text-sm font-medium">Rotas Inválidas</span>
              {auditResult.invalidRoutes.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {auditResult.invalidRoutes.join(', ')}
                </p>
              )}
            </div>
            {getStatusBadge(auditResult.invalidRoutes.length === 0,
              auditResult.invalidRoutes.length === 0 ? 'OK' : `${auditResult.invalidRoutes.length} encontradas`
            )}
          </div>

          {/* Integridade dos Dados */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium">Integridade dos Dados</span>
            {getStatusBadge(auditResult.dataIntegrity, auditResult.dataIntegrity ? 'OK' : 'Problemas')}
          </div>

          {/* Consistência do Design */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium">Consistência do Design</span>
            {getStatusBadge(auditResult.designConsistency, auditResult.designConsistency ? 'OK' : 'Inconsistente')}
          </div>

          {/* Última Auditoria */}
          {auditResult.lastAudit && (
            <div className="text-xs text-slate-500 text-center pt-2 border-t">
              Última auditoria: {new Date(auditResult.lastAudit).toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default AuditPanel;
