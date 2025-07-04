
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CashFlowEntry } from "./CashFlowOverview";

interface CashFlowFormProps {
  onEntryAdded: () => void;
  onEditComplete?: () => void;
  editingEntry?: CashFlowEntry;
}

export function CashFlowForm({ onEntryAdded, onEditComplete, editingEntry }: CashFlowFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    category: "",
    amount: 0,
    type: "income" as "income" | "expense",
    status: "completed" as "completed" | "pending" | "canceled",
    paymentMethod: "cash" as string,
    recurring: false,
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      console.log('Configurando formulário para edição:', editingEntry);
      
      // Garantir que a data esteja no formato correto para o input
      const dateForInput = editingEntry.date ? editingEntry.date.split('T')[0] : new Date().toISOString().split('T')[0];
        
      setFormData({
        date: dateForInput,
        description: editingEntry.description || "",
        category: editingEntry.category || "",
        amount: editingEntry.amount || 0,
        type: editingEntry.type || "income",
        status: editingEntry.status || "completed",
        paymentMethod: editingEntry.paymentMethod || "cash",
        recurring: false,
        notes: editingEntry.notes || ""
      });
    } else {
      // Reset form quando não está editando
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        category: "",
        amount: 0,
        type: "income",
        status: "completed",
        paymentMethod: "cash",
        recurring: false,
        notes: ""
      });
    }
  }, [editingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || formData.amount <= 0 || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    console.log('Tentando salvar entrada:', formData);
    setIsSubmitting(true);

    try {
      // Get the user's restaurant ID
      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (restaurantError) {
        console.error('Erro ao buscar restaurante:', restaurantError);
        throw new Error('Erro ao buscar dados do restaurante');
      }

      if (!restaurants || restaurants.length === 0) {
        throw new Error('Nenhum restaurante encontrado para este usuário');
      }

      const restaurantId = restaurants[0].id;

      const entryData = {
        restaurant_id: restaurantId,
        type: formData.type,
        amount: formData.amount,
        date: formData.date,
        description: formData.description,
        category: formData.category,
        status: formData.status === 'completed' ? 'paid' : formData.status,
        payment_method: formData.paymentMethod,
        documento: formData.notes || null
      };

      console.log('Dados que serão salvos no Supabase:', entryData);

      if (editingEntry) {
        // Editando entrada existente
        const { error } = await supabase
          .from('cash_flow')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        
        console.log('Entrada editada com sucesso');
        toast.success("Transação editada com sucesso!");
      } else {
        // Adicionando nova entrada
        const { error } = await supabase
          .from('cash_flow')
          .insert(entryData);

        if (error) throw error;

        console.log('Nova entrada adicionada com sucesso');
        toast.success("Transação adicionada com sucesso!");
      }

      // Reset form apenas quando não está editando
      if (!editingEntry) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: "",
          category: "",
          amount: 0,
          type: "income",
          status: "completed",
          paymentMethod: "cash",
          recurring: false,
          notes: ""
        });
      }
      
      if (editingEntry && onEditComplete) {
        onEditComplete();
      } else {
        onEntryAdded();
      }
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      toast.error("Erro ao salvar transação: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeCategories = [
    { value: "sales", label: "Vendas" },
    { value: "food", label: "Alimentação" },
    { value: "beverage", label: "Bebidas" },
    { value: "delivery", label: "Delivery" },
    { value: "other_income", label: "Outras Receitas" }
  ];

  const expenseCategories = [
    { value: "food_supplies", label: "Insumos Alimentares" },
    { value: "beverage_supplies", label: "Insumos Bebidas" },
    { value: "supplies", label: "Suprimentos" },
    { value: "rent", label: "Aluguel" },
    { value: "utilities", label: "Utilidades" },
    { value: "salaries", label: "Salários" },
    { value: "marketing", label: "Marketing" },
    { value: "maintenance", label: "Manutenção" },
    { value: "other_expense", label: "Outras Despesas" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Dinheiro" },
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "debit_card", label: "Cartão de Débito" },
    { value: "pix", label: "PIX" },
    { value: "bank_transfer", label: "Transferência" },
    { value: "check", label: "Cheque" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingEntry ? "Editar Transação" : "Nova Transação"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: "income" | "expense") => {
                  setFormData(prev => ({ ...prev, type: value, category: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
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
                value={formData.amount || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === "income" 
                    ? incomeCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))
                    : expenseCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "completed" | "pending" | "canceled") => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.recurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: checked }))}
            />
            <Label htmlFor="recurring">Transação recorrente</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting 
                ? "Salvando..." 
                : editingEntry 
                  ? "Salvar Alterações" 
                  : "Adicionar Transação"
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => editingEntry && onEditComplete ? onEditComplete() : onEntryAdded()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
