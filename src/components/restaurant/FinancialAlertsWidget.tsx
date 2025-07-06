import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Bell, CheckCircle, Clock, X } from "lucide-react";
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

interface FinancialAlertsWidgetProps {
  onAlertsUpdate?: () => void;
}

export function FinancialAlertsWidget({ onAlertsUpdate }: FinancialAlertsWidgetProps) {
  const { currentRestaurant } = useAuth();
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadAlerts();
      // Auto-check para novos alertas a cada 5 minutos
      const interval = setInterval(checkForNewAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentRestaurant]);

  const loadAlerts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('resolvido', false)
        .in('tipo_alerta', ['vencimento_pagar', 'vencimento_receber', 'saldo_baixo', 'cmv_alto'])
        .order('data_criacao', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const checkForNewAlerts = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cash-flow-alerts', {
        body: { 
          restaurantId: currentRestaurant.id,
          daysBeforeDue: 3 
        }
      });

      if (error) throw error;

      if (data?.alertsProcessed > 0) {
        toast.success(`${data.alertsProcessed} novo(s) alerta(s) encontrado(s)`);
        loadAlerts();
        onAlertsUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    } finally {
      setIsLoading(false);
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

      toast.success('Alerta marcado como resolvido');
      loadAlerts();
      onAlertsUpdate?.();
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      toast.error('Erro ao resolver alerta');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return <AlertTriangle className="h-4 w-4" />;
      case 'media': return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Alertas Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm">Tudo em ordem!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            Alertas Financeiros ({alerts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkForNewAlerts}
            disabled={isLoading}
            className="h-8 px-2"
          >
            {isLoading ? 'Verificando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={`${getPriorityColor(alert.prioridade)} relative`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getPriorityIcon(alert.prioridade)}
              </div>
              <div className="flex-1 space-y-1">
                <AlertTitle className="text-sm font-medium">
                  {alert.titulo}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {alert.mensagem}
                </AlertDescription>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-75">
                    {formatDate(alert.data_criacao)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {alert.prioridade}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}