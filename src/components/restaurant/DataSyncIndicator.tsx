
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';

export function DataSyncIndicator() {
  const { syncStatus, syncConfigurationsToModules, validateDataIntegrity } = useDataSync();
  const [dataIssues, setDataIssues] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkIntegrity = async () => {
      const issues = await validateDataIntegrity();
      setDataIssues(issues);
    };

    checkIntegrity();
  }, [validateDataIntegrity]);

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-500';
    if (syncStatus.isSyncing) return 'bg-yellow-500';
    if (dataIssues.length > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Sincronizando...';
    if (dataIssues.length > 0) return `${dataIssues.length} problema(s)`;
    return 'Sincronizado';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff className="h-3 w-3" />;
    if (syncStatus.isSyncing) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (dataIssues.length > 0) return <AlertTriangle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className={`${getStatusColor()} text-white border-0 cursor-pointer`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span className="ml-1 text-xs">{getStatusText()}</span>
      </Badge>

      {syncStatus.isOnline && !syncStatus.isSyncing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncConfigurationsToModules}
          className="h-6 w-6 p-0"
          title="Sincronizar dados"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}

      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Status de Sincronização</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
                <span className="text-sm">
                  {syncStatus.isOnline ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              {syncStatus.lastSync && (
                <div className="text-sm text-gray-600">
                  Última sincronização: {syncStatus.lastSync.toLocaleTimeString()}
                </div>
              )}

              {dataIssues.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Problemas encontrados:</strong>
                    <ul className="mt-2 space-y-1">
                      {dataIssues.map((issue, index) => (
                        <li key={index} className="text-sm">• {issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {dataIssues.length === 0 && syncStatus.isOnline && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Todos os dados estão sincronizados e consistentes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
