import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  MessageSquare,
  Calculator,
  PieChart,
  BarChart3,
  Shield,
  Smartphone
} from "lucide-react";

// Intersection Observer hook for animations
const useInView = () => {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return [setRef, isInView] as const;
};

// Animated counter
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: {
  end: number;
  duration?: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

export function PersuasiveAbout() {
  const [heroRef, heroInView] = useInView();
  const [problemRef, problemInView] = useInView();
  const [solutionRef, solutionInView] = useInView();
  const [benefitsRef, benefitsInView] = useInView();
  const [socialProofRef, socialProofInView] = useInView();

  const problems = [
    {
      icon: TrendingUp,
      title: "Não sabe se está tendo lucro real?",
      description: "85% dos restaurantes fecham sem saber onde perderam dinheiro",
      impact: "R$ 15.000/mês perdidos em média"
    },
    {
      icon: Calculator,
      title: "Precificação no 'achômetro'?",
      description: "Definir preços sem base científica é o caminho para o prejuízo",
      impact: "Margem 40% menor que o potencial"
    },
    {
      icon: Clock,
      title: "Horas perdidas com planilhas?",
      description: "Gestores gastam 20h/semana em tarefas que deveriam ser automáticas",
      impact: "R$ 8.000/mês em tempo perdido"
    }
  ];

  const solutions = [
    {
      icon: PieChart,
      title: "CMV e DRE em Tempo Real",
      description: "Tenha visão completa da saúde financeira do seu negócio atualizada a cada venda",
      result: "+34% lucro em média"
    },
    {
      icon: Target,
      title: "Precificação Inteligente com IA",
      description: "Algoritmo calcula o preço ideal considerando todos os custos e margem desejada",
      result: "+28% margem otimizada"
    },
    {
      icon: Smartphone,
      title: "Controle Total pelo WhatsApp",
      description: "Gerencie estoque, vendas e relatórios direto do WhatsApp com comandos de voz",
      result: "95% menos tempo gasto"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Aumento Médio de 40% no Lucro",
      subtitle: "Em até 30 dias de uso",
      description: "Otimização automática de custos e preços baseada em dados reais",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Economia de 20h por Semana",
      subtitle: "Automatização completa",
      description: "Relatórios, controles e análises gerados automaticamente",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Redução de 60% nos Erros",
      subtitle: "Controle automatizado",
      description: "Sistema inteligente previne erros de precificação e estoque",
      color: "from-purple-500 to-violet-600"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "Dono - Pizzaria Don Luigi",
      text: "Em 15 dias descobri que estava perdendo R$ 4.000/mês em precificação errada. Lucraí me salvou!",
      rating: 5,
      increase: "+45%",
      metric: "lucro"
    },
    {
      name: "Marina Santos",
      role: "Chef - Bistrô Gourmet",
      text: "Nunca pensei que gestão financeira pudesse ser tão simples. Meu CMV está sempre na meta agora.",
      rating: 5,
      increase: "+38%",
      metric: "margem"
    },
    {
      name: "Roberto Silva",
      role: "Gerente - Rede de Lanchonetes",
      text: "Sistema revolucionário! Controlo 3 lojas pelo WhatsApp e tenho todos os números em tempo real.",
      rating: 5,
      increase: "20h",
      metric: "economia/semana"
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      {/* Hero About */}
      <div 
        ref={heroRef}
        className={`container mx-auto px-6 mb-20 transition-all duration-1000 ${
          heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Award className="mr-2 h-4 w-4" />
            Sobre a Lucraí - Desenvolvido por Especialistas
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Transformamos restaurantes em máquinas de lucro
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Criamos a <span className="text-primary font-semibold">primeira plataforma brasileira</span> que 
            combina gestão financeira inteligente com automação por IA, desenvolvida especificamente 
            para o food service nacional.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <div className="text-muted-foreground">Restaurantes ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                <AnimatedCounter end={34} suffix="%" />
              </div>
              <div className="text-muted-foreground">Aumento médio de lucro</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                R$ <AnimatedCounter end={2} suffix="M+" />
              </div>
              <div className="text-muted-foreground">Economia gerada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div 
        ref={problemRef}
        className={`container mx-auto px-6 mb-20 transition-all duration-1000 delay-200 ${
          problemInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-destructive">
              95% dos restaurantes cometem estes erros fatais
            </h3>
            <p className="text-xl text-muted-foreground">
              Que custam em média <span className="text-destructive font-semibold">R$ 23.000 por mês</span> em prejuízos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <Card 
                key={index} 
                className="border-destructive/20 bg-card hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                    <problem.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{problem.title}</h4>
                  <p className="text-muted-foreground mb-4">{problem.description}</p>
                  <div className="bg-destructive/5 rounded-lg p-3">
                    <span className="text-destructive font-semibold text-sm">
                      💸 Impacto: {problem.impact}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div 
        ref={solutionRef}
        className={`container mx-auto px-6 mb-20 transition-all duration-1000 delay-400 ${
          solutionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Nossa solução científica e comprovada
            </h3>
            <p className="text-xl text-muted-foreground">
              Tecnologia que já gerou <span className="text-primary font-semibold">mais de R$ 2 milhões</span> em economia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card 
                key={index} 
                className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <solution.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{solution.title}</h4>
                  <p className="text-muted-foreground mb-4">{solution.description}</p>
                  <div className="bg-primary/5 rounded-lg p-3">
                    <span className="text-primary font-semibold text-sm">
                      ✅ Resultado: {solution.result}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div 
        ref={benefitsRef}
        className={`container mx-auto px-6 mb-20 transition-all duration-1000 delay-600 ${
          benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Resultados que você vai ver nos primeiros 30 dias
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`h-2 bg-gradient-to-r ${benefit.color}`}></div>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-lg flex items-center justify-center mb-4`}>
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-1">{benefit.title}</h4>
                  <p className="text-primary font-semibold text-sm mb-3">{benefit.subtitle}</p>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div 
        ref={socialProofRef}
        className={`container mx-auto px-6 transition-all duration-1000 delay-800 ${
          socialProofInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Veja o que nossos clientes estão falando
            </h3>
            <div className="flex justify-center items-center gap-2 mb-4">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xl font-semibold ml-2">4.9/5</span>
              <span className="text-muted-foreground ml-2">(+200 avaliações)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="bg-gradient-to-br from-card to-secondary/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground italic mb-4">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold">{testimonial.name}</h5>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold text-lg">{testimonial.increase}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.metric}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
            >
              Quero estes resultados também
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}