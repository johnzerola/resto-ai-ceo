
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { UsageDashboard } from "@/components/subscription/UsageDashboard";

export function AssinaturaCompleta() {
  const { planType, subscription } = useSubscriptionPlan();

  const plans = [
    {
      id: 'free',
      name: "Gratuito",
      price: "R$ 0",
      description: "Para começar seu negócio",
      features: [
        "1 restaurante",
        "Dashboard básico",
        "Relatórios simples",
        "Suporte por email"
      ],
      limitations: [
        "Funcionalidades limitadas",
        "Sem IA",
        "Sem simulações"
      ],
      buttonText: "Plano Atual",
      disabled: planType === 'free'
    },
    {
      id: 'essencial',
      name: "Essencial",
      price: "R$ 99",
      description: "Para restaurantes em crescimento",
      features: [
        "Até 2 restaurantes",
        "Gestão de estoque completa",
        "Relatórios avançados",
        "Análise financeira",
        "Controle de custos",
        "Suporte prioritário"
      ],
      popular: planType === 'free',
      buttonText: planType === 'essencial' ? "Plano Atual" : "Escolher Essencial",
      disabled: planType === 'essencial'
    },
    {
      id: 'profissional',
      name: "Profissional",
      price: "R$ 199",
      description: "Para maximizar resultados",
      features: [
        "Até 5 restaurantes",
        "Tudo do plano Essencial",
        "Assistente IA completo",
        "Simulador de cenários",
        "Projeções avançadas",
        "Suporte 24/7",
        "Consultoria especializada"
      ],
      popular: planType !== 'profissional',
      premium: true,
      buttonText: planType === 'profissional' ? "Plano Atual" : "Escolher Profissional",
      disabled: planType === 'profissional'
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    console.log('Selecionando plano:', planId);
    // Aqui seria integração com Stripe
    alert(`Redirecionando para checkout do plano ${planId}`);
  };

  return (
    <ModernLayout>
      <div className="space-y-6 p-6 bg-background min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Planos e Assinatura
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para acelerar o crescimento do seu restaurante
          </p>
        </div>

        {/* Status atual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <SubscriptionStatus />
          <UsageDashboard />
        </div>

        {/* Planos disponíveis */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                plan.popular ? 'border-2 border-blue-500 shadow-lg scale-105' : ''
              } ${plan.premium ? 'bg-gradient-to-br from-purple-50 to-blue-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  <Star className="inline h-4 w-4 mr-1" />
                  Recomendado
                </div>
              )}
              
              {plan.premium && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-medium rounded-br-lg">
                  <Crown className="inline h-4 w-4 mr-1" />
                  Premium
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {plan.id === 'free' && <Zap className="h-8 w-8 text-gray-500" />}
                  {plan.id === 'essencial' && <Star className="h-8 w-8 text-blue-500" />}
                  {plan.id === 'profissional' && <Crown className="h-8 w-8 text-purple-600" />}
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  {plan.price}
                  {plan.id !== 'free' && <span className="text-lg text-muted-foreground">/mês</span>}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Limitações:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-red-600">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  className={`w-full ${
                    plan.premium 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                      : plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : ''
                  }`}
                  variant={plan.disabled ? 'secondary' : plan.popular || plan.premium ? 'default' : 'outline'}
                  disabled={plan.disabled}
                  onClick={() => !plan.disabled && handlePlanSelection(plan.id)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Garantias e informações */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Sem Compromisso</h3>
                  <p className="text-sm text-muted-foreground">
                    Cancele quando quiser, sem multas ou taxas extras
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Ativação Imediata</h3>
                  <p className="text-sm text-muted-foreground">
                    Funcionalidades liberadas instantaneamente após o pagamento
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Suporte Especializado</h3>
                  <p className="text-sm text-muted-foreground">
                    Equipe dedicada para ajudar no crescimento do seu negócio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}

export default AssinaturaCompleta;
