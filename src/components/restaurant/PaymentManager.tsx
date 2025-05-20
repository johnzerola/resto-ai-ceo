
import { useState, useEffect } from 'react';
import { 
  paymentService, 
  Payment, 
  PAYMENT_STATUS, 
  PAYMENT_TYPES, 
  PAYMENT_CATEGORIES 
} from '@/services/PaymentService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileEdit, Trash2, CheckCircle, PanelLeftClose, PanelRightClose } from 'lucide-react';

interface PaymentManagerProps {
  restaurantId: string;
}

export function PaymentManager({ restaurantId }: PaymentManagerProps) {
  const [activeTab, setActiveTab] = useState('payable');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    payables: { pending: 0, overdue: 0, total: 0 },
    receivables: { pending: 0, overdue: 0, total: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({
    type: 'payable',
    status: 'pending',
    category: 'outros',
    amount: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  // Carregar dados
  useEffect(() => {
    loadData();
    
    // Verificar contas vencidas ao iniciar
    paymentService.checkOverduePayments(restaurantId);
    
    // Configurar ouvinte de eventos
    const handlePaymentUpdate = () => {
      loadData();
    };
    
    window.addEventListener('paymentDataUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentDataUpdated', handlePaymentUpdate);
    };
  }, [restaurantId]);

  // Carregar dados de pagamentos
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar pagamentos
      const data = await paymentService.getPayments(restaurantId);
      setPayments(data);
      
      // Carregar resumo
      const summaryData = await paymentService.getPaymentSummary(restaurantId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar pagamentos pelo tipo (payable/receivable)
  const filteredPayments = payments.filter(payment => payment.type === activeTab);

  // Formatar datas
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setCurrentPayment({
      type: activeTab === 'payable' ? 'payable' : 'receivable',
      status: 'pending',
      category: 'outros',
      amount: 0,
      restaurant_id: restaurantId
    });
    setIsEditing(false);
  };

  // Abrir modal para novo registro
  const openNewPaymentModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Abrir modal para edição
  const openEditModal = (payment: Payment) => {
    setCurrentPayment({...payment});
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Salvar pagamento (novo ou edição)
  const savePayment = async () => {
    try {
      if (!currentPayment.description) {
        toast.error('A descrição é obrigatória');
        return;
      }
      
      if (!currentPayment.amount || currentPayment.amount <= 0) {
        toast.error('O valor deve ser maior que zero');
        return;
      }
      
      if (!currentPayment.due_date) {
        toast.error('A data de vencimento é obrigatória');
        return;
      }
      
      if (isEditing && currentPayment.id) {
        // Atualizar registro existente
        const { id, ...updates } = currentPayment;
        await paymentService.updatePayment(id, updates);
      } else {
        // Criar novo registro
        await paymentService.createPayment({
          ...currentPayment as any,
          restaurant_id: restaurantId
        });
      }
      
      // Fechar modal e recarregar dados
      setIsModalOpen(false);
      loadData();
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar registro');
    }
  };

  // Marcar como pago
  const markAsPaid = async (id: string) => {
    try {
      await paymentService.markAsPaid(id);
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  // Excluir registro
  const deletePayment = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await paymentService.deletePayment(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir registro');
      }
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payable">
            <PanelRightClose className="mr-2 h-4 w-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receivable">
            <PanelLeftClose className="mr-2 h-4 w-4" />
            Contas a Receber
          </TabsTrigger>
        </TabsList>

        {/* Contas a Pagar */}
        <TabsContent value="payable" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Contas a Pagar</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie pagamentos pendentes e vencidos
              </p>
            </div>
            <Button onClick={openNewPaymentModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Pendentes</CardTitle>
                <CardDescription>Contas a vencer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {formatCurrency(summary.payables.pending)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Vencidas</CardTitle>
                <CardDescription>Contas em atraso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(summary.payables.overdue)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Total</CardTitle>
                <CardDescription>Todas as contas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.payables.total)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.category}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.due_date)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => markAsPaid(payment.id)}
                                title="Marcar como pago"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditModal(payment)}
                              title="Editar registro"
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => deletePayment(payment.id)}
                              title="Excluir registro"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Receber */}
        <TabsContent value="receivable" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Contas a Receber</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie receitas pendentes e vencidas
              </p>
            </div>
            <Button onClick={openNewPaymentModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Pendentes</CardTitle>
                <CardDescription>Valores a receber</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(summary.receivables.pending)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Vencidas</CardTitle>
                <CardDescription>Recebimentos em atraso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {formatCurrency(summary.receivables.overdue)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Total</CardTitle>
                <CardDescription>Todas as contas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.receivables.total)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.category}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.due_date)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => markAsPaid(payment.id)}
                                title="Marcar como recebido"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditModal(payment)}
                              title="Editar registro"
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => deletePayment(payment.id)}
                              title="Excluir registro"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Adição/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Registro' : 'Novo Registro'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'payable' ? 'Informe os detalhes da conta a pagar' : 'Informe os detalhes da conta a receber'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={currentPayment.description || ''}
                onChange={(e) => setCurrentPayment({...currentPayment, description: e.target.value})}
                className="col-span-3"
                placeholder="Aluguel, luz, pagamento cliente, etc"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                value={currentPayment.amount || ''}
                onChange={(e) => setCurrentPayment({...currentPayment, amount: parseFloat(e.target.value)})}
                className="col-span-3"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">
                Vencimento
              </Label>
              <Input
                id="due_date"
                type="date"
                value={
                  currentPayment.due_date 
                    ? new Date(currentPayment.due_date).toISOString().split('T')[0] 
                    : ''
                }
                onChange={(e) => setCurrentPayment({...currentPayment, due_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select 
                value={currentPayment.category} 
                onValueChange={(value) => setCurrentPayment({...currentPayment, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={currentPayment.status} 
                onValueChange={(value) => setCurrentPayment({...currentPayment, status: value as any})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'pending' && 'Pendente'}
                      {status === 'paid' && 'Pago'}
                      {status === 'overdue' && 'Vencido'}
                      {status === 'canceled' && 'Cancelado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePayment}>
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
