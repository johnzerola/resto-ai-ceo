import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";

interface QuickExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuickExpenseForm({ onSuccess, onCancel }: QuickExpenseFormProps) {
  const { currentRestaurant } = useAuth();
  const { getExpenseCategories } = useFinancialCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    category: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || formData.amount <= 0 || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!currentRestaurant?.id) {
      toast.error("Restaurante não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        restaurant_id: currentRestaurant.id,
        type: 'expense',
        amount: formData.amount,
        date: formData.date,
        description: formData.description,
        category: formData.category,
        status: 'paid',
        payment_method: formData.paymentMethod,
        documento: formData.notes || null
      };

      const { error } = await supabase
        .from('cash_flow')
        .insert(expenseData);

      if (error) throw error;

      toast.success("Despesa adicionada com sucesso!");
      
      // Reset form
      setFormData({
        description: "",
        amount: 0,
        category: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        notes: ""
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error("Erro ao salvar despesa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = getExpenseCategories().map(cat => ({ 
    value: cat.nome, 
    label: cat.nome 
  }));

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
        <CardTitle>Nova Despesa Operacional</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Aluguel, Salários, Marketing..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Adicionar Despesa"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}