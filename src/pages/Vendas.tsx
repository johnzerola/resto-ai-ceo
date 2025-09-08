
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
  Quote,
  AlertCircle,
  Target,
  Brain,
  CreditCard,
  Eye,
  Coffee,
  Pizza,
  Wine,
  Utensils,
  X,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Vendas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-lucrai-gray-neutral to-lucrai-blue-tech/5">
      {/* Header público */}
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent bg-clip-text text-transparent">
                Lucraí
              </h1>
              <p className="text-xs text-lucrai-gray-text">Sistema Inteligente para Restaurantes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:flex text-lucrai-blue-tech hover:text-lucrai-green-profit" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-lucrai-green-profit to-lucrai-green-profit-dark hover:from-lucrai-green-profit-dark hover:to-lucrai-green-profit text-white shadow-lg font-semibold" asChild>
              <Link to="/login">
                <UserPlus className="h-4 w-4 mr-2" />
                Teste Grátis 7 Dias
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 space-y-16">
        {/* Hero Section */}
        <section className="text-center py-20 space-y-10">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-lucrai-green-profit/10 via-lucrai-blue-tech/10 to-lucrai-gold-accent/10 rounded-full border border-lucrai-green-profit/20 mb-8">
              <Star className="h-5 w-5 text-lucrai-green-profit mr-2" />
              <span className="text-sm font-semibold text-lucrai-blue-tech">Sistema #1 para Restaurantes Lucrativos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              O sistema mais fácil e barato para 
              <span className="bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent bg-clip-text text-transparent block mt-2">
                fazer seu negócio lucrar de verdade!
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-lucrai-gray-text max-w-4xl mx-auto leading-relaxed">
              Controle CMV, DRE, estoque e precificação sem planilhas, sem dor de cabeça e 
              <span className="font-bold text-lucrai-blue-tech"> por menos do que você imagina.</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-lucrai-green-profit to-lucrai-green-profit-dark hover:from-lucrai-green-profit-dark hover:to-lucrai-green-profit text-white shadow-2xl px-10 py-8 text-xl font-bold transform hover:scale-105 transition-all duration-300" asChild>
              <Link to="/login">
                <Zap className="h-6 w-6 mr-2" />
                Comece a Lucrar Agora!
                <ArrowRight className="h-6 w-6 ml-2" />
              </Link>
            </Button>
            <p className="text-sm text-lucrai-gray-text">
              <CheckCircle className="h-4 w-4 inline text-lucrai-green-profit mr-1" />
              Teste grátis 7 dias • Sem cartão • 1 clique
            </p>
          </div>

          {/* Sistema Preview - Placeholder animado */}
          <div className="mt-16 bg-gradient-to-br from-white to-lucrai-gray-neutral rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-lucrai-green-profit/10 p-6 rounded-xl">
                <div className="text-3xl font-bold text-lucrai-green-profit mb-2">+47%</div>
                <div className="text-sm text-lucrai-blue-tech">Lucro este mês</div>
              </div>
              <div className="bg-lucrai-blue-tech/10 p-6 rounded-xl">
                <div className="text-3xl font-bold text-lucrai-blue-tech mb-2">23.4%</div>
                <div className="text-sm text-lucrai-blue-tech">CMV otimizado</div>
              </div>
              <div className="bg-lucrai-gold-accent/10 p-6 rounded-xl">
                <div className="text-3xl font-bold text-lucrai-gold-accent mb-2">R$ 2.847</div>
                <div className="text-sm text-lucrai-blue-tech">Economia mensal</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios em Blocos */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Tudo que você precisa para lucrar mais
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-3xl mx-auto">
              Funciona para pizzarias, bares, cafeterias, restaurantes e lanchonetes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-green-profit/10 to-lucrai-green-profit/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-8 h-8 text-lucrai-green-profit" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">💰 Controle total do seu estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  Nunca mais perca ingredientes ou fique sem produtos. Alertas automáticos quando acabar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-blue-tech/10 to-lucrai-blue-tech/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-lucrai-blue-tech" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">⚡ Precificação inteligente em segundos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  O sistema calcula o preço ideal automaticamente. Nunca mais venda no prejuízo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-gold-accent/10 to-lucrai-gold-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-lucrai-gold-accent" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">📈 CMV & DRE prontos automaticamente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  Relatórios contábeis completos sem precisar de contador. Veja seus lucros na hora.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-green-profit/10 to-lucrai-green-profit/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-lucrai-green-profit" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">🤖 Insights por IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  Inteligência artificial te diz exatamente onde melhorar para lucrar mais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-blue-tech/10 to-lucrai-blue-tech/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8 text-lucrai-blue-tech" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">💳 Fluxo de caixa simples e visual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  Veja todas as entradas e saídas em gráficos fáceis de entender.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-lucrai-green-profit/30 transition-all duration-300 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-lucrai-gold-accent/10 to-lucrai-gold-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Utensils className="w-8 h-8 text-lucrai-gold-accent" />
                </div>
                <CardTitle className="text-xl text-lucrai-blue-tech">🍕 ☕ 🍔 🍻 Para todos os negócios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lucrai-gray-text text-center">
                  Pizzarias, bares, cafeterias, restaurantes e lanchonetes. Funciona para todos!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Solução para as Dores */}
        <section className="py-16 bg-gradient-to-r from-red-50 to-green-50 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Chega de prejuízo, planilhas e falta de tempo
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-3xl mx-auto">
              O Lucraí faz o difícil por você — mostra onde você perde dinheiro e como lucrar mais, sem ser contador.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-red-600 mb-6">Problemas que você enfrenta hoje:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-lucrai-gray-text">Não sabe se está tendo lucro?</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-lucrai-gray-text">Erra no preço dos produtos?</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-lucrai-gray-text">Perde itens no estoque?</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-lucrai-gray-text">Não entende contabilidade?</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-lucrai-gray-text">Falta tempo para gestão?</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-lucrai-green-profit mb-6">Com Lucraí, você resolve tudo:</h3>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-lucrai-green-profit" />
                  <span className="text-xl font-semibold text-lucrai-blue-tech">Visão e controle em poucos cliques</span>
                </div>
                <p className="text-lucrai-gray-text">
                  Dashboards intuitivos mostram exatamente onde seu dinheiro está indo e como aumentar seus lucros.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Histórias reais de sucesso
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-2xl mx-auto">
              Veja como outros donos de restaurantes transformaram seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative bg-gradient-to-br from-white to-lucrai-gray-neutral border-2 hover:border-lucrai-green-profit/30 transition-all">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-lucrai-green-profit mb-4" />
                <p className="text-lucrai-gray-text mb-6 leading-relaxed">
                  "Com o Lucraí, nunca mais vendi pizza sem saber se estava lucrando. O sistema me diz o preço certo na hora!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-lucrai-green-profit to-lucrai-blue-tech rounded-full flex items-center justify-center text-white font-bold">
                    <Pizza className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lucrai-blue-tech">Pedro Silva</div>
                    <div className="text-sm text-lucrai-gray-text">Pizzaria Bella Napolitana</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-white to-lucrai-gray-neutral border-2 hover:border-lucrai-green-profit/30 transition-all">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-lucrai-green-profit mb-4" />
                <p className="text-lucrai-gray-text mb-6 leading-relaxed">
                  "Agora sei quanto gasto em cada café e nunca mais fiquei no vermelho. Recomendo para todo mundo!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-lucrai-gold-accent to-lucrai-green-profit rounded-full flex items-center justify-center text-white font-bold">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lucrai-blue-tech">Sofia Martins</div>
                    <div className="text-sm text-lucrai-gray-text">Café Aromas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-white to-lucrai-gray-neutral border-2 hover:border-lucrai-green-profit/30 transition-all">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-lucrai-green-profit mb-4" />
                <p className="text-lucrai-gray-text mb-6 leading-relaxed">
                  "Antes era só prejuízo com estoque, hoje tenho lucro fixo todo mês."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-lucrai-blue-tech to-lucrai-gold-accent rounded-full flex items-center justify-center text-white font-bold">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lucrai-blue-tech">Rodrigo Santos</div>
                    <div className="text-sm text-lucrai-gray-text">Hamburgueria Grill House</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gradient-to-br from-white to-lucrai-gray-neutral border-2 hover:border-lucrai-green-profit/30 transition-all">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-lucrai-green-profit mb-4" />
                <p className="text-lucrai-gray-text mb-6 leading-relaxed">
                  "O Lucraí manda alerta até quando vai faltar insumo. É fácil, barato e me fez crescer!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-lucrai-green-profit to-lucrai-blue-tech rounded-full flex items-center justify-center text-white font-bold">
                    <Wine className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lucrai-blue-tech">Ana Costa</div>
                    <div className="text-sm text-lucrai-gray-text">Bar do Ruy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demonstração Visual do Sistema */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Veja o Lucraí em ação
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-2xl mx-auto">
              Interface simples e poderosa que qualquer pessoa consegue usar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-lucrai-green-profit/10 to-lucrai-green-profit/20 border-lucrai-green-profit/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lucrai-blue-tech">
                  <BarChart3 className="h-5 w-5" />
                  📊 Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-lucrai-gray-text mb-4">Gráfico de margem, receita x custo em tempo real</p>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-lucrai-green-profit">R$ 4.847</div>
                  <div className="text-xs text-lucrai-gray-text">Lucro este mês</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-lucrai-blue-tech/10 to-lucrai-blue-tech/20 border-lucrai-blue-tech/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lucrai-blue-tech">
                  <Target className="h-5 w-5" />
                  📋 Ficha Técnica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-lucrai-gray-text mb-4">Ingredientes, custo/porção, markup automático</p>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-lucrai-blue-tech">R$ 8,50</div>
                  <div className="text-xs text-lucrai-gray-text">Custo por porção</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-100 to-red-200 border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  🚨 Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-lucrai-gray-text mb-4">Estoque baixo, margem abaixo da meta</p>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm font-semibold text-red-600">Alerta!</div>
                  <div className="text-xs text-lucrai-gray-text">Farinha acabando</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-lucrai-gold-accent/10 to-lucrai-gold-accent/20 border-lucrai-gold-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lucrai-blue-tech">
                  <DollarSign className="h-5 w-5" />
                  💲 Precificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-lucrai-gray-text mb-4">Preço sugerido, mínimo e premium</p>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-lucrai-gold-accent">R$ 28,90</div>
                  <div className="text-xs text-lucrai-gray-text">Preço sugerido</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Planos & Garantias */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-2xl mx-auto">
              Investimento que se paga sozinho no primeiro mês
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative border-2 hover:border-lucrai-green-profit/50 transition-all">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-lucrai-blue-tech">Starter</CardTitle>
                <div className="text-4xl font-bold text-lucrai-green-profit mt-4">R$ 49</div>
                <div className="text-lucrai-gray-text">/mês</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Dashboard completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Controle de estoque</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Precificação automática</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">CMV e DRE básicos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border-4 border-lucrai-green-profit shadow-2xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-lucrai-green-profit to-lucrai-green-profit-dark text-white px-4 py-1 text-sm font-bold">
                  MAIS ESCOLHIDO
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-lucrai-blue-tech">Pro</CardTitle>
                <div className="text-4xl font-bold text-lucrai-green-profit mt-4">R$ 99</div>
                <div className="text-lucrai-gray-text">/mês</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Tudo do Starter +</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">IA para insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Integração delivery</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border-2 hover:border-lucrai-blue-tech/50 transition-all">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-lucrai-blue-tech">Enterprise</CardTitle>
                <div className="text-2xl font-bold text-lucrai-blue-tech mt-4">Sob consulta</div>
                <div className="text-lucrai-gray-text">Personalizado</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Tudo do Pro +</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Múltiplas unidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">API personalizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span className="text-sm">Suporte dedicado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white shadow-2xl px-12 py-8 text-xl font-bold transform hover:scale-105 transition-all duration-300" asChild>
              <Link to="/login">
                <Target className="h-6 w-6 mr-2" />
                Teste Grátis Agora!
              </Link>
            </Button>
            <p className="text-sm text-lucrai-gray-text mt-4">
              <Shield className="h-4 w-4 inline text-lucrai-green-profit mr-1" />
              Satisfeito ou seu dinheiro de volta • Sem cartão • 1 clique
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lucrai-blue-tech">
              Tire suas dúvidas
            </h2>
            <p className="text-xl text-lucrai-gray-text max-w-2xl mx-auto">
              Respostas para as perguntas mais comuns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-bold text-lucrai-blue-tech mb-3">Preciso ser contador para usar?</h3>
              <p className="text-lucrai-gray-text">Não! O Lucraí faz toda a matemática para você. Interface simples que qualquer pessoa consegue usar.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lucrai-blue-tech mb-3">Funciona em celular e tablet?</h3>
              <p className="text-lucrai-gray-text">Sim, interface 100% responsiva. Acesse de qualquer dispositivo, a qualquer hora.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lucrai-blue-tech mb-3">Como cancelar?</h3>
              <p className="text-lucrai-gray-text">A qualquer momento, sem burocracia. Cancele com 1 clique no painel de controle.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lucrai-blue-tech mb-3">E se não gostar?</h3>
              <p className="text-lucrai-gray-text">Garantia total de reembolso em 7 dias. Sem perguntas, sem complicação.</p>
            </Card>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="py-20">
          <Card className="bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent p-1 shadow-2xl">
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <h3 className="text-4xl md:text-5xl font-bold text-lucrai-blue-tech">
                  Pronto para transformar seu negócio?
                </h3>
                <p className="text-xl text-lucrai-gray-text leading-relaxed">
                  Junte-se a mais de <span className="font-bold text-lucrai-green-profit">2.500+ restaurantes</span> que já aumentaram seus lucros com o Lucraí.
                  <br />Comece agora com <span className="font-bold text-lucrai-blue-tech">7 dias grátis</span> e veja a diferença.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                  <Button size="lg" className="bg-gradient-to-r from-lucrai-green-profit to-lucrai-green-profit-dark hover:from-lucrai-green-profit-dark hover:to-lucrai-green-profit text-white shadow-2xl px-12 py-8 text-xl font-bold transform hover:scale-105 transition-all duration-300" asChild>
                    <Link to="/login">
                      <Zap className="h-6 w-6 mr-2" />
                      Quero Vender Mais!
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-12 py-8 text-xl border-2 border-lucrai-blue-tech text-lucrai-blue-tech hover:bg-lucrai-blue-tech hover:text-white font-bold" asChild>
                    <Link to="/login">
                      Ver Planos
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-8 pt-6 text-sm text-lucrai-gray-text">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span>Sem compromisso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span>Setup gratuito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lucrai-green-profit" />
                    <span>Suporte 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-lucrai-gray-neutral py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-lucrai-blue-tech via-lucrai-green-profit to-lucrai-gold-accent bg-clip-text text-transparent">
                    Lucraí
                  </h3>
                  <p className="text-sm text-lucrai-gray-text">Sistema Inteligente para Restaurantes</p>
                </div>
              </div>
              <p className="text-lucrai-gray-text mb-4">
                Transformando a gestão de restaurantes com inteligência artificial e simplicidade.
              </p>
              <p className="text-sm text-lucrai-blue-tech font-semibold">
                📱 Em breve: integração via WhatsApp para registrar vendas, dar baixa no estoque e despesas por texto, áudio e imagem.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lucrai-blue-tech mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-lucrai-gray-text">
                <li><Link to="/login" className="hover:text-lucrai-green-profit">Funcionalidades</Link></li>
                <li><Link to="/login" className="hover:text-lucrai-green-profit">Preços</Link></li>
                <li><Link to="/login" className="hover:text-lucrai-green-profit">Teste Grátis</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lucrai-blue-tech mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-lucrai-gray-text">
                <li><a href="mailto:suporte@lucrai.com.br" className="hover:text-lucrai-green-profit">suporte@lucrai.com.br</a></li>
                <li><Link to="/login" className="hover:text-lucrai-green-profit">Central de Ajuda</Link></li>
                <li><Link to="/privacidade" className="hover:text-lucrai-green-profit">Política de Privacidade</Link></li>
                <li><a href="#" className="hover:text-lucrai-green-profit">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-lucrai-blue-tech/20 mt-8 pt-8 text-center">
            <p className="text-lucrai-gray-text">
              © 2024 Lucraí. Todos os direitos reservados. Sistema inteligente para restaurantes lucrativos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
