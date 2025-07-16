import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
    monthlyPrice: 97,
    yearlyPrice: 77,
    originalMonthlyPrice: 197,
    originalYearlyPrice: 127,
    stripeMonthlyPriceId: "price_starter_monthly",
    stripeYearlyPriceId: "price_starter_yearly",
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
    savings: "Economize R$ 100/mês",
    icon: Rocket,
    color: "from-blue-500 to-cyan-600",
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-600"
  },
  {
    name: "Pro",
    description: "Para restaurantes que querem crescer",
    monthlyPrice: 197,
    yearlyPrice: 157,
    originalMonthlyPrice: 397,
    originalYearlyPrice: 257,
    stripeMonthlyPriceId: "price_pro_monthly",
    stripeYearlyPriceId: "price_pro_yearly",
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
    savings: "Economize R$ 200/mês",
    icon: Crown,
    color: "from-emerald-500 to-green-600",
    gradient: "bg-gradient-to-r from-emerald-500 to-green-600"
  },
  {
    name: "Enterprise",
    description: "Solução completa para redes",
    monthlyPrice: 397,
    yearlyPrice: 297,
    originalMonthlyPrice: 797,
    originalYearlyPrice: 497,
    stripeMonthlyPriceId: "price_enterprise_monthly",
    stripeYearlyPriceId: "price_enterprise_yearly",
    features: [
      "Restaurantes ilimitados",
      "IA avançada com machine learning",
      "Customizações exclusivas",
      "API para integrações",
      "Suporte dedicado 24/7",
      "Consultor financeiro pessoal",
      "White-label disponível",
      "Treinamento da equipe incluído",
      "Backups automáticos",
      "SLA 99.9% uptime"
    ],
    urgency: "últimas 3 vagas",
    savings: "Economize R$ 400/mês",
    icon: Zap,
    color: "from-purple-500 to-violet-600",
    gradient: "bg-gradient-to-r from-purple-500 to-violet-600"
  }
];

// Checkout function using Supabase Edge Function
const handleCheckout = async (priceId: string, planName: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId,
        planName,
        successUrl: `${window.location.origin}/dashboard?welcome=true`,
        cancelUrl: `${window.location.origin}/?checkout=cancelled`
      }
    });

    if (error) throw error;

    // Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Erro ao processar pagamento. Tente novamente.');
  }
};

export function OptimizedPricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [urgencyTime, setUrgencyTime] = useState({ hours: 23, minutes: 47 });
  const { user, isAuthenticated } = useAuth();

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
      window.location.href = `/login?tab=register&plan=${plan.name.toLowerCase()}&billing=${isYearly ? 'yearly' : 'monthly'}`;
      return;
    }

    const priceId = isYearly ? plan.stripeYearlyPriceId : plan.stripeMonthlyPriceId;
    if (priceId) {
      await handleCheckout(priceId, plan.name);
    }
  };

  return (
    <section id="precos" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6">
        {/* Header with urgency */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-6 bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
            <Clock className="mr-2 h-4 w-4" />
            🔥 Promoção de lançamento termina em {urgencyTime.hours}h {urgencyTime.minutes}min
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Escolha o plano que vai transformar seu restaurante
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            <span className="text-primary font-semibold">Mais de 200 restaurantes</span> já aumentaram 
            seu lucro em até <span className="text-primary font-semibold">40% em 30 dias</span>
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={cn("font-medium", !isYearly && "text-primary")}>Mensal</span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn("font-medium", isYearly && "text-primary")}>Anual</span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                2 meses grátis!
              </Badge>
            )}
          </div>

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
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const originalPrice = isYearly ? plan.originalYearlyPrice : plan.originalMonthlyPrice;
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
                      {originalPrice && (
                        <span className="text-2xl text-muted-foreground line-through">
                          R$ {originalPrice}
                        </span>
                      )}
                      <span className="text-5xl font-bold text-primary">
                        R$ {currentPrice}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      por mês{isYearly && " (cobrado anualmente)"}
                    </p>
                    
                    {savings > 0 && (
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

                  {/* CTA Button */}
                  <Button 
                    onClick={() => handlePlanSelect(plan)}
                    className={cn(
                      "w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105",
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-accent hover:shadow-xl animate-pulse" 
                        : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {isAuthenticated ? "Assinar Agora" : "Começar Teste Grátis"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

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