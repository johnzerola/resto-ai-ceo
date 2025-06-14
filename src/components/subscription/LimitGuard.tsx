
import React from 'react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LimitGuardProps {
  resourceType: 'restaurants' | 'menuItems' | 'cashFlowEntries' | 'teamMembers';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LimitGuard({ resourceType, children, fallback }: LimitGuardProps) {
  const { canCreate, usage, limits } = useUsageLimits();
  const { planType } = useSubscriptionPlan();

  const canCreateResource = canCreate(resourceType);

  if (canCreateResource) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const resourceNames = {
    restaurants: 'restaurantes',
    menuItems: 'itens do menu',
    cashFlowEntries: 'registros financeiros',
    teamMembers: 'membros da equipe'
  };

  const currentUsage = usage[resourceType];
  const limit = limits[resourceType as keyof typeof limits];

  return (
    <Card className="border-2 border-dashed border-amber-200 bg-amber-50">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-lg text-amber-800">
          Limite Atingido
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-amber-700">
          Você atingiu o limite de <strong>{limit}</strong> {resourceNames[resourceType]} do plano <strong>{planType.toUpperCase()}</strong>.
        </p>
        
        <div className="p-3 bg-amber-100 rounded-lg">
          <p className="text-xs text-amber-800 mb-1">Uso atual:</p>
          <p className="font-semibold">{currentUsage} / {limit === -1 ? '∞' : limit}</p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
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
