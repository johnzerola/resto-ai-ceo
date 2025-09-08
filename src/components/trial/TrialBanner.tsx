
import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Crown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrialBanner() {
  const { trialStatus, isLoading } = useTrialStatus();

  if (isLoading || !trialStatus) return null;

  // Banner para trial ativo
  if (trialStatus.isTrialActive) {
    const isUrgent = trialStatus.daysRemaining <= 3;
    
    return (
      <Alert className={`border-2 mb-4 ${isUrgent ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
        <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
        <AlertDescription className="flex items-center justify-between">
          <span className={isUrgent ? 'text-red-800' : 'text-blue-800'}>
            <strong>Trial Ativo:</strong> {trialStatus.daysRemaining} dias restantes para aproveitar todas as funcionalidades!
          </span>
          <Button asChild size="sm" className={isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}>
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Assinar Agora
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Banner para trial expirado
  if (trialStatus.planStatus === 'trial_expired' || trialStatus.planStatus === 'expired') {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">
            <strong>Trial Expirado!</strong> Assine agora para continuar usando todas as funcionalidades do Lucraí.
          </span>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Assinar
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
