
import React from 'react';
import { useInterfaceAudit } from '@/hooks/useInterfaceAudit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react';

export const SystemAuditPanel = () => {
  const { auditResult, runAudit, isHealthy, performanceScore } = useInterfaceAudit();

  const handleRunAudit = () => {
    runAudit();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Auditoria do Sistema
          </CardTitle>
          <Button onClick={handleRunAudit} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Executar Auditoria
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-medium">
            Status: {isHealthy ? 'Sistema Saudável' : 'Problemas Detectados'}
          </span>
        </div>

        {/* Menus Duplicados */}
        <div className="flex items-center justify-between">
          <span>Menus Duplicados</span>
          {auditResult.duplicateMenus.length === 0 ? (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Nenhum
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {auditResult.duplicateMenus.length} encontrados
            </Badge>
          )}
        </div>

        {/* Rotas Inválidas */}
        <div className="flex items-center justify-between">
          <span>Rotas Inválidas</span>
          {auditResult.invalidRoutes.length === 0 ? (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Nenhuma
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {auditResult.invalidRoutes.length} encontradas
            </Badge>
          )}
        </div>

        {/* Integridade dos Dados */}
        <div className="flex items-center justify-between">
          <span>Integridade dos Dados</span>
          {auditResult.dataIntegrity ? (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              OK
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Problemas
            </Badge>
          )}
        </div>

        {/* Design Moderno */}
        <div className="flex items-center justify-between">
          <span>Design Moderno</span>
          {auditResult.designConsistency ? (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aplicado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Inconsistente
            </Badge>
          )}
        </div>

        {/* Performance */}
        <div className="flex items-center justify-between">
          <span>Performance</span>
          <Badge variant={performanceScore === 'good' ? 'outline' : 'secondary'}>
            <Clock className="h-3 w-3 mr-1" />
            {performanceScore === 'good' ? 'Boa' : 'Necessita Melhoria'}
          </Badge>
        </div>

        {/* Última Auditoria */}
        {auditResult.lastAudit && (
          <div className="text-xs text-gray-500">
            Última auditoria: {new Date(auditResult.lastAudit).toLocaleString('pt-BR')}
          </div>
        )}

        {/* Detalhes dos Problemas */}
        {(!isHealthy) && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Problemas Detectados:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {auditResult.duplicateMenus.length > 0 && (
                <li>• Menus duplicados: {auditResult.duplicateMenus.join(', ')}</li>
              )}
              {auditResult.invalidRoutes.length > 0 && (
                <li>• Rotas inválidas: {auditResult.invalidRoutes.join(', ')}</li>
              )}
              {!auditResult.dataIntegrity && (
                <li>• Problemas na integridade dos dados</li>
              )}
              {!auditResult.designConsistency && (
                <li>• Inconsistências no design moderno</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
