
import React from 'react';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SubscriptionBanner() {
  const { planType, subscription } = useSubscriptionPlan();

  // Não mostrar banner para usuários profissionais
  if (planType === 'profissional') return null;

  // Banner para plano gratuito
  if (planType === 'free') {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            Você está no <strong>Plano Gratuito</strong>. Faça upgrade para ter acesso a todas as funcionalidades!
          </span>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Banner para plano essencial
  if (planType === 'essencial') {
    return (
      <Alert className="border-purple-200 bg-purple-50 mb-4">
        <Crown className="h-4 w-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-purple-800">
            Plano <strong>Essencial</strong> ativo. Faça upgrade para <strong>Profissional</strong> e tenha acesso ao Assistente IA completo!
          </span>
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Banner para assinatura expirada
  if (subscription?.status === 'inactive' || subscription?.status === 'cancelled') {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">
            Sua assinatura foi <strong>cancelada</strong>. Reative para continuar usando as funcionalidades premium.
          </span>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Reativar
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
