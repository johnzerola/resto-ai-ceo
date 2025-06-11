
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, Package } from "lucide-react";
import { toast } from "sonner";

interface InventoryFormProps {
  itemId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function InventoryForm({ itemId, onCancel, onSuccess }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    cost: 0,
    supplier: '',
    expiryDate: '',
    minStock: 0,
    location: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      loadItemData();
    }
  }, [itemId]);

  const loadItemData = () => {
    try {
      const storedItems = localStorage.getItem('inventoryItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        const item = items.find((i: any) => i.id === itemId);
        if (item) {
          setFormData({
            name: item.name || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            unit: item.unit || '',
            cost: item.cost || 0,
            supplier: item.supplier || '',
            expiryDate: item.expiryDate || '',
            minStock: item.minStock || 0,
            location: item.location || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading item data:', error);
      toast.error('Erro ao carregar dados do item');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category || formData.quantity < 0 || formData.cost < 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const storedItems = localStorage.getItem('inventoryItems');
      let items = storedItems ? JSON.parse(storedItems) : [];

      const newItem = {
        id: itemId || Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString()
      };

      if (itemId) {
        // Update existing item
        items = items.map((item: any) => item.id === itemId ? newItem : item);
      } else {
        // Add new item
        items.push(newItem);
      }

      localStorage.setItem('inventoryItems', JSON.stringify(items));
      
      // Dispatch event for other components to update
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      
      onSuccess();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Erro ao salvar item');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Carnes',
    'Peixes',
    'Aves',
    'Vegetais',
    'Frutas',
    'Grãos',
    'Laticínios',
    'Bebidas',
    'Temperos',
    'Outros'
  ];

  const units = [
    'kg',
    'g',
    'L',
    'ml',
    'unidade',
    'pacote',
    'caixa',
    'saco',
    'lata',
    'garrafa'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          {itemId ? 'Editar Item' : 'Novo Item no Estoque'}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {itemId ? 'Atualize as informações do item' : 'Adicione um novo item ao seu estoque'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Nome do Item *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Filé de Frango"
                required
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs sm:text-sm">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-xs sm:text-sm">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                required
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-xs sm:text-sm">Unidade *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit} className="text-xs sm:text-sm">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-xs sm:text-sm">Custo Unitário (R$) *</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', Number(e.target.value))}
                required
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock" className="text-xs sm:text-sm">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                step="0.01"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', Number(e.target.value))}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-xs sm:text-sm">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Ex: Distribuidora XYZ"
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-sm">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: Geladeira A, Prateleira 2"
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="expiryDate" className="text-xs sm:text-sm">Data de Validade</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 sm:pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
            >
              <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
            >
              <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
