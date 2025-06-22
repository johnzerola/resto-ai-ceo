
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Target,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfitAlert {
  id: string;
  type: 'low_margin' | 'hidden_loss' | 'high_cmv' | 'price_alert';
  title: string;
  message: string;
  value: number;
  recommended: number;
  dishName?: string;
  priority: 'high' | 'medium' | 'low';
}

export function ProfitabilityAlerts() {
  const { currentRestaurant } = useAuth();
  const [alerts, setAlerts] = useState<ProfitAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const checkProfitabilityAlerts = async () => {
    if (!currentRestaurant?.id) return;

    const newAlerts: ProfitAlert[] = [];

    try {
      // Buscar configurações
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      // Buscar pratos com cálculos
      const { data: pratos } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (pratos && config) {
        pratos.forEach(prato => {
          const custo = prato.custo_por_porcao || 0;
          const preco = prato.preco_praticado || prato.preco_sugerido || 0;
          
          if (custo > 0 && preco > 0) {
            const margemBruta = ((preco - custo) / preco) * 100;
            const cmv = (custo / preco) * 100;
            const margemLiquida = margemBruta - (config.taxa_impostos || 15);

            // Alert 1: Margem muito baixa
            if (margemLiquida < 15) {
              newAlerts.push({
                id: `low_margin_${prato.id}`,
                type: 'low_margin',
                title: `Margem Crítica: ${prato.nome_prato}`,
                message: `Margem líquida de apenas ${margemLiquida.toFixed(1)}%. Risco de prejuízo oculto.`,
                value: margemLiquida,
                recommended: 25,
                dishName: prato.nome_prato,
                priority: margemLiquida < 5 ? 'high' : 'medium'
              });
            }

            // Alert 2: CMV muito alto
            if (cmv > 40) {
              newAlerts.push({
                id: `high_cmv_${prato.id}`,
                type: 'high_cmv',
                title: `CMV Elevado: ${prato.nome_prato}`,
                message: `CMV de ${cmv.toFixed(1)}% está acima do recomendado (máx. 35%).`,
                value: cmv,
                recommended: 30,
                dishName: prato.nome_prato,
                priority: cmv > 50 ? 'high' : 'medium'
              });
            }

            // Alert 3: Prejuízo oculto (margem líquida negativa)
            if (margemLiquida < 0) {
              newAlerts.push({
                id: `hidden_loss_${prato.id}`,
                type: 'hidden_loss',
                title: `🚨 PREJUÍZO: ${prato.nome_prato}`,
                message: `Este prato está gerando prejuízo de ${Math.abs(margemLiquida).toFixed(1)}% por venda.`,
                value: margemLiquida,
                recommended: 20,
                dishName: prato.nome_prato,
                priority: 'high'
              });
            }

            // Alert 4: Preço muito abaixo do sugerido
            if (prato.preco_praticado && prato.preco_sugerido) {
              const diferenca = ((prato.preco_sugerido - prato.preco_praticado) / prato.preco_sugerido) * 100;
              if (diferenca > 20) {
                newAlerts.push({
                  id: `price_alert_${prato.id}`,
                  type: 'price_alert',
                  title: `Preço Abaixo do Ideal: ${prato.nome_prato}`,
                  message: `Preço atual R$ ${prato.preco_praticado.toFixed(2)} vs sugerido R$ ${prato.preco_sugerido.toFixed(2)}`,
                  value: prato.preco_praticado,
                  recommended: prato.preco_sugerido,
                  dishName: prato.nome_prato,
                  priority: 'medium'
                });
              }
            }
          }
        });
      }

      // Filtrar alertas dispensados
      const activeAlerts = newAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
      setAlerts(activeAlerts);

    } catch (error) {
      console.error('Erro ao verificar alertas de lucratividade:', error);
    }
  };

  useEffect(() => {
    if (currentRestaurant?.id) {
      checkProfitabilityAlerts();
      // Verificar a cada 5 minutos
      const interval = setInterval(checkProfitabilityAlerts, 300000);
      return () => clearInterval(interval);
    }
  }, [currentRestaurant, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'hidden_loss':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'low_margin':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high_cmv':
        return <DollarSign className="h-5 w-5 text-orange-600" />;
      case 'price_alert':
        return <Target className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-50';
    if (type === 'hidden_loss') return 'border-red-400 bg-red-50';
    if (type === 'low_margin') return 'border-yellow-400 bg-yellow-50';
    if (type === 'high_cmv') return 'border-orange-400 bg-orange-50';
    return 'border-blue-400 bg-blue-50';
  };

  const getBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (alerts.length === 0) return null;

  const highPriorityAlerts = alerts.filter(a => a.priority === 'high');
  const otherAlerts = alerts.filter(a => a.priority !== 'high');

  return (
    <div className="space-y-4">
      {/* Alertas de Alta Prioridade */}
      {highPriorityAlerts.map(alert => (
        <Alert key={alert.id} className={`${getAlertColor(alert.type, alert.priority)} border-2`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <Badge variant={getBadgeVariant(alert.priority)}>
                    {alert.priority === 'high' ? 'URGENTE' : 'ATENÇÃO'}
                  </Badge>
                </div>
                <AlertDescription className="mb-3">
                  {alert.message}
                </AlertDescription>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href="/ficha-tecnica-inteligente-completa">
                      Corrigir Agora
                    </a>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dispensar
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}

      {/* Outros Alertas */}
      {otherAlerts.map(alert => (
        <Alert key={alert.id} className={getAlertColor(alert.type, alert.priority)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant={getBadgeVariant(alert.priority)}>
                    {alert.priority === 'medium' ? 'ATENÇÃO' : 'INFO'}
                  </Badge>
                </div>
                <AlertDescription>
                  {alert.message}
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
