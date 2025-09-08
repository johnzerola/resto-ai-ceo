import React from 'react';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Crown, 
  Clock, 
  Zap,
  Users,
  Package,
  MessageSquare,
  CreditCard
} from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: 'transactions' | 'inventory' | 'fixedExpenses' | 'whatsappMessages';
  requiredTier?: 'basic' | 'premium' | 'enterprise';
}

export function SubscriptionGuard({ 
  children, 
  feature,
  requiredTier = 'basic' 
}: SubscriptionGuardProps) {
  const { 
    tenantContext, 
    usageQuotas, 
    isLoading,
    canCreateResource,
    isTrialActive,
    isSubscriptionActive
  } = useMultiTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar se assinatura está ativa
  if (!isSubscriptionActive()) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Assinatura Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isTrialActive() 
                ? 'Seu trial gratuito expirou. Assine um plano para continuar usando.'
                : 'Assinatura inativa. Renove para continuar usando todas as funcionalidades.'
              }
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlanCard 
              name="Básico" 
              price="R$ 29,90" 
              features={['100 transações/mês', '50 itens estoque', '10 despesas fixas']}
              tier="basic"
            />
            <PlanCard 
              name="Premium" 
              price="R$ 59,90" 
              features={['500 transações/mês', '200 itens estoque', '50 despesas fixas', 'WhatsApp avançado']}
              tier="premium"
              popular
            />
            <PlanCard 
              name="Enterprise" 
              price="R$ 99,90" 
              features={['Ilimitado', 'Multi-restaurantes', 'API completa', 'Suporte prioritário']}
              tier="enterprise"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verificar se tem permissão para o tier necessário
  const tierHierarchy = { basic: 0, premium: 1, enterprise: 2 };
  const currentTierLevel = tierHierarchy[tenantContext.subscriptionTier];
  const requiredTierLevel = tierHierarchy[requiredTier];

  if (currentTierLevel < requiredTierLevel) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade Necessário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidade requer o plano <strong>{requiredTier}</strong> ou superior.
              Seu plano atual: <Badge variant="outline">{tenantContext.subscriptionTier}</Badge>
            </AlertDescription>
          </Alert>

          <Button className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verificar quota de uso
  if (feature && !canCreateResource(feature)) {
    const quota = usageQuotas[feature];
    const percentage = (quota.used / quota.limit) * 100;

    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Limite Atingido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você atingiu o limite de {getFeatureName(feature)} do seu plano.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso atual</span>
              <span>{quota.used} / {quota.limit === -1 ? '∞' : quota.limit}</span>
            </div>
            <Progress value={percentage} className="w-full" />
          </div>

          <Button className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade para Aumentar Limite
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Mostrar aviso se próximo do limite
  if (feature && tenantContext.subscriptionTier !== 'enterprise') {
    const quota = usageQuotas[feature];
    const percentage = (quota.used / quota.limit) * 100;

    if (percentage >= 80) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você usou {percentage.toFixed(0)}% do limite de {getFeatureName(feature)}. 
              Considere fazer upgrade para evitar interrupções.
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }
  }

  // Mostrar aviso de trial próximo do fim
  if (isTrialActive() && tenantContext.trialEnd) {
    const daysLeft = Math.ceil(
      (new Date(tenantContext.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 3) {
      return (
        <div className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Seu trial gratuito termina em {daysLeft} dia{daysLeft !== 1 ? 's' : ''}. 
              Assine um plano para continuar usando.
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }
  }

  return <>{children}</>;
}

function getFeatureName(feature: string): string {
  const names = {
    transactions: 'transações',
    inventory: 'itens no estoque',
    fixedExpenses: 'despesas fixas',
    whatsappMessages: 'mensagens WhatsApp'
  };
  return names[feature as keyof typeof names] || feature;
}

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  tier: 'basic' | 'premium' | 'enterprise';
  popular?: boolean;
}

function PlanCard({ name, price, features, tier, popular }: PlanCardProps) {
  return (
    <Card className={`relative ${popular ? 'ring-2 ring-primary' : ''}`}>
      {popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          Mais Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-center">{name}</CardTitle>
        <div className="text-center">
          <span className="text-2xl font-bold">{price}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full mt-4" variant={popular ? "default" : "outline"}>
          Assinar {name}
        </Button>
      </CardContent>
    </Card>
  );
}