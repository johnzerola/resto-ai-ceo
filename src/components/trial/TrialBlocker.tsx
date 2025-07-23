import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrialBlockerProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  critical?: boolean; // Para funcionalidades críticas que devem ser bloqueadas imediatamente
}

export function TrialBlocker({ 
  children, 
  featureName, 
  description,
  critical = false 
}: TrialBlockerProps) {
  const { trialStatus } = useTrialStatus();
  const { planType } = useSubscriptionPlan();

  // Verificar se o usuário tem acesso
  const hasAccess = () => {
    // Planos pagos sempre têm acesso
    if (planType && planType !== 'free') {
      return true;
    }

    // Se não tem status do trial, dar acesso (fallback)
    if (!trialStatus) {
      return true;
    }

    // Trial expirado = sem acesso
    if (trialStatus.planStatus === 'trial_expired' || 
        trialStatus.planStatus === 'expired' ||
        !trialStatus.isTrialActive) {
      return false;
    }

    // Trial ativo = tem acesso
    if (trialStatus.isTrialActive) {
      return true;
    }

    return false;
  };

  // Se tem acesso, mostrar o conteúdo
  if (hasAccess()) {
    return <>{children}</>;
  }

  // Bloquear acesso - trial expirado
  return (
    <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center bg-red-50">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            {critical ? (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            ) : (
              <Lock className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-red-900">{featureName} Bloqueado</h3>
          {description && (
            <p className="text-sm text-red-700 mt-2">{description}</p>
          )}
        </div>
        
        <Alert className="border-red-300 bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Seu trial expirou!</strong><br />
            Esta funcionalidade está bloqueada. Assine um plano para continuar usando o sistema.
          </AlertDescription>
        </Alert>

        {trialStatus?.daysRemaining !== undefined && (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
            <strong>Status:</strong> Trial expirado há {Math.abs(trialStatus.daysRemaining)} dias
          </div>
        )}

        <div className="space-y-2">
          <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Assinar e Reativar Conta
            </Link>
          </Button>
          
          <p className="text-xs text-red-600">
            Seus dados estão salvos e serão restaurados após a assinatura
          </p>
        </div>
      </div>
    </div>
  );
}