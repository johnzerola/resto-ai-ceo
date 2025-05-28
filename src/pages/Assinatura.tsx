import { Layout } from "@/components/restaurant/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";
import { useEffect } from "react";

const plans = [
  {
    name: "Essencial",
    priceId: "price_1RTEtE2KJzRobT4lNUHn1uJl",
    price: "R$ 29,90",
    description: "Perfeito para começar",
    features: [
      "Dashboard básico",
      "Fluxo de caixa",
      "Relatórios básicos",
      "Suporte por email",
      "Até 100 transações/mês"
    ],
    icon: Sparkles,
    popular: false
  },
  {
    name: "Profissional",
    priceId: "price_1RTEu02KJzRobT4lJpYyLdSr",
    price: "R$ 79,90",
    description: "Para negócios em crescimento",
    features: [
      "Tudo do plano Essencial",
      "Dashboard avançado",
      "IA Assistente",
      "Relatórios avançados",
      "Gestão de estoque",
      "Fichas técnicas",
      "Metas e conquistas",
      "Suporte prioritário",
      "Transações ilimitadas"
    ],
    icon: Crown,
    popular: true
  }
];

export function Assinatura() {
  const { subscriptionInfo, createCheckoutSession, openCustomerPortal, checkSubscription } = useAuth();

  useEffect(() => {
    // Check subscription status when page loads
    checkSubscription();
  }, []);

  // Handle URL parameters for success/cancel
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      toast.success('Assinatura realizada com sucesso! Verificando status...');
      // Wait a bit for Stripe to process, then check subscription
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    } else if (canceled === 'true') {
      toast.info('Processo de assinatura cancelado.');
    }
  }, [checkSubscription]);

  const handleSubscribe = (priceId: string) => {
    console.log('Subscribing to plan with price ID:', priceId);
    createCheckoutSession(priceId);
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <Layout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Planos de Assinatura</h1>
            <p className="text-muted-foreground mt-2">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>

          {subscriptionInfo.subscribed && (
            <div className="text-center">
              <Card className="max-w-md mx-auto border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Assinatura Ativa</CardTitle>
                  <CardDescription>
                    Plano {subscriptionInfo.subscription_tier}
                    {subscriptionInfo.subscription_end && (
                      <div className="mt-1">
                        Renova em: {new Date(subscriptionInfo.subscription_end).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleManageSubscription} className="w-full">
                    Gerenciar Assinatura
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscriptionInfo.subscribed && 
                subscriptionInfo.subscription_tier === plan.name;

              return (
                <Card key={plan.name} className={`relative ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Mais Popular
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge variant="secondary" className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                      Plano Atual
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">/mês</div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Plano Atual
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSubscribe(plan.priceId)}
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Assinar Agora
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={checkSubscription}>
              Atualizar Status da Assinatura
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
