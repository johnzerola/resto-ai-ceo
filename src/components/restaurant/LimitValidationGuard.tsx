
import React from 'react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { LimitGuard } from '@/components/subscription/LimitGuard';
import { toast } from 'sonner';

interface LimitValidationGuardProps {
  resourceType: 'restaurants' | 'menuItems' | 'cashFlowEntries' | 'teamMembers';
  children: React.ReactNode;
  onLimitReached?: () => void;
  showToast?: boolean;
  blockAction?: boolean; // Nova prop para controlar se deve bloquear a ação
}

export function LimitValidationGuard({ 
  resourceType, 
  children, 
  onLimitReached,
  showToast = true,
  blockAction = true
}: LimitValidationGuardProps) {
  const { canCreate, usage, limits } = useUsageLimits();
  const { planType } = useSubscriptionPlan();

  const handleLimitReached = (e?: React.MouseEvent) => {
    if (blockAction && e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (showToast) {
      const resourceNames = {
        restaurants: 'restaurantes',
        menuItems: 'itens do menu',
        cashFlowEntries: 'registros financeiros',
        teamMembers: 'membros da equipe'
      };

      toast.error(
        `Limite atingido! Você pode criar no máximo ${limits[resourceType as keyof typeof limits]} ${resourceNames[resourceType]} no plano ${planType.toUpperCase()}.`,
        {
          duration: 5000,
          action: {
            label: 'Fazer Upgrade',
            onClick: () => window.location.href = '/assinatura'
          }
        }
      );
    }
    
    onLimitReached?.();
    return false;
  };

  // Se não pode criar e deve bloquear, envolver em div que intercepta cliques
  if (!canCreate(resourceType) && blockAction) {
    return (
      <div 
        onClick={handleLimitReached}
        onSubmit={handleLimitReached}
        className="cursor-not-allowed"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <LimitGuard 
          resourceType={resourceType}
          fallback={null}
        >
          <div />
        </LimitGuard>
      </div>
    );
  }

  // Se não pode criar mas não deve bloquear, mostrar o LimitGuard
  if (!canCreate(resourceType)) {
    return (
      <LimitGuard 
        resourceType={resourceType}
        fallback={
          <div className="cursor-not-allowed opacity-50">
            {children}
          </div>
        }
      >
        {children}
      </LimitGuard>
    );
  }

  // Se pode criar, renderizar normalmente
  return <>{children}</>;
}

// Hook para validação de limite antes de ações
export function useValidateLimit() {
  const { canCreate } = useUsageLimits();
  const { planType } = useSubscriptionPlan();

  const validateBeforeAction = (
    resourceType: 'restaurants' | 'menuItems' | 'cashFlowEntries' | 'teamMembers',
    actionName: string = 'criar'
  ): boolean => {
    if (!canCreate(resourceType)) {
      const resourceNames = {
        restaurants: 'restaurantes',
        menuItems: 'itens do menu',
        cashFlowEntries: 'registros financeiros',
        teamMembers: 'membros da equipe'
      };

      toast.error(
        `Não é possível ${actionName} mais ${resourceNames[resourceType]}. Limite do plano ${planType.toUpperCase()} atingido.`,
        {
          duration: 5000,
          action: {
            label: 'Ver Planos',
            onClick: () => window.location.href = '/assinatura'
          }
        }
      );
      return false;
    }
    return true;
  };

  return { validateBeforeAction, canCreate };
}
