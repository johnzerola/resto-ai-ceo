
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
  UserPlus
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header público */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D887] to-[#00B572] bg-clip-text text-transparent">
              RestaurIA
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <Button asChild>
              <Link to="/login">
                <UserPlus className="h-4 w-4 mr-2" />
                Começar Grátis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Banner de apresentação */}
        <div className="text-center py-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Gestão Inteligente para 
            <span className="bg-gradient-to-r from-[#00D887] to-[#00B572] bg-clip-text text-transparent"> Restaurantes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Controle completo de vendas, estoque, cardápio e financeiro em uma única plataforma. 
            Comece seu trial gratuito de 14 dias agora!
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg" asChild>
              <Link to="/login">
                Começar Trial Gratuito
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">
                Fazer Login
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Demo - Controle de Vendas</h2>
            <p className="text-muted-foreground">
              Veja como seria o controle de vendas do seu restaurante
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda (Faça login)
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +15.2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                +8 vendas hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {averageTicket.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +5.1% vs. semana passada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
        <Card>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">
                        Venda #{sale.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleString()}
                      </p>
                      {sale.customer && (
                        <p className="text-sm text-muted-foreground">
                          Cliente: {sale.customer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-lg">
                          R$ {sale.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.items} {sale.items === 1 ? 'item' : 'itens'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(sale.status)}
                        <Button variant="ghost" size="sm" disabled>
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

        {/* Call to Action Final */}
        <Card className="bg-gradient-to-r from-[#00D887]/10 to-[#00B572]/10 border-[#00D887]/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Pronto para transformar seu restaurante?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Comece agora com 14 dias grátis e veja como o RestaurIA pode revolucionar a gestão do seu negócio.
              Sem compromisso, sem cartão de crédito.
            </p>
            <Button size="lg" asChild>
              <Link to="/login">
                Começar Agora - Grátis por 14 dias
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
