
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, AlertCircle } from 'lucide-react';
import { useEnhancedSubscriptionPlan } from '@/hooks/useEnhancedSubscriptionPlan';
import { Link } from 'react-router-dom';
import type { PlanFeatures } from '@/services/PlanService';

interface EnhancedPlanGateProps {
  feature?: keyof PlanFeatures;
  requiredPlan?: string;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function EnhancedPlanGate({ 
  feature,
  requiredPlan,
  featureName, 
  description, 
  children, 
  fallback 
}: EnhancedPlanGateProps) {
  const { hasFeature, canAccess, planType, error, isLoading } = useEnhancedSubscriptionPlan();

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Verificando permissões...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg text-red-800">
            Erro de Verificação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-red-700">{error}</p>
          <Button asChild size="sm" variant="destructive">
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Verificar Planos
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verificar por feature específica
  if (feature) {
    if (hasFeature(feature)) {
      return <>{children}</>;
    }
  }

  // Verificar por plano mínimo
  if (requiredPlan) {
    if (canAccess(requiredPlan)) {
      return <>{children}</>;
    }
  }

  // Se nenhuma verificação específica, mostrar conteúdo
  if (!feature && !requiredPlan) {
    return <>{children}</>;
  }

  // Se há fallback customizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // Determinar plano necessário
  const getRequiredPlanName = () => {
    if (requiredPlan) return requiredPlan;
    
    // Para features específicas, determinar o plano necessário
    if (feature === 'hasFullAIAssistant' || feature === 'hasSimuladorCenarios') {
      return 'profissional';
    }
    return 'essencial';
  };

  const requiredPlanName = getRequiredPlanName();
  const getPlanIcon = () => {
    return requiredPlanName === 'profissional' ? <Crown className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  };

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
            {requiredPlanName.charAt(0).toUpperCase() + requiredPlanName.slice(1)}
          </Badge>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta funcionalidade está disponível no plano <strong>{requiredPlanName}</strong>.
        </p>
        
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
              Voltar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
