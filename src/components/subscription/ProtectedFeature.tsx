
import React from 'react';
import { useSubscriptionPlan, PlanType } from '@/hooks/useSubscriptionPlan';
import { PlanGate } from './PlanGate';

interface ProtectedFeatureProps {
  requiredPlan?: PlanType;
  feature?: keyof import('@/hooks/useSubscriptionPlan').PlanFeatures;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function ProtectedFeature({ 
  requiredPlan,
  feature, 
  featureName, 
  description, 
  children, 
  fallback,
  showUpgradeButton = true
}: ProtectedFeatureProps) {
  const { hasFeature, canAccess, planType, subscription } = useSubscriptionPlan();

  // Se especificou uma feature específica, usar verificação de feature
  if (feature) {
    if (hasFeature(feature)) {
      return <>{children}</>;
    }
    
    return (
      <PlanGate
        feature={feature}
        featureName={featureName}
        description={description}
        fallback={fallback}
      >
        {children}
      </PlanGate>
    );
  }

  // Se especificou um plano mínimo, verificar hierarquia de planos
  if (requiredPlan) {
    if (canAccess(requiredPlan)) {
      return <>{children}</>;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar bloqueio por plano
    return (
      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
        <div className="space-y-4">
          <div className="text-lg font-semibold">{featureName}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="text-sm">
            <p>Plano atual: <strong>{planType.toUpperCase()}</strong></p>
            <p>Plano requerido: <strong>{requiredPlan.toUpperCase()}</strong></p>
          </div>
          {showUpgradeButton && (
            <button 
              onClick={() => window.location.href = '/assinatura'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Fazer Upgrade
            </button>
          )}
        </div>
      </div>
    );
  }

  // Se não especificou nem feature nem plano, mostrar conteúdo
  return <>{children}</>;
}
