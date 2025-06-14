
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  Bell,
  CheckCircle,
  Settings,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  category: string;
  unit: string;
  severity: 'low' | 'critical' | 'out';
  estimatedDaysLeft: number;
  costPerUnit: number;
  suggestedOrderQuantity: number;
}

interface AutomaticStockAlertsProps {
  restaurantId: string;
}

export function AutomaticStockAlerts({ restaurantId }: AutomaticStockAlertsProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      checkStockLevels();
      
      // Auto-check a cada 30 minutos se habilitado
      if (autoCheck) {
        const interval = setInterval(checkStockLevels, 30 * 60 * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [restaurantId, autoCheck]);

  const checkStockLevels = async () => {
    setIsLoading(true);
    try {
      // Buscar itens do estoque
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      const newAlerts: StockAlert[] = [];

      inventory?.forEach(item => {
        const currentStock = item.quantity || 0;
        const minimumStock = item.minimum_stock || 0;
        
        if (currentStock <= minimumStock) {
          let severity: 'low' | 'critical' | 'out' = 'low';
          let estimatedDaysLeft = 0;

          if (currentStock === 0) {
            severity = 'out';
          } else if (currentStock <= minimumStock * 0.5) {
            severity = 'critical';
            estimatedDaysLeft = Math.ceil(currentStock / (minimumStock * 0.1)); // Consumo estimado
          } else {
            estimatedDaysLeft = Math.ceil(currentStock / (minimumStock * 0.15));
          }

          // Calcular quantidade sugerida para pedido
          const suggestedOrderQuantity = Math.max(
            minimumStock * 2 - currentStock, // Reestoque para o dobro do mínimo
            minimumStock
          );

          newAlerts.push({
            id: item.id,
            itemName: item.name,
            currentStock,
            minimumStock,
            category: item.category || 'Geral',
            unit: item.unit || 'unidade',
            severity,
            estimatedDaysLeft,
            costPerUnit: item.cost_per_unit || 0,
            suggestedOrderQuantity
          });
        }
      });

      // Ordenar por severidade
      newAlerts.sort((a, b) => {
        const severityOrder = { out: 0, critical: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      setAlerts(newAlerts);

      // Notificar se há alertas críticos
      const criticalAlerts = newAlerts.filter(a => a.severity === 'critical' || a.severity === 'out');
      if (criticalAlerts.length > 0) {
        toast.warning(
          `${criticalAlerts.length} itens com estoque crítico!`,
          {
            duration: 10000,
            action: {
              label: 'Ver Alertas',
              onClick: () => document.getElementById('stock-alerts')?.scrollIntoView()
            }
          }
        );
      }

    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      toast.error('Erro ao verificar níveis de estoque');
    } finally {
      setIsLoading(false);
    }
  };

  const generateShoppingList = () => {
    const shoppingList = alerts.map(alert => ({
      item: alert.itemName,
      quantidade: alert.suggestedOrderQuantity,
      unidade: alert.unit,
      custoEstimado: alert.costPerUnit * alert.suggestedOrderQuantity,
      prioridade: alert.severity
    }));

    const blob = new Blob([JSON.stringify(shoppingList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-compras-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Lista de compras gerada!');
  };

  const markAsOrdered = async (alertId: string) => {
    try {
      // Aqui você poderia registrar o pedido em uma tabela de pedidos
      // Por enquanto, vamos apenas remover o alerta
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Item marcado como pedido!');
    } catch (error) {
      toast.error('Erro ao marcar item como pedido');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'out': return 'bg-red-500 text-white';
      case 'critical': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'out': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <TrendingDown className="h-4 w-4" />;
      case 'low': return <Bell className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'out': return 'SEM ESTOQUE';
      case 'critical': return 'CRÍTICO';
      case 'low': return 'BAIXO';
      default: return 'NORMAL';
    }
  };

  const totalCost = alerts.reduce((sum, alert) => 
    sum + (alert.costPerUnit * alert.suggestedOrderQuantity), 0
  );

  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'out').length;
  const lowCount = alerts.filter(a => a.severity === 'low').length;

  return (
    <div className="space-y-6" id="stock-alerts">
      {/* Resumo dos alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixos</p>
                <p className="text-2xl font-bold text-yellow-600">{lowCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Estimado</p>
                <p className="text-xl font-bold">R$ {totalCost.toFixed(2)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Alertas de Estoque Automáticos
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoCheck(!autoCheck)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Auto-Check: {autoCheck ? 'ON' : 'OFF'}
              </Button>
              <Button 
                onClick={checkStockLevels} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Verificar Agora
              </Button>
              <Button 
                onClick={generateShoppingList}
                disabled={alerts.length === 0}
                size="sm"
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Lista de Compras
              </Button>
            </div>
          </div>
        </CardHeader>

        {criticalCount > 0 && (
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{criticalCount}</strong> itens com estoque crítico precisam de atenção imediata!
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Lista de alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{alert.itemName}</h4>
                  <p className="text-sm text-muted-foreground">{alert.category}</p>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                  <span className="ml-1">{getSeverityLabel(alert.severity)}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Estoque Atual</p>
                  <p className="font-medium">{alert.currentStock} {alert.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estoque Mínimo</p>
                  <p className="font-medium">{alert.minimumStock} {alert.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dias Restantes</p>
                  <p className="font-medium">
                    {alert.estimatedDaysLeft > 0 ? `~${alert.estimatedDaysLeft} dias` : 'Esgotado'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Qtd. Sugerida</p>
                  <p className="font-medium">{alert.suggestedOrderQuantity} {alert.unit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-muted-foreground">Custo estimado</p>
                  <p className="font-medium">R$ {(alert.costPerUnit * alert.suggestedOrderQuantity).toFixed(2)}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => markAsOrdered(alert.id)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Estoque em Ordem!</p>
            <p className="text-muted-foreground">
              Todos os itens estão acima do nível mínimo de estoque.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Verificando níveis de estoque...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
