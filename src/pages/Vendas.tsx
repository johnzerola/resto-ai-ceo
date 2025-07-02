
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  LogIn,
  UserPlus,
  Star,
  CheckCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Users,
  Clock,
  Shield,
  Zap,
  Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Vendas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header público */}
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D887] to-[#00B572] bg-clip-text text-transparent">
                RestaurIA
              </h1>
              <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:from-[#00B572] hover:to-[#00A665] text-white shadow-lg" asChild>
              <Link to="/login">
                <UserPlus className="h-4 w-4 mr-2" />
                Começar Grátis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 space-y-12">
        {/* Hero Section */}
        <section className="text-center py-16 space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-full border border-[#00D887]/20 mb-6">
              <Star className="h-4 w-4 text-[#00D887] mr-2" />
              <span className="text-sm font-medium text-[#00D887]">Plataforma #1 para Restaurantes</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Gestão Inteligente para 
              <span className="bg-gradient-to-r from-[#00D887] to-[#00B572] bg-clip-text text-transparent block mt-2">
                Seu Restaurante
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Controle completo de vendas, estoque, cardápio e financeiro em uma única plataforma. 
              <span className="font-semibold text-foreground">Aumente seus lucros em até 40%</span> com nossa IA especializada.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Button size="lg" className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:from-[#00B572] hover:to-[#00A665] text-white shadow-xl px-8 py-6 text-lg" asChild>
              <Link to="/login">
                <Zap className="h-5 w-5 mr-2" />
                Começar Trial Gratuito
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2" asChild>
              <Link to="/login">
                Ver Demo Ao Vivo
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#00D887]" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#00D887]" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#00D887]" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </section>

        {/* Números de Sucesso */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resultados que Falam por Si
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milhares de restaurantes já transformaram seus negócios com o RestaurIA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:border-[#00D887]/30 transition-all">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-[#00D887] mb-2">2.500+</div>
                <div className="text-lg font-semibold mb-1">Restaurantes Ativos</div>
                <div className="text-sm text-muted-foreground">Em todo o Brasil</div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-[#00D887]/30 transition-all">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-[#00D887] mb-2">40%</div>
                <div className="text-lg font-semibold mb-1">Aumento no Lucro</div>
                <div className="text-sm text-muted-foreground">Média dos clientes</div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-[#00D887]/30 transition-all">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-[#00D887] mb-2">8h</div>
                <div className="text-lg font-semibold mb-1">Economizadas/Semana</div>
                <div className="text-sm text-muted-foreground">Em gestão manual</div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-[#00D887]/30 transition-all">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-[#00D887] mb-2">99.8%</div>
                <div className="text-lg font-semibold mb-1">Uptime</div>
                <div className="text-sm text-muted-foreground">Disponibilidade garantida</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de transformação e sucesso
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-[#00D887] mb-4" />
                <p className="text-lg mb-6 leading-relaxed">
                  "O RestaurIA revolucionou nossa operação. Conseguimos reduzir custos em 35% e aumentar nossa margem de lucro significativamente."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Maria Silva</div>
                    <div className="text-sm text-muted-foreground">Proprietária - Cantina da Maria</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-[#00D887] mb-4" />
                <p className="text-lg mb-6 leading-relaxed">
                  "A análise financeira automática me deu visibilidade total do negócio. Agora sei exatamente onde posso melhorar."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-full flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div>
                    <div className="font-semibold">Carlos Mendes</div>
                    <div className="text-sm text-muted-foreground">Chef - Bistrô do Carlos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-[#00D887] mb-4" />
                <p className="text-lg mb-6 leading-relaxed">
                  "Economizo mais de 10 horas por semana em tarefas administrativas. Posso focar no que realmente importa: meus clientes."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <div className="font-semibold">Ana Rodrigues</div>
                    <div className="text-sm text-muted-foreground">Gerente - Pizzaria Bella</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que seu restaurante precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais que se adaptam ao seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Análise de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dashboards em tempo real com métricas de performance, faturamento e tendências de vendas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Controle Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  DRE automatizado, fluxo de caixa e análise de custos para maximizar sua margem de lucro.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Gestão de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Controle inteligente de ingredientes com alertas automáticos e otimização de compras.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Cardápio Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Precificação automática com análise de CMV e sugestões de pratos mais lucrativos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Automação Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Processos automatizados que economizam horas de trabalho manual todos os dias.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#00D887]/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#00D887]" />
                </div>
                <CardTitle>Segurança Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dados protegidos com criptografia de nível bancário e backups automáticos.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Empresas que Confiam */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Empresas que confiam no RestaurIA
            </h2>
            <p className="text-lg text-muted-foreground">
              De pequenos bistrôs a grandes redes de restaurantes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {[
              'Bistrô Gourmet', 'Pizzaria Bella', 'Cantina Maria', 
              'Sushi House', 'Burger Palace', 'Café Central'
            ].map((name, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-600">
                    {name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-600">{name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="py-16">
          <Card className="bg-gradient-to-r from-[#00D887]/10 via-[#00B572]/5 to-[#00D887]/10 border-[#00D887]/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold">
                  Pronto para transformar seu restaurante?
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Junte-se a mais de <span className="font-semibold text-[#00D887]">2.500+ restaurantes</span> que já aumentaram seus lucros com o RestaurIA.
                  Comece agora com <span className="font-semibold">14 dias grátis</span> e veja a diferença.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:from-[#00B572] hover:to-[#00A665] text-white shadow-xl px-8 py-6 text-lg" asChild>
                    <Link to="/login">
                      <Zap className="h-5 w-5 mr-2" />
                      Começar Agora - Grátis por 14 dias
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2" asChild>
                    <Link to="/login">
                      Falar com Especialista
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D887]" />
                    <span>Sem compromisso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D887]" />
                    <span>Implementação gratuita</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#00D887]" />
                    <span>Suporte 24/7</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-semibold">RestaurIA</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 RestaurIA. Todos os direitos reservados. Gestão inteligente para restaurantes.
          </p>
        </div>
      </footer>
    </div>
  );
}
