
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Wifi, Database, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    sync: 'healthy',
    api: 'healthy',
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    // Verificar status do sistema
    const checkSystemHealth = () => {
      try {
        // Verificar localStorage
        const testData = localStorage.getItem('systemTest');
        localStorage.setItem('systemTest', 'ok');
        localStorage.removeItem('systemTest');

        // Simular verificação de conectividade
        setSystemHealth({
          database: 'healthy',
          sync: 'healthy',
          api: navigator.onLine ? 'healthy' : 'warning',
          lastUpdate: new Date().toISOString()
        });
      } catch (error) {
        setSystemHealth(prev => ({
          ...prev,
          database: 'error',
          lastUpdate: new Date().toISOString()
        }));
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Operacional';
      case 'warning': return 'Atenção';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Armazenamento</span>
          </div>
          <Badge className={`${getStatusColor(systemHealth.database)} text-white text-xs`}>
            {getStatusText(systemHealth.database)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Sincronização</span>
          </div>
          <Badge className={`${getStatusColor(systemHealth.sync)} text-white text-xs`}>
            {getStatusText(systemHealth.sync)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Conectividade</span>
          </div>
          <Badge className={`${getStatusColor(systemHealth.api)} text-white text-xs`}>
            {getStatusText(systemHealth.api)}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          Última verificação: {new Date(systemHealth.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
