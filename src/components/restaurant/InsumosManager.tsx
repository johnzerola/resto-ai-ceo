
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Package2 } from "lucide-react";
import { toast } from "sonner";

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  precoUnitario: number;
  unidade: string;
  fornecedor: string;
  dataAtualizacao: string;
}

export function InsumosManager() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    precoUnitario: '',
    unidade: '',
    fornecedor: ''
  });

  useEffect(() => {
    loadInsumos();
  }, []);

  const loadInsumos = () => {
    try {
      const stored = localStorage.getItem('insumos');
      if (stored) {
        const data = JSON.parse(stored);
        setInsumos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading insumos:', error);
      setInsumos([]);
    }
  };

  const clearForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      precoUnitario: '',
      unidade: '',
      fornecedor: ''
    });
  };

  const handleSave = () => {
    if (!formData.nome.trim() || !formData.precoUnitario || !formData.unidade.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const precoNumerico = parseFloat(formData.precoUnitario);
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      toast.error('Preço deve ser um número válido maior que zero');
      return;
    }

    try {
      const novoInsumo: Insumo = {
        id: editingId || Date.now().toString(),
        nome: formData.nome.trim(),
        categoria: formData.categoria.trim() || 'Geral',
        precoUnitario: precoNumerico,
        unidade: formData.unidade.trim(),
        fornecedor: formData.fornecedor.trim() || 'Não informado',
        dataAtualizacao: new Date().toISOString()
      };

      let updatedInsumos;
      if (editingId) {
        updatedInsumos = insumos.map(item => 
          item.id === editingId ? novoInsumo : item
        );
        toast.success('Insumo atualizado com sucesso');
      } else {
        updatedInsumos = [...insumos, novoInsumo];
        toast.success('Insumo adicionado com sucesso');
      }

      setInsumos(updatedInsumos);
      localStorage.setItem('insumos', JSON.stringify(updatedInsumos));
      
      clearForm();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving insumo:', error);
      toast.error('Erro ao salvar insumo');
    }
  };

  const handleEdit = (insumo: Insumo) => {
    setFormData({
      nome: insumo.nome,
      categoria: insumo.categoria,
      precoUnitario: insumo.precoUnitario.toString(),
      unidade: insumo.unidade,
      fornecedor: insumo.fornecedor
    });
    setEditingId(insumo.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    try {
      const updatedInsumos = insumos.filter(item => item.id !== id);
      setInsumos(updatedInsumos);
      localStorage.setItem('insumos', JSON.stringify(updatedInsumos));
      toast.success('Insumo removido com sucesso');
    } catch (error) {
      console.error('Error deleting insumo:', error);
      toast.error('Erro ao remover insumo');
    }
  };

  const handleCancel = () => {
    clearForm();
    setIsAdding(false);
    setEditingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4 overflow-hidden">
      {!isAdding ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Insumos Cadastrados</h3>
              <p className="text-xs text-muted-foreground">
                {insumos.length} insumos cadastrados
              </p>
            </div>
            <Button 
              onClick={() => setIsAdding(true)} 
              size="sm"
              className="text-xs h-7 sm:h-8 whitespace-nowrap"
            >
              <Plus className="mr-1 h-3 w-3" />
              Novo Insumo
            </Button>
          </div>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium">Nome</TableHead>
                      <TableHead className="text-xs font-medium">Categoria</TableHead>
                      <TableHead className="text-xs font-medium">Preço</TableHead>
                      <TableHead className="text-xs font-medium">Unidade</TableHead>
                      <TableHead className="text-xs font-medium hidden sm:table-cell">Fornecedor</TableHead>
                      <TableHead className="text-xs font-medium w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insumos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="flex flex-col items-center gap-2">
                            <Package2 className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Nenhum insumo cadastrado
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      insumos.map((insumo) => (
                        <TableRow key={insumo.id}>
                          <TableCell className="text-xs font-medium">{insumo.nome}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {insumo.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-green-600">
                            {formatCurrency(insumo.precoUnitario)}
                          </TableCell>
                          <TableCell className="text-xs">{insumo.unidade}</TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">{insumo.fornecedor}</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(insumo)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(insumo.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Package2 className="h-4 w-4 text-blue-600" />
              {editingId ? 'Editar Insumo' : 'Novo Insumo'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {editingId ? 'Atualize as informações do insumo' : 'Cadastre um novo insumo para usar nas fichas técnicas'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs sm:text-sm">Nome do Insumo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Filé de Frango"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-xs sm:text-sm">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ex: Carnes"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoUnitario" className="text-xs sm:text-sm">Preço Unitário (R$) *</Label>
                <Input
                  id="precoUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoUnitario}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: e.target.value }))}
                  placeholder="0,00"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade" className="text-xs sm:text-sm">Unidade *</Label>
                <Input
                  id="unidade"
                  value={formData.unidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
                  placeholder="Ex: kg, litro, unidade"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fornecedor" className="text-xs sm:text-sm">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  placeholder="Ex: Distribuidora ABC"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 sm:pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
