
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Receipt, Plus, Calendar, Bell, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAccountsPayable } from "@/hooks/useAccountsPayable";
import { useAccountsReceivable } from "@/hooks/useAccountsReceivable";

export function AccountsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pagar");
  const [novaConta, setNovaConta] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    categoria: '',
    fornecedor: '',
    cliente: ''
  });

  const {
    contas: contasPagar,
    isLoading: loadingPagar,
    addConta: addContaPagar,
    marcarComoPaga,
    getContasVencidas,
    getTotalPendente: getTotalPagar
  } = useAccountsPayable();

  const {
    contas: contasReceber,
    isLoading: loadingReceber,
    addConta: addContaReceber,
    marcarComoRecebida,
    getTotalPendente: getTotalReceber
  } = useAccountsReceivable();

  const handleCreateConta = async () => {
    if (!novaConta.descricao || !novaConta.valor || !novaConta.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const valor = parseFloat(novaConta.valor);
      if (isNaN(valor) || valor <= 0) {
        toast.error('Valor deve ser um número positivo');
        return;
      }

      if (activeTab === "pagar") {
        await addContaPagar({
          descricao: novaConta.descricao,
          valor,
          data_vencimento: novaConta.data_vencimento,
          categoria: novaConta.categoria || 'geral',
          fornecedor: novaConta.fornecedor || 'Não informado',
          status: 'pendente'
        });
      } else {
        await addContaReceber({
          descricao: novaConta.descricao,
          valor,
          data_vencimento: novaConta.data_vencimento,
          categoria: novaConta.categoria || 'vendas',
          cliente: novaConta.cliente || 'Cliente',
          status: 'pendente'
        });
      }

      setIsDialogOpen(false);
      setNovaConta({
        descricao: '',
        valor: '',
        data_vencimento: '',
        categoria: '',
        fornecedor: '',
        cliente: ''
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isVencendoEm3Dias = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const contasVencidas = getContasVencidas();
  const contasVencendoSoon = [...contasPagar, ...contasReceber].filter(conta => 
    conta.status === 'pendente' && isVencendoEm3Dias(conta.data_vencimento)
  );

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getTotalPagar())}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasPagar.filter(c => c.status === 'pendente').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalReceber())}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasReceber.filter(c => c.status === 'pendente').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {contasVencidas.length}
            </div>
            <p className="text-xs text-muted-foreground">contas em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo Soon</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {contasVencendoSoon.length}
            </div>
            <p className="text-xs text-muted-foreground">próximos 3 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Contas Vencendo */}
      {contasVencendoSoon.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Bell className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-yellow-800">
                🔔 {contasVencendoSoon.length} conta(s) vencendo nos próximos 3 dias:
              </span>
              <div className="space-y-1">
                {contasVencendoSoon.slice(0, 3).map((conta) => (
                  <div key={conta.id} className="text-sm">
                    <strong>{conta.descricao}</strong> - {formatCurrency(conta.valor)}
                    <span className="text-yellow-700">
                      {' '}(vence: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')})
                    </span>
                  </div>
                ))}
                {contasVencendoSoon.length > 3 && (
                  <div className="text-sm text-yellow-700">
                    E mais {contasVencendoSoon.length - 3} conta(s)...
                  </div>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Controles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Contas a Pagar e Receber</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie seus pagamentos e recebimentos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {activeTab === "pagar" ? "Nova Conta a Pagar" : "Nova Conta a Receber"}
              </DialogTitle>
              <DialogDescription>
                Adicione uma nova {activeTab === "pagar" ? "despesa" : "receita"} para acompanhamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Descrição *</label>
                <Input
                  placeholder={activeTab === "pagar" ? "Ex: Pagamento fornecedor" : "Ex: Venda evento"}
                  value={novaConta.descricao}
                  onChange={(e) => setNovaConta(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor *</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={novaConta.valor}
                    onChange={(e) => setNovaConta(prev => ({ ...prev, valor: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    {activeTab === "pagar" ? "Vencimento" : "Previsão"} *
                  </label>
                  <Input
                    type="date"
                    value={novaConta.data_vencimento}
                    onChange={(e) => setNovaConta(prev => ({ ...prev, data_vencimento: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select 
                  value={novaConta.categoria} 
                  onValueChange={(value) => setNovaConta(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "pagar" ? (
                      <>
                        <SelectItem value="ingredientes">Ingredientes</SelectItem>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="eventos">Eventos</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {activeTab === "pagar" ? (
                <div>
                  <label className="text-sm font-medium">Fornecedor</label>
                  <Input
                    placeholder="Nome do fornecedor"
                    value={novaConta.fornecedor}
                    onChange={(e) => setNovaConta(prev => ({ ...prev, fornecedor: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <Input
                    placeholder="Nome do cliente"
                    value={novaConta.cliente}
                    onChange={(e) => setNovaConta(prev => ({ ...prev, cliente: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateConta} className="flex-1">
                  Criar Conta
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabelas com Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pagar" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receber" className="gap-2">
            <Receipt className="h-4 w-4" />
            Contas a Receber
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pagar">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                Gerencie seus pagamentos e fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPagar ? (
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasPagar.length > 0 ? (
                        contasPagar.map((conta) => (
                          <TableRow key={conta.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{conta.descricao}</div>
                                <div className="text-xs text-muted-foreground">
                                  {conta.categoria}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{conta.fornecedor}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(conta.valor)}
                            </TableCell>
                            <TableCell>
                              <div className={isVencendoEm3Dias(conta.data_vencimento) ? 'text-yellow-600 font-medium' : ''}>
                                {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={conta.status === 'pago' ? 'default' : 'destructive'}>
                                {conta.status === 'pago' ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Pago</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {conta.status === 'pendente' && (
                                <Button
                                  size="sm"
                                  onClick={() => marcarComoPaga(conta.id, 'dinheiro')}
                                >
                                  Marcar Pago
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center gap-2">
                              <CreditCard className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Nenhuma conta a pagar encontrada
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receber">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
              <CardDescription>
                Acompanhe seus recebimentos e clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReceber ? (
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Previsão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasReceber.length > 0 ? (
                        contasReceber.map((conta) => (
                          <TableRow key={conta.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{conta.descricao}</div>
                                <div className="text-xs text-muted-foreground">
                                  {conta.categoria}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{conta.cliente}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(conta.valor)}
                            </TableCell>
                            <TableCell>
                              <div className={isVencendoEm3Dias(conta.data_vencimento) ? 'text-yellow-600 font-medium' : ''}>
                                {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={conta.status === 'recebido' ? 'default' : 'secondary'}>
                                {conta.status === 'recebido' ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Recebido</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {conta.status === 'pendente' && (
                                <Button
                                  size="sm"
                                  onClick={() => marcarComoRecebida(conta.id, 'dinheiro')}
                                >
                                  Marcar Recebido
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center gap-2">
                              <Receipt className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Nenhuma conta a receber encontrada
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
