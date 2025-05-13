
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Interface for inventory item
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  minStockLevel: number;
  lastUpdated: string;
  supplier?: string;
  location?: string;
  notes?: string;
}

interface InventoryFormProps {
  itemId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function InventoryForm({ itemId, onCancel, onSuccess }: InventoryFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<InventoryItem>();
  
  // Watch values for real-time calculations
  const quantity = watch("quantity") || 0;
  const costPerUnit = watch("costPerUnit") || 0;
  
  // Categories of inventory items
  const categories = [
    "Carnes", 
    "Aves", 
    "Frutos do Mar", 
    "Hortifruti",
    "Laticínios",
    "Secos",
    "Conservas",
    "Refrigerantes",
    "Alcoólicos",
    "Descartáveis",
    "Limpeza",
    "Outros"
  ];

  // Units of measurement
  const units = [
    "g", "kg", "ml", "L", "unidade", "caixa", "dúzia", "pacote", "garrafas"
  ];

  // Calculate total cost whenever quantity or cost changes
  useEffect(() => {
    const total = quantity * costPerUnit;
    setValue("totalCost", total);
  }, [quantity, costPerUnit, setValue]);

  // Load item data if in edit mode
  useEffect(() => {
    if (itemId) {
      const loadItem = async () => {
        try {
          const savedInventory = localStorage.getItem("inventory");
          if (savedInventory) {
            const items = JSON.parse(savedInventory);
            const item = items.find((i: InventoryItem) => i.id === itemId);
            
            if (item) {
              // Pre-fill form with item data
              Object.keys(item).forEach((key) => {
                setValue(key as keyof InventoryItem, item[key as keyof InventoryItem]);
              });
            }
          }
        } catch (error) {
          console.error("Error loading inventory item:", error);
          toast.error("Erro ao carregar dados do item");
        }
      };
      
      loadItem();
    }
  }, [itemId, setValue]);

  // Save inventory item
  const onSubmit = (data: InventoryItem) => {
    // Calculate total cost
    const totalCost = data.quantity * data.costPerUnit;
    
    const itemToSave: InventoryItem = {
      ...data,
      id: itemId || Date.now().toString(),
      totalCost,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      // Save to localStorage
      const savedInventory = localStorage.getItem("inventory") || "[]";
      const items = JSON.parse(savedInventory);
      
      if (itemId) {
        // Update existing item
        const index = items.findIndex((i: InventoryItem) => i.id === itemId);
        if (index >= 0) {
          items[index] = itemToSave;
        }
      } else {
        // Add new item
        items.push(itemToSave);
      }
      
      localStorage.setItem("inventory", JSON.stringify(items));
      
      toast.success(itemId ? "Item atualizado com sucesso!" : "Novo item adicionado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast.error("Erro ao salvar item de estoque");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" onClick={onCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-xl font-semibold">
            {itemId ? "Editar Item de Estoque" : "Novo Item de Estoque"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                placeholder="Ex: Farinha de Trigo"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                onValueChange={(value) => setValue("category", value)}
                defaultValue={watch("category")}
              >
                <SelectTrigger id="category">
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
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="Ex: 10"
                {...register("quantity", { 
                  required: "Quantidade é obrigatória",
                  min: { value: 0, message: "Quantidade deve ser maior ou igual a 0" }
                })}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select 
                onValueChange={(value) => setValue("unit", value)}
                defaultValue={watch("unit")}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
              <Input
                id="minStockLevel"
                type="number"
                step="0.01"
                placeholder="Ex: 5"
                {...register("minStockLevel", { 
                  required: "Estoque mínimo é obrigatório",
                  min: { value: 0, message: "Estoque mínimo deve ser maior ou igual a 0" }
                })}
              />
              {errors.minStockLevel && <p className="text-sm text-red-500">{errors.minStockLevel.message}</p>}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Custo por Unidade (R$)</Label>
              <div className="flex">
                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  className="rounded-l-none"
                  placeholder="0.00"
                  {...register("costPerUnit", { 
                    required: "Custo por unidade é obrigatório",
                    min: { value: 0, message: "Custo deve ser maior ou igual a 0" }
                  })}
                />
              </div>
              {errors.costPerUnit && <p className="text-sm text-red-500">{errors.costPerUnit.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalCost">Custo Total (R$)</Label>
              <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                <span className="text-muted-foreground">R$</span>
                <span className="ml-1 font-medium">
                  {((quantity || 0) * (costPerUnit || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor (opcional)</Label>
              <Input
                id="supplier"
                placeholder="Ex: Distribuidora Alimentos SA"
                {...register("supplier")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização (opcional)</Label>
              <Input
                id="location"
                placeholder="Ex: Estante 3, Prateleira 2"
                {...register("location")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background text-sm"
              placeholder="Informações adicionais sobre o item"
              {...register("notes")}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {itemId ? "Atualizar Item" : "Salvar Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
