
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export interface CashFlowEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  status: "pending" | "completed" | "cancelled";
  paymentMethod?: string;
  recurring?: boolean;
}

interface CashFlowFormProps {
  onEntryAdded: (entry: CashFlowEntry) => void;
  editingEntry?: CashFlowEntry;
  onEditComplete?: () => void;
}

const categories = {
  income: [
    { value: "sales", label: "Vendas" },
    { value: "food", label: "Alimentação" },
    { value: "beverage", label: "Bebidas" },
    { value: "delivery", label: "Delivery" },
    { value: "other_income", label: "Outras Receitas" }
  ],
  expense: [
    { value: "food_supplies", label: "Insumos Alimentares" },
    { value: "beverage_supplies", label: "Insumos Bebidas" },
    { value: "supplies", label: "Suprimentos" },
    { value: "rent", label: "Aluguel" },
    { value: "utilities", label: "Utilidades" },
    { value: "salaries", label: "Salários" },
    { value: "marketing", label: "Marketing" },
    { value: "maintenance", label: "Manutenção" },
    { value: "other_expense", label: "Outras Despesas" }
  ]
};

const paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "pix", label: "PIX" },
  { value: "bank_transfer", label: "Transferência" },
  { value: "other", label: "Outro" }
];

export const CashFlowForm: React.FC<CashFlowFormProps> = ({ 
  onEntryAdded, 
  editingEntry, 
  onEditComplete 
}) => {
  const [formData, setFormData] = useState<Partial<CashFlowEntry>>({
    date: editingEntry?.date || new Date().toISOString().split('T')[0],
    description: editingEntry?.description || "",
    category: editingEntry?.category || "",
    amount: editingEntry?.amount || 0,
    type: editingEntry?.type || "income",
    status: editingEntry?.status || "completed",
    paymentMethod: editingEntry?.paymentMethod || "",
    recurring: editingEntry?.recurring || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.category || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const entry: CashFlowEntry = {
        id: editingEntry?.id || Date.now().toString(),
        date: formData.date!,
        description: formData.description!,
        category: formData.category!,
        amount: Number(formData.amount),
        type: formData.type!,
        status: formData.status!,
        paymentMethod: formData.paymentMethod,
        recurring: formData.recurring || false
      };

      // Salvar no localStorage
      const existingEntries = JSON.parse(localStorage.getItem('cashFlowEntries') || '[]');
      let updatedEntries;
      
      if (editingEntry) {
        // Atualizar entrada existente
        updatedEntries = existingEntries.map((item: CashFlowEntry) => 
          item.id === editingEntry.id ? entry : item
        );
        toast.success("Entrada atualizada com sucesso!");
      } else {
        // Adicionar nova entrada
        updatedEntries = [...existingEntries, entry];
        toast.success("Entrada adicionada com sucesso!");
      }
      
      localStorage.setItem('cashFlowEntries', JSON.stringify(updatedEntries));

      // Disparar evento para atualização do dashboard
      window.dispatchEvent(new CustomEvent('cashFlowUpdated', { detail: updatedEntries }));
      window.dispatchEvent(new CustomEvent('financialDataUpdated'));

      onEntryAdded(entry);

      if (editingEntry && onEditComplete) {
        onEditComplete();
      } else {
        // Limpar formulário para nova entrada
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: "",
          category: "",
          amount: 0,
          type: "income",
          status: "completed",
          paymentMethod: "",
          recurring: false
        });
      }

    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      toast.error("Erro ao salvar entrada");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onEditComplete) {
      onEditComplete();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          {editingEntry ? "Editar Lançamento" : "Novo Lançamento"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: "income" | "expense") => 
                  setFormData(prev => ({ ...prev, type: value, category: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">
                    <Badge className="bg-green-100 text-green-800">Receita</Badge>
                  </SelectItem>
                  <SelectItem value="expense">
                    <Badge className="bg-red-100 text-red-800">Despesa</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type && categories[formData.type].map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o lançamento..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Forma de Pagamento</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "pending" | "completed" | "cancelled") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  </SelectItem>
                  <SelectItem value="pending">
                    <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {editingEntry && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Salvando..." : editingEntry ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
