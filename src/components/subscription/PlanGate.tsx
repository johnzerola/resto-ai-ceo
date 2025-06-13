
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';
import { useSubscriptionPlan, PlanType } from '@/hooks/useSubscriptionPlan';
import { Link } from 'react-router-dom';

interface PlanGateProps {
  feature: keyof import('@/hooks/useSubscriptionPlan').PlanFeatures;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ 
  feature, 
  featureName, 
  description, 
  children, 
  fallback 
}: PlanGateProps) {
  const { hasFeature, planType, requiresUpgrade } = useSubscriptionPlan();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getRequiredPlan = () => {
    if (planType === PlanType.FREE) {
      return 'Essencial';
    }
    return 'Profissional';
  };

  const getPlanIcon = () => {
    if (planType === PlanType.FREE) {
      return <Zap className="h-5 w-5" />;
    }
    return <Crown className="h-5 w-5" />;
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          {featureName}
          <Badge variant="outline" className="text-xs">
            {getPlanIcon()}
            {getRequiredPlan()}
          </Badge>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta funcionalidade está disponível no plano <strong>{getRequiredPlan()}</strong>.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild size="sm">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
