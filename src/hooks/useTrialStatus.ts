import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  trialEndDate: string | null;
  planStatus: string;
}

export function useTrialStatus() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkTrialStatus = useCallback(async () => {
    if (!user?.email) {
      setTrialStatus({
        isTrialActive: false,
        daysRemaining: 0,
        trialEndDate: null,
        planStatus: 'guest'
      });
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Verificar diretamente na tabela profiles com trial de 7 dias
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('trial_start, trial_end, plan_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile query failed, using default trial:', profileError);
        // Dar trial padrão para novos usuários - 7 dias
        setTrialStatus({
          isTrialActive: true,
          daysRemaining: 7,
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          planStatus: 'trial'
        });
        return;
      }

      if (profileData?.trial_end) {
        const now = new Date();
        const trialEnd = new Date(profileData.trial_end);
        const isActive = now < trialEnd;
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        setTrialStatus({
          isTrialActive: isActive,
          daysRemaining,
          trialEndDate: profileData.trial_end,
          planStatus: profileData.plan_status || 'trial'
        });
      } else {
        // Novo usuário sem trial configurado - 7 dias
        setTrialStatus({
          isTrialActive: true,
          daysRemaining: 7,
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          planStatus: 'trial'
        });
      }
    } catch (err: any) {
      console.warn('Trial status check failed, using safe defaults:', err);
      // Em caso de erro, dar trial padrão ao usuário - 7 dias
      setTrialStatus({
        isTrialActive: true,
        daysRemaining: 7,
        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        planStatus: 'trial'
      });
      setError(null); // Não propagar erro para a UI
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => {
    checkTrialStatus();
  }, [checkTrialStatus]);

  return {
    trialStatus,
    isLoading,
    error,
    refreshTrialStatus: checkTrialStatus
  };
}