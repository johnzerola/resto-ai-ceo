
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock,
  FileText,
  Download,
  Plus,
  Trash2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

interface TechnicalSheetData {
  // Dados básicos
  dishName: string;
  dishCode: string;
  category: string;
  description: string;
  imageUrl?: string;
  
  // Ingredientes
  ingredients: Ingredient[];
  
  // Custos diretos
  wastePercentage: number;
  directOperationalCost: number;
  packagingCost: number;
  
  // Custos indiretos
  fixedCostAllocation: number;
  indirectCosts: number;
  
  // Precificação
  desiredProfitMargin: number;
  currentMenuPrice: number;
  marketComparisonMin: number;
  marketComparisonMax: number;
  
  // Informações adicionais
  preparationTime: number;
  allergens: string[];
  specialInstructions: string;
  notes: string;
}

interface TechnicalSheetProps {
  menuItemId?: string;
  onSave: (data: TechnicalSheetData) => void;
  onCancel: () => void;
}

export function TechnicalSheet({ menuItemId, onSave, onCancel }: TechnicalSheetProps) {
  const [data, setData] = useState<TechnicalSheetData>({
    dishName: "",
    dishCode: "",
    category: "",
    description: "",
    ingredients: [],
    wastePercentage: 5,
    directOperationalCost: 0,
    packagingCost: 0,
    fixedCostAllocation: 0,
    indirectCosts: 0,
    desiredProfitMargin: 200,
    currentMenuPrice: 0,
    marketComparisonMin: 0,
    marketComparisonMax: 0,
    preparationTime: 30,
    allergens: [],
    specialInstructions: "",
    notes: ""
  });

  const [calculatedCosts, setCalculatedCosts] = useState({
    totalIngredientCost: 0,
    totalDirectCost: 0,
    totalCost: 0,
    suggestedPrice: 0,
    contributionMargin: 0,
    foodCostPercentage: 0,
    breakEvenQuantity: 0,
    projectedMonthlyRevenue: 0,
    estimatedNetProfit: 0
  });

  // Carregar dados do item do menu se estiver editando
  useEffect(() => {
    if (menuItemId) {
      loadMenuItemData(menuItemId);
    }
  }, [menuItemId]);

  // Recalcular custos sempre que os dados mudarem
  useEffect(() => {
    calculateCosts();
  }, [data]);

  const loadMenuItemData = (itemId: string) => {
    const storedItems = localStorage.getItem("menuItems");
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const item = items.find((i: any) => i.id === itemId);
      if (item) {
        setData(prev => ({
          ...prev,
          dishName: item.name,
          category: item.category,
          description: item.description,
          currentMenuPrice: item.price,
          preparationTime: item.preparationTime || 30
        }));
      }
    }
  };

  const calculateCosts = () => {
    // Custo total dos ingredientes
    const totalIngredientCost = data.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    
    // Custo com desperdício
    const wasteAmount = totalIngredientCost * (data.wastePercentage / 100);
    
    // Custo direto total
    const totalDirectCost = totalIngredientCost + wasteAmount + data.directOperationalCost + data.packagingCost;
    
    // Custo total (direto + indireto)
    const totalCost = totalDirectCost + data.fixedCostAllocation + data.indirectCosts;
    
    // Preço sugerido
    const suggestedPrice = totalCost * (1 + data.desiredProfitMargin / 100);
    
    // Margem de contribuição
    const contributionMargin = data.currentMenuPrice - totalDirectCost;
    
    // Food cost percentage
    const foodCostPercentage = data.currentMenuPrice > 0 ? (totalIngredientCost / data.currentMenuPrice) * 100 : 0;
    
    // Ponto de equilíbrio (assumindo 100 pratos vendidos por mês como base)
    const monthlyDishes = 100;
    const breakEvenQuantity = data.fixedCostAllocation > 0 ? data.fixedCostAllocation / contributionMargin : 0;
    
    // Projeções mensais
    const projectedMonthlyRevenue = data.currentMenuPrice * monthlyDishes;
    const estimatedNetProfit = (data.currentMenuPrice - totalCost) * monthlyDishes;

    setCalculatedCosts({
      totalIngredientCost,
      totalDirectCost,
      totalCost,
      suggestedPrice,
      contributionMargin,
      foodCostPercentage,
      breakEvenQuantity,
      projectedMonthlyRevenue,
      estimatedNetProfit
    });
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      quantity: 0,
      unit: "g",
      unitCost: 0,
      totalCost: 0
    };
    setData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.id === id) {
          const updated = { ...ing, [field]: value };
          // Recalcular custo total do ingrediente
          if (field === 'quantity' || field === 'unitCost') {
            updated.totalCost = updated.quantity * updated.unitCost;
          }
          return updated;
        }
        return ing;
      })
    }));
  };

  const removeIngredient = (id: string) => {
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const exportToPDF = () => {
    // Implementar exportação para PDF
    console.log("Exportando ficha técnica para PDF...");
  };

  const getAlertLevel = () => {
    if (calculatedCosts.foodCostPercentage > 35) return "critical";
    if (calculatedCosts.foodCostPercentage > 30) return "warning";
    return "good";
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ficha Técnica</h2>
          <p className="text-muted-foreground">
            Análise completa de custos e rentabilidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(data)}>
            Salvar Ficha
          </Button>
        </div>
      </div>

      {/* Alertas de rentabilidade */}
      {alertLevel !== "good" && (
        <Alert variant={alertLevel === "critical" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alertLevel === "critical" 
              ? `Food Cost crítico: ${calculatedCosts.foodCostPercentage.toFixed(1)}% (recomendado: máx. 30%)`
              : `Food Cost elevado: ${calculatedCosts.foodCostPercentage.toFixed(1)}% (recomendado: máx. 30%)`
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna 1: Dados básicos e ingredientes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Básicos do Prato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dishName">Nome do Prato</Label>
                  <Input
                    id="dishName"
                    value={data.dishName}
                    onChange={(e) => setData(prev => ({ ...prev, dishName: e.target.value }))}
                    placeholder="Ex: Risotto de Camarão"
                  />
                </div>
                <div>
                  <Label htmlFor="dishCode">Código do Prato</Label>
                  <Input
                    id="dishCode"
                    value={data.dishCode}
                    onChange={(e) => setData(prev => ({ ...prev, dishCode: e.target.value }))}
                    placeholder="Ex: RST001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do prato..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Ingredientes e Quantidades
                </span>
                <Button onClick={addIngredient} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Input
                        placeholder="Nome do ingrediente"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={ingredient.quantity || ""}
                        onChange={(e) => updateIngredient(ingredient.id, "quantity", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        placeholder="Un"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(ingredient.id, "unit", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="R$/Un"
                        value={ingredient.unitCost || ""}
                        onChange={(e) => updateIngredient(ingredient.id, "unitCost", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">
                        {formatCurrency(ingredient.totalCost)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {data.ingredients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum ingrediente adicionado</p>
                    <p className="text-sm">Clique em "Adicionar" para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custos operacionais */}
          <Card>
            <CardHeader>
              <CardTitle>Custos Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wastePercentage">Desperdício (%)</Label>
                  <Input
                    id="wastePercentage"
                    type="number"
                    step="0.1"
                    value={data.wastePercentage}
                    onChange={(e) => setData(prev => ({ ...prev, wastePercentage: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="preparationTime">Tempo de Preparo (min)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={data.preparationTime}
                    onChange={(e) => setData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="directOperationalCost">Custo Operacional Direto (R$)</Label>
                  <Input
                    id="directOperationalCost"
                    type="number"
                    step="0.01"
                    value={data.directOperationalCost}
                    onChange={(e) => setData(prev => ({ ...prev, directOperationalCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="packagingCost">Custo de Embalagem (R$)</Label>
                  <Input
                    id="packagingCost"
                    type="number"
                    step="0.01"
                    value={data.packagingCost}
                    onChange={(e) => setData(prev => ({ ...prev, packagingCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Análises e resultados */}
        <div className="space-y-6">
          {/* Resumo de custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Análise de Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Custo Ingredientes:</span>
                <span className="font-medium">{formatCurrency(calculatedCosts.totalIngredientCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Custo Direto Total:</span>
                <span className="font-medium">{formatCurrency(calculatedCosts.totalDirectCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm">Custo Total:</span>
                <span className="font-bold text-lg">{formatCurrency(calculatedCosts.totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Preço Sugerido:</span>
                <span className="font-bold text-lg text-green-600">{formatCurrency(calculatedCosts.suggestedPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Food Cost %:</span>
                  <Badge variant={alertLevel === "good" ? "default" : alertLevel === "warning" ? "secondary" : "destructive"}>
                    {calculatedCosts.foodCostPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Margem Contribuição:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.contributionMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ponto Equilíbrio:</span>
                  <span className="font-medium">{Math.ceil(calculatedCosts.breakEvenQuantity)} unid/mês</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precificação */}
          <Card>
            <CardHeader>
              <CardTitle>Estratégia de Preços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentMenuPrice">Preço Atual no Cardápio (R$)</Label>
                <Input
                  id="currentMenuPrice"
                  type="number"
                  step="0.01"
                  value={data.currentMenuPrice}
                  onChange={(e) => setData(prev => ({ ...prev, currentMenuPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="desiredProfitMargin">Margem de Lucro Desejada (%)</Label>
                <Input
                  id="desiredProfitMargin"
                  type="number"
                  value={data.desiredProfitMargin}
                  onChange={(e) => setData(prev => ({ ...prev, desiredProfitMargin: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Receita Projetada (100 un/mês)</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(calculatedCosts.projectedMonthlyRevenue)}
                </p>
                <p className="text-sm">
                  Lucro: {formatCurrency(calculatedCosts.estimatedNetProfit)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informações Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialInstructions">Instruções Especiais</Label>
                <Textarea
                  id="specialInstructions"
                  value={data.specialInstructions}
                  onChange={(e) => setData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Instruções de preparo..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações Internas</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas e observações..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
