import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CashFlowEntry {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  payment_method?: string;
  status: string;
  restaurant_id: string;
  tenant_id?: string;
}

export function EnhancedFinancialCRUD() {
  const { currentRestaurant, user } = useAuth();
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'dinheiro',
    status: 'paid' as 'pending' | 'paid' | 'cancelled'
  });

  const categories = {
    expense: [
      'ingredientes', 'aluguel', 'salarios', 'marketing', 'delivery', 
      'energia', 'agua', 'gas', 'equipamentos', 'limpeza', 'outras'
    ],
    income: [
      'vendas_balcao', 'vendas_delivery', 'vendas_ifood', 'vendas_ubereats',
      'outras_receitas'
    ]
  };

  const paymentMethods = [
    'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'cheque'
  ];

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadEntries();
    }
  }, [currentRestaurant?.id]);

  const loadEntries = async () => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Erro ao carregar entradas:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser um número positivo';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentRestaurant?.id || !user?.id) {
      return;
    }

    try {
      const entryData = {
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        payment_method: formData.payment_method,
        status: formData.status,
        restaurant_id: currentRestaurant.id,
        tenant_id: currentRestaurant.id
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('cash_flow')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('restaurant_id', currentRestaurant.id); // Segurança adicional

        if (error) throw error;
        toast.success('Entrada atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('cash_flow')
          .insert(entryData);

        if (error) throw error;
        toast.success('Entrada criada com sucesso');
      }

      resetForm();
      loadEntries();
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      toast.error('Erro ao salvar entrada financeira');
    }
  };

  const handleEdit = (entry: CashFlowEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type as 'income' | 'expense',
      amount: entry.amount.toString(),
      category: entry.category,
      description: entry.description || '',
      date: entry.date,
      payment_method: entry.payment_method || 'dinheiro',
      status: entry.status as 'pending' | 'paid' | 'cancelled'
    });
    setShowForm(true);
  };

  const handleDelete = async (entry: CashFlowEntry) => {
    if (!window.confirm('Confirma a exclusão desta entrada?')) return;

    try {
      const { error } = await supabase
        .from('cash_flow')
        .delete()
        .eq('id', entry.id)
        .eq('restaurant_id', currentRestaurant?.id); // Segurança adicional

      if (error) throw error;

      toast.success('Entrada excluída com sucesso');
      loadEntries();
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      toast.error('Erro ao excluir entrada');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'dinheiro',
      status: 'paid'
    });
    setEditingEntry(null);
    setShowForm(false);
    setErrors({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    } as const;

    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (!currentRestaurant) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum restaurante selecionado. Selecione um restaurante para gerenciar os dados financeiros.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Gestão Financeira - {currentRestaurant.name}
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrada
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'income' | 'expense') => 
                          setFormData({ ...formData, type: value, category: '' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Valor (R$) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className={errors.amount ? 'border-red-500' : ''}
                      />
                      {errors.amount && (
                        <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[formData.type].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={errors.date ? 'border-red-500' : ''}
                      />
                      {errors.date && (
                        <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="payment_method">Forma de Pagamento</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'pending' | 'paid' | 'cancelled') => 
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={errors.description ? 'border-red-500' : ''}
                      placeholder="Descreva o motivo da despesa/receita..."
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingEntry ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {loading ? (
              <p>Carregando...</p>
            ) : entries.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma entrada financeira encontrada.</p>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={entry.type === 'income' ? 'default' : 'secondary'}>
                            {entry.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                          {getStatusBadge(entry.status)}
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <h4 className="font-medium">{entry.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {entry.category.replace('_', ' ').toUpperCase()} • {entry.payment_method?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'} {formatCurrency(entry.amount)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(entry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}