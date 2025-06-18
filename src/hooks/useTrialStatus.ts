
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
      setTrialStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('check_trial_status', {
        user_email: user.email
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const status = data[0];
        setTrialStatus({
          isTrialActive: status.is_trial_active,
          daysRemaining: status.days_remaining,
          trialEndDate: status.trial_end_date,
          planStatus: status.plan_status
        });
      } else {
        setTrialStatus({
          isTrialActive: false,
          daysRemaining: 0,
          trialEndDate: null,
          planStatus: 'not_found'
        });
      }
    } catch (err: any) {
      console.error('Erro ao verificar status do trial:', err);
      setError(err.message);
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
