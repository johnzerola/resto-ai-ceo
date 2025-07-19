import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function SubscriptionSync() {
  const { user } = useAuth();

  useEffect(() => {
    const syncSubscription = async () => {
      if (!user?.email) return;

      try {
        // Verificar se houve pagamento bem-sucedido
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment') === 'success';
        const welcomeParam = urlParams.get('welcome') === 'true';
        const planParam = urlParams.get('plan');

        if (paymentSuccess || welcomeParam) {
          // Sincronizar status após pagamento
          const { data, error } = await supabase.functions.invoke('sync-subscription-status');
          
          if (!error && data?.subscription?.subscribed) {
            toast.success('Pagamento confirmado! Seu plano foi ativado.', {
              description: `Bem-vindo ao plano ${planParam || 'premium'}!`,
              duration: 6000
            });
            
            // Limpar parâmetros da URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      } catch (error) {
        console.error('Erro ao sincronizar assinatura:', error);
      }
    };

    syncSubscription();
  }, [user]);

  return null; // Componente invisível
}