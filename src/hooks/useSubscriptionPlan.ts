
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
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  expires_at: string | null;
  created_at: string;
  user_id?: string;
  email?: string;
  stripe_customer_id?: string;
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

      console.log('🔍 [Subscription] Verificando plano para usuário:', user.email);

      // Buscar dados do usuário na tabela subscribers por email E user_id
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (subscriberError) {
        console.error('❌ [Subscription] Erro na consulta subscribers:', subscriberError);
        throw new Error(`Erro ao verificar assinatura: ${subscriberError.message}`);
      }

      let finalSubscription: UserSubscription;

      if (subscriberData) {
        console.log('✅ [Subscription] Dados brutos encontrados:', subscriberData);
        
        // Log detalhado dos campos importantes
        console.log('🔍 [Subscription] Análise dos campos:', {
          subscription_tier: subscriberData.subscription_tier,
          subscription_tier_type: typeof subscriberData.subscription_tier,
          plan_status: subscriberData.plan_status,
          plan_status_type: typeof subscriberData.plan_status,
          subscription_end: subscriberData.subscription_end,
          subscription_end_type: typeof subscriberData.subscription_end,
          subscribed: subscriberData.subscribed,
          now: new Date().toISOString()
        });

        // LÓGICA REFINADA: Verificar tier e status
        const hasTier = subscriberData.subscription_tier && 
                        subscriberData.subscription_tier !== null && 
                        subscriberData.subscription_tier.trim() !== '';
        
        let planType = PlanType.FREE;
        let status: 'active' | 'inactive' | 'cancelled' | 'trial' = 'inactive';

        if (hasTier) {
          // Mapear tier para PlanType
          const tier = subscriberData.subscription_tier.toLowerCase().trim();
          console.log('🔍 [Subscription] Tier processado:', tier);
          
          if (tier === 'profissional' || tier === 'professional' || tier === 'pro') {
            planType = PlanType.PROFISSIONAL;
            console.log('✅ [Subscription] Tier mapeado para PROFISSIONAL');
          } else if (tier === 'essencial' || tier === 'essential' || tier === 'basic') {
            planType = PlanType.ESSENCIAL;
            console.log('✅ [Subscription] Tier mapeado para ESSENCIAL');
          } else {
            console.log('⚠️ [Subscription] Tier não reconhecido:', tier);
          }

          // Verificar se está ativo
          const now = new Date();
          const endDate = subscriberData.subscription_end ? new Date(subscriberData.subscription_end) : null;
          const isNotExpired = !endDate || endDate > now;
          const hasActiveStatus = subscriberData.plan_status === 'active';
          
          console.log('🔍 [Subscription] Verificação de ativação:', {
            now: now.toISOString(),
            endDate: endDate?.toISOString(),
            isNotExpired,
            hasActiveStatus,
            plan_status: subscriberData.plan_status
          });
          
          if (isNotExpired && hasActiveStatus) {
            status = 'active';
            console.log('✅ [Subscription] Status definido como ACTIVE');
          } else {
            console.log('❌ [Subscription] Status definido como INACTIVE - motivo:', {
              expired: !isNotExpired,
              inactiveStatus: !hasActiveStatus
            });
          }
        } else {
          console.log('❌ [Subscription] Nenhum tier válido encontrado');
        }

        finalSubscription = {
          id: subscriberData.id,
          plan_type: planType,
          status: status,
          expires_at: subscriberData.subscription_end,
          created_at: subscriberData.created_at,
          user_id: subscriberData.user_id,
          email: subscriberData.email,
          stripe_customer_id: subscriberData.stripe_customer_id
        };

        console.log(`🎯 [Subscription] RESULTADO FINAL:`, {
          plan_type: finalSubscription.plan_type,
          status: finalSubscription.status,
          expires_at: finalSubscription.expires_at
        });
      } else {
        console.log('⚠️ [Subscription] Usuário sem registro na tabela subscribers - aplicando plano gratuito');
        
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
  }, [user]);

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

    if (subscription.status !== 'active') {
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
  }, [subscription, getPlanFeatures]);

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
    if (!subscription || subscription.status !== 'active') return false;
    
    const planHierarchy = {
      [PlanType.FREE]: 0,
      [PlanType.ESSENCIAL]: 1,
      [PlanType.PROFISSIONAL]: 2
    };
    
    return planHierarchy[subscription.plan_type] >= planHierarchy[requiredPlan];
  }, [subscription]);

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
    refreshSubscription
  };
}
