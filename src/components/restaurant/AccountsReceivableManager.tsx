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
import { Plus, Edit, Trash2, Check, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: string;
  categoria: string;
  cliente?: string;
  observacoes?: string;
  forma_recebimento?: string;
}

interface AccountsReceivableManagerProps {
  onDataChange?: () => void;
}

export function AccountsReceivableManager({ onDataChange }: AccountsReceivableManagerProps) {
  const { currentRestaurant } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaReceber | null>(null);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: 0,
    data_vencimento: "",
    categoria: "",
    cliente: "",
    observacoes: "",
    forma_recebimento: ""
  });

  useEffect(() => {
    loadContas();
  }, [currentRestaurant]);

  const loadContas = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contas_a_receber')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
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
        categoria: formData.categoria || 'vendas',
        cliente: formData.cliente || null,
        observacoes: formData.observacoes || null,
        forma_recebimento: formData.forma_recebimento || null,
        status: 'pendente'
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas_a_receber')
          .update(contaData)
          .eq('id', editingConta.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('contas_a_receber')
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

  const markAsReceived = async (contaId: string) => {
    try {
      const { error } = await supabase
        .from('contas_a_receber')
        .update({ 
          status: 'recebido',
          data_recebimento: new Date().toISOString().split('T')[0]
        })
        .eq('id', contaId);

      if (error) throw error;

      toast.success("Conta marcada como recebida!");
      loadContas();
      onDataChange?.();
    } catch (error) {
      console.error('Erro ao marcar conta como recebida:', error);
      toast.error("Erro ao atualizar conta");
    }
  };

  const deleteConta = async (contaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    try {
      const { error } = await supabase
        .from('contas_a_receber')
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
      cliente: "",
      observacoes: "",
      forma_recebimento: ""
    });
    setEditingConta(null);
    setShowForm(false);
  };

  const editConta = (conta: ContaReceber) => {
    setFormData({
      descricao: conta.descricao,
      valor: conta.valor,
      data_vencimento: conta.data_vencimento,
      categoria: conta.categoria,
      cliente: conta.cliente || "",
      observacoes: conta.observacoes || "",
      forma_recebimento: conta.forma_recebimento || ""
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

  const getStatusBadge = (conta: ContaReceber) => {
    if (conta.status === 'recebido') {
      return <Badge className="bg-green-100 text-green-800">Recebido</Badge>;
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

  const categorias = [
    { value: "vendas", label: "Vendas" },
    { value: "servicos", label: "Serviços" },
    { value: "eventos", label: "Eventos" },
    { value: "delivery", label: "Delivery" },
    { value: "catering", label: "Catering" },
    { value: "parcerias", label: "Parcerias" },
    { value: "outras_receitas", label: "Outras Receitas" }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando contas a receber...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contas a Receber</CardTitle>
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
                  {editingConta ? "Editar Conta" : "Nova Conta a Receber"}
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
                      {categorias.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
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
                <TableHead>Cliente</TableHead>
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
                  <TableCell>{conta.cliente || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {conta.status === 'pendente' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        onClick={() => markAsReceived(conta.id)}
                        title="Marcar como recebido"
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
            <DollarSign className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhuma conta a receber cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova Conta" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}