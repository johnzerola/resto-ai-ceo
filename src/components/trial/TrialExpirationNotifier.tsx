import React, { useEffect, useState } from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function TrialExpirationNotifier() {
  const { trialStatus } = useTrialStatus();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!trialStatus || !user) return;

    // Notificações automáticas por toast
    if (trialStatus.daysRemaining === 3 && !dismissed) {
      toast.warning('Seu trial expira em 3 dias!', {
        description: 'Assine agora para continuar usando todas as funcionalidades.',
        duration: 10000,
        action: {
          label: 'Ver Planos',
          onClick: () => window.location.href = '/assinatura'
        }
      });
    }

    if (trialStatus.daysRemaining === 1 && !dismissed) {
      toast.error('Seu trial expira AMANHÃ!', {
        description: 'Última chance! Assine agora para não perder acesso.',
        duration: 15000,
        action: {
          label: 'Assinar Agora',
          onClick: () => window.location.href = '/assinatura'
        }
      });
    }

    if (trialStatus.daysRemaining === 0 && trialStatus.planStatus === 'trial_expired') {
      toast.error('Seu trial expirou!', {
        description: 'Assine um plano para reativar sua conta.',
        duration: 0, // Não remove automaticamente
        action: {
          label: 'Assinar',
          onClick: () => window.location.href = '/assinatura'
        }
      });
    }
  }, [trialStatus?.daysRemaining, trialStatus?.planStatus, user, dismissed]);

  if (!trialStatus || !user) return null;

  // Não mostrar se já foi dispensado ou se não está no trial
  if (dismissed || !trialStatus.isTrialActive) return null;

  // Só mostrar nos últimos 3 dias do trial
  if (trialStatus.daysRemaining > 3) return null;

  const getAlertVariant = () => {
    if (trialStatus.daysRemaining <= 1) return 'destructive';
    if (trialStatus.daysRemaining <= 3) return 'warning';
    return 'default';
  };

  const getIcon = () => {
    if (trialStatus.daysRemaining <= 1) return AlertTriangle;
    return Clock;
  };

  const Icon = getIcon();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className={`border-2 ${
        trialStatus.daysRemaining <= 1 
          ? 'border-red-500 bg-red-50 text-red-900' 
          : 'border-amber-500 bg-amber-50 text-amber-900'
      }`}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <div>
            <strong>
              {trialStatus.daysRemaining === 0 
                ? 'Trial expirado!' 
                : `Trial expira em ${trialStatus.daysRemaining} dia${trialStatus.daysRemaining > 1 ? 's' : ''}!`
              }
            </strong>
            <p className="text-sm mt-1">
              {trialStatus.daysRemaining === 0
                ? 'Assine um plano para continuar usando o sistema.'
                : 'Assine agora para não perder acesso às funcionalidades.'
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link to="/assinatura">
                <Crown className="h-3 w-3 mr-1" />
                Assinar
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDismissed(true)}
              className="px-2"
            >
              ✕
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}