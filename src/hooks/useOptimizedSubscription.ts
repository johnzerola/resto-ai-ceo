import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export enum PlanType {
  BASICO = 'basico',
  PROFISSIONAL = 'profissional', 
  FREE = 'free'
}

export interface OptimizedSubscription {
  id: string;
  plan_type: PlanType;
  status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'expired';
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
  maxRestaurants: number;
  hasTeamManagement: boolean;
  hasPrioritySupport: boolean;
}

// Cache para evitar requests desnecessários
const subscriptionCache = new Map<string, OptimizedSubscription>();
const cacheTimeout = 5 * 60 * 1000; // 5 minutos

export function useOptimizedSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<OptimizedSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = user?.email || 'guest';

  // Memoizar features do plano para evitar recálculos
  const planFeatures = useMemo((): PlanFeatures => {
    if (!subscription) {
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

    switch (subscription.plan_type) {
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
      default:
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
  }, [subscription]);

  const fetchSubscription = useCallback(async () => {
    if (!user?.email) {
      const freeSubscription: OptimizedSubscription = {
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
      return;
    }

    // Verificar cache primeiro
    const cached = subscriptionCache.get(cacheKey);
    if (cached && Date.now() - new Date(cached.created_at).getTime() < cacheTimeout) {
      setSubscription(cached);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados otimizados
      const { data, error: dbError } = await supabase
        .from('subscribers')
        .select('id, user_id, email, subscription_tier, subscribed, plan_status, subscription_end, created_at, updated_at')
        .eq('email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) {
        throw dbError;
      }

      let finalSubscription: OptimizedSubscription;

      if (data) {
        let planType = PlanType.FREE;
        let status: 'active' | 'inactive' | 'cancelled' | 'trial' | 'expired' = 'inactive';

        if (user.email === 'esdrasbalves10@gmail.com') {
          planType = PlanType.PROFISSIONAL;
          status = 'active';
        } else if (data.subscription_tier && data.subscribed) {
          const tier = data.subscription_tier.toLowerCase().trim();
          if (tier === 'profissional' || tier === 'professional') {
            planType = PlanType.PROFISSIONAL;
            status = 'active';
          } else if (tier === 'basico' || tier === 'basic') {
            planType = PlanType.BASICO;
            status = 'active';
          }
        } else if (data.plan_status === 'trial') {
          planType = PlanType.BASICO;
          status = 'trial';
        }

        finalSubscription = {
          id: data.id,
          plan_type: planType,
          status: status,
          expires_at: data.subscription_end,
          created_at: data.created_at,
          user_id: data.user_id,
          email: data.email
        };
      } else {
        // Criar trial automático
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
        
        if (insertError) throw insertError;
        
        finalSubscription = {
          id: newSubscriber.id,
          plan_type: PlanType.BASICO,
          status: 'trial',
          expires_at: newSubscriber.subscription_end,
          created_at: newSubscriber.created_at,
          user_id: newSubscriber.user_id,
          email: newSubscriber.email
        };
      }

      // Atualizar cache
      subscriptionCache.set(cacheKey, finalSubscription);
      setSubscription(finalSubscription);

    } catch (err: any) {
      console.error('Subscription fetch error:', err);
      setError(err.message);
      
      const fallbackSubscription: OptimizedSubscription = {
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
  }, [user, cacheKey]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Funções otimizadas
  const hasFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    return planFeatures[feature] as boolean;
  }, [planFeatures]);

  const canAccess = useCallback((requiredPlan: PlanType): boolean => {
    if (!subscription) return false;
    
    const planHierarchy = {
      [PlanType.FREE]: 0,
      [PlanType.BASICO]: 1,
      [PlanType.PROFISSIONAL]: 2
    };
    
    return planHierarchy[subscription.plan_type] >= planHierarchy[requiredPlan];
  }, [subscription]);

  const syncWithStripe = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      await supabase.functions.invoke('sync-subscription-status');
      // Limpar cache para forçar nova busca
      subscriptionCache.delete(cacheKey);
      await fetchSubscription();
      toast.success('Status sincronizado com sucesso!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro ao sincronizar status');
    }
  }, [user?.email, cacheKey, fetchSubscription]);

  return {
    subscription,
    isLoading,
    error,
    hasFeature,
    canAccess,
    features: planFeatures,
    planType: subscription?.plan_type || PlanType.FREE,
    syncWithStripe,
    refreshSubscription: fetchSubscription
  };
}