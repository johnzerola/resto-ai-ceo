import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrialCountdown } from "@/components/trial/TrialCountdown";
import { TrialExpirationPopup } from "@/components/trial/TrialExpirationPopup";
import { 
  PlayCircle, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Zap,
  Shield,
  Users,
  Clock,
  Star,
  Crown
} from "lucide-react";

// Typewriter effect component
const TypewriterEffect = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 1500 }: {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
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
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span>
      {currentText}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
};

// Fade-in animation component
const FadeInUp = ({ children, delay = 0 }: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
};

export function OptimizedHero() {
  const { isAuthenticated } = useAuth();
  const { trialStatus } = useTrialStatus();
  const [showTrialPopup, setShowTrialPopup] = useState(false);
  
  const heroTexts = [
    "Aumente seu lucro em até 40% em 30 dias",
    "Controle seu CMV como um expert",
    "Transforme seu restaurante num negócio lucrativo"
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Content */}
          <div className="space-y-8">
            <FadeInUp delay={200}>
              {isAuthenticated && trialStatus?.isTrialActive ? (
                <TrialCountdown 
                  daysRemaining={trialStatus.daysRemaining} 
                  isTrialActive={trialStatus.isTrialActive}
                  variant="compact"
                />
              ) : (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-slow-pulse shadow-lg">
              <Crown className="mr-2 h-4 w-4" />
              🔥 ÚLTIMAS 47 VAGAS - Teste Grátis 7 dias
            </Badge>
              )}
            </FadeInUp>

            <FadeInUp delay={400}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-foreground">
                  <TypewriterEffect texts={heroTexts} />
                </span>
              </h1>
            </FadeInUp>

            <FadeInUp delay={600}>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                <span className="text-primary font-semibold">Pare de perder dinheiro!</span> 
                {" "}Sistema completo de gestão financeira para restaurantes. 
                Controle CMV, DRE e precificação em tempo real.
              </p>
            </FadeInUp>

            <FadeInUp delay={800}>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  trialStatus?.isTrialActive ? (
                    <Link to="/assinatura">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto group animate-slow-pulse"
                      >
                        <Crown className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        ATIVAR PLANO - 50% OFF
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto group"
                      >
                        <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        Acessar Dashboard
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link to="/login?tab=register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto group animate-slow-pulse"
                    >
                      <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      TESTE GRÁTIS 7 DIAS
                    </Button>
                  </Link>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border hover:border-primary hover:text-primary transition-all duration-300 text-lg px-8 py-6 w-full sm:w-auto group"
                >
                  <PlayCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Ver Demonstração
                </Button>
              </div>
            </FadeInUp>

            {/* Social proof and benefits */}
            <FadeInUp delay={1000}>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Setup em 5 minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Suporte gratuito</span>
                  </div>
                </div>

                {/* Social proof */}
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold text-white">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm font-semibold ml-2">4.9/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">+200 restaurantes</span> aumentaram o lucro em 30 dias
                      </p>
                    </div>
                  </div>
                </div>

                {/* Urgency element - Trial countdown for authenticated users */}
                {isAuthenticated && trialStatus?.isTrialActive && trialStatus.daysRemaining <= 3 ? (
                  <TrialCountdown 
                    daysRemaining={trialStatus.daysRemaining} 
                    isTrialActive={trialStatus.isTrialActive}
                    variant="hero"
                  />
                ) : (
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-3 animate-slow-pulse">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">
                        🔥 Promoção especial: 50% OFF termina em breve!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </FadeInUp>
          </div>

          {/* Dashboard mockup */}
          <FadeInUp delay={600}>
            <div className="relative">
              <div className="bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-2xl p-8 border border-border backdrop-blur-sm transform hover:scale-105 transition-all duration-500">
                {/* Browser header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">
                    dashboard.lucrai.com
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Lucro Mensal</h3>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold mb-2">R$ 58.427</div>
                    <div className="flex items-center text-green-200 text-sm">
                      <ArrowRight className="h-4 w-4 mr-1 rotate-[-45deg]" />
                      +34% vs mês anterior
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">CMV</div>
                      <div className="text-xl font-bold text-primary">26.8%</div>
                      <div className="text-xs text-green-600">-3.2% otimizado</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Margem</div>
                      <div className="text-xl font-bold text-accent">73.2%</div>
                      <div className="text-xs text-green-600">+8.5% melhorada</div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Meta Mensal</div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-4/5"></div>
                    </div>
                    <div className="text-sm text-primary font-semibold">80% concluída</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}

              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 border animate-bounce delay-500">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-sm font-semibold">+200</div>
                    <div className="text-xs text-muted-foreground">Restaurantes</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}