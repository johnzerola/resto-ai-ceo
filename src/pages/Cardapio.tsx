import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Utensils, Plus, Edit, Trash2, DollarSign, Clock, Users, FileText } from "lucide-react";
import { TechnicalSheet } from "@/components/restaurant/TechnicalSheet";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  ingredients: string[];
  isAvailable: boolean;
  allergens?: string[];
  calories?: number;
  servingSize?: string;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: "appetizers", label: "Entradas" },
  { value: "main_dishes", label: "Pratos Principais" },
  { value: "salads", label: "Saladas" },
  { value: "pasta", label: "Massas" },
  { value: "pizza", label: "Pizzas" },
  { value: "seafood", label: "Frutos do Mar" },
  { value: "meat", label: "Carnes" },
  { value: "vegetarian", label: "Vegetariano" },
  { value: "desserts", label: "Sobremesas" },
  { value: "beverages", label: "Bebidas" },
  { value: "drinks", label: "Drinks" }
];

const allergens = [
  { value: "gluten", label: "Glúten" },
  { value: "lactose", label: "Lactose" },
  { value: "nuts", label: "Nozes" },
  { value: "soy", label: "Soja" },
  { value: "eggs", label: "Ovos" },
  { value: "fish", label: "Peixes" },
  { value: "shellfish", label: "Crustáceos" }
];

export function Cardapio() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    preparationTime: 0,
    ingredients: "",
    allergens: [] as string[],
    calories: 0,
    servingSize: "",
    isAvailable: true
  });

  // Load menu items from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem("menuItems");
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        setMenuItems(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Error parsing menu items:", error);
        setMenuItems([]);
      }
    }
  }, []);

  // Save menu items to localStorage
  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem("menuItems", JSON.stringify(items));
    setMenuItems(items);
    // Dispatch event for system integration
    window.dispatchEvent(new CustomEvent('menuUpdated', { detail: items }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      preparationTime: 0,
      ingredients: "",
      allergens: [],
      calories: 0,
      servingSize: "",
      isAvailable: true
    });
    setEditingItem(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const now = new Date().toISOString();
    const ingredientsList = formData.ingredients.split(",").map(i => i.trim()).filter(Boolean);

    if (editingItem) {
      // Update existing item
      const updatedItem: MenuItem = {
        ...editingItem,
        ...formData,
        ingredients: ingredientsList,
        updatedAt: now
      };
      
      const updatedItems = menuItems.map(item => 
        item.id === editingItem.id ? updatedItem : item
      );
      
      saveMenuItems(updatedItems);
      toast.success("Item atualizado com sucesso!");
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...formData,
        ingredients: ingredientsList,
        createdAt: now,
        updatedAt: now
      };
      
      saveMenuItems([...menuItems, newItem]);
      toast.success("Item adicionado com sucesso!");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients.join(", "),
      allergens: item.allergens || [],
      calories: item.calories || 0,
      servingSize: item.servingSize || "",
      isAvailable: item.isAvailable
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (itemId: string) => {
    const updatedItems = menuItems.filter(item => item.id !== itemId);
    saveMenuItems(updatedItems);
    toast.success("Item removido com sucesso!");
  };

  // Toggle availability
  const toggleAvailability = (itemId: string) => {
    const updatedItems = menuItems.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    saveMenuItems(updatedItems);
    toast.success("Disponibilidade atualizada!");
  };

  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Get category label
  const getCategoryLabel = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue)?.label || categoryValue;
  };

  const [showTechnicalSheet, setShowTechnicalSheet] = useState(false);
  const [selectedItemForSheet, setSelectedItemForSheet] = useState<string | null>(null);

  // Nova função para abrir ficha técnica
  const openTechnicalSheet = (itemId: string) => {
    setSelectedItemForSheet(itemId);
    setShowTechnicalSheet(true);
  };

  // Nova função para salvar ficha técnica
  const saveTechnicalSheet = (technicalData: any) => {
    // Salvar dados da ficha técnica no localStorage
    const storedSheets = localStorage.getItem("technicalSheets") || "{}";
    const sheets = JSON.parse(storedSheets);
    
    if (selectedItemForSheet) {
      sheets[selectedItemForSheet] = {
        ...technicalData,
        id: selectedItemForSheet,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem("technicalSheets", JSON.stringify(sheets));
      toast.success("Ficha técnica salva com sucesso!");
    }
    
    setShowTechnicalSheet(false);
    setSelectedItemForSheet(null);
  };

  // Verificar se item tem ficha técnica
  const hasSheetData = (itemId: string) => {
    const storedSheets = localStorage.getItem("technicalSheets");
    if (!storedSheets) return false;
    const sheets = JSON.parse(storedSheets);
    return !!sheets[itemId];
  };

  if (showTechnicalSheet) {
    return (
      <ModernLayout>
        <div className="p-6">
          <TechnicalSheet
            menuItemId={selectedItemForSheet || undefined}
            onSave={saveTechnicalSheet}
            onCancel={() => {
              setShowTechnicalSheet(false);
              setSelectedItemForSheet(null);
            }}
          />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight page-title">
                Gestão de Cardápio
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base page-subtitle">
                Gerencie os itens do seu cardápio e suas fichas técnicas
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Item *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Risotto de Camarão"
                      required
                    />
                  </div>

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
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o prato, ingredientes principais, modo de preparo..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparation-time">Tempo de Preparo (min)</Label>
                    <Input
                      id="preparation-time"
                      type="number"
                      min="0"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorias</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredientes (separados por vírgula)</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="Ex: Arroz arbóreo, camarão, cebola, alho, vinho branco..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serving-size">Tamanho da Porção</Label>
                  <Input
                    id="serving-size"
                    value={formData.servingSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, servingSize: e.target.value }))}
                    placeholder="Ex: 350g, 1 pessoa, Individual"
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    {editingItem ? "Atualizar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Todas ({menuItems.length})
          </Button>
          {categories.map((category) => {
            const count = menuItems.filter(item => item.category === category.value).length;
            if (count === 0) return null;
            
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Utensils className="h-8 w-8 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {selectedCategory === "all" ? "Nenhum item no cardápio" : "Nenhum item nesta categoria"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    {selectedCategory === "all" 
                      ? "Comece adicionando os primeiros itens ao seu cardápio."
                      : "Adicione itens nesta categoria ou selecione outra categoria."
                    }
                  </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {item.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <Badge 
                          variant={item.isAvailable ? "default" : "destructive"}
                          className={item.isAvailable ? "bg-green-100 text-green-800" : ""}
                        >
                          {item.isAvailable ? "Disponível" : "Indisponível"}
                        </Badge>
                        {hasSheetData(item.id) && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <FileText className="h-3 w-3 mr-1" />
                            Ficha
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {item.preparationTime > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{item.preparationTime}min</span>
                      </div>
                    )}
                  </div>

                  {item.ingredients.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Ingredientes:</strong> {item.ingredients.slice(0, 3).join(", ")}
                      {item.ingredients.length > 3 && "..."}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTechnicalSheet(item.id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Ficha
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={item.isAvailable ? "outline" : "default"}
                      onClick={() => toggleAvailability(item.id)}
                    >
                      {item.isAvailable ? "Desativar" : "Ativar"}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{item.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
