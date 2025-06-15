
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanService, Plan, PlanFeatures } from '@/services/PlanService';
import { IAUsageService } from '@/services/IAUsageService';
import { N8nWebhookService } from '@/services/N8nWebhookService';

export function useEnhancedSubscriptionPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserPlan();
      loadDailyUsage();
    } else {
      // Usuário não logado - usar plano gratuito
      loadFreePlan();
    }
  }, [user]);

  const loadUserPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const userPlan = await PlanService.getUserPlan(user.id);
      setPlan(userPlan);
    } catch (err) {
      console.error('Erro ao carregar plano do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para plano gratuito em caso de erro
      const freePlan = await PlanService.getPlanById('free');
      setPlan(freePlan);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFreePlan = async () => {
    try {
      setIsLoading(true);
      const freePlan = await PlanService.getPlanById('free');
      setPlan(freePlan);
    } catch (err) {
      console.error('Erro ao carregar plano gratuito:', err);
      setError('Erro ao carregar configurações do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyUsage = async () => {
    if (!user?.id) return;

    try {
      const usage = await IAUsageService.getUserDailyUsage(user.id);
      setDailyUsage(usage);
    } catch (err) {
      console.error('Erro ao carregar uso diário:', err);
    }
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (!plan) return false;
    return PlanService.hasFeature(plan, feature);
  };

  const getLimit = (limitType: keyof import('@/services/PlanService').PlanLimits): number => {
    if (!plan) return 0;
    return PlanService.getLimit(plan, limitType);
  };

  const canAccess = (requiredPlan: string): boolean => {
    if (!plan) return false;
    return PlanService.canAccess(plan, requiredPlan);
  };

  const checkAILimit = async (): Promise<boolean> => {
    if (!plan || !user?.id) return false;
    
    const aiLimit = getLimit('aiMessages');
    return await IAUsageService.checkUserLimit(user.id, aiLimit);
  };

  const recordAIUsage = async (tokensUsed: number = 0, featureUsed?: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const success = await IAUsageService.recordUsage(user.id, tokensUsed, 1, featureUsed);
    
    // Verificar se atingiu limite e disparar webhook se necessário
    if (success && plan) {
      const aiLimit = getLimit('aiMessages');
      const currentUsage = await IAUsageService.getUserDailyUsage(user.id);
      
      if (currentUsage && aiLimit > 0 && currentUsage.messages_sent >= aiLimit) {
        await N8nWebhookService.triggerUsageLimitReached(
          user.id,
          user.email || '',
          'aiMessages',
          currentUsage.messages_sent,
          aiLimit
        );
      }
    }
    
    return success;
  };

  const upgradePlan = async (newPlanId: string): Promise<boolean> => {
    if (!user?.id || !plan) return false;

    try {
      const success = await PlanService.updateUserPlan(user.id, newPlanId);
      
      if (success) {
        // Disparar webhook de upgrade
        await N8nWebhookService.triggerPlanUpgrade(
          user.id,
          user.email || '',
          plan.plan_id,
          newPlanId
        );
        
        // Recarregar dados do plano
        await loadUserPlan();
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao fazer upgrade do plano:', error);
      return false;
    }
  };

  const downgradePlan = async (newPlanId: string): Promise<boolean> => {
    if (!user?.id || !plan) return false;

    try {
      const success = await PlanService.updateUserPlan(user.id, newPlanId);
      
      if (success) {
        // Disparar webhook de downgrade
        await N8nWebhookService.triggerPlanDowngrade(
          user.id,
          user.email || '',
          plan.plan_id,
          newPlanId
        );
        
        // Recarregar dados do plano
        await loadUserPlan();
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao fazer downgrade do plano:', error);
      return false;
    }
  };

  const planType = plan?.plan_id || 'free';

  return {
    plan,
    planType,
    isLoading,
    error,
    dailyUsage,
    hasFeature,
    getLimit,
    canAccess,
    checkAILimit,
    recordAIUsage,
    upgradePlan,
    downgradePlan,
    refreshPlan: loadUserPlan,
    refreshUsage: loadDailyUsage
  };
}
