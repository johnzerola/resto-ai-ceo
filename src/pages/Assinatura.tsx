
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Assinatura() {
  const { subscriptionInfo } = useAuth();

  const plans = [
    {
      name: "Básico",
      price: "R$ 99",
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
      current: subscriptionInfo?.plan === "basic"
    },
    {
      name: "Profissional",
      price: "R$ 199",
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
      current: subscriptionInfo?.plan === "professional"
    },
    {
      name: "Enterprise",
      price: "R$ 399",
      period: "/mês",
      description: "Para redes e restaurantes grandes",
      features: [
        "Todos os recursos do Profissional",
        "Análise de múltiplas unidades",
        "Dashboard executivo",
        "API personalizada",
        "Treinamento dedicado",
        "Suporte 24/7"
      ],
      icon: Crown,
      current: subscriptionInfo?.plan === "enterprise"
    }
  ];

  const handlePlanChange = (planName: string) => {
    // Implementar lógica de mudança de plano
    console.log(`Alterando para plano: ${planName}`);
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Planos e Assinatura</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu restaurante e desbloquear todo o potencial da RestaurIA
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
                Plano atual: {subscriptionInfo.plan || 'Não definido'}
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

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                    disabled={plan.current}
                  >
                    {plan.current ? "Plano Atual" : "Escolher Plano"}
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
    </ModernLayout>
  );
}
