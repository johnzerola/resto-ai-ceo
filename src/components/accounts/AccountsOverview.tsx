
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus,
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar
} from "lucide-react";
import { AccountsService, AccountPayable, AccountReceivable } from "@/services/AccountsService";
import { useAuth } from "@/contexts/AuthContext";
import { AccountsPayableForm } from "./AccountsPayableForm";
import { AccountsReceivableForm } from "./AccountsReceivableForm";

export function AccountsOverview() {
  const { currentRestaurant } = useAuth();
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [overdueAccounts, setOverdueAccounts] = useState({ payable: 0, receivable: 0 });
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [showReceivableForm, setShowReceivableForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const [payable, receivable, overdue] = await Promise.all([
        AccountsService.getAccountsPayable(currentRestaurant.id),
        AccountsService.getAccountsReceivable(currentRestaurant.id),
        AccountsService.checkOverdueAccounts(currentRestaurant.id)
      ]);

      setAccountsPayable(payable);
      setAccountsReceivable(receivable);
      setOverdueAccounts(overdue);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRestaurant]);

  const handlePayAccount = async (id: string) => {
    const formaPagamento = prompt('Forma de pagamento:');
    if (formaPagamento) {
      const success = await AccountsService.payAccount(id, formaPagamento);
      if (success) {
        await loadData();
      }
    }
  };

  const handleReceiveAccount = async (id: string) => {
    const formaRecebimento = prompt('Forma de recebimento:');
    if (formaRecebimento) {
      const success = await AccountsService.receiveAccount(id, formaRecebimento);
      if (success) {
        await loadData();
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string, isOverdue: boolean = false) => {
    if (isOverdue) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'pago':
      case 'recebido':
        return <Badge variant="default" className="bg-green-600">Pago</Badge>;
      case 'cancelado':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPayable = accountsPayable
    .filter(acc => acc.status === 'pendente')
    .reduce((sum, acc) => sum + acc.valor, 0);

  const totalReceivable = accountsReceivable
    .filter(acc => acc.status === 'pendente')
    .reduce((sum, acc) => sum + acc.valor, 0);

  if (showPayableForm) {
    return (
      <AccountsPayableForm
        onSuccess={() => {
          setShowPayableForm(false);
          loadData();
        }}
        onCancel={() => setShowPayableForm(false)}
      />
    );
  }

  if (showReceivableForm) {
    return (
      <AccountsReceivableForm
        onSuccess={() => {
          setShowReceivableForm(false);
          loadData();
        }}
        onCancel={() => setShowReceivableForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              A Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPayable)}</div>
            <p className="text-xs text-muted-foreground">{accountsPayable.filter(acc => acc.status === 'pendente').length} contas pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceivable)}</div>
            <p className="text-xs text-muted-foreground">{accountsReceivable.filter(acc => acc.status === 'pendente').length} contas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueAccounts.payable + overdueAccounts.receivable}</div>
            <p className="text-xs text-muted-foreground">Contas em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Saldo Projetado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceivable - totalPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalReceivable - totalPayable)}
            </div>
            <p className="text-xs text-muted-foreground">Diferença entre receber e pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowPayableForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Pagar
        </Button>
        <Button onClick={() => setShowReceivableForm(true)} variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta a Receber
        </Button>
      </div>

      {/* Tabs for Accounts */}
      <Tabs defaultValue="payable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payable" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receivable" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Contas a Receber
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payable">
          <Card>
            <CardContent className="p-0">
              {accountsPayable.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsPayable.map((account) => {
                      const isOverdue = account.status === 'pendente' && 
                        new Date(account.data_vencimento) < new Date();
                      
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.fornecedor}</TableCell>
                          <TableCell>{account.descricao}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(account.data_vencimento)}
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            {formatCurrency(account.valor)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account.status, isOverdue)}
                          </TableCell>
                          <TableCell>
                            {account.status === 'pendente' && (
                              <Button 
                                size="sm" 
                                onClick={() => handlePayAccount(account.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Pagar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-muted-foreground">Nenhuma conta a pagar cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receivable">
          <Card>
            <CardContent className="p-0">
              {accountsReceivable.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsReceivable.map((account) => {
                      const isOverdue = account.status === 'pendente' && 
                        new Date(account.data_vencimento) < new Date();
                      
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.cliente || 'N/A'}</TableCell>
                          <TableCell>{account.descricao}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(account.data_vencimento)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(account.valor)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account.status, isOverdue)}
                          </TableCell>
                          <TableCell>
                            {account.status === 'pendente' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleReceiveAccount(account.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Receber
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-muted-foreground">Nenhuma conta a receber cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
