
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CanalVendaFormProps {
  onSubmit: (canal: any) => void;
}

export function CanalVendaForm({ onSubmit }: CanalVendaFormProps) {
  const [novoCanal, setNovoCanal] = useState({
    nome: '',
    taxa_percentual: 0,
    taxa_fixa: 0,
    tempo_entrega_min: 30,
    ativo: true
  });

  const handleSubmit = () => {
    if (!novoCanal.nome.trim()) {
      toast.error('Preencha o nome do canal');
      return;
    }

    onSubmit(novoCanal);
    setNovoCanal({
      nome: '',
      taxa_percentual: 0,
      taxa_fixa: 0,
      tempo_entrega_min: 30,
      ativo: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Canal de Venda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nome_canal">Nome do Canal *</Label>
          <Input
            id="nome_canal"
            value={novoCanal.nome}
            onChange={(e) => setNovoCanal(prev => ({...prev, nome: e.target.value}))}
            placeholder="Ex: iFood, Uber Eats"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="taxa_perc">Taxa (%)</Label>
            <Input
              id="taxa_perc"
              type="number"
              step="0.1"
              value={novoCanal.taxa_percentual}
              onChange={(e) => setNovoCanal(prev => ({...prev, taxa_percentual: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label htmlFor="taxa_fixa">Taxa Fixa (R$)</Label>
            <Input
              id="taxa_fixa"
              type="number"
              step="0.01"
              value={novoCanal.taxa_fixa}
              onChange={(e) => setNovoCanal(prev => ({...prev, taxa_fixa: parseFloat(e.target.value) || 0}))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tempo_entrega">Tempo de Entrega (min)</Label>
          <Input
            id="tempo_entrega"
            type="number"
            value={novoCanal.tempo_entrega_min}
            onChange={(e) => setNovoCanal(prev => ({...prev, tempo_entrega_min: parseInt(e.target.value) || 30}))}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Canal
        </Button>
      </CardContent>
    </Card>
  );
}
