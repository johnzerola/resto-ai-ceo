import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Bot, 
  CreditCard, 
  UtensilsCrossed,
  X,
  Check,
  Star,
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Rocket,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AboutSection } from '@/components/landing/AboutSection';

// Componente de máquina de escrever aprimorado
const Typewriter = ({ texts, speed = 150, deleteSpeed = 100, pauseTime = 3000 }: {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        setCurrentText(fullText.slice(0, currentText.length + 1));
        if (currentText === fullText) {
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, pauseTime);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className="font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
      {currentText}
      <span className="animate-[pulse_1.5s_ease-in-out_infinite] text-yellow-300">|</span>
    </span>
  );
};

// Componente de animação fade-in
const FadeIn = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn(
      'transition-all duration-1000',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      className
    )}>
      {children}
    </div>
  );
};

// Seção Hero aprimorada
const HeroSection = () => {
  const typewriterTexts = [
    "Transforme seu restaurante numa máquina de fazer dinheiro! 💰",
    "Nunca mais erre no preço dos seus pratos! 🎯", 
    "CMV automático que realmente funciona! ⚡",
    "Veja seu lucro aumentar a cada dia! 📈",
    "Controle total, sem planilhas, sem dor de cabeça! 🚀"
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0058A3] via-[#00B140] to-[#FFD400] relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 bg-white/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/10 to-green-400/10 rounded-full blur-3xl animate-[spin_20s_linear_infinite]"></div>
      
      <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col lg:flex-row items-center min-h-screen relative z-10">
        {/* Conteúdo Principal */}
        <div className="lg:w-1/2 text-white mb-10 lg:mb-0">
          <FadeIn delay={200}>
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🚀 +200 negócios já usam Lucraí
            </Badge>
          </FadeIn>

          <FadeIn delay={400}>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <Typewriter texts={typewriterTexts} />
            </h1>
          </FadeIn>

          <FadeIn delay={800}>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
              Controle CMV, DRE, estoque e precificação por menos do que você imagina.
            </p>
          </FadeIn>

          <FadeIn delay={1200}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-[#00B140] hover:bg-[#009935] text-white text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-pulse"
              >
                <Play className="mr-2 h-5 w-5" />
                Teste Grátis 7 Dias
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#0058A3] text-lg px-8 py-4 rounded-xl"
              >
                Ver Demonstração
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={1400}>
            <p className="text-sm text-white/70">
              ✓ Sem cartão • ✓ 1 clique • ✓ Garantia de satisfação
            </p>
          </FadeIn>

          <FadeIn delay={1600}>
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-sm text-white/90">
                🔥 <span className="font-semibold">Últimas 20 vagas</span> para teste grátis - Vagas limitadas!
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Mockup Dashboard */}
        <div className="lg:w-1/2">
          <FadeIn delay={1000}>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 ml-2">Dashboard Lucraí</span>
                </div>
                
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-semibold mb-2">Lucro do Mês</h3>
                  <p className="text-white text-2xl font-bold">R$ 45.890</p>
                  <div className="flex items-center text-white/90 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +23% vs mês anterior
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm">CMV</p>
                    <p className="text-blue-600 font-bold">28%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm">Margem</p>
                    <p className="text-green-600 font-bold">72%</p>
                  </div>
                </div>
              </div>
              
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_3s_ease-in-out_infinite] skew-x-12"></div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

// Seção de Benefícios
const BenefitsSection = () => {
  const benefits = [
    { icon: DollarSign, title: "Controle total do seu estoque", description: "Nunca mais perca produtos ou fique sem ingredientes" },
    { icon: Zap, title: "Precificação inteligente em segundos", description: "Algoritmo calcula o preço ideal para máxima lucratividade" },
    { icon: TrendingUp, title: "CMV & DRE prontos automaticamente", description: "Relatórios financeiros sempre atualizados em tempo real" },
    { icon: Bot, title: "Insights proativos por IA", description: "Inteligência artificial sugere melhorias para seu negócio" },
    { icon: CreditCard, title: "Fluxo de caixa simplificado", description: "Controle financeiro descomplicado e visual" },
    { icon: UtensilsCrossed, title: "Para pizzarias, bares, cafeterias e restaurantes", description: "Solução completa para qualquer tipo de food service" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desenvolvido por especialistas em finanças de restaurantes
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <FadeIn key={index} delay={index * 200}>
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0058A3] to-[#00B140] rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// Seção Solução para Dores
const PainSolutionSection = () => {
  const pains = [
    "Não sabe se está tendo lucro?",
    "Erra no preço dos produtos?",
    "Perde itens no estoque?",
    "Não entende contabilidade?",
    "Falta tempo para gestão?"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Chega de prejuízo, planilhas e falta de tempo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Não perca mais dinheiro com CMV fora de controle
            </p>
          </div>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
                <X className="w-6 h-6 mr-2" />
                Seus problemas atuais:
              </h3>
              <ul className="space-y-4">
                {pains.map((pain, index) => (
                  <FadeIn key={index} delay={index * 150}>
                    <li className="flex items-center text-gray-700">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      {pain}
                    </li>
                  </FadeIn>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center">
                <Check className="w-6 h-6 mr-2" />
                Com Lucraí você tem:
              </h3>
              <FadeIn delay={300}>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        Visão e controle em poucos cliques
                      </h4>
                      <p className="text-gray-600">
                        Dashboard completo que mostra exatamente onde você está ganhando ou perdendo dinheiro, com sugestões automáticas de melhorias.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Carousel de Depoimentos
const TestimonialsCarousel = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      position: "Proprietária",
      company: "Pizza Bella Napoli",
      text: "Lucraí transformou meu negócio! Descobri que estava perdendo R$ 3.000 por mês em precificação errada.",
      rating: 5,
      logo: "🍕"
    },
    {
      name: "João Santos",
      position: "Gerente",
      company: "Bar do Zé",
      text: "Finalmente entendo meus números. O CMV automático me poupou 10 horas por semana!",
      rating: 5,
      logo: "🍺"
    },
    {
      name: "Ana Costa",
      position: "Chef",
      company: "Café Gourmet",
      text: "A precificação inteligente aumentou minha margem em 25%. Recomendo para todos!",
      rating: 5,
      logo: "☕"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-[#0058A3] to-[#00B140]">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Mais de 200 negócios já transformaram seus resultados
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Veja o que nossos clientes estão dizendo sobre o Lucraí
            </p>
          </div>
        </FadeIn>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Card className="mx-4 p-8 bg-white shadow-xl">
                    <CardContent className="p-0 text-center">
                      <div className="text-6xl mb-4">{testimonial.logo}</div>
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-lg text-gray-700 mb-6 italic">
                        "{testimonial.text}"
                      </p>
                      <div>
                        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                        <p className="text-gray-600">{testimonial.position} - {testimonial.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentSlide === index ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Seção de Planos com integração Stripe
const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const plans = [
    {
      name: "Starter",
      price: isAnnual ? 47 : 59,
      originalPrice: isAnnual ? 59 : null,
      stripeMonthlyPriceId: "price_1QXgr2J9z1ZzFvG3pL8sNkMq",
      stripeAnnualPriceId: "price_1QXgr2J9z1ZzFvG3pL8sNkMq", 
      features: [
        "1 Restaurante", 
        "Controle básico de estoque", 
        "CMV automático", 
        "Relatórios básicos",
        "Suporte por email"
      ],
      popular: false,
      description: "Ideal para começar",
      savings: isAnnual ? "Economize R$ 144/ano" : null
    },
    {
      name: "Professional",
      price: isAnnual ? 97 : 119,
      originalPrice: isAnnual ? 119 : null,
      stripeMonthlyPriceId: "price_1QXgr2J9z1ZzFvG3pL8sNkMq",
      stripeAnnualPriceId: "price_1QXgr2J9z1ZzFvG3pL8sNkMq",
      features: [
        "Até 3 Restaurantes", 
        "IA para precificação avançada", 
        "DRE completo automatizado", 
        "Relatórios avançados",
        "Analytics em tempo real",
        "Suporte prioritário",
        "WhatsApp integration"
      ],
      popular: true,
      description: "Mais escolhido",
      savings: isAnnual ? "Economize R$ 264/ano" : null
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      customPrice: true,
      features: [
        "Restaurantes ilimitados", 
        "Customizações exclusivas", 
        "Integração com ERPs", 
        "Multi-unidades",
        "API dedicada",
        "Suporte 24/7",
        "Gerente de conta dedicado",
        "Treinamento personalizado"
      ],
      popular: false,
      description: "Para redes e grandes operações",
      savings: null
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Melhor custo-benefício do mercado
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn("text-lg", !isAnnual ? "font-semibold" : "text-gray-500")}>
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={cn(
                  "relative w-16 h-8 rounded-full transition-colors",
                  isAnnual ? "bg-[#00B140]" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute w-6 h-6 bg-white rounded-full top-1 transition-transform",
                  isAnnual ? "translate-x-9" : "translate-x-1"
                )} />
              </button>
              <span className={cn("text-lg", isAnnual ? "font-semibold" : "text-gray-500")}>
                Anual
                <Badge className="ml-2 bg-[#FFD400] text-gray-800">-20%</Badge>
              </span>
            </div>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <FadeIn key={index} delay={index * 200}>
              <Card 
                className={cn(
                  "relative p-8 h-full transition-all duration-500 cursor-pointer group",
                  plan.popular 
                    ? "border-2 border-[#00B140] shadow-2xl scale-105 bg-gradient-to-br from-green-50 to-blue-50" 
                    : "border border-gray-200 hover:shadow-xl hover:scale-105 hover:border-green-300",
                  hoveredPlan === index ? "shadow-2xl scale-105" : ""
                )}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 text-sm font-semibold animate-pulse">
                      🔥 {plan.description}
                    </Badge>
                  </div>
                )}
                
                {plan.savings && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full transform rotate-12 font-bold">
                    {plan.savings}
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    {!plan.popular && (
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    )}
                  </div>
                  
                  <div className="text-center mb-8">
                    {!plan.customPrice ? (
                      <div>
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            R${plan.price}
                          </span>
                          <span className="text-gray-600 ml-1">/mês</span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-gray-500 line-through text-lg">
                            De R${plan.originalPrice}/mês
                          </div>
                        )}
                        <div className="text-green-600 font-semibold text-sm mt-1">
                          💸 Faturamento coberto em 1 dia
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">{plan.price}</div>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={cn(
                      "w-full py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                      plan.popular 
                        ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg" 
                        : plan.customPrice
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                    )}
                  >
                    {plan.customPrice ? '📞 Falar com Vendas' : '🚀 Teste Grátis 7 Dias'}
                    {!plan.customPrice && (
                      <div className="text-xs opacity-75 ml-2">• Sem cartão</div>
                    )}
                  </Button>
                  
                  {!plan.customPrice && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      ✅ Cancele quando quiser • 💳 Sem compromisso
                    </p>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

          <FadeIn delay={600}>
            <div className="text-center mt-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h4 className="font-semibold text-gray-800 mb-2">✅ Garantia de 30 dias</h4>
                <p className="text-gray-600">
                  Teste grátis por 7 dias — sem compromisso. Se não gostar, devolvemos 100% do seu dinheiro.
                </p>
              </div>
            </div>
          </FadeIn>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "Como funciona o teste grátis?",
      answer: "Você tem 7 dias para testar todas as funcionalidades do Lucraí sem pagar nada. Não precisa de cartão de crédito para começar."
    },
    {
      question: "O Lucraí funciona para qualquer tipo de restaurante?",
      answer: "Sim! Funciona para pizzarias, bares, lanchonetes, cafeterias, restaurantes, food trucks e qualquer negócio de alimentação."
    },
    {
      question: "Preciso instalar algum programa?",
      answer: "Não! O Lucraí funciona 100% online. Você acessa de qualquer dispositivo com internet."
    },
    {
      question: "Como funciona a precificação inteligente?",
      answer: "Nossa IA analisa seus custos, margem desejada, concorrência e sugere o preço ideal para maximizar seus lucros."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, você pode cancelar quando quiser. Sem multas, sem burocracias."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Dúvidas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o Lucraí
            </p>
          </div>
        </FadeIn>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 100}>
              <Card className="mb-4 border-0 shadow-sm">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 pr-8">
                      {faq.question}
                    </h3>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-[#00B140] flex items-center justify-center transition-transform",
                      openItems.includes(index) ? "rotate-45" : ""
                    )}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    openItems.includes(index) ? "max-h-96 pb-6" : "max-h-0"
                  )}>
                    <div className="px-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0058A3] to-[#FFD400] rounded-lg mr-3"></div>
              <span className="text-2xl font-bold">Lucraí</span>
            </div>
            <p className="text-gray-400 mb-4">
              O sistema mais completo para gestão de restaurantes do Brasil.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500">
                f
              </div>
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-500">
                @
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Controle de Estoque</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Precificação IA</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CMV Automático</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DRE Completo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
            </ul>
            <div className="mt-4 p-3 bg-green-600 rounded-lg">
              <p className="text-sm">Em breve: suporte via WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Lucraí. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

// Navigation Component
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  const navItems = [
    { id: 'inicio', label: 'Início', href: '#inicio' },
    { id: 'recursos', label: 'Recursos', href: '#recursos' },
    { id: 'sobre', label: 'Sobre', href: '#sobre' },
    { id: 'precos', label: 'Preços', href: '#precos' },
    { id: 'faq', label: 'FAQ', href: '#faq' }
  ];

  const scrollToSection = (href: string, id: string) => {
    setActiveSection(id);
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0058A3] to-[#FFD400] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0058A3] to-[#00B140] bg-clip-text text-transparent">
              Lucraí
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.href, item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#00B140]",
                  activeSection === item.id ? "text-[#00B140]" : "text-gray-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-gradient-to-r from-[#00B140] to-[#0058A3] hover:opacity-90 text-white">
              <Rocket className="w-4 h-4 mr-2" />
              Teste Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.href, item.id)}
                  className="block w-full text-left text-gray-600 hover:text-[#00B140] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button className="w-full bg-gradient-to-r from-[#00B140] to-[#0058A3] text-white mt-4">
                <Rocket className="w-4 h-4 mr-2" />
                Teste Grátis
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Componente Principal
export default function LandingPage() {
  return (
    <div className="font-inter">
      <Navigation />
      <div id="inicio">
        <HeroSection />
      </div>
      <div id="recursos">
        <BenefitsSection />
        <PainSolutionSection />
      </div>
      <TestimonialsCarousel />
      <div id="sobre">
        <AboutSection />
      </div>
      <div id="precos">
        <PricingSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      <Footer />
    </div>
  );
}