import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Star, 
  Shield,
  TrendingUp,
  Users,
  Zap,
  PlayCircle,
  DollarSign,
  Target,
  AlertTriangle
} from "lucide-react";

export function PersuasiveCTA() {
  const { isAuthenticated } = useAuth();
  const [urgencyTimer, setUrgencyTimer] = useState({ hours: 23, minutes: 47, seconds: 32 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "Lucraí me salvou! Descobri que estava perdendo R$ 5.000/mês",
      author: "Carlos - Pizza Express",
      increase: "+42%"
    },
    {
      text: "Em 15 dias meu lucro aumentou 38%. Sistema revolucionário!",
      author: "Marina - Bistrô Gourmet", 
      increase: "+38%"
    },
    {
      text: "Melhor investimento que fiz. ROI de 500% no primeiro mês",
      author: "Roberto - Rede de Lanchonetes",
      increase: "+56%"
    }
  ];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotating testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce delay-1000"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          
          {/* Urgency header */}
          <Badge className="mb-6 bg-destructive/20 text-white border-destructive/30 animate-slow-pulse">
            <AlertTriangle className="mr-2 h-4 w-4" />
            🔥 ÚLTIMAS HORAS - Promoção encerra em:
          </Badge>

          {/* Countdown timer */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold">{String(urgencyTimer.hours).padStart(2, '0')}</div>
              <div className="text-sm opacity-80">HORAS</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold">{String(urgencyTimer.minutes).padStart(2, '0')}</div>
              <div className="text-sm opacity-80">MIN</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold">{String(urgencyTimer.seconds).padStart(2, '0')}</div>
              <div className="text-sm opacity-80">SEG</div>
            </div>
          </div>

          {/* Main headline */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Não perca mais dinheiro!
            <br />
            <span className="text-yellow-300">
              Comece a lucrar hoje mesmo
            </span>
          </h2>

          <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            Junte-se aos <span className="font-semibold text-yellow-300">+200 restaurantes</span> que 
            já aumentaram seu lucro em até <span className="font-semibold text-yellow-300">40% em 30 dias</span> 
            com nossa tecnologia.
          </p>

          {/* Rotating testimonials */}
          <div className="mb-8 h-20 flex items-center justify-center">
            <div className="max-w-2xl transition-all duration-500 ease-in-out">
              <p className="text-lg italic mb-2">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm opacity-80">
                  {testimonials[currentTestimonial].author}
                </span>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  {testimonials[currentTestimonial].increase} lucro
                </Badge>
              </div>
            </div>
          </div>

          {/* Main CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xl px-12 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold animate-slow-pulse"
                >
                  <TrendingUp className="mr-3 h-6 w-6" />
                  ACESSAR DASHBOARD
                </Button>
              </Link>
            ) : (
              <Link to="/login?tab=register">
                <Button 
                  size="lg" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xl px-12 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold animate-slow-pulse"
                >
                  <Zap className="mr-3 h-6 w-6" />
                  TESTE GRÁTIS 7 DIAS
                </Button>
              </Link>
            )}

            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white hover:text-primary text-xl px-12 py-6 rounded-xl backdrop-blur-sm"
            >
              <PlayCircle className="mr-3 h-6 w-6" />
              Ver Demonstração
            </Button>
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Aumento Imediato</h3>
                <p className="text-sm opacity-80">+40% lucro médio em 30 dias</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Precisão Total</h3>
                <p className="text-sm opacity-80">CMV e precificação automática</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-semibold mb-2">Economia de Tempo</h3>
                <p className="text-sm opacity-80">20h/semana economizadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Dados 100% seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>+200 clientes satisfeitos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.9/5 avaliação</span>
            </div>
          </div>

          {/* Final urgency message */}
          <div className="bg-destructive/20 backdrop-blur-sm border border-destructive/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">
              ⚠️ Últimas vagas disponíveis
            </h3>
            <p className="text-lg">
              Apenas <span className="font-bold text-yellow-300">23 vagas restantes</span> para 
              a promoção de lançamento. Não perca a oportunidade de transformar seu restaurante!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}