import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bell, CheckCircle, Clock, X, RefreshCw, CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialAlert {
  id: string;
  tipo_alerta: string;
  prioridade: string;
  titulo: string;
  mensagem: string;
  data_criacao: string;
  resolvido: boolean;
  dados_contexto: any;
}

interface EnhancedFinancialAlertsWidgetProps {
  onAlertsUpdate?: () => void;
  maxAlerts?: number;
  showAutoRefresh?: boolean;
}

export function EnhancedFinancialAlertsWidget({ 
  onAlertsUpdate, 
  maxAlerts = 5, 
  showAutoRefresh = true 
}: EnhancedFinancialAlertsWidgetProps) {
  const { currentRestaurant } = useAuth();
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadAlerts();
      
      if (showAutoRefresh) {
        // Auto-refresh a cada 2 minutos
        const interval = setInterval(checkForNewAlerts, 2 * 60 * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [currentRestaurant, showAutoRefresh]);

  const loadAlerts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('resolvido', false)
        .in('tipo_alerta', ['vencimento_pagar', 'vencimento_receber', 'cmv_alto', 'saldo_baixo'])
        .order('data_criacao', { ascending: false })
        .limit(maxAlerts);

      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const checkForNewAlerts = async () => {
    if (!currentRestaurant?.id || isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Chamar a edge function para processar novos alertas
      const { data, error } = await supabase.functions.invoke('cash-flow-alerts', {
        body: { 
          restaurantId: currentRestaurant.id,
          daysBeforeDue: 3 
        }
      });

      if (error) {
        console.warn('Erro na edge function de alertas:', error);
      } else if (data?.alertsProcessed > 0) {
        toast.success(`${data.alertsProcessed} novo(s) alerta(s) encontrado(s)`);
        loadAlerts();
        onAlertsUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao verificar novos alertas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_sistema')
        .update({ 
          resolvido: true,
          data_resolucao: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alerta resolvido');
      loadAlerts();
      onAlertsUpdate?.();
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      toast.error('Erro ao resolver alerta');
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'alta': 
        return { 
          color: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          badge: 'bg-red-100 text-red-800'
        };
      case 'media': 
        return { 
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          badge: 'bg-yellow-100 text-yellow-800'
        };
      default: 
        return { 
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Bell className="h-4 w-4 text-blue-600" />,
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const getAlertTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'vencimento_pagar':
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case 'vencimento_receber':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'cmv_alto':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours === 1) return '1 hora atrás';
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 dia atrás';
    return `${diffDays} dias atrás`;
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Alertas Financeiros
            </CardTitle>
            {showAutoRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={checkForNewAlerts}
                disabled={isRefreshing}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm">Sistema monitorando - Tudo em ordem!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-600" />
            Alertas Financeiros ({alerts.length})
          </CardTitle>
          {showAutoRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={checkForNewAlerts}
              disabled={isRefreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const priorityConfig = getPriorityConfig(alert.prioridade);
          
          return (
            <Alert key={alert.id} className={`${priorityConfig.color} relative`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center gap-1">
                  {getAlertTypeIcon(alert.tipo_alerta)}
                  {priorityConfig.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{alert.titulo}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <AlertDescription className="text-xs">
                    {alert.mensagem}
                  </AlertDescription>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {formatTimeAgo(alert.data_criacao)}
                    </span>
                    <Badge className={priorityConfig.badge}>
                      {alert.prioridade.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}