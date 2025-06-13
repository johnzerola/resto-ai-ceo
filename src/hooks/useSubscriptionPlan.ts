
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum PlanType {
  ESSENCIAL = 'essencial',
  PROFISSIONAL = 'profissional',
  FREE = 'free'
}

export interface UserSubscription {
  id: string;
  plan_type: PlanType;
  status: 'active' | 'inactive' | 'cancelled';
  expires_at: string | null;
  created_at: string;
  user_id?: string;
  email?: string;
}

export interface PlanFeatures {
  hasSimuladorCenarios: boolean;
  hasFullAIAssistant: boolean;
  hasAdvancedReports: boolean;
  hasInventoryManagement: boolean;
  hasFinancialAnalysis: boolean;
}

// Cache para evitar múltiplas consultas
let subscriptionCache: { [userId: string]: UserSubscription } = {};
let lastFetch: { [userId: string]: number } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useSubscriptionPlan() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapSubscriberToSubscription = useCallback((subscriberData: any): UserSubscription => {
    const planMapping: { [key: string]: PlanType } = {
      'professional': PlanType.PROFISSIONAL,
      'profissional': PlanType.PROFISSIONAL,
      'essencial': PlanType.ESSENCIAL,
      'essential': PlanType.ESSENCIAL
    };

    return {
      id: subscriberData.id,
      plan_type: planMapping[subscriberData.subscription_tier?.toLowerCase()] || PlanType.ESSENCIAL,
      status: subscriberData.subscribed ? 'active' : 'inactive',
      expires_at: subscriberData.subscription_end,
      created_at: subscriberData.created_at,
      user_id: subscriberData.user_id,
      email: subscriberData.email
    };
  }, []);

  const fetchUserSubscription = useCallback(async (skipCache = false) => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Verificar cache primeiro
    const now = Date.now();
    if (!skipCache && subscriptionCache[user.id] && (now - (lastFetch[user.id] || 0)) < CACHE_DURATION) {
      console.log('🎯 [Subscription] Usando dados do cache para:', user.email);
      setSubscription(subscriptionCache[user.id]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [Subscription] Buscando dados para usuário:', user.email);

      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('❌ [Subscription] Erro na consulta:', subscriberError);
        throw new Error(`Erro ao consultar assinatura: ${subscriberError.message}`);
      }

      let finalSubscription: UserSubscription;

      if (subscriberData && subscriberData.subscribed) {
        console.log('✅ [Subscription] Assinatura ativa encontrada:', subscriberData);
        finalSubscription = mapSubscriberToSubscription(subscriberData);
      } else {
        console.log('⚠️ [Subscription] Usuário sem assinatura ativa, aplicando plano gratuito');
        finalSubscription = {
          id: 'free',
          plan_type: PlanType.FREE,
          status: 'active',
          expires_at: null,
          created_at: new Date().toISOString(),
          user_id: user.id,
          email: user.email || ''
        };
      }

      // Atualizar cache
      subscriptionCache[user.id] = finalSubscription;
      lastFetch[user.id] = now;

      console.log('🎯 [Subscription] Plano definido:', finalSubscription.plan_type);
      setSubscription(finalSubscription);

    } catch (err: any) {
      console.error('💥 [Subscription] Erro crítico:', err);
      setError('Estamos com instabilidade técnica ao acessar os dados. Tente novamente em instantes ou contate nosso suporte.');
      
      // Fallback para plano gratuito em caso de erro
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
  }, [user, mapSubscriberToSubscription]);

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
        };
      case PlanType.ESSENCIAL:
        return {
          hasSimuladorCenarios: false,
          hasFullAIAssistant: false,
          hasAdvancedReports: true,
          hasInventoryManagement: true,
          hasFinancialAnalysis: true,
        };
      default: // FREE
        return {
          hasSimuladorCenarios: false,
          hasFullAIAssistant: false,
          hasAdvancedReports: false,
          hasInventoryManagement: false,
          hasFinancialAnalysis: false,
        };
    }
  }, []);

  const hasFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    if (!subscription) {
      console.log('🔒 [Feature Check] Sem assinatura, negando acesso a:', feature);
      return false;
    }

    if (subscription.status !== 'active') {
      console.log('🔒 [Feature Check] Assinatura inativa, negando acesso a:', feature);
      return false;
    }

    const features = getPlanFeatures(subscription.plan_type);
    const hasAccess = features[feature];
    console.log(`🔍 [Feature Check] ${feature} para plano ${subscription.plan_type}:`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');
    return hasAccess;
  }, [subscription, getPlanFeatures]);

  const requiresUpgrade = useCallback((feature: keyof PlanFeatures): boolean => {
    return !hasFeature(feature);
  }, [hasFeature]);

  const showUpgradeMessage = useCallback((featureName: string) => {
    const currentPlan = subscription?.plan_type || PlanType.FREE;
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
  }, [subscription]);

  const refreshSubscription = useCallback(() => {
    console.log('🔄 [Subscription] Forçando atualização dos dados...');
    return fetchUserSubscription(true);
  }, [fetchUserSubscription]);

  return {
    subscription,
    isLoading,
    error,
    hasFeature,
    requiresUpgrade,
    showUpgradeMessage,
    features: subscription ? getPlanFeatures(subscription.plan_type) : null,
    planType: subscription?.plan_type || PlanType.FREE,
    refreshSubscription
  };
}
