
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  Plus,
  Eye,
  Filter,
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
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Sale {
  id: string;
  date: string;
  amount: number;
  items: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  customer?: string;
}

export default function Vendas() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Mock data for demonstration
  useEffect(() => {
    const mockSales: Sale[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        amount: 85.50,
        items: 3,
        paymentMethod: 'credit',
        status: 'completed',
        customer: 'João Silva'
      },
      {
        id: '2',
        date: new Date(Date.now() - 3600000).toISOString(),
        amount: 42.00,
        items: 2,
        paymentMethod: 'pix',
        status: 'completed'
      },
      {
        id: '3',
        date: new Date(Date.now() - 7200000).toISOString(),
        amount: 156.75,
        items: 5,
        paymentMethod: 'debit',
        status: 'pending'
      }
    ];
    setSales(mockSales);
  }, []);

  const totalRevenue = sales
    .filter(sale => sale.status === 'completed')
    .reduce((sum, sale) => sum + sale.amount, 0);

  const totalSales = sales.filter(sale => sale.status === 'completed').length;

  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const getStatusBadge = (status: Sale['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    } as const;

    const labels = {
      completed: 'Concluída',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit: 'Cartão de Crédito',
      debit: 'Cartão de Débito',
      pix: 'PIX',
      cash: 'Dinheiro'
    };
    return labels[method] || method;
  };

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

        {/* Demo Section */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Demo - Controle de Vendas</h2>
              <p className="text-muted-foreground text-lg mt-2">
                Veja como seria o controle de vendas do seu restaurante
              </p>
            </div>
            <Button disabled className="opacity-60">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda (Faça login)
            </Button>
          </div>

          {/* Métricas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-gradient-to-br from-white to-[#00D887]/5 border-[#00D887]/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[#00D887]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00D887]">
                  R$ {totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +15.2% vs. mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Vendas
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  +8 vendas hoje
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Médio
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  R$ {averageTicket.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5.1% vs. semana passada
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vendas Hoje
                </CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {sales.filter(sale => {
                    const today = new Date().toDateString();
                    const saleDate = new Date(sale.date).toDateString();
                    return today === saleDate;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: 25 vendas/dia
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros (Demo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Select value={filter} onValueChange={setFilter} disabled>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status da venda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as vendas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter} disabled>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas (Demo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-6 border rounded-xl hover:bg-muted/30 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-[#00D887]" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Venda #{sale.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.date).toLocaleString('pt-BR')}
                        </p>
                        {sale.customer && (
                          <p className="text-sm text-muted-foreground">
                            Cliente: {sale.customer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="font-bold text-xl text-[#00D887]">
                            R$ {sale.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sale.items} {sale.items === 1 ? 'item' : 'itens'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getPaymentMethodLabel(sale.paymentMethod)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(sale.status)}
                          <Button variant="ghost" size="sm" disabled className="opacity-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
