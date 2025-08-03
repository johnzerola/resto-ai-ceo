import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Crown, 
  Rocket,
  ArrowRight,
  Clock,
  Users,
  Shield,
  TrendingUp,
  Calculator,
  MessageSquare,
  BarChart3,
  Smartphone,
  Bot,
  CreditCard,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  originalMonthlyPrice?: number;
  originalYearlyPrice?: number;
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  recommended?: boolean;
  urgency?: string;
  savings?: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "Perfeito para começar a lucrar mais",
    monthlyPrice: 29.90,
    yearlyPrice: 23.90,
    originalMonthlyPrice: 59.90,
    originalYearlyPrice: 47.90,
    stripeMonthlyPriceId: "price_1RgzvXRon1VrwJMGcv0TECIa", // Básico - R$ 29,90
    stripeYearlyPriceId: "price_1RgzvXRon1VrwJMGcv0TECIa", // Básico - mesmo price para anual
    features: [
      "1 Restaurante",
      "CMV e DRE em tempo real",
      "Controle básico de estoque",
      "Precificação automática",
      "Relatórios essenciais",
      "Suporte por email",
      "WhatsApp integrado"
    ],
    limitations: [
      "Limitado a 1 restaurante",
      "Relatórios básicos"
    ],
    urgency: "últimas 12 vagas",
    savings: "Economize R$ 30/mês",
    icon: Rocket,
    color: "from-blue-500 to-cyan-600",
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-600"
  },
  {
    name: "Pro",
    description: "Para restaurantes que querem crescer",
    monthlyPrice: 78.90,
    yearlyPrice: 62.90,
    originalMonthlyPrice: 158.90,
    originalYearlyPrice: 125.90,
    stripeMonthlyPriceId: "price_1RgzwaRon1VrwJMGoESYbq1r", // Profissional - R$ 78,90
    stripeYearlyPriceId: "price_1RgzwaRon1VrwJMGoESYbq1r", // Profissional - mesmo price para anual
    features: [
      "Até 3 Restaurantes",
      "IA para precificação dinâmica",
      "DRE completo automatizado",
      "Análise de lucratividade por prato",
      "Relatórios avançados com insights",
      "Suporte prioritário via WhatsApp",
      "Integração com delivery apps",
      "Dashboard mobile completo",
      "Alertas inteligentes de estoque",
      "Projeções financeiras"
    ],
    popular: true,
    recommended: true,
    urgency: "últimas 8 vagas",
    savings: "Economize R$ 80/mês",
    icon: Crown,
    color: "from-emerald-500 to-green-600",
    gradient: "bg-gradient-to-r from-emerald-500 to-green-600"
  }
];

// Checkout function otimizado
const handleCheckout = async (priceId: string, planName: string) => {
  try {
    console.log('🚀 Iniciando checkout:', { priceId, planName });
    
    // Verificar se o price ID é válido
    if (!priceId || priceId.includes('price_starter_') || priceId.includes('price_pro_')) {
      throw new Error('Price ID inválido. Verifique as configurações do Stripe.');
    }
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId,
        planName,
        successUrl: `${window.location.origin}/dashboard?welcome=true&plan=${planName.toLowerCase()}`,
        cancelUrl: `${window.location.origin}/?checkout=cancelled`
      }
    });

    if (error) {
      console.error('❌ Erro no checkout:', error);
      throw error;
    }

    if (data?.url) {
      console.log('✅ Redirecionando para Stripe:', data.url);
      // Redirecionar diretamente para o Stripe
      window.location.href = data.url;
    } else {
      throw new Error('URL de checkout não recebida');
    }
  } catch (error: any) {
    console.error('💥 Erro no checkout:', error);
    alert(`Erro ao processar pagamento: ${error.message || 'Tente novamente'}`);
  }
};

export function OptimizedPricing() {
  const [urgencyTime, setUrgencyTime] = useState({ hours: 23, minutes: 47 });
  const { user, isAuthenticated } = useAuth();
  const { trialStatus } = useTrialStatus();

  // 50% discount for users in trial
  const getDiscountedPrice = (plan: PricingPlan) => {
    const basePrice = plan.monthlyPrice;
    const isInTrial = isAuthenticated && trialStatus?.isTrialActive;
    return isInTrial ? Math.round(basePrice * 0.5) : basePrice;
  };

  const hasTrialDiscount = isAuthenticated && trialStatus?.isTrialActive;

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTime(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!isAuthenticated) {
      // Redirect to login with plan info
      window.location.href = `/login?tab=register&plan=${plan.name.toLowerCase()}&billing=monthly`;
      return;
    }

    const priceId = plan.stripeMonthlyPriceId;
    if (priceId) {
      await handleCheckout(priceId, plan.name);
    }
  };

  return (
    <section id="precos" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6">
        {/* Header with urgency */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          {hasTrialDiscount ? (
            <Badge className="mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 animate-pulse text-lg px-6 py-2">
              <Zap className="mr-2 h-5 w-5" />
              🎉 OFERTA ESPECIAL: 50% OFF apenas para quem está no trial!
            </Badge>
          ) : (
            <Badge className="mb-6 bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
              <Clock className="mr-2 h-4 w-4" />
              🔥 Promoção de lançamento termina em {urgencyTime.hours}h {urgencyTime.minutes}min
            </Badge>
          )}
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {hasTrialDiscount ? 'Ative Seu Plano com 50% de Desconto!' : 'Escolha o plano que vai transformar seu restaurante'}
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {hasTrialDiscount 
              ? `Aproveite sua oferta exclusiva de trial! Restam apenas ${trialStatus?.daysRemaining} ${trialStatus?.daysRemaining === 1 ? 'dia' : 'dias'}.`
              : <>
                  <span className="text-primary font-semibold">Mais de 200 restaurantes</span> já aumentaram 
                  seu lucro em até <span className="text-primary font-semibold">40% em 30 dias</span>
                </>
            }
          </p>


          {/* Social proof */}
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>+200 restaurantes ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9/5 satisfação</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Dados 100% seguros</span>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const currentPrice = plan.monthlyPrice;
            const originalPrice = plan.originalMonthlyPrice;
            const savings = originalPrice ? originalPrice - currentPrice : 0;
            const savingsPercentage = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

            return (
              <Card 
                key={plan.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl",
                  plan.popular && "ring-2 ring-primary shadow-2xl scale-105",
                  plan.recommended && "border-primary/50"
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 text-sm font-semibold">
                    ⭐ MAIS ESCOLHIDO - {plan.urgency}
                  </div>
                )}

                {/* Recommended ribbon */}
                {plan.recommended && (
                  <div className="absolute top-4 -right-12 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-1 text-xs font-semibold transform rotate-45">
                    RECOMENDADO
                  </div>
                )}

                <CardHeader className={cn("text-center", plan.popular && "pt-12")}>
                  <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4", plan.gradient)}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                  
                   {/* Pricing */}
                  <div className="py-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {hasTrialDiscount && (
                        <div className="text-center">
                          <div className="text-lg text-muted-foreground line-through">
                            R$ {currentPrice.toFixed(2).replace('.', ',')}
                          </div>
                          <span className="text-4xl font-bold text-green-600">
                            R$ {getDiscountedPrice(plan).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}
                      {!hasTrialDiscount && originalPrice && (
                        <span className="text-2xl text-muted-foreground line-through">
                          R$ {originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      {!hasTrialDiscount && (
                        <span className="text-5xl font-bold text-primary">
                          R$ {currentPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      por mês
                    </p>
                    
                    {hasTrialDiscount ? (
                      <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 animate-pulse">
                        🎉 50% OFF - Oferta exclusiva de trial!
                      </Badge>
                    ) : savings > 0 && (
                      <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                        💰 Economize {savingsPercentage}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations && plan.limitations.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium">Limitações:</p>
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start gap-3">
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trial urgency for authenticated users */}
                  {hasTrialDiscount && trialStatus && trialStatus.daysRemaining <= 1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          ⚠️ Oferta expira hoje! Não perca!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  {!isAuthenticated ? (
                    <Link to="/login?tab=register">
                      <Button 
                        className={cn(
                          "w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105",
                          plan.popular 
                            ? "bg-gradient-to-r from-primary to-accent hover:shadow-xl animate-pulse" 
                            : "bg-primary hover:bg-primary/90"
                        )}
                      >
                        Começar Teste Grátis
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelect(plan)}
                      className={cn(
                        "w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105",
                        hasTrialDiscount 
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl animate-pulse"
                          : plan.popular 
                            ? "bg-gradient-to-r from-primary to-accent hover:shadow-xl" 
                            : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {hasTrialDiscount ? "Ativar com 50% OFF" : "Assinar Agora"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}

                  {/* Savings highlight */}
                  {plan.savings && (
                    <div className="text-center">
                      <p className="text-sm text-primary font-semibold">{plan.savings}</p>
                    </div>
                  )}

                  {/* Urgency */}
                  {plan.urgency && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-center">
                      <p className="text-sm text-destructive font-medium">
                        ⚡ Apenas {plan.urgency}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom guarantees and trust signals */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold mb-1">Garantia de 7 dias</h4>
              <p className="text-sm text-muted-foreground">
                Não satisfeito? Reembolso total
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold mb-1">Pagamento seguro</h4>
              <p className="text-sm text-muted-foreground">
                Processado pelo Stripe
              </p>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold mb-1">Suporte incluído</h4>
              <p className="text-sm text-muted-foreground">
                Setup gratuito e treinamento
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <p className="text-lg font-semibold mb-2">
              🚀 Oferta especial de lançamento
            </p>
            <p className="text-muted-foreground">
              Até <span className="text-primary font-semibold">50% de desconto</span> nos 3 primeiros meses. 
              Válido apenas para os próximos <span className="text-destructive font-semibold">47 clientes</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}