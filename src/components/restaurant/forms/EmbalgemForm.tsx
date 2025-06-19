
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface EmbalgemFormProps {
  onSubmit: (embalagem: any) => void;
}

export function EmbalgemForm({ onSubmit }: EmbalgemFormProps) {
  const [novaEmbalagem, setNovaEmbalagem] = useState({
    nome: '',
    tipo: 'descartavel',
    custo_unitario: 0,
    quantidade_minima: 1,
    fornecedor: ''
  });

  const handleSubmit = () => {
    if (!novaEmbalagem.nome.trim()) {
      toast.error('Preencha o nome da embalagem');
      return;
    }

    onSubmit(novaEmbalagem);
    setNovaEmbalagem({
      nome: '',
      tipo: 'descartavel',
      custo_unitario: 0,
      quantidade_minima: 1,
      fornecedor: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Embalagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome da Embalagem *</Label>
          <Input
            id="nome"
            value={novaEmbalagem.nome}
            onChange={(e) => setNovaEmbalagem(prev => ({...prev, nome: e.target.value}))}
            placeholder="Ex: Copo 500ml"
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            value={novaEmbalagem.tipo} 
            onValueChange={(value) => setNovaEmbalagem(prev => ({...prev, tipo: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="descartavel">Descartável</SelectItem>
              <SelectItem value="retornavel">Retornável</SelectItem>
              <SelectItem value="personalizada">Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="custo">Custo Unitário (R$)</Label>
            <Input
              id="custo"
              type="number"
              step="0.01"
              value={novaEmbalagem.custo_unitario}
              onChange={(e) => setNovaEmbalagem(prev => ({...prev, custo_unitario: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label htmlFor="qtd_min">Qtd. Mínima</Label>
            <Input
              id="qtd_min"
              type="number"
              value={novaEmbalagem.quantidade_minima}
              onChange={(e) => setNovaEmbalagem(prev => ({...prev, quantidade_minima: parseInt(e.target.value) || 1}))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input
            id="fornecedor"
            value={novaEmbalagem.fornecedor}
            onChange={(e) => setNovaEmbalagem(prev => ({...prev, fornecedor: e.target.value}))}
            placeholder="Nome do fornecedor"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Embalagem
        </Button>
      </CardContent>
    </Card>
  );
}
