
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export function Cardapio() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true
  });

  const categories = [
    "Pratos Principais",
    "Entradas",
    "Sobremesas",
    "Bebidas Alcoólicas",
    "Bebidas Não Alcoólicas",
    "Lanches",
    "Saladas"
  ];

  useEffect(() => {
    const storedItems = localStorage.getItem("menuItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        setMenuItems(parsedItems);
      } catch (error) {
        console.error("Error parsing menu items:", error);
        setMenuItems([]);
      }
    }
  }, []);

  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem("menuItems", JSON.stringify(items));
    setMenuItems(items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      available: formData.available
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = menuItems.map(item => 
        item.id === editingItem.id ? newItem : item
      );
      toast.success("Item atualizado com sucesso");
    } else {
      updatedItems = [...menuItems, newItem];
      toast.success("Item adicionado com sucesso");
    }

    saveMenuItems(updatedItems);
    resetForm();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available
    });
    setIsAddingItem(true);
  };

  const handleDelete = (itemId: string) => {
    const updatedItems = menuItems.filter(item => item.id !== itemId);
    saveMenuItems(updatedItems);
    toast.success("Item removido com sucesso");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true
    });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  if (isAddingItem) {
    return (
      <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
        <ModernLayout>
          <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                    {editingItem ? "Editar Item" : "Novo Item do Cardápio"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {editingItem ? "Atualize as informações do item" : "Adicione um novo item ao seu cardápio"}
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Item *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Hambúrguer Clássico"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva os ingredientes e características do item"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="available">Item disponível</Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                      {editingItem ? "Atualizar Item" : "Adicionar Item"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </ModernLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <ModernLayout>
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Gestão do Cardápio</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Gerencie pratos, categorias e preços do seu cardápio
                </p>
              </div>
            </div>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Prato
            </Button>
          </div>

          {menuItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Utensils className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Seu cardápio está vazio</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Comece adicionando seus primeiros pratos e organize seu cardápio de forma personalizada.
                    </p>
                  </div>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setIsAddingItem(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                      <span className="truncate">{item.name}</span>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description || "Sem descrição"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-lg font-bold text-green-600">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.available 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {item.available ? "Disponível" : "Indisponível"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
}
