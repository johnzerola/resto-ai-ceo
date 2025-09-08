
import { PlanType } from '@/hooks/useSubscriptionPlan';

export const PLAN_LIMITS = {
  [PlanType.FREE]: {
    maxRestaurants: 1,
    maxMenuItems: 10,
    maxCashFlowEntries: 50,
    maxTeamMembers: 1,
    features: ['basic_reports']
  },
  'basico': {
    maxRestaurants: 2,
    maxMenuItems: 100,
    maxCashFlowEntries: 500,
    maxTeamMembers: 3,
    features: ['basic_reports', 'inventory_management', 'cash_flow', 'basic_dre_cmv']
  },
  [PlanType.PROFISSIONAL]: {
    maxRestaurants: -1, // ilimitado
    maxMenuItems: -1, // ilimitado
    maxCashFlowEntries: -1, // ilimitado
    maxTeamMembers: 10,
    features: ['all']
  }
} as const;

export function getPlanDisplayName(planType: string): string {
  switch (planType) {
    case PlanType.PROFISSIONAL:
    case 'profissional':
      return 'Profissional';
    case 'basico':
      return 'Básico';
    case PlanType.FREE:
    default:
      return 'Gratuito';
  }
}

export function getPlanColor(planType: string): string {
  switch (planType) {
    case PlanType.PROFISSIONAL:
    case 'profissional':
      return 'text-purple-600 bg-purple-100';
    case 'basico':
      return 'text-blue-600 bg-blue-100';
    case PlanType.FREE:
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function checkUsageLimit(
  planType: string, 
  limitType: keyof typeof PLAN_LIMITS[PlanType], 
  currentUsage: number
): { allowed: boolean; limit: number; usage: number } {
  const limits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS] || PLAN_LIMITS[PlanType.FREE];
  const limit = limits[limitType];
  const allowed = limit === -1 || currentUsage < (limit as number);
  
  return {
    allowed,
    limit: limit as number,
    usage: currentUsage
  };
}

export function getUpgradeMessage(currentPlan: string, targetFeature: string): string {
  switch (currentPlan) {
    case PlanType.FREE:
      return `${targetFeature} está disponível nos planos Básico e Profissional. Faça upgrade para ter acesso!`;
    case 'basico':
      return `${targetFeature} está disponível no plano Profissional. Faça upgrade para ter acesso completo!`;
    default:
      return `Você já tem acesso a ${targetFeature}!`;
  }
}
