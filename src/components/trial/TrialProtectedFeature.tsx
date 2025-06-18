
import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrialProtectedFeatureProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  fallback?: React.ReactNode;
}

export function TrialProtectedFeature({ 
  children, 
  featureName, 
  description, 
  fallback 
}: TrialProtectedFeatureProps) {
  const { trialStatus } = useTrialStatus();
  const { planType } = useSubscriptionPlan();

  // Permitir acesso se:
  // 1. Trial ativo
  // 2. Plano pago (essencial ou profissional)
  const hasAccess = trialStatus?.isTrialActive || 
                   (planType && planType !== 'free');

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
      <div className="space-y-4">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">{featureName}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        
        <Alert className="border-amber-200 bg-amber-50">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {trialStatus?.planStatus === 'trial_expired' || trialStatus?.planStatus === 'expired' ? (
              <>Seu trial expirou. Assine um plano para continuar usando esta funcionalidade.</>
            ) : (
              <>Esta funcionalidade está disponível apenas durante o trial ou em planos pagos.</>
            )}
          </AlertDescription>
        </Alert>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link to="/assinatura">
            <Crown className="h-4 w-4 mr-2" />
            Ver Planos e Assinar
          </Link>
        </Button>
      </div>
    </div>
  );
}
