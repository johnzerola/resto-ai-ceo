import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Edit, Trash2, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";

// Hook para escutar atualizações de categorias
function useCategoriesRefresh(reloadFn: () => void) {
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      reloadFn();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
  }, [reloadFn]);
}

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  categoria: string;
  fornecedor?: string;
  observacoes?: string;
  forma_pagamento?: string;
}

interface AccountsPayableManagerProps {
  onDataChange?: () => void;
}

export function AccountsPayableManager({ onDataChange }: AccountsPayableManagerProps) {
  const { currentRestaurant } = useAuth();
  const { getExpenseCategories, reloadCategories } = useFinancialCategories();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaPagar | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: 0,
    data_vencimento: "",
    categoria: "",
    fornecedor: "",
    observacoes: "",
    forma_pagamento: ""
  });

  useEffect(() => {
    loadContas();
  }, [currentRestaurant]);

  // Escutar atualizações de categorias
  useCategoriesRefresh(reloadCategories);

  const loadContas = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim() || formData.valor <= 0 || !formData.data_vencimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const contaData = {
        restaurant_id: currentRestaurant?.id,
        descricao: formData.descricao,
        valor: formData.valor,
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria || 'outras_despesas',
        fornecedor: formData.fornecedor || null,
        observacoes: formData.observacoes || null,
        forma_pagamento: formData.forma_pagamento || null,
        status: 'pendente'
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas_a_pagar')
          .update(contaData)
          .eq('id', editingConta.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('contas_a_pagar')
          .insert(contaData);

        if (error) throw error;
        toast.success("Conta adicionada com sucesso!");
      }

      resetForm();
      loadContas();
      onDataChange?.();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast.error("Erro ao salvar conta");
    }
  };

  const markAsPaid = async (contaId: string) => {
    try {
      const conta = contas.find(c => c.id === contaId);
      if (!conta) return;

      // Atualizar status da conta
      const { error } = await supabase
        .from('contas_a_pagar')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', contaId);

      if (error) throw error;

      // Verificar se a categoria impacta CMV ou DRE e integrar ao cash_flow
      const { data: categoryData } = await supabase
        .from('categorias_financeiras')
        .select('impacta_cmv, impacta_dre')
        .eq('nome', conta.categoria)
        .eq('restaurant_id', currentRestaurant?.id)
        .single();

      // Adicionar ao cash_flow para integração com CMV/DRE
      const { error: cashFlowError } = await supabase
        .from('cash_flow')
        .insert({
          restaurant_id: currentRestaurant?.id,
          type: 'expense',
          amount: conta.valor,
          date: new Date().toISOString().split('T')[0],
          description: `${conta.descricao} - ${conta.fornecedor || 'Fornecedor'}`,
          category: conta.categoria,
          status: 'paid',
          impacta_cmv: categoryData?.impacta_cmv || false,
          impacta_dre: categoryData?.impacta_dre || true,
          payment_method: conta.forma_pagamento || 'dinheiro'
        });

      if (cashFlowError) {
        console.warn('Erro ao integrar com cash_flow:', cashFlowError);
      }

      toast.success("Conta marcada como paga e integrada ao fluxo financeiro!");
      loadContas();
      onDataChange?.();
    } catch (error) {
      console.error('Erro ao marcar conta como paga:', error);
      toast.error("Erro ao atualizar conta");
    }
  };

  const deleteConta = async (contaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    try {
      const { error } = await supabase
        .from('contas_a_pagar')
        .delete()
        .eq('id', contaId);

      if (error) throw error;

      toast.success("Conta excluída com sucesso!");
      loadContas();
      onDataChange?.();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error("Erro ao excluir conta");
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: "",
      valor: 0,
      data_vencimento: "",
      categoria: "",
      fornecedor: "",
      observacoes: "",
      forma_pagamento: ""
    });
    setEditingConta(null);
    setShowForm(false);
  };

  const editConta = (conta: ContaPagar) => {
    setFormData({
      descricao: conta.descricao,
      valor: conta.valor,
      data_vencimento: conta.data_vencimento,
      categoria: conta.categoria,
      fornecedor: conta.fornecedor || "",
      observacoes: conta.observacoes || "",
      forma_pagamento: conta.forma_pagamento || ""
    });
    setEditingConta(conta);
    setShowForm(true);
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

  const getStatusBadge = (conta: ContaPagar) => {
    if (conta.status === 'pago') {
      return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
    }
    
    const hoje = new Date();
    const vencimento = new Date(conta.data_vencimento);
    const diasAteVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasAteVencimento < 0) {
      return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    } else if (diasAteVencimento <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-800">Vence em breve</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Pendente</Badge>;
    }
  };

  const expenseCategories = getExpenseCategories();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando contas a pagar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contas a Pagar</CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingConta ? "Editar Conta" : "Nova Conta a Pagar"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_vencimento">Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.nome}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.cor }}
                            />
                            {cat.nome}
                            {cat.impacta_cmv && <Badge variant="outline" className="text-xs">CMV</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingConta ? "Salvar" : "Adicionar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {contas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell>{formatCurrency(conta.valor)}</TableCell>
                  <TableCell>{formatDate(conta.data_vencimento)}</TableCell>
                  <TableCell>{getStatusBadge(conta)}</TableCell>
                  <TableCell>{conta.fornecedor || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {conta.status === 'pendente' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        onClick={() => markAsPaid(conta.id)}
                        title="Marcar como pago"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => editConta(conta)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => deleteConta(conta.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhuma conta a pagar cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova Conta" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}