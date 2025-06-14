
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { getPlanDisplayName, getPlanColor } from '@/utils/subscription-utils';
import { Building2, Menu, DollarSign, Users, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UsageDashboard() {
  const { usage, isLoading, getUsagePercentage, limits } = useUsageLimits();
  const { planType } = useSubscriptionPlan();

  const usageItems = [
    {
      key: 'restaurants' as const,
      label: 'Restaurantes',
      icon: Building2,
      current: usage.restaurants,
      limit: limits.maxRestaurants,
      color: 'text-blue-600'
    },
    {
      key: 'menuItems' as const,
      label: 'Itens do Menu',
      icon: Menu,
      current: usage.menuItems,
      limit: limits.maxMenuItems,
      color: 'text-green-600'
    },
    {
      key: 'cashFlowEntries' as const,
      label: 'Registros Financeiros',
      icon: DollarSign,
      current: usage.cashFlowEntries,
      limit: limits.maxCashFlowEntries,
      color: 'text-purple-600'
    },
    {
      key: 'teamMembers' as const,
      label: 'Membros da Equipe',
      icon: Users,
      current: usage.teamMembers,
      limit: limits.maxTeamMembers,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Carregando dados de uso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uso do Plano</span>
          <Badge className={getPlanColor(planType)}>
            {getPlanDisplayName(planType)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.key);
          const isUnlimited = item.limit === -1;
          const isNearLimit = percentage >= 80 && !isUnlimited;
          const isAtLimit = percentage >= 100 && !isUnlimited;

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.current} / {isUnlimited ? '∞' : item.limit}
                </div>
              </div>
              
              {!isUnlimited && (
                <div className="space-y-1">
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-green-100'}`}
                  />
                  {isAtLimit && (
                    <p className="text-xs text-red-600">
                      Limite atingido. Faça upgrade para continuar.
                    </p>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <p className="text-xs text-yellow-600">
                      Próximo ao limite ({percentage.toFixed(0)}%)
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <Button asChild size="sm" className="w-full">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
