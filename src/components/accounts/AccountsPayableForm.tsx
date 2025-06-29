
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountsService, AccountPayable } from "@/services/AccountsService";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";

interface AccountsPayableFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountsPayableForm({ onSuccess, onCancel }: AccountsPayableFormProps) {
  const { currentRestaurant } = useAuth();
  const { categories } = useExpenseCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fornecedor: "",
    descricao: "",
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    categoria: "",
    observacoes: "",
    documento: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRestaurant?.id || !formData.fornecedor || !formData.descricao || formData.valor <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const accountData: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'notificacao_enviada_1_dia' | 'notificacao_enviada_vencimento'> = {
        restaurant_id: currentRestaurant.id,
        fornecedor: formData.fornecedor,
        descricao: formData.descricao,
        valor: formData.valor,
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria,
        status: 'pendente',
        observacoes: formData.observacoes,
        documento: formData.documento
      };

      const success = await AccountsService.createAccountPayable(accountData);
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Conta a Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                placeholder="Nome do fornecedor"
                required
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
              placeholder="Descrição da conta"
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
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
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
            <Label htmlFor="documento">Número do Documento</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
              placeholder="Número da nota fiscal, boleto, etc."
            />
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
              {isSubmitting ? "Salvando..." : "Criar Conta a Pagar"}
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
