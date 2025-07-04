import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Users, 
  BarChart3,
  Shield,
  Headphones,
  Brain,
  ChartBar,
  Database,
  Target
} from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 29.90,
    period: '/mês',
    description: 'Para começar',
    stripeProductId: 'prod_ScEOIQOyRxpW4r',
    features: [
      'Dashboard básico',
      'Até 2 restaurantes',
      'Controle de estoque',
      'Fluxo de caixa',
      'Relatórios básicos',
      'CMV e DRE básicos',
      'Suporte por email'
    ],
    limitations: [
      'IA com funcionalidades limitadas',
      'Relatórios simples'
    ],
    popular: false,
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 78.90,
    period: '/mês',
    description: 'Para dominar',
    stripeProductId: 'prod_ScEPJDdBU5a0xq',
    popular: true,
    features: [
      'Restaurantes ilimitados',
      'Assistente IA completo',
      'Gerente Virtual',
      'Social Media IA',
      'Simulador avançado de cenários',
      'Análises preditivas',
      'Relatórios personalizados',
      'Gestão de equipe',
      'Suporte VIP 24/7',
      'Integração com marketplaces',
      'API personalizada',
      'Análise financeira avançada'
    ],
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

export function AssinaturaCompleta() {
  const { planType, subscription, refreshSubscription, isLoading } = useSubscriptionPlan();
  const [selectedPlan, setSelectedPlan] = useState<string>(planType || 'basico');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Forçar atualização imediata dos dados da assinatura
    const forceRefresh = async () => {
      console.log('🔄 [AssinaturaCompleta] Forçando refresh dos dados...');
      await refreshSubscription();
    };
    
    forceRefresh();
  }, [refreshSubscription]);

  // Atualizar selectedPlan quando planType mudar
  useEffect(() => {
    if (planType) {
      setSelectedPlan(planType);
    }
  }, [planType]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 [Manual] Atualizando dados da assinatura...');
      await refreshSubscription();
      toast.success('Dados da assinatura atualizados!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar dados da assinatura');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePlanSelection = async (planId: string) => {
    if (planId === planType) {
      toast.success('Este já é seu plano atual!');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const selectedPlanData = plans.find(p => p.id === planId);
      if (!selectedPlanData) {
        toast.error('Plano não encontrado');
        return;
      }

      console.log('Iniciando checkout para plano:', selectedPlanData.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          productId: selectedPlanData.stripeProductId,
          planId: planId
        }
      });

      if (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        toast.error('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        console.log('Redirecionando para Stripe Checkout:', data.url);
        // Abrir Stripe checkout em uma nova aba
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o pagamento...');
      } else {
        toast.error('Erro ao gerar link de pagamento');
      }
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <ModernLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header centralizado */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Planos e Assinatura
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para acelerar o crescimento do seu restaurante
          </p>
          
          {/* Botão de atualização manual */}
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Atualizando...
                </>
              ) : (
                'Atualizar Status da Assinatura'
              )}
            </Button>
          </div>
        </div>

        <SubscriptionBanner />

        {/* Status da Assinatura */}
        <div className="max-w-md mx-auto">
          <SubscriptionStatus />
        </div>

        {/* Debug info - apenas para desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg text-xs">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Plan Type: {planType}</p>
            <p>Status: {subscription?.status}</p>
            <p>Email: {subscription?.email}</p>
            <p>Loading: {isLoading ? 'true' : 'false'}</p>
          </div>
        )}

        {/* Planos */}
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = planType === plan.id;
            const isPopular = plan.popular;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  isCurrentPlan ? 'ring-2 ring-purple-500 shadow-lg' : ''
                } ${isPopular ? 'scale-105 border-purple-300 shadow-lg' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center pb-4 ${plan.bgColor} rounded-t-lg`}>
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.bgColor} border-2 ${plan.borderColor}`}>
                      <Icon className={`h-8 w-8 ${plan.color}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Incluído:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations && plan.limitations.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          Limitações:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-xs mt-1">•</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <Button 
                    onClick={() => handlePlanSelection(plan.id)}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : isPopular 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : ''
                    }`}
                    variant={isCurrentPlan ? "default" : isPopular ? "default" : "outline"}
                    disabled={isCurrentPlan || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Plano Atual
                      </>
                    ) : (
                      <>
                        {isPopular && <Crown className="h-4 w-4 mr-2" />}
                        Assinar Agora
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recursos Detalhados */}
        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Compare os Recursos</h2>
            <p className="text-muted-foreground">Veja em detalhes o que cada plano oferece</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Assistente IA",
                basico: "Limitado",
                profissional: "✅ Completo"
              },
              {
                icon: ChartBar,
                title: "Relatórios",
                basico: "Básicos",
                profissional: "✅ Avançados"
              },
              {
                icon: Database,
                title: "Restaurantes",
                basico: "2",
                profissional: "Ilimitado"
              },
              {
                icon: Target,
                title: "Simulador",
                basico: "❌",
                profissional: "✅ Avançado"
              }
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader className="text-center pb-3">
                  <feature.icon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-center text-sm">
                  <div className="space-y-2">
                    <div className="font-medium">Básico: <span className="text-blue-600">{feature.basico}</span></div>
                    <div className="font-medium">Profissional: <span className="text-purple-600">{feature.profissional}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white mt-16">
          <h2 className="text-2xl font-bold mb-4">Pronto para crescer?</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Escolha o plano Profissional e tenha acesso a todas as ferramentas de IA e análises avançadas para fazer seu restaurante decolar!
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => handlePlanSelection('profissional')}
            className="bg-white text-purple-600 hover:bg-gray-100"
            disabled={isProcessingPayment}
          >
            <Crown className="h-5 w-5 mr-2" />
            Assinar Plano Profissional
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
}
