
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Calculator,
  Users,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00D887] to-[#1B2C4F] rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#1B2C4F] to-[#00D887] bg-clip-text text-transparent">
                  LucrAÍ CEO
                </h1>
                <p className="text-xs text-slate-600">Gestão Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-[#00D887]">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:shadow-lg">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-[#00D887]/10 text-[#00D887] border-[#00D887]/20">
              🚀 Revolucione seu restaurante com IA
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1B2C4F] via-slate-700 to-[#00D887] bg-clip-text text-transparent leading-tight">
              Gestão Inteligente para
              <span className="block">Restaurantes Modernos</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transforme seus dados em lucro com nossa plataforma de IA. 
              Controle total de custos, precificação inteligente e análises preditivas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg px-8 py-6">
                  <Zap className="mr-2 h-5 w-5" />
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-[#00D887] text-[#00D887] hover:bg-[#00D887] hover:text-white transition-all duration-200 text-lg px-8 py-6">
                  Entrar na plataforma
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Funcionalidades completas para gestão inteligente do seu restaurante
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Fichas Técnicas</CardTitle>
                <CardDescription>
                  Padronize receitas e calcule custos automaticamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1B2C4F] to-[#2D4A6B] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">DRE Automática</CardTitle>
                <CardDescription>
                  Relatórios financeiros em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">IA Preditiva</CardTitle>
                <CardDescription>
                  Previsões de vendas e análises inteligentes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1B2C4F] to-[#2D4A6B] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Controle Total</CardTitle>
                <CardDescription>
                  Gestão completa de estoque e fornecedores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Multi-usuário</CardTitle>
                <CardDescription>
                  Colaboração em equipe com controle de acesso
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#00D887]/30">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1B2C4F] to-[#2D4A6B] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-900">Automação</CardTitle>
                <CardDescription>
                  Processos automáticos para máxima eficiência
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-900">
                Resultados comprovados
              </h2>
              <p className="text-xl text-slate-600">
                Veja o que nossos clientes alcançaram
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00D887] mb-2">35%</div>
                <div className="text-slate-900 font-semibold mb-2">Redução de custos</div>
                <div className="text-slate-600">Controle inteligente de despesas</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00D887] mb-2">60%</div>
                <div className="text-slate-900 font-semibold mb-2">Tempo economizado</div>
                <div className="text-slate-600">Automatização de processos</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00D887] mb-2">25%</div>
                <div className="text-slate-900 font-semibold mb-2">Aumento do lucro</div>
                <div className="text-slate-600">Precificação otimizada</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#00D887] text-[#00D887]" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "Revolucionou nossa gestão. Conseguimos reduzir custos em 30% no primeiro mês."
                </p>
                <div className="font-semibold text-slate-900">Carlos Silva</div>
                <div className="text-sm text-slate-600">Pizzaria do Carlos</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#00D887] text-[#00D887]" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "A IA nos ajuda a tomar decisões mais assertivas. Recomendo!"
                </p>
                <div className="font-semibold text-slate-900">Maria Santos</div>
                <div className="text-sm text-slate-600">Bistrô Gourmet</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#00D887] text-[#00D887]" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "Finalmente temos controle total sobre nossos custos e margens."
                </p>
                <div className="font-semibold text-slate-900">João Pereira</div>
                <div className="text-sm text-slate-600">Restaurante Sabor</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1B2C4F] to-[#00D887]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Pronto para transformar seu restaurante?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Junte-se a centenas de restaurantes que já aumentaram seus lucros
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#1B2C4F] hover:bg-slate-100 text-lg px-8 py-6">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Começar teste gratuito
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1B2C4F] text-lg px-8 py-6">
                  Já tem conta? Entrar
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-white/70 mt-6">
              ✅ 14 dias grátis • ✅ Sem compromisso • ✅ Suporte incluído
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00D887] to-[#00B572] rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-[#00D887] bg-clip-text text-transparent">
                  LucrAÍ CEO
                </h3>
              </div>
            </div>
            
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              A plataforma de gestão inteligente que transforma dados em lucro para seu restaurante.
            </p>
            
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              <span>© 2024 LucrAÍ</span>
              <span>•</span>
              <span>Todos os direitos reservados</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
