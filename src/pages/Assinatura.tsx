
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { LoadingBoundary } from '@/components/common/LoadingBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function Assinatura() {
  const { subscriptionInfo } = useAuth();
  const { trialStatus, isLoading: trialLoading, error: trialError } = useTrialStatus();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { handleAsyncError } = useErrorHandler();

  const isTrial = subscriptionInfo?.status === 'trial' || trialStatus?.isTrialActive;
  const currentPaidPlan = (subscriptionInfo?.status === 'active' && !isTrial) ? subscriptionInfo?.plan : null;

  const plans = [
    {
      name: "Básico",
      price: "R$ 29,90",
      period: "/mês",
      description: "Perfeito para restaurantes pequenos",
      features: [
        "Dashboard completo",
        "Controle de estoque",
        "Fluxo de caixa",
        "Relatórios básicos",
        "Suporte por email"
      ],
      icon: Star,
      current: subscriptionInfo?.plan === "basic",
      stripeProductId: 'prod_ScEOIQOyRxpW4r',
      id: 'basico'
    },
    {
      name: "Profissional",
      price: "R$ 78,90",
      period: "/mês",
      description: "Ideal para restaurantes em crescimento",
      features: [
        "Todos os recursos do Básico",
        "IA para análises avançadas",
        "Projeções financeiras",
        "Múltiplos usuários",
        "Integração com delivery",
        "Suporte prioritário"
      ],
      icon: Zap,
      popular: true,
      current: subscriptionInfo?.plan === "professional",
      stripeProductId: 'prod_ScEPJDdBU5a0xq',
      id: 'profissional'
    }
  ];

  const handlePlanChange = async (planName: string) => {
    const selectedPlan = plans.find(p => p.name === planName);
    if (!selectedPlan) {
      toast.error('Plano não encontrado');
      return;
    }
    
    setIsProcessingPayment(true);
    
    await handleAsyncError(
      async () => {
        // Determinar o price ID correto baseado no plano
        let priceId = '';
        if (selectedPlan.id === 'basico') {
          priceId = 'price_1QqJbJLNcHH4pGhKbasico29'; // Básico mensal - prod_ScEOIQOyRxpW4r
        } else if (selectedPlan.id === 'profissional') {
          priceId = 'price_1QqJbJLNcHH4pGhKpro79'; // Profissional mensal - prod_ScEPJDdBU5a0xq
        }
        
        if (!priceId) {
          throw new Error('Price ID não encontrado para o plano selecionado');
        }
        
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: priceId,
            planName: selectedPlan.name
          }
        });
        
        if (error) throw new Error('Erro ao processar pagamento');
        
        if (data?.url) {
          window.open(data.url, '_blank');
          toast.success('Redirecionando para o pagamento...');
        } else {
          throw new Error('Erro ao gerar link de pagamento');
        }
      },
      {
        toastTitle: 'Erro no Pagamento',
        toastDescription: 'Não foi possível processar o pagamento. Tente novamente.',
        onError: () => setIsProcessingPayment(false)
      }
    );
    
    setIsProcessingPayment(false);
  };

  return (
    <ModernLayout>
      <LoadingBoundary 
        isLoading={trialLoading} 
        error={null}
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando informações de assinatura...</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6 p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Planos e Assinatura</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu restaurante e desbloquear todo o potencial do Lucraí
          </p>
        </div>

        {subscriptionInfo && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Status da Assinatura
                <Badge variant={subscriptionInfo.status === 'active' ? 'default' : 'destructive'}>
                  {subscriptionInfo.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Plano atual: {isTrial ? 'Teste Grátis' : (currentPaidPlan || 'Não definido')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Próximo pagamento:</strong> {subscriptionInfo.nextBilling || 'Não disponível'}</p>
                <p><strong>Valor:</strong> {subscriptionInfo.amount || 'Não disponível'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto justify-center items-stretch">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanChange(plan.name)}
                    disabled={isProcessingPayment || (!isTrial && plan.current)}
                  >
                    {isProcessingPayment ? 'Processando...' : ((!isTrial && plan.current) ? "Plano Atual" : "Escolher Plano")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Precisa de ajuda?</CardTitle>
            <CardDescription>
              Nossa equipe está pronta para ajudar você a escolher o melhor plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Entre em contato conosco para mais informações sobre nossos planos ou para suporte personalizado.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Falar com Vendas
                </Button>
                <Button variant="outline" size="sm">
                  Suporte Técnico
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </LoadingBoundary>
    </ModernLayout>
  );
}
