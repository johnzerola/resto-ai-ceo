import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp,
  Heart,
  Shield,
  Clock,
  Brain
} from 'lucide-react';

// Componente de animação fade-in
const FadeIn = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
};

// Seção Sobre
export const AboutSection = () => {
  const stats = [
    { icon: Users, value: "500+", label: "Restaurantes atendidos", color: "from-blue-500 to-blue-600" },
    { icon: TrendingUp, value: "35%", label: "Aumento médio de lucro", color: "from-green-500 to-green-600" },
    { icon: Clock, value: "15h", label: "Economizadas por semana", color: "from-purple-500 to-purple-600" },
    { icon: Award, value: "98%", label: "Satisfação dos clientes", color: "from-yellow-500 to-yellow-600" }
  ];

  const values = [
    {
      icon: Brain,
      title: "Inovação Constante",
      description: "Desenvolvemos tecnologia de ponta com IA para revolucionar a gestão de restaurantes.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Foco no Cliente",
      description: "Cada funcionalidade é pensada para resolver problemas reais dos donos de restaurantes.",
      gradient: "from-pink-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Dados seguros, preços justos e sem pegadinhas. O que você vê é o que você paga.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Resultados Reais",
      description: "Nosso sucesso se mede pelo sucesso dos nossos clientes. Lucrou? Nós lucramos juntos.",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Nossa História
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Sobre o <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Lucraí</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nascemos da necessidade real de donos de restaurantes que não conseguiam ter controle sobre seus negócios. 
              Nossa missão é simples: <span className="font-semibold text-gray-800">tornar a gestão financeira acessível e lucrativa para todos</span>.
            </p>
          </div>
        </FadeIn>

        {/* Nossa História */}
        <FadeIn delay={200}>
          <div className="max-w-4xl mx-auto mb-20">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-green-50 border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Por que criamos o Lucraí?
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Depois de ajudar centenas de restaurantes a sair do vermelho, percebemos que 
                      <span className="font-semibold"> 80% dos problemas vinham da falta de controle financeiro</span>.
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Planilhas complexas, sistemas caros e burocráticos não funcionavam. 
                      Precisávamos de algo <span className="font-semibold">simples, barato e que realmente funcionasse</span>.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Assim nasceu o Lucraí: a ferramenta que nós mesmos gostaríamos de ter usado 
                      quando começamos no ramo alimentício.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎯</div>
                        <h4 className="font-bold text-gray-800 mb-2">Nossa Missão</h4>
                        <p className="text-gray-600 text-sm">
                          "Democratizar a gestão financeira profissional para todos os tamanhos de negócio alimentício"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Estatísticas */}
        <FadeIn delay={400}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-0">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-3xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Nossos Valores */}
        <FadeIn delay={600}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Nossos Valores</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Os princípios que nos guiam na construção de um produto que realmente faz a diferença
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <FadeIn key={index} delay={800 + index * 200}>
              <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-0 bg-white group hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-r ${value.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Compromisso */}
        <FadeIn delay={1200}>
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-green-600 border-0 text-white max-w-4xl mx-auto">
              <CardContent className="p-0">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold mb-4">Nosso Compromisso com Você</h3>
                <p className="text-lg leading-relaxed text-blue-50 mb-6">
                  Não somos apenas mais um software. Somos seus parceiros no crescimento do seu negócio. 
                  Quando você lucra, nós sabemos que estamos no caminho certo.
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl mb-2">📞</div>
                    <h4 className="font-semibold mb-1">Suporte Real</h4>
                    <p className="text-sm text-blue-100">Pessoas reais, respostas rápidas</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">🔄</div>
                    <h4 className="font-semibold mb-1">Melhorias Constantes</h4>
                    <p className="text-sm text-blue-100">Seu feedback vira funcionalidade</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-semibold mb-1">Preço Justo</h4>
                    <p className="text-sm text-blue-100">Tecnologia avançada, preço acessível</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};