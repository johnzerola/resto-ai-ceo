
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscriptionPlan, PlanType } from '@/hooks/useSubscriptionPlan';

interface UpgradePromptProps {
  featureName: string;
  description?: string;
  requiredPlan: PlanType;
  compact?: boolean;
}

export function UpgradePrompt({ 
  featureName, 
  description, 
  requiredPlan, 
  compact = false 
}: UpgradePromptProps) {
  const { planType } = useSubscriptionPlan();

  const planFeatures = {
    [PlanType.ESSENCIAL]: [
      'Gestão de Estoque',
      'Relatórios Avançados',
      'Análise Financeira',
      'Até 2 restaurantes'
    ],
    [PlanType.PROFISSIONAL]: [
      'Tudo do Essencial',
      'Assistente IA Completo',
      'Simulador de Cenários',
      'Até 5 restaurantes',
      'Suporte prioritário'
    ]
  };

  const getPlanColor = (plan: PlanType) => {
    if (plan === PlanType.PROFISSIONAL) return 'bg-purple-600 hover:bg-purple-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getPlanPrice = (plan: PlanType) => {
    if (plan === PlanType.PROFISSIONAL) return 'R$ 199/mês';
    return 'R$ 99/mês';
  };

  if (compact) {
    return (
      <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{featureName}</p>
            <p className="text-xs text-muted-foreground">
              Disponível no plano {requiredPlan.toUpperCase()}
            </p>
          </div>
          <Button asChild size="sm" className={getPlanColor(requiredPlan)}>
            <Link to="/assinatura">
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl">
          Funcionalidade Premium
        </CardTitle>
        <Badge variant="outline" className="mx-auto">
          {requiredPlan.toUpperCase()}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{featureName}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">O que você ganha com o plano {requiredPlan}:</p>
          <ul className="space-y-2">
            {planFeatures[requiredPlan]?.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Seu plano atual:</p>
          <Badge variant="outline">{planType.toUpperCase()}</Badge>
        </div>

        <div className="flex gap-2">
          <Button asChild className={`flex-1 ${getPlanColor(requiredPlan)}`}>
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade - {getPlanPrice(requiredPlan)}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
