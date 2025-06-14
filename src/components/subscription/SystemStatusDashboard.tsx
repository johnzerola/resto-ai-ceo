
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Database, 
  Shield, 
  Users, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp
} from 'lucide-react';

export function SystemStatusDashboard() {
  const { user } = useAuth();
  const { subscription, planType, isLoading: planLoading, error: planError } = useSubscriptionPlan();
  const { usage, isLoading: usageLoading } = useUsageLimits();

  const getSystemHealth = () => {
    if (planError) return { status: 'error', color: 'text-red-600', icon: XCircle };
    if (planLoading || usageLoading) return { status: 'loading', color: 'text-yellow-600', icon: AlertTriangle };
    if (subscription && planType !== 'free') return { status: 'healthy', color: 'text-green-600', icon: CheckCircle };
    return { status: 'basic', color: 'text-blue-600', icon: CheckCircle };
  };

  const health = getSystemHealth();

  const systemInfo = [
    {
      label: 'Usuário',
      value: user?.email || 'Não autenticado',
      icon: Users,
      status: user ? 'ok' : 'warning'
    },
    {
      label: 'Plano Ativo',
      value: planType.toUpperCase(),
      icon: Shield,
      status: planType === 'free' ? 'warning' : 'ok'
    },
    {
      label: 'Restaurantes',
      value: `${usage.restaurants}`,
      icon: Building2,
      status: usage.restaurants > 0 ? 'ok' : 'info'
    },
    {
      label: 'Banco de Dados',
      value: 'Conectado',
      icon: Database,
      status: 'ok'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <health.icon className={`h-5 w-5 ${health.color}`} />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status geral */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Sistema</span>
          <Badge 
            className={
              health.status === 'healthy' ? 'bg-green-500 hover:bg-green-600' :
              health.status === 'error' ? 'bg-red-500 hover:bg-red-600' :
              health.status === 'loading' ? 'bg-yellow-500 hover:bg-yellow-600' :
              'bg-blue-500 hover:bg-blue-600'
            }
          >
            {health.status === 'healthy' ? 'Operacional' :
             health.status === 'error' ? 'Erro' :
             health.status === 'loading' ? 'Carregando' :
             'Básico'}
          </Badge>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-3">
          {systemInfo.map((info, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <info.icon className={`h-4 w-4 ${
                info.status === 'ok' ? 'text-green-600' :
                info.status === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{info.label}</p>
                <p className="text-sm font-medium truncate">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas de uso */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Estatísticas de Uso</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Itens Menu: {usage.menuItems}</div>
            <div>Registros: {usage.cashFlowEntries}</div>
            <div>Equipe: {usage.teamMembers}</div>
            <div>Status: {subscription?.status || 'N/A'}</div>
          </div>
        </div>

        {/* Erros ou avisos */}
        {planError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">⚠️ {planError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
