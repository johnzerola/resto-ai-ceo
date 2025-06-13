
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, AlertCircle } from 'lucide-react';
import { useSubscriptionPlan, PlanType } from '@/hooks/useSubscriptionPlan';
import { Link } from 'react-router-dom';

interface PlanGateProps {
  feature: keyof import('@/hooks/useSubscriptionPlan').PlanFeatures;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ 
  feature, 
  featureName, 
  description, 
  children, 
  fallback 
}: PlanGateProps) {
  const { hasFeature, planType, requiresUpgrade, error } = useSubscriptionPlan();

  // Se houver erro na verificação do plano
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg text-red-800">
            Erro na Verificação do Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-red-700">
            Desculpe, encontramos uma inconsistência no seu plano. Por favor, entre em contato com o suporte para correção.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild size="sm" variant="destructive">
              <Link to="/assinatura">
                <Crown className="h-4 w-4 mr-2" />
                Verificar Planos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se o usuário tem acesso à funcionalidade
  if (hasFeature(feature)) {
    console.log(`✅ [PlanGate] Acesso liberado para ${featureName} no plano ${planType}`);
    return <>{children}</>;
  }

  // Se há um fallback customizado
  if (fallback) {
    console.log(`⚠️ [PlanGate] Usando fallback para ${featureName} no plano ${planType}`);
    return <>{fallback}</>;
  }

  // Determinar qual plano é necessário
  const getRequiredPlan = () => {
    if (planType === PlanType.FREE) {
      return feature === 'hasSimuladorCenarios' || feature === 'hasFullAIAssistant' 
        ? 'Profissional' 
        : 'Essencial';
    }
    return 'Profissional';
  };

  const getPlanIcon = () => {
    const requiredPlan = getRequiredPlan();
    return requiredPlan === 'Profissional' ? <Crown className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  };

  const requiredPlan = getRequiredPlan();

  console.log(`🔒 [PlanGate] Acesso negado para ${featureName}. Plano atual: ${planType}, Requerido: ${requiredPlan}`);

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          {featureName}
          <Badge variant="outline" className="text-xs">
            {getPlanIcon()}
            {requiredPlan}
          </Badge>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta funcionalidade está disponível no plano <strong>{requiredPlan}</strong>.
        </p>
        
        {/* Mostrar plano atual */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Seu plano atual:</p>
          <Badge variant="outline">{planType.toUpperCase()}</Badge>
        </div>

        <div className="flex gap-2 justify-center">
          <Button asChild size="sm">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
