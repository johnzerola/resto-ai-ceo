import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

export function useOnboardingStatus() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    isComplete: false,
    currentStep: 0,
    isLoading: true,
    error: null
  });

  const checkStatus = async () => {
    if (!user || !isAuthenticated) {
      setStatus({
        isComplete: false,
        currentStep: 0,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_complete, onboarding_step')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        setStatus({
          isComplete: false,
          currentStep: 0,
          isLoading: false,
          error: error.message
        });
        return;
      }

      setStatus({
        isComplete: data?.onboarding_complete || false,
        currentStep: data?.onboarding_step || 0,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
      setStatus({
        isComplete: false,
        currentStep: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  const updateStep = async (step: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_step: step,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar step do onboarding:', error);
        return false;
      }

      setStatus(prev => ({ ...prev, currentStep: step }));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar step:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_complete: true,
          onboarding_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao completar onboarding:', error);
        return false;
      }

      setStatus(prev => ({ 
        ...prev, 
        isComplete: true, 
        currentStep: 4 
      }));
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      return false;
    }
  };

  const resetOnboarding = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_complete: false,
          onboarding_step: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao resetar onboarding:', error);
        return false;
      }

      setStatus(prev => ({ 
        ...prev, 
        isComplete: false, 
        currentStep: 0 
      }));
      return true;
    } catch (error) {
      console.error('Erro ao resetar onboarding:', error);
      return false;
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user, isAuthenticated]);

  return {
    ...status,
    checkStatus,
    updateStep,
    completeOnboarding,
    resetOnboarding,
    refresh: checkStatus
  };
}