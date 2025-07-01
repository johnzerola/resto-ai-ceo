import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getCashFlowEntries, saveCashFlowEntries } from "@/services/FinancialStorageService";
import type { CashFlowEntry } from "./CashFlowOverview";

interface CashFlowFormProps {
  onEntryAdded: () => void;
  onEditComplete?: () => void;
  editingEntry?: CashFlowEntry;
}

export function CashFlowForm({ onEntryAdded, onEditComplete, editingEntry }: CashFlowFormProps) {
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
      // Corrigir formatação da data para formato correto do input
      const dateForInput = editingEntry.date.includes('T') 
        ? editingEntry.date.split('T')[0] 
        : editingEntry.date;
        
      setFormData({
        date: dateForInput,
        description: editingEntry.description,
        category: editingEntry.category,
        amount: editingEntry.amount,
        type: editingEntry.type,
        status: editingEntry.status,
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

    console.log('Tentando salvar entrada:', formData);
    setIsSubmitting(true);

    try {
      const existingEntries = await getCashFlowEntries();
      
      const newEntry: CashFlowEntry = {
        id: editingEntry?.id || Date.now().toString(),
        date: formData.date, // Usar a data exatamente como inserida no form
        description: formData.description,
        category: formData.category,
        amount: formData.amount,
        type: formData.type,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      console.log('Entrada a ser salva:', newEntry);

      let updatedEntries;
      if (editingEntry) {
        // Editando entrada existente
        updatedEntries = existingEntries.map(entry => 
          entry.id === editingEntry.id ? newEntry : entry
        );
        console.log('Editando entrada existente');
      } else {
        // Adicionando nova entrada
        updatedEntries = [newEntry, ...existingEntries];
        console.log('Adicionando nova entrada');
      }

      await saveCashFlowEntries(updatedEntries);
      console.log('Entradas salvas para o usuário atual:', updatedEntries);

      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('cashFlowUpdated', { detail: updatedEntries }));
      window.dispatchEvent(new CustomEvent('dataSync'));

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

      toast.success(editingEntry ? "Transação editada com sucesso!" : "Transação adicionada com sucesso!");
      
      if (editingEntry && onEditComplete) {
        onEditComplete();
      } else {
        onEntryAdded();
      }
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      toast.error("Erro ao salvar transação");
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
