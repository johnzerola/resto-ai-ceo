
import { PlanType } from '@/hooks/useSubscriptionPlan';

export const PLAN_LIMITS = {
  [PlanType.FREE]: {
    maxRestaurants: 1,
    maxMenuItems: 10,
    maxCashFlowEntries: 50,
    maxTeamMembers: 1,
    features: ['basic_reports']
  },
  [PlanType.ESSENCIAL]: {
    maxRestaurants: 2,
    maxMenuItems: 100,
    maxCashFlowEntries: 500,
    maxTeamMembers: 3,
    features: ['basic_reports', 'advanced_reports', 'inventory_management', 'financial_analysis']
  },
  [PlanType.PROFISSIONAL]: {
    maxRestaurants: 5,
    maxMenuItems: -1, // ilimitado
    maxCashFlowEntries: -1, // ilimitado
    maxTeamMembers: 10,
    features: ['all']
  }
} as const;

export function getPlanDisplayName(planType: PlanType): string {
  switch (planType) {
    case PlanType.PROFISSIONAL:
      return 'Profissional';
    case PlanType.ESSENCIAL:
      return 'Essencial';
    case PlanType.FREE:
    default:
      return 'Gratuito';
  }
}

export function getPlanColor(planType: PlanType): string {
  switch (planType) {
    case PlanType.PROFISSIONAL:
      return 'text-purple-600 bg-purple-100';
    case PlanType.ESSENCIAL:
      return 'text-blue-600 bg-blue-100';
    case PlanType.FREE:
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function checkUsageLimit(
  planType: PlanType, 
  limitType: keyof typeof PLAN_LIMITS[PlanType], 
  currentUsage: number
): { allowed: boolean; limit: number; usage: number } {
  const limit = PLAN_LIMITS[planType][limitType];
  const allowed = limit === -1 || currentUsage < (limit as number);
  
  return {
    allowed,
    limit: limit as number,
    usage: currentUsage
  };
}

export function getUpgradeMessage(currentPlan: PlanType, targetFeature: string): string {
  switch (currentPlan) {
    case PlanType.FREE:
      return `${targetFeature} está disponível nos planos Essencial e Profissional. Faça upgrade para ter acesso!`;
    case PlanType.ESSENCIAL:
      return `${targetFeature} está disponível no plano Profissional. Faça upgrade para ter acesso completo!`;
    default:
      return `Você já tem acesso a ${targetFeature}!`;
  }
}
