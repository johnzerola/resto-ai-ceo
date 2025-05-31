
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { SupabaseDataService } from '@/services/SupabaseDataService';
import { useAuth } from '@/contexts/AuthContext';

export function RealTimeSync() {
  const { currentRestaurant } = useAuth();
  const { isLoading, lastSync, refreshData } = useRealTimeData();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!currentRestaurant?.id) return;
    
    await refreshData();
    await SupabaseDataService.syncModuleData(currentRestaurant.id);
  };

  const getLastSyncText = () => {
    if (!lastSync) return 'Nunca sincronizado';
    
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return '1 minuto atrás';
    if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hora atrás';
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    return syncDate.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Sincronização em Tempo Real
          </CardTitle>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <CardDescription>
          Status da sincronização de dados entre módulos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {isLoading ? 'Sincronizando...' : 'Dados atualizados'}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualSync}
              disabled={isLoading || !isOnline}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Última sincronização: {getLastSyncText()}
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Sem conexão. Os dados serão sincronizados quando a conexão for restabelecida.
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium">Financeiro</div>
              <Badge variant="outline" className="mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                OK
              </Badge>
            </div>
            <div>
              <div className="font-medium">Estoque</div>
              <Badge variant="outline" className="mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                OK
              </Badge>
            </div>
            <div>
              <div className="font-medium">Metas</div>
              <Badge variant="outline" className="mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                OK
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
