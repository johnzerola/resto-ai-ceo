
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MovimentoCaixa {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  payment_method?: string;
  status?: string;
  conta_tipo: string;
  centro_custo?: string;
  documento?: string;
  pessoa_responsavel?: string;
  recorrente: boolean;
  vencimento?: string;
  restaurant_id?: string;
  created_at?: string;
}

export function FluxoCaixaIntegrado() {
  const { currentRestaurant } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [novoMovimento, setNovoMovimento] = useState<Partial<MovimentoCaixa>>({
    type: 'entrada',
    conta_tipo: 'operacional',
    recorrente: false,
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarMovimentos();
    }
  }, [currentRestaurant, filtroMes]);

  const carregarMovimentos = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);

      const inicioMes = `${filtroMes}-01`;
      const fimMes = new Date(new Date(filtroMes).getFullYear(), new Date(filtroMes).getMonth() + 1, 0)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .gte('date', inicioMes)
        .lte('date', fimMes)
        .order('date', { ascending: false });

      if (error) throw error;
      setMovimentos((data || []) as MovimentoCaixa[]);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      toast.error('Erro ao carregar fluxo de caixa');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarMovimento = async () => {
    if (!currentRestaurant?.id || !novoMovimento.description?.trim() || !novoMovimento.amount) {
      toast.error('Preencha descrição e valor');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .insert({
          ...novoMovimento,
          restaurant_id: currentRestaurant.id,
          amount: novoMovimento.amount,
          category: novoMovimento.category || 'geral',
          date: novoMovimento.date || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      setMovimentos(prev => [data as MovimentoCaixa, ...prev]);
      setNovoMovimento({
        type: 'entrada',
        conta_tipo: 'operacional',
        recorrente: false,
        date: new Date().toISOString().split('T')[0]
      });
      toast.success('Movimento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar movimento:', error);
      toast.error('Erro ao adicionar movimento');
    }
  };

  const movimentosFiltrados = movimentos.filter(mov => 
    filtroTipo === 'todos' || mov.type === filtroTipo
  );

  const totalEntradas = movimentos
    .filter(m => m.type === 'entrada')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalSaidas = movimentos
    .filter(m => m.type === 'saida')
    .reduce((acc, m) => acc + m.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const contasAPagar = movimentos.filter(m => 
    m.type === 'saida' && 
    m.status === 'pending' && 
    m.vencimento && 
    new Date(m.vencimento) >= new Date()
  );

  const contasVencidas = movimentos.filter(m => 
    m.type === 'saida' && 
    m.status === 'pending' && 
    m.vencimento && 
    new Date(m.vencimento) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contas a Pagar</p>
                <p className="text-2xl font-bold text-orange-600">{contasAPagar.length}</p>
                {contasVencidas.length > 0 && (
                  <p className="text-sm text-red-600">{contasVencidas.length} vencidas</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário de Novo Movimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Movimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo</Label>
                <Select 
                  value={novoMovimento.type} 
                  onValueChange={(value) => setNovoMovimento(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novoMovimento.amount || ''}
                  onChange={(e) => setNovoMovimento(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={novoMovimento.description || ''}
                onChange={(e) => setNovoMovimento(prev => ({...prev, description: e.target.value}))}
                placeholder="Descrição do movimento"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={novoMovimento.date || ''}
                  onChange={(e) => setNovoMovimento(prev => ({...prev, date: e.target.value}))}
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Select 
                  value={novoMovimento.category} 
                  onValueChange={(value) => setNovoMovimento(prev => ({...prev, category: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {novoMovimento.type === 'entrada' ? (
                      <>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="outros_recebimentos">Outros Recebimentos</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="ingredientes">Ingredientes</SelectItem>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="utilities">Utilidades</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="impostos">Impostos</SelectItem>
                        <SelectItem value="outras_despesas">Outras Despesas</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select 
                value={novoMovimento.payment_method} 
                onValueChange={(value) => setNovoMovimento(prev => ({...prev, payment_method: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
                  <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Conta</Label>
              <Select 
                value={novoMovimento.conta_tipo} 
                onValueChange={(value) => setNovoMovimento(prev => ({...prev, conta_tipo: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                  <SelectItem value="financiamento">Financiamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Centro de Custo</Label>
                <Input
                  value={novoMovimento.centro_custo || ''}
                  onChange={(e) => setNovoMovimento(prev => ({...prev, centro_custo: e.target.value}))}
                  placeholder="Ex: Cozinha"
                />
              </div>

              <div>
                <Label>Responsável</Label>
                <Input
                  value={novoMovimento.pessoa_responsavel || ''}
                  onChange={(e) => setNovoMovimento(prev => ({...prev, pessoa_responsavel: e.target.value}))}
                  placeholder="Nome"
                />
              </div>
            </div>

            {novoMovimento.type === 'saida' && (
              <div>
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={novoMovimento.vencimento || ''}
                  onChange={(e) => setNovoMovimento(prev => ({...prev, vencimento: e.target.value}))}
                />
              </div>
            )}

            <Button onClick={adicionarMovimento} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Movimento
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Movimentos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saídas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="month"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="w-40"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {movimentosFiltrados.length} movimento(s)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Movimentos */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {movimentosFiltrados.map((movimento) => (
              <Card key={movimento.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={movimento.type === 'entrada' ? 'default' : 'destructive'}>
                          {movimento.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                        <h4 className="font-medium">{movimento.description}</h4>
                        {movimento.status === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Pendente
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>Data: {new Date(movimento.date).to LocaleDateString('pt-BR')}</div>
                        <div>Categoria: {movimento.category}</div>
                        {movimento.payment_method && <div>Pagamento: {movimento.payment_method}</div>}
                        <div>Tipo: {movimento.conta_tipo}</div>
                      </div>

                      {movimento.vencimento && movimento.status === 'pending' && (
                        <div className="mt-2 text-sm">
                          <span className={`${new Date(movimento.vencimento) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                            Vencimento: {new Date(movimento.vencimento).toLocaleDateString('pt-BR')}
                            {new Date(movimento.vencimento) < new Date() && ' (VENCIDO)'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${movimento.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {movimento.type === 'entrada' ? '+' : '-'}R$ {movimento.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {movimento.centro_custo && (
                        <p className="text-xs text-muted-foreground">{movimento.centro_custo}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {movimentosFiltrados.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum movimento encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
