
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

      const { data, error } = await supabase.rpc('check_trial_status', {
        user_email: user.email
      });

      if (error) {
        console.warn('RPC check_trial_status failed, using fallback:', error);
        // Fallback: verificar diretamente na tabela subscribers
        const { data: subscriberData, error: subError } = await supabase
          .from('subscribers')
          .select('trial_start, trial_end, trial_used, plan_status')
          .eq('email', user.email)
          .maybeSingle();

        if (subError) {
          console.warn('Subscriber query failed, using default trial:', subError);
          // Dar trial padrão para novos usuários
          setTrialStatus({
            isTrialActive: true,
            daysRemaining: 14,
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            planStatus: 'trial'
          });
          return;
        }

        if (subscriberData?.trial_end) {
          const now = new Date();
          const trialEnd = new Date(subscriberData.trial_end);
          const isActive = now < trialEnd;
          const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

          setTrialStatus({
            isTrialActive: isActive,
            daysRemaining,
            trialEndDate: subscriberData.trial_end,
            planStatus: subscriberData.plan_status || 'trial'
          });
        } else {
          // Novo usuário sem trial configurado
          setTrialStatus({
            isTrialActive: true,
            daysRemaining: 14,
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            planStatus: 'trial'
          });
        }
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setTrialStatus({
          isTrialActive: status.is_trial_active || false,
          daysRemaining: status.days_remaining || 0,
          trialEndDate: status.trial_end_date,
          planStatus: status.plan_status || 'free'
        });
      } else {
        // Trial padrão para novos usuários
        setTrialStatus({
          isTrialActive: true,
          daysRemaining: 14,
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          planStatus: 'trial'
        });
      }
    } catch (err: any) {
      console.warn('Trial status check failed, using safe defaults:', err);
      // Em caso de erro, dar trial padrão ao usuário
      setTrialStatus({
        isTrialActive: true,
        daysRemaining: 14,
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        planStatus: 'trial'
      });
      setError(null); // Não propagar erro para a UI
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

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
