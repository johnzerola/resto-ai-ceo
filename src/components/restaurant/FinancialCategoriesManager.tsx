import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";

export function FinancialCategoriesManager() {
  const { 
    categories, 
    isLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useFinancialCategories();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "despesa" as "receita" | "despesa",
    impacta_cmv: false,
    impacta_dre: true,
    cor: "#64748b",
    icone: "circle",
    ativa: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    const success = editingCategory 
      ? await updateCategory(editingCategory.id, formData)
      : await addCategory(formData);

    if (success) {
      resetForm();
      // Notificar outros componentes sobre a atualização
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "despesa",
      impacta_cmv: false,
      impacta_dre: true,
      cor: "#64748b",
      icone: "circle",
      ativa: true
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const editCategory = (category: any) => {
    setFormData({
      nome: category.nome,
      tipo: category.tipo,
      impacta_cmv: category.impacta_cmv,
      impacta_dre: category.impacta_dre,
      cor: category.cor,
      icone: category.icone,
      ativa: category.ativa
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta categoria?")) return;
    await deleteCategory(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando categorias...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categorias Financeiras</CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: "receita" | "despesa") => setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="impacta_cmv"
                      checked={formData.impacta_cmv}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, impacta_cmv: checked }))}
                    />
                    <Label htmlFor="impacta_cmv">Impacta CMV</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="impacta_dre"
                      checked={formData.impacta_dre}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, impacta_dre: checked }))}
                    />
                    <Label htmlFor="impacta_dre">Impacta DRE</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? "Salvar" : "Adicionar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>CMV</TableHead>
                <TableHead>DRE</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.cor }}
                      />
                      {category.nome}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.tipo === 'receita' ? 'default' : 'secondary'}>
                      {category.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.impacta_cmv ? (
                      <Badge className="bg-blue-100 text-blue-800">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.impacta_dre ? (
                      <Badge className="bg-green-100 text-green-800">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => editCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhuma categoria personalizada criada</p>
            <p className="text-sm mt-1">Clique em "Nova Categoria" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}