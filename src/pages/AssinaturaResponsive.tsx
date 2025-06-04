
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

export function AssinaturaResponsive() {
  const plans = [
    {
      name: "Básico",
      price: "R$ 49",
      description: "Ideal para pequenos restaurantes",
      features: [
        "Dashboard básico",
        "Controle de estoque",
        "Relatórios simples",
        "Suporte por email"
      ]
    },
    {
      name: "Profissional",
      price: "R$ 99",
      description: "Para restaurantes em crescimento",
      features: [
        "Tudo do plano Básico",
        "IA para análises",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integração com delivery"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 199",
      description: "Para redes de restaurantes",
      features: [
        "Tudo do plano Profissional",
        "Multi-unidades",
        "API personalizada",
        "Suporte 24/7",
        "Consultoria especializada"
      ]
    }
  ];

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Planos e Assinatura
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Escolha o plano ideal para o seu restaurante e acelere seus resultados
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'border-restauria-green-profit shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-restauria-green-profit text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  <Star className="inline h-3 w-3 mr-1" />
                  Popular
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-restauria-green-profit">
                  {plan.price}<span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-restauria-green-profit mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-restauria-green-profit hover:bg-restauria-green-profit-dark' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ModernLayout>
  );
}
