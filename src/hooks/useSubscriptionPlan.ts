
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTrialStatus } from './useTrialStatus';

export enum PlanType {
  BASICO = 'basico',
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
      // Usuário não logado - plano gratuito por padrão com acesso básico
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
          // Trial ativo - dar acesso ao plano básico durante o trial
          planType = PlanType.BASICO;
          status = 'trial';
          console.log('✅ [Subscription] TRIAL ATIVO - Liberando plano básico');
        } else if (subscriberData.subscription_tier && subscriberData.subscribed) {
          const tier = subscriberData.subscription_tier.toLowerCase().trim();
          console.log('🔍 [Subscription] Processando tier:', tier);
          
          if (tier === 'profissional' || tier === 'professional') {
            planType = PlanType.PROFISSIONAL;
            status = 'active';
            console.log('✅ [Subscription] PLANO PROFISSIONAL ativo');
          } else if (tier === 'basico' || tier === 'basic') {
            planType = PlanType.BASICO;
            status = 'active';
            console.log('✅ [Subscription] Plano BÁSICO ativo');
          }
        } else {
          // Usuário registrado mas sem plano ativo - dar 14 dias de trial
          if (!subscriberData.trial_used && !subscriberData.trial_start) {
            console.log('🎁 [Subscription] Iniciando trial de 14 dias para novo usuário');
            
            // Atualizar dados do trial
            const { error: updateError } = await supabase
              .from('subscribers')
              .update({
                plan_status: 'trial',
                trial_start: new Date().toISOString(),
                trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email);
            
            if (!updateError) {
              planType = PlanType.BASICO;
              status = 'trial';
            }
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
        console.log('⚠️ [Subscription] Nenhum registro encontrado - criando trial de 14 dias');
        
        // Criar novo registro com trial
        const { data: newSubscriber, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email,
            subscription_tier: 'free',
            subscribed: true,
            plan_status: 'trial',
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ [Subscription] Erro ao criar trial:', insertError);
          throw insertError;
        }
        
        finalSubscription = {
          id: newSubscriber.id,
          plan_type: PlanType.BASICO,
          status: 'trial',
          expires_at: newSubscriber.subscription_end,
          created_at: newSubscriber.created_at,
          user_id: newSubscriber.user_id,
          email: newSubscriber.email,
          stripe_customer_id: newSubscriber.stripe_customer_id,
          trial_start: newSubscriber.trial_start,
          trial_end: newSubscriber.trial_end,
          trial_used: newSubscriber.trial_used
        };
        
        console.log('🎁 [Subscription] Trial de 14 dias criado com sucesso');
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
          maxRestaurants: -1,
          hasTeamManagement: true,
          hasPrioritySupport: true,
        };
      case PlanType.BASICO:
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

    // Se está em trial ativo, liberar funcionalidades do plano básico
    if (subscription.status === 'trial' || trialStatus?.isTrialActive) {
      const trialFeatures = getPlanFeatures(PlanType.BASICO);
      const hasAccess = feature === 'maxRestaurants' ? trialFeatures.maxRestaurants > 0 : trialFeatures[feature] as boolean;
      console.log(`🎁 [Feature Check] TRIAL ATIVO - ${feature}:`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');
      return hasAccess;
    }

    if (!['active', 'trial'].includes(subscription.status)) {
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
    const featurePlanMap: { [K in keyof PlanFeatures]: PlanType } = {
      hasSimuladorCenarios: PlanType.PROFISSIONAL,
      hasFullAIAssistant: PlanType.PROFISSIONAL,
      hasAdvancedReports: PlanType.BASICO,
      hasInventoryManagement: PlanType.BASICO,
      hasFinancialAnalysis: PlanType.BASICO,
      maxRestaurants: PlanType.BASICO,
      hasTeamManagement: PlanType.PROFISSIONAL,
      hasPrioritySupport: PlanType.PROFISSIONAL,
    };
    
    return featurePlanMap[feature];
  }, []);

  const canAccess = useCallback((requiredPlan: PlanType): boolean => {
    if (!subscription) return false;
    
    // Trial ativo permite acesso ao plano básico
    if (subscription.status === 'trial' || trialStatus?.isTrialActive) {
      const planHierarchy = {
        [PlanType.FREE]: 0,
        [PlanType.BASICO]: 1,
        [PlanType.PROFISSIONAL]: 2
      };
      return planHierarchy[PlanType.BASICO] >= planHierarchy[requiredPlan];
    }
    
    if (!['active', 'trial'].includes(subscription.status)) return false;
    
    const planHierarchy = {
      [PlanType.FREE]: 0,
      [PlanType.BASICO]: 1,
      [PlanType.PROFISSIONAL]: 2
    };
    
    return planHierarchy[subscription.plan_type] >= planHierarchy[requiredPlan];
  }, [subscription, trialStatus]);

  const showUpgradeMessage = useCallback((featureName: string) => {
    const currentPlan = subscription?.plan_type || PlanType.FREE;
    
    if (subscription?.status === 'trial' || trialStatus?.isTrialActive) {
      toast.info(
        `${featureName} está disponível durante seu trial! Trial expira em ${trialStatus?.daysRemaining || 14} dias.`,
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
      targetPlan = 'Básico ou Profissional';
    } else if (currentPlan === PlanType.BASICO) {
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
    setSubscription(null);
    setIsLoading(true);
    setError(null);
    
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
