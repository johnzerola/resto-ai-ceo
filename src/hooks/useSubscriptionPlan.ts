
import { useState, useEffect } from 'react';
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
}

export interface PlanFeatures {
  hasSimuladorCenarios: boolean;
  hasFullAIAssistant: boolean;
  hasAdvancedReports: boolean;
  hasInventoryManagement: boolean;
  hasFinancialAnalysis: boolean;
}

export function useSubscriptionPlan() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSubscription(data);
      } else {
        // Usuário sem assinatura ativa - considerar plano gratuito
        setSubscription({
          id: 'free',
          plan_type: PlanType.FREE,
          status: 'active',
          expires_at: null,
          created_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar assinatura:', err);
      setError(err.message);
      // Em caso de erro, assumir plano gratuito
      setSubscription({
        id: 'free',
        plan_type: PlanType.FREE,
        status: 'active',
        expires_at: null,
        created_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanFeatures = (planType: PlanType): PlanFeatures => {
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
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (!subscription) return false;
    const features = getPlanFeatures(subscription.plan_type);
    return features[feature];
  };

  const requiresUpgrade = (feature: keyof PlanFeatures): boolean => {
    return !hasFeature(feature);
  };

  const showUpgradeMessage = (featureName: string) => {
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
  };

  return {
    subscription,
    isLoading,
    error,
    hasFeature,
    requiresUpgrade,
    showUpgradeMessage,
    features: subscription ? getPlanFeatures(subscription.plan_type) : null,
    planType: subscription?.plan_type || PlanType.FREE,
    refreshSubscription: fetchUserSubscription
  };
}
