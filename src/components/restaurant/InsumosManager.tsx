
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  precoPago: number;
  volumeEmbalagem: number;
  fornecedor: string;
  observacoes?: string;
  dataAtualizacao: string;
}

const categorias = [
  { value: "carnes", label: "Carnes" },
  { value: "vegetais", label: "Vegetais" },
  { value: "grãos", label: "Grãos e Cereais" },
  { value: "laticínios", label: "Laticínios" },
  { value: "temperos", label: "Temperos e Condimentos" },
  { value: "bebidas", label: "Bebidas" },
  { value: "outros", label: "Outros" }
];

const unidades = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "un", label: "Unidade" },
  { value: "cx", label: "Caixa" },
  { value: "pct", label: "Pacote" }
];

export function InsumosManager() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isAddingInsumo, setIsAddingInsumo] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    unidade: "",
    precoPago: "",
    volumeEmbalagem: "",
    fornecedor: "",
    observacoes: ""
  });

  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = () => {
    try {
      const stored = localStorage.getItem("insumos");
      if (stored) {
        const parsedInsumos = JSON.parse(stored);
        setInsumos(Array.isArray(parsedInsumos) ? parsedInsumos : []);
      }
    } catch (error) {
      console.error("Error loading insumos:", error);
      setInsumos([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.categoria || !formData.unidade || !formData.precoPago || !formData.volumeEmbalagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const novoInsumo: Insumo = {
        id: editingInsumo?.id || crypto.randomUUID(),
        nome: formData.nome,
        categoria: formData.categoria,
        unidade: formData.unidade,
        precoPago: parseFloat(formData.precoPago),
        volumeEmbalagem: parseFloat(formData.volumeEmbalagem),
        fornecedor: formData.fornecedor,
        observacoes: formData.observacoes,
        dataAtualizacao: new Date().toISOString()
      };

      let updatedInsumos;
      if (editingInsumo) {
        updatedInsumos = insumos.map(insumo => 
          insumo.id === editingInsumo.id ? novoInsumo : insumo
        );
      } else {
        updatedInsumos = [...insumos, novoInsumo];
      }

      localStorage.setItem("insumos", JSON.stringify(updatedInsumos));
      setInsumos(updatedInsumos);
      resetForm();
      toast.success(editingInsumo ? "Insumo atualizado com sucesso!" : "Insumo adicionado com sucesso!");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('insumosUpdated'));
    } catch (error) {
      console.error("Error saving insumo:", error);
      toast.error("Erro ao salvar insumo");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria: "",
      unidade: "",
      precoPago: "",
      volumeEmbalagem: "",
      fornecedor: "",
      observacoes: ""
    });
    setIsAddingInsumo(false);
    setEditingInsumo(null);
  };

  const handleEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setFormData({
      nome: insumo.nome,
      categoria: insumo.categoria,
      unidade: insumo.unidade,
      precoPago: insumo.precoPago.toString(),
      volumeEmbalagem: insumo.volumeEmbalagem.toString(),
      fornecedor: insumo.fornecedor,
      observacoes: insumo.observacoes || ""
    });
    setIsAddingInsumo(true);
  };

  const handleDelete = (id: string) => {
    try {
      const updatedInsumos = insumos.filter(insumo => insumo.id !== id);
      localStorage.setItem("insumos", JSON.stringify(updatedInsumos));
      setInsumos(updatedInsumos);
      toast.success("Insumo removido com sucesso!");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('insumosUpdated'));
    } catch (error) {
      console.error("Error deleting insumo:", error);
      toast.error("Erro ao remover insumo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCostPerUnit = (insumo: Insumo) => {
    return insumo.precoPago / insumo.volumeEmbalagem;
  };

  const getCategoriaLabel = (categoria: string) => {
    return categorias.find(cat => cat.value === categoria)?.label || categoria;
  };

  const getUnidadeLabel = (unidade: string) => {
    return unidades.find(un => un.value === unidade)?.label || unidade;
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Insumos Cadastrados</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {insumos.length} insumos cadastrados no sistema
          </p>
        </div>
        <Button onClick={() => setIsAddingInsumo(true)} size="sm" className="text-xs sm:text-sm">
          <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span>Novo Insumo</span>
        </Button>
      </div>

      {/* Lista de Insumos */}
      {insumos.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Nome</TableHead>
                    <TableHead className="text-xs sm:text-sm">Categoria</TableHead>
                    <TableHead className="text-xs sm:text-sm">Preço Pago</TableHead>
                    <TableHead className="text-xs sm:text-sm">Volume</TableHead>
                    <TableHead className="text-xs sm:text-sm">Custo/Unidade</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fornecedor</TableHead>
                    <TableHead className="text-xs sm:text-sm w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell className="text-xs sm:text-sm font-medium">{insumo.nome}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline">{getCategoriaLabel(insumo.categoria)}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatCurrency(insumo.precoPago)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {insumo.volumeEmbalagem} {insumo.unidade}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium text-green-600">
                        {formatCurrency(getCostPerUnit(insumo))}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{insumo.fornecedor}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(insumo)}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(insumo.id)}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold">Nenhum insumo cadastrado</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comece cadastrando os insumos que você utiliza no seu restaurante.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal/Form para Adicionar/Editar Insumo */}
      <Dialog open={isAddingInsumo} onOpenChange={(open) => {
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingInsumo ? "Editar Insumo" : "Novo Insumo"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="nome" className="text-xs sm:text-sm">Nome do Insumo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Filé de Frango"
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="categoria" className="text-xs sm:text-sm">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value} className="text-xs sm:text-sm">
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unidade" className="text-xs sm:text-sm">Unidade *</Label>
                <Select value={formData.unidade} onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade.value} value={unidade.value} className="text-xs sm:text-sm">
                        {unidade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="precoPago" className="text-xs sm:text-sm">Preço Pago (R$) *</Label>
                <Input
                  id="precoPago"
                  type="number"
                  step="0.01"
                  value={formData.precoPago}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoPago: e.target.value }))}
                  placeholder="0.00"
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div>
                <Label htmlFor="volumeEmbalagem" className="text-xs sm:text-sm">Volume da Embalagem *</Label>
                <Input
                  id="volumeEmbalagem"
                  type="number"
                  step="0.01"
                  value={formData.volumeEmbalagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, volumeEmbalagem: e.target.value }))}
                  placeholder="1.00"
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="fornecedor" className="text-xs sm:text-sm">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  placeholder="Ex: Açougue Central"
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="observacoes" className="text-xs sm:text-sm">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais..."
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="text-xs sm:text-sm">
                Cancelar
              </Button>
              <Button type="submit" className="text-xs sm:text-sm">
                {editingInsumo ? "Atualizar" : "Salvar"} Insumo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
