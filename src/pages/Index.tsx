import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "@/components/auth/AuthButton";
import { HeroCTA } from "@/components/landing/HeroCTA";
import { CTASection } from "@/components/landing/CTASection";
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
  ArrowRight,
  PlayCircle,
  Smartphone,
  Globe,
  MessageSquare,
  PieChart,
  Target,
  Clock,
  Award,
  Monitor,
  DollarSign,
  Utensils,
  TrendingDown,
  Activity
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="relative z-50 w-full bg-white/95 backdrop-blur-lg border-b border-slate-200/60 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  Lucraí CEO
                </h1>
                <p className="text-xs text-slate-600">Gestão Inteligente</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#recursos" className="text-slate-600 hover:text-emerald-500 transition-colors">Recursos</a>
              <a href="#precos" className="text-slate-600 hover:text-emerald-500 transition-colors">Preços</a>
              <a href="#sobre" className="text-slate-600 hover:text-emerald-500 transition-colors">Sobre</a>
            </nav>
            
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-emerald-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-colors">
                <Zap className="mr-2 h-4 w-4" />
                Top Rated Automatic Restaurant Management Software
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-600 bg-clip-text text-transparent">
                    Seu restaurante mais inteligente.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Seus negócios mais lucrativos.
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                  Com a gestão de restaurante do Lucraí você envia mensagens de áudio e texto pelo WhatsApp e 
                  organiza a operação do seu restaurante.
                </p>
              </div>
              
              <HeroCTA />
            </div>
            
            {/* Product Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 border border-slate-200/60">
                <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Dashboard - Lucraí CEO</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/80">Faturamento</span>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">R$ 60.757</div>
                      <div className="text-xs text-emerald-200">+15.3% vs mês anterior</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/80">CMV</span>
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-bold">28.4%</div>
                      <div className="text-xs text-emerald-200">-2.1% otimizado</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm text-white/80 mb-2">Margem de Lucro</div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div className="bg-emerald-300 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="text-sm text-emerald-200">75% da meta mensal atingida</div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">WhatsApp</div>
                      <div className="text-xs text-slate-500">3 mensagens</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">IA Analytics</div>
                      <div className="text-xs text-slate-500">Análise completa</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-t border-slate-200/60">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-slate-600 font-medium">NOSSOS PARCEIROS</p>
          </div>
          <div className="flex justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="text-2xl font-bold text-slate-400">abrasel</div>
            <div className="text-2xl font-bold text-slate-400">ECOA</div>
            <div className="text-2xl font-bold text-slate-400">bia food</div>
            <div className="text-2xl font-bold text-slate-400">Repediu</div>
            <div className="text-2xl font-bold text-slate-400">Falaê!</div>
            <div className="text-2xl font-bold text-slate-400">SEBRAE</div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="recursos" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Recursos Completos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
              Comece no seu estoque e revoluciona a operação inteira
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Olha tudo que a Lucraí faz: desde controle de estoque até análises preditivas com IA
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Movimentação de estoque</h3>
                    <p className="text-slate-600">Controle completo de entrada e saída de produtos com rastreabilidade total.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Gestão de compras</h3>
                    <p className="text-slate-600">Automatize pedidos e otimize sua cadeia de suprimentos.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Controle de CMV</h3>
                    <p className="text-slate-600">Monitore custos em tempo real e otimize sua margem de lucro.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Delegação de tarefas</h3>
                    <p className="text-slate-600">Organize sua equipe e delegue responsabilidades com eficiência.</p>
                  </div>
                </div>
              </div>
              
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Teste grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-white rounded-2xl p-8 shadow-xl border border-slate-200">
                <img 
                  src="/lovable-uploads/633ccea0-b0be-4e1b-8596-7c25ee217aba.png" 
                  alt="Dashboard do sistema mostrando controle de estoque e análises"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Integration Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-slate-900">WhatsApp Business</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-100 rounded-lg p-3 text-sm">
                      <div className="font-medium text-slate-900">5kg parmesão</div>
                      <div className="text-slate-600">1kg de filé</div>
                      <div className="text-slate-600">Venceu Ontem</div>
                    </div>
                    <div className="bg-emerald-100 rounded-lg p-3 text-sm">
                      <div className="font-medium text-emerald-800">INVENTÁRIO</div>
                      <div className="text-emerald-600">Fiz o scan na verduraria</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-slate-900">No WhatsApp por texto, </span>
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    áudio ou foto
                  </span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Além de um painel completo no celular ou computador, você também pode 
                  fazer o controle de tudo através de mensagens de áudio, texto e foto pelo WhatsApp.
                </p>
              </div>
              
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Teste grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time CMV Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                    Seu CMV atualizado em tempo real
                  </span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-6">
                  A gente sabe que a sua rentabilidade depende do CMV, preciso a que 
                  suas conta seja é do fácil de fazer toda força é por isso que facilitamos ela 
                  pra você nem precisar calcular.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">30.4%</div>
                  <div className="text-sm text-slate-600">CMV Atual</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">R$ 15k</div>
                  <div className="text-sm text-slate-600">Economia mensal</div>
                </div>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                Ver demonstração
                <PlayCircle className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-100">CMV</span>
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="text-4xl font-bold mb-1">60.757</div>
                  <div className="text-emerald-200 text-sm">30.4 Meta Semana 29 últimos 10 dias</div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-3xl font-bold mb-1">R$ 50.000,00</div>
                    <div className="text-emerald-200 text-sm">Quanto foram as saídas de agosto?</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-lg font-bold">R$ 16k</div>
                      <div className="text-emerald-200 text-xs">1º Semana</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-lg font-bold">R$ 12k</div>
                      <div className="text-emerald-200 text-xs">2º Semana</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Resultados que <span className="text-emerald-400">fazem a diferença</span>
            </h2>
            <p className="text-xl text-slate-300">
              Veja o impacto real em restaurantes como o seu
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-3">1000+</div>
              <div className="text-slate-300 font-medium">Restaurantes ativos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-3">35%</div>
              <div className="text-slate-300 font-medium">Redução média de custos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-3">60%</div>
              <div className="text-slate-300 font-medium">Tempo economizado</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-3">4.9★</div>
              <div className="text-slate-300 font-medium">Avaliação dos usuários</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              O que nossos clientes dizem
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 text-lg leading-relaxed">
                  "Revolucionou nossa gestão. Conseguimos reduzir custos em 30% no primeiro mês e ter controle total do nosso CMV."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">CS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Carlos Silva</div>
                    <div className="text-sm text-slate-600">Pizzaria do Carlos • São Paulo</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 text-lg leading-relaxed">
                  "A IA nos ajuda a tomar decisões mais assertivas. O WhatsApp integrado é genial para nossa equipe!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">MS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Maria Santos</div>
                    <div className="text-sm text-slate-600">Bistrô Gourmet • Rio de Janeiro</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 text-lg leading-relaxed">
                  "Finalmente temos controle total sobre custos e margens. O sistema é intuitivo e muito completo."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JP</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">João Pereira</div>
                    <div className="text-sm text-slate-600">Restaurante Sabor • Belo Horizonte</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <CTASection />

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
                    Lucraí CEO
                  </h3>
                  <p className="text-slate-400 text-sm">Gestão Inteligente</p>
                </div>
              </div>
              
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                A plataforma de gestão inteligente que transforma dados em lucro para seu restaurante. 
                Controle total, análises preditivas e automação em um só lugar.
              </p>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-8 text-sm text-slate-400">
                <span>© 2024 Lucraí CEO</span>
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Termos</a>
              </div>
              <div className="text-sm text-slate-400">
                Feito com ❤️ para restaurantes brasileiros
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
