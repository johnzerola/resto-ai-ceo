
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountsService, AccountReceivable } from "@/services/AccountsService";
import { useAuth } from "@/contexts/AuthContext";

interface AccountsReceivableFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const incomeCategories = [
  { value: "vendas", label: "Vendas" },
  { value: "servicos", label: "Serviços" },
  { value: "eventos", label: "Eventos" },
  { value: "outros", label: "Outros" }
];

export function AccountsReceivableForm({ onSuccess, onCancel }: AccountsReceivableFormProps) {
  const { currentRestaurant } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente: "",
    descricao: "",
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    categoria: "vendas",
    observacoes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRestaurant?.id || !formData.descricao || formData.valor <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const accountData: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'notificacao_enviada_1_dia' | 'notificacao_enviada_vencimento'> = {
        restaurant_id: currentRestaurant.id,
        cliente: formData.cliente,
        descricao: formData.descricao,
        valor: formData.valor,
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria,
        status: 'pendente',
        observacoes: formData.observacoes
      };

      const success = await AccountsService.createAccountReceivable(accountData);
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Conta a Receber</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                placeholder="Nome do cliente (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do que será recebido"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
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
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Criar Conta a Receber"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
