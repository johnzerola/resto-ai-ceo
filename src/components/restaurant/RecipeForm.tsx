
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Interface para os ingredientes
interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

// Interface para a receita
interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  ingredients: Ingredient[];
  preparationTime: number;
  preparationInstructions: string;
  sellingPrice: number;
  suggestedPrice: number;
  costPerServing: number;
  profitMargin: number;
}

interface RecipeFormProps {
  recipeId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function RecipeForm({ recipeId, onCancel, onSuccess }: RecipeFormProps) {
  const { toast } = useToast();
  
  // Estado inicial para uma nova receita
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  
  // Categorias de produtos
  const categories = [
    "Entrada", 
    "Prato Principal", 
    "Sobremesa", 
    "Bebida", 
    "Acompanhamento"
  ];

  // Unidades de medida
  const units = [
    "g", "kg", "ml", "l", "unidade", "colher", "xícara"
  ];

  // Unidades de porção
  const servingUnits = [
    "porção", "unidade", "prato", "copo", "taça"
  ];

  // Formulário com react-hook-form
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Recipe>();
  
  const sellingPrice = watch("sellingPrice") || 0;
  
  // Função para adicionar um novo ingrediente
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      quantity: 0,
      unit: "g",
      costPerUnit: 0
    };
    
    setIngredients([...ingredients, newIngredient]);
  };

  // Função para remover um ingrediente
  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
    calculateTotalCost();
  };

  // Função para atualizar um ingrediente
  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    const updatedIngredients = ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, [field]: value };
      }
      return ing;
    });
    
    setIngredients(updatedIngredients);
    
    // Recalcular o custo total sempre que um ingrediente for atualizado
    setTimeout(calculateTotalCost, 100);
  };

  // Calcular custo total e preço sugerido
  const calculateTotalCost = () => {
    const cost = ingredients.reduce((total, ing) => {
      return total + (ing.quantity * ing.costPerUnit);
    }, 0);
    
    setTotalCost(cost);
    
    // Restaurante normal geralmente usa 30% de CMV como referência
    const desiredProfitMargin = 0.7; // 70% de margem
    const suggestedPrice = cost / (1 - desiredProfitMargin);
    
    setSuggestedPrice(suggestedPrice);
    
    if (sellingPrice > 0) {
      const calculatedMargin = (sellingPrice - cost) / sellingPrice * 100;
      setProfitMargin(calculatedMargin);
    }
  };
  
  // Função para carregar uma receita existente se estiver editando
  const loadRecipe = async (id: string) => {
    try {
      // Aqui deveria carregar da API ou localStorage
      // Por enquanto, vamos simular com dados locais
      const savedRecipes = localStorage.getItem("recipes");
      if (savedRecipes) {
        const recipes = JSON.parse(savedRecipes);
        const recipe = recipes.find((r: Recipe) => r.id === id);
        
        if (recipe) {
          // Preencher o formulário com os dados da receita
          Object.keys(recipe).forEach((key) => {
            // Ignorar ingredientes, que serão tratados separadamente
            if (key !== "ingredients") {
              setValue(key as keyof Recipe, recipe[key as keyof Recipe]);
            }
          });
          
          setIngredients(recipe.ingredients);
          setTotalCost(recipe.costPerServing * recipe.servingSize);
          setSuggestedPrice(recipe.suggestedPrice);
          setProfitMargin(recipe.profitMargin);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a receita.",
        variant: "destructive"
      });
    }
  };
  
  // Carregar receita se estiver em modo de edição
  useState(() => {
    if (recipeId) {
      loadRecipe(recipeId);
    } else {
      // Adicionar um ingrediente vazio para nova receita
      addIngredient();
    }
  });
  
  // Função para salvar a receita
  const onSubmit = (data: Recipe) => {
    if (ingredients.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um ingrediente à receita.",
        variant: "destructive"
      });
      return;
    }
    
    // Calcular custo por porção
    const costPerServing = totalCost / (data.servingSize || 1);
    
    const recipeToSave: Recipe = {
      ...data,
      id: recipeId || Date.now().toString(),
      ingredients,
      costPerServing,
      suggestedPrice,
      profitMargin
    };
    
    try {
      // Aqui deveria salvar na API ou backend
      // Por enquanto, vamos simular com localStorage
      const savedRecipes = localStorage.getItem("recipes") || "[]";
      const recipes = JSON.parse(savedRecipes);
      
      if (recipeId) {
        // Atualizar receita existente
        const index = recipes.findIndex((r: Recipe) => r.id === recipeId);
        if (index >= 0) {
          recipes[index] = recipeToSave;
        }
      } else {
        // Adicionar nova receita
        recipes.push(recipeToSave);
      }
      
      localStorage.setItem("recipes", JSON.stringify(recipes));
      
      toast({
        title: "Sucesso",
        description: recipeId ? "Receita atualizada com sucesso!" : "Nova receita criada com sucesso!"
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a receita.",
        variant: "destructive"
      });
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
            {recipeId ? "Editar Receita" : "Nova Receita"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Receita</Label>
              <Input
                id="name"
                placeholder="Ex: Risoto de Camarão"
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servingSize">Rendimento</Label>
              <div className="flex space-x-2">
                <Input
                  id="servingSize"
                  type="number"
                  placeholder="Ex: 1"
                  {...register("servingSize", { 
                    required: "Rendimento é obrigatório",
                    min: { value: 0.1, message: "Rendimento deve ser maior que 0" }
                  })}
                />
                
                <Select 
                  onValueChange={(value) => setValue("servingUnit", value)}
                  defaultValue={watch("servingUnit")}
                >
                  <SelectTrigger id="servingUnit" className="w-[180px]">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {servingUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Tempo de Preparo (minutos)</Label>
              <Input
                id="preparationTime"
                type="number"
                placeholder="Ex: 30"
                {...register("preparationTime")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Breve descrição da receita"
              {...register("description")}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Ingredientes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Ingrediente
              </Button>
            </div>
            
            <div className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Nome do ingrediente"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)}
                    />
                  </div>
                  
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={ingredient.quantity || ""}
                      onChange={(e) => updateIngredient(ingredient.id, "quantity", parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="w-28">
                    <Select 
                      value={ingredient.unit}
                      onValueChange={(value) => updateIngredient(ingredient.id, "unit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-28">
                    <Input
                      type="number"
                      placeholder="R$/Unid"
                      value={ingredient.costPerUnit || ""}
                      onChange={(e) => updateIngredient(ingredient.id, "costPerUnit", parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              
              {ingredients.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  Nenhum ingrediente adicionado. Clique em "Adicionar Ingrediente".
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preparationInstructions">Modo de Preparo</Label>
            <textarea
              id="preparationInstructions"
              className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background text-sm"
              placeholder="Descreva o passo a passo do preparo"
              {...register("preparationInstructions")}
            ></textarea>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalCost">Custo Total</Label>
              <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                <span className="text-muted-foreground">R$</span>
                <span className="ml-1 font-medium">{totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suggestedPrice">Preço Sugerido</Label>
              <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                <span className="text-muted-foreground">R$</span>
                <span className="ml-1 font-medium">{suggestedPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Preço de Venda</Label>
              <div className="flex">
                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="sellingPrice"
                  className="rounded-l-none"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("sellingPrice", { 
                    required: "Preço de venda é obrigatório",
                    min: { value: 0.01, message: "Preço deve ser maior que 0" }
                  })}
                  onChange={(e) => {
                    setValue("sellingPrice", parseFloat(e.target.value));
                    calculateTotalCost();
                  }}
                />
              </div>
              {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Margem de Lucro</Label>
              <div className={`flex h-10 items-center rounded-md border px-3 ${profitMargin < 30 ? 'bg-red-50' : profitMargin > 70 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <span className={`font-medium ${profitMargin < 30 ? 'text-red-600' : profitMargin > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {recipeId ? "Atualizar Receita" : "Salvar Receita"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
