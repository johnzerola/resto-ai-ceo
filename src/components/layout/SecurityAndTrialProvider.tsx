import React, { useEffect } from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useAuth } from '@/contexts/AuthContext';
import { TrialExpirationNotifier } from '@/components/trial/TrialExpirationNotifier';
import { HelmetProvider } from 'react-helmet-async';
import { SEOOptimizations } from '@/components/seo/SEOOptimizations';

interface SecurityAndTrialProviderProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageKeywords?: string;
}

export function SecurityAndTrialProvider({ 
  children, 
  pageTitle,
  pageDescription,
  pageKeywords 
}: SecurityAndTrialProviderProps) {
  const { trialStatus } = useTrialStatus();
  const { user } = useAuth();

  // Enviar notificações automáticas para usuários próximos do vencimento
  useEffect(() => {
    if (!user || !trialStatus) return;

    const sendNotificationIfNeeded = async () => {
      // Verificar se precisa enviar notificação
      if (trialStatus.daysRemaining <= 3 && trialStatus.isTrialActive) {
        try {
          // Chamar edge function para enviar notificações
          const response = await fetch('/api/send-trial-notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.id}`
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              daysRemaining: trialStatus.daysRemaining
            })
          });

          if (response.ok) {
            console.log('Notificação de trial enviada com sucesso');
          }
        } catch (error) {
          console.warn('Erro ao enviar notificação de trial:', error);
        }
      }
    };

    // Enviar notificação com delay para não bloquear a UI
    const timeoutId = setTimeout(sendNotificationIfNeeded, 2000);
    return () => clearTimeout(timeoutId);
  }, [user, trialStatus?.daysRemaining, trialStatus?.isTrialActive]);

  return (
    <HelmetProvider>
      <SEOOptimizations 
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
      
      {/* Notificador de expiração do trial */}
      <TrialExpirationNotifier />
      
      {/* Conteúdo da aplicação */}
      {children}
    </HelmetProvider>
  );
}