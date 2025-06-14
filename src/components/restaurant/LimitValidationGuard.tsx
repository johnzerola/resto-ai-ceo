
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
}

export function LimitValidationGuard({ 
  resourceType, 
  children, 
  onLimitReached,
  showToast = true 
}: LimitValidationGuardProps) {
  const { canCreate, usage, limits } = useUsageLimits();
  const { planType } = useSubscriptionPlan();

  const handleLimitReached = () => {
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
  };

  // Verificar se pode criar antes de renderizar o children
  const handleClick = (e: React.MouseEvent) => {
    if (!canCreate(resourceType)) {
      e.preventDefault();
      e.stopPropagation();
      handleLimitReached();
      return false;
    }
  };

  if (!canCreate(resourceType)) {
    return (
      <LimitGuard 
        resourceType={resourceType}
        fallback={
          <div 
            onClick={handleClick}
            className="cursor-not-allowed opacity-50"
          >
            {children}
          </div>
        }
      >
        {children}
      </LimitGuard>
    );
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}
