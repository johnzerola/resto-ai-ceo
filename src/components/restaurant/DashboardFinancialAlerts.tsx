import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Clock, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface FinancialAlert {
  id: string;
  tipo_alerta: string;
  prioridade: string;
  titulo: string;
  mensagem: string;
  data_criacao: string;
  dados_contexto: any;
}

export function DashboardFinancialAlerts() {
  const { currentRestaurant } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadUrgentAlerts();
    }
  }, [currentRestaurant]);

  const loadUrgentAlerts = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('alertas_sistema')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .eq('resolvido', false)
        .in('tipo_alerta', ['vencimento_pagar', 'vencimento_receber'])
        .order('data_criacao', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas urgentes:', error);
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
      loadUrgentAlerts();
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      toast.error('Erro ao resolver alerta');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-50 border-red-200 text-red-800';
      case 'media': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
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
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum alerta urgente</p>
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
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Alertas de Vencimento ({alerts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/fluxo-de-caixa')}
            className="h-8 px-2 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 rounded-lg border ${getPriorityColor(alert.prioridade)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{alert.titulo}</h4>
                  <Badge variant="outline" className="text-xs">
                    {alert.prioridade}
                  </Badge>
                </div>
                <p className="text-xs opacity-90 mb-2">
                  {alert.mensagem}
                </p>
                <span className="text-xs opacity-75">
                  {formatTimeAgo(alert.data_criacao)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resolveAlert(alert.id)}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {alerts.length >= 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/fluxo-de-caixa')}
            className="w-full text-xs"
          >
            Ver Mais Alertas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}