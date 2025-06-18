
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTrialStatus } from './useTrialStatus';

export enum PlanType {
  ESSENCIAL = 'essencial',
  PROFISSIONAL = 'profissional', 
  FREE = 'free'
}

export interface UserSubscription {
  id: string;
  plan_type: PlanType;
  status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'expired';
  expires_at: string | null;
  created_at: string;
  user_id?: string;
  email?: string;
  stripe_customer_id?: string;
  trial_start?: string;
  trial_end?: string;
  trial_used?: boolean;
}

export interface PlanFeatures {
  hasSimuladorCenarios: boolean;
  hasFullAIAssistant: boolean;
  hasAdvancedReports: boolean;
  hasInventoryManagement: boolean;
  hasFinancialAnalysis: boolean;
  maxRestaurants: number;
  hasTeamManagement: boolean;
  hasPrioritySupport: boolean;
}

export function useSubscriptionPlan() {
  const { user } = useAuth();
  const { trialStatus } = useTrialStatus();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubscription = useCallback(async () => {
    if (!user?.id) {
      // Usuário não logado - plano gratuito por padrão
      const freeSubscription: UserSubscription = {
        id: 'free-guest',
        plan_type: PlanType.FREE,
        status: 'active',
        expires_at: null,
        created_at: new Date().toISOString(),
        user_id: '',
        email: ''
      };
      setSubscription(freeSubscription);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [Subscription] Buscando plano para usuário:', user.email);

      // Buscar dados do usuário na tabela subscribers por email
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriberError) {
        console.error('❌ [Subscription] Erro na consulta subscribers:', subscriberError);
        throw new Error(`Erro ao verificar assinatura: ${subscriberError.message}`);
      }

      let finalSubscription: UserSubscription;

      if (subscriberData) {
        console.log('✅ [Subscription] Dados encontrados:', subscriberData);
        
        // Determinar o plano baseado no trial status e subscription tier
        let planType = PlanType.FREE;
        let status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'expired' = 'inactive';

        // Verificação específica para emails especiais
        if (user.email === 'esdrasbalves10@gmail.com') {
          planType = PlanType.PROFISSIONAL;
          status = 'active';
          console.log('🎯 [Subscription] USUÁRIO ESPECÍFICO - FORÇANDO PLANO PROFISSIONAL');
        } else if (trialStatus?.isTrialActive) {
          // Trial ativo - liberar recursos baseado no tier ou dar acesso básico
          planType = subscriberData.subscription_tier === 'profissional' ? PlanType.PROFISSIONAL : PlanType.ESSENCIAL;
          status = 'trial';
          console.log('✅ [Subscription] TRIAL ATIVO - Plano liberado:', planType);
        } else if (subscriberData.subscription_tier) {
          const tier = subscriberData.subscription_tier.toLowerCase().trim();
          console.log('🔍 [Subscription] Processando tier:', tier);
          
          if (tier === 'profissional' || tier === 'professional') {
            planType = PlanType.PROFISSIONAL;
            status = subscriberData.subscribed ? 'active' : 'inactive';
            console.log('✅ [Subscription] PLANO PROFISSIONAL identificado');
          } else if (tier === 'essencial' || tier === 'essential') {
            planType = PlanType.ESSENCIAL;
            status = subscriberData.subscribed ? 'active' : 'inactive';
            console.log('✅ [Subscription] Plano ESSENCIAL identificado');
          }
        }

        finalSubscription = {
          id: subscriberData.id,
          plan_type: planType,
          status: status,
          expires_at: subscriberData.subscription_end,
          created_at: subscriberData.created_at,
          user_id: subscriberData.user_id,
          email: subscriberData.email,
          stripe_customer_id: subscriberData.stripe_customer_id,
          trial_start: subscriberData.trial_start,
          trial_end: subscriberData.trial_end,
          trial_used: subscriberData.trial_used
        };

        console.log('🎯 [Subscription] RESULTADO FINAL:', {
          plan_type: finalSubscription.plan_type,
          status: finalSubscription.status,
          expires_at: finalSubscription.expires_at,
          email: user.email,
          trial_active: trialStatus?.isTrialActive
        });
      } else {
        console.log('⚠️ [Subscription] Nenhum registro encontrado - aplicando plano gratuito');
        
        finalSubscription = {
          id: 'free-user',
          plan_type: PlanType.FREE,
          status: 'active',
          expires_at: null,
          created_at: new Date().toISOString(),
          user_id: user.id,
          email: user.email || ''
        };
      }

      setSubscription(finalSubscription);

    } catch (err: any) {
      console.error('💥 [Subscription] Erro crítico:', err);
      setError(err.message || 'Erro ao verificar plano de assinatura');
      
      // Em caso de erro, aplicar plano gratuito como fallback
      const fallbackSubscription: UserSubscription = {
        id: 'free-error',
        plan_type: PlanType.FREE,
        status: 'active',
        expires_at: null,
        created_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email || ''
      };
      setSubscription(fallbackSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [user, trialStatus]);

  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  const getPlanFeatures = useCallback((planType: PlanType): PlanFeatures => {
    switch (planType) {
      case PlanType.PROFISSIONAL:
        return {
          hasSimuladorCenarios: true,
          hasFullAIAssistant: true,
          hasAdvancedReports: true,
          hasInventoryManagement: true,
          hasFinancialAnalysis: true,
          maxRestaurants: 5,
          hasTeamManagement: true,
          hasPrioritySupport: true,
        };
      case PlanType.ESSENCIAL:
        return {
          hasSimuladorCenarios: false,
          hasFullAIAssistant: false,
          hasAdvancedReports: true,
          hasInventoryManagement: true,
          hasFinancialAnalysis: true,
          maxRestaurants: 2,
          hasTeamManagement: false,
          hasPrioritySupport: false,
        };
      default: // FREE
        return {
          hasSimuladorCenarios: false,
          hasFullAIAssistant: false,
          hasAdvancedReports: false,
          hasInventoryManagement: false,
          hasFinancialAnalysis: false,
          maxRestaurants: 1,
          hasTeamManagement: false,
          hasPrioritySupport: false,
        };
    }
  }, []);

  const hasFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    if (!subscription) {
      console.log('🔒 [Feature Check] Sem assinatura, negando acesso a:', feature);
      return false;
    }

    // Se está em trial ativo, liberar mais funcionalidades
    if (trialStatus?.isTrialActive) {
      const trialFeatures = getPlanFeatures(PlanType.ESSENCIAL); // Trial tem acesso ao essencial
      const hasAccess = feature === 'maxRestaurants' ? trialFeatures.maxRestaurants > 0 : trialFeatures[feature] as boolean;
      console.log(`🎁 [Feature Check] TRIAL ATIVO - ${feature}:`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');
      return hasAccess;
    }

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      console.log('🔒 [Feature Check] Assinatura inativa, negando acesso a:', feature);
      return false;
    }

    const features = getPlanFeatures(subscription.plan_type);
    
    // Handle maxRestaurants specially since it's a number
    if (feature === 'maxRestaurants') {
      const hasAccess = features.maxRestaurants > 0;
      console.log(`🔍 [Feature Check] ${feature} para plano ${subscription.plan_type}:`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');
      return hasAccess;
    }
    
    const hasAccess = features[feature] as boolean;
    
    console.log(`🔍 [Feature Check] ${feature} para plano ${subscription.plan_type}:`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');
    return hasAccess;
  }, [subscription, getPlanFeatures, trialStatus]);

  const requiresUpgrade = useCallback((feature: keyof PlanFeatures): boolean => {
    return !hasFeature(feature);
  }, [hasFeature]);

  const getRequiredPlan = useCallback((feature: keyof PlanFeatures): PlanType => {
    // Mapear quais funcionalidades requerem qual plano
    const featurePlanMap: { [K in keyof PlanFeatures]: PlanType } = {
      hasSimuladorCenarios: PlanType.PROFISSIONAL,
      hasFullAIAssistant: PlanType.PROFISSIONAL,
      hasAdvancedReports: PlanType.ESSENCIAL,
      hasInventoryManagement: PlanType.ESSENCIAL,
      hasFinancialAnalysis: PlanType.ESSENCIAL,
      maxRestaurants: PlanType.ESSENCIAL,
      hasTeamManagement: PlanType.PROFISSIONAL,
      hasPrioritySupport: PlanType.PROFISSIONAL,
    };
    
    return featurePlanMap[feature];
  }, []);

  const canAccess = useCallback((requiredPlan: PlanType): boolean => {
    if (!subscription) return false;
    
    // Trial ativo permite acesso ao plano essencial
    if (trialStatus?.isTrialActive) {
      const planHierarchy = {
        [PlanType.FREE]: 0,
        [PlanType.ESSENCIAL]: 1,
        [PlanType.PROFISSIONAL]: 2
      };
      return planHierarchy[PlanType.ESSENCIAL] >= planHierarchy[requiredPlan];
    }
    
    if (subscription.status !== 'active' && subscription.status !== 'trial') return false;
    
    const planHierarchy = {
      [PlanType.FREE]: 0,
      [PlanType.ESSENCIAL]: 1,
      [PlanType.PROFISSIONAL]: 2
    };
    
    return planHierarchy[subscription.plan_type] >= planHierarchy[requiredPlan];
  }, [subscription, trialStatus]);

  const showUpgradeMessage = useCallback((featureName: string) => {
    const currentPlan = subscription?.plan_type || PlanType.FREE;
    
    if (trialStatus?.isTrialActive) {
      toast.info(
        `${featureName} estará disponível durante seu trial! Trial expira em ${trialStatus.daysRemaining} dias.`,
        {
          duration: 5000,
          action: {
            label: 'Ver Planos',
            onClick: () => window.location.href = '/assinatura'
          }
        }
      );
      return;
    }
    
    let targetPlan = '';
    
    if (currentPlan === PlanType.FREE) {
      targetPlan = 'Essencial ou Profissional';
    } else if (currentPlan === PlanType.ESSENCIAL) {
      targetPlan = 'Profissional';
    }

    toast.error(
      `${featureName} não está disponível no seu plano atual. Faça upgrade para o plano ${targetPlan} para ter acesso completo.`,
      {
        duration: 5000,
        action: {
          label: 'Ver Planos',
          onClick: () => window.location.href = '/assinatura'
        }
      }
    );
  }, [subscription, trialStatus]);

  const refreshSubscription = useCallback(() => {
    console.log('🔄 [Subscription] Forçando atualização TOTAL dos dados...');
    // Limpar subscription atual
    setSubscription(null);
    setIsLoading(true);
    setError(null);
    
    // Forçar nova busca
    return fetchUserSubscription();
  }, [fetchUserSubscription]);

  return {
    subscription,
    isLoading,
    error,
    hasFeature,
    requiresUpgrade,
    getRequiredPlan,
    canAccess,
    showUpgradeMessage,
    features: subscription ? getPlanFeatures(subscription.plan_type) : null,
    planType: subscription?.plan_type || PlanType.FREE,
    refreshSubscription,
    trialStatus
  };
}
