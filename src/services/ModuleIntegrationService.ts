
import { toast } from "sonner";
import { getFinancialData, updateFinancialData } from "./FinancialDataService";

// Interface para dados de estoque
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  minQuantity: number;
  lastUpdate: string;
}

// Interface para dados de receita
export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: {
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
  }[];
  portionSize: string;
  portionCost: number;
  suggestedPrice: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
}

// Função para atualizar estoque com base nas vendas de receitas
export function updateInventoryFromSales(recipeId: string, quantity: number): void {
  try {
    // Buscar dados atuais
    const recipesData = localStorage.getItem("recipes");
    const inventoryData = localStorage.getItem("inventory");
    
    if (!recipesData || !inventoryData) {
      console.error("Dados de receitas ou estoque não encontrados");
      return;
    }
    
    const recipes: Record<string, Recipe> = JSON.parse(recipesData);
    const inventory: Record<string, InventoryItem> = JSON.parse(inventoryData);
    
    // Encontrar a receita vendida
    const recipe = recipes[recipeId];
    if (!recipe) {
      console.error(`Receita com ID ${recipeId} não encontrada`);
      return;
    }
    
    // Para cada ingrediente, atualizar o estoque
    const updatedInventory = { ...inventory };
    const lowStockItems: string[] = [];
    
    recipe.ingredients.forEach(ingredient => {
      const inventoryItem = Object.values(updatedInventory).find(
        item => item.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      
      if (inventoryItem) {
        // Calcular a quantidade a ser consumida
        const consumedQuantity = ingredient.quantity * quantity;
        
        // Atualizar o inventário
        const newQuantity = inventoryItem.quantity - consumedQuantity;
        updatedInventory[inventoryItem.id] = {
          ...inventoryItem,
          quantity: newQuantity >= 0 ? newQuantity : 0,
          lastUpdate: new Date().toISOString()
        };
        
        // Verificar se o item está com estoque baixo
        if (newQuantity <= inventoryItem.minQuantity) {
          lowStockItems.push(inventoryItem.name);
        }
      }
    });
    
    // Salvar o inventário atualizado
    localStorage.setItem("inventory", JSON.stringify(updatedInventory));
    
    // Notificar sobre itens com estoque baixo
    if (lowStockItems.length > 0) {
      toast.warning(`Estoque baixo: ${lowStockItems.join(", ")}`, {
        description: "Verifique sua lista de compras"
      });
      
      // Adicionar alerta ao sistema
      addSystemAlert({
        type: "warning",
        title: "Estoque Baixo",
        description: `${lowStockItems.join(", ")} estão com níveis críticos.`,
        date: new Date().toLocaleString()
      });
    }
    
    console.log(`Estoque atualizado após venda de ${quantity}x ${recipe.name}`);
    
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    toast.error("Erro ao atualizar estoque");
  }
}

// Função para calcular CMV e atualizar dados financeiros
export function updateCMVFromSales(recipeId: string, quantity: number, salePrice: number): void {
  try {
    // Buscar dados atuais
    const recipesData = localStorage.getItem("recipes");
    
    if (!recipesData) {
      console.error("Dados de receitas não encontrados");
      return;
    }
    
    const recipes: Record<string, Recipe> = JSON.parse(recipesData);
    
    // Encontrar a receita vendida
    const recipe = recipes[recipeId];
    if (!recipe) {
      console.error(`Receita com ID ${recipeId} não encontrada`);
      return;
    }
    
    // Calcular dados financeiros
    const totalCost = recipe.portionCost * quantity;
    const totalRevenue = salePrice * quantity;
    const cmvPercentage = (totalCost / totalRevenue) * 100;
    
    // Atualizar relatórios financeiros
    const financialData = getFinancialData();
    
    // Criar entrada para o fluxo de caixa
    const cashFlowEntry = {
      id: Date.now().toString(),
      type: "income",
      category: "Vendas",
      description: `Venda de ${quantity}x ${recipe.name}`,
      amount: totalRevenue,
      date: new Date().toISOString(),
      status: "completed"
    };
    
    // Salvar entrada no fluxo de caixa
    const cashFlowData = localStorage.getItem("cashFlow");
    const cashFlow = cashFlowData ? JSON.parse(cashFlowData) : [];
    cashFlow.push(cashFlowEntry);
    localStorage.setItem("cashFlow", JSON.stringify(cashFlow));
    
    // Atualizar dados financeiros
    updateFinancialData(cashFlow);
    
    // Verificar se o CMV está acima da meta
    const targetCMV = getTargetCMV();
    if (cmvPercentage > targetCMV) {
      toast.error(`CMV Alto: ${cmvPercentage.toFixed(1)}%`, {
        description: `Meta: ${targetCMV}% - Considere revisar preços`
      });
      
      // Adicionar alerta ao sistema
      addSystemAlert({
        type: "error",
        title: "CMV Acima da Meta",
        description: `${recipe.name} com CMV ${cmvPercentage.toFixed(1)}%, meta é ${targetCMV}%.`,
        date: new Date().toLocaleString()
      });
    }
    
    console.log(`Dados financeiros atualizados: CMV de ${cmvPercentage.toFixed(1)}% para ${recipe.name}`);
    
  } catch (error) {
    console.error("Erro ao atualizar CMV:", error);
    toast.error("Erro ao atualizar dados financeiros");
  }
}

// Função para obter a meta de CMV das configurações
function getTargetCMV(): number {
  try {
    const configData = localStorage.getItem("restaurantData");
    if (!configData) return 30; // Valor padrão
    
    const config = JSON.parse(configData);
    return config.targetCMV || 30;
  } catch (error) {
    console.error("Erro ao obter meta de CMV:", error);
    return 30; // Valor padrão em caso de erro
  }
}

// Interface para alertas do sistema
export interface SystemAlert {
  type: "warning" | "error" | "success";
  title: string;
  description: string;
  date?: string;
}

// Função para adicionar alertas ao sistema
export function addSystemAlert(alert: SystemAlert): void {
  try {
    const alertsData = localStorage.getItem("systemAlerts");
    const alerts: SystemAlert[] = alertsData ? JSON.parse(alertsData) : [];
    
    // Adicionar novo alerta (limite de 10 alertas)
    alerts.unshift(alert);
    if (alerts.length > 10) {
      alerts.pop();
    }
    
    localStorage.setItem("systemAlerts", JSON.stringify(alerts));
    
    // Disparar evento de alerta para componentes que precisam reagir
    const event = new CustomEvent("systemAlertAdded", { detail: alert });
    window.dispatchEvent(event);
    
  } catch (error) {
    console.error("Erro ao adicionar alerta:", error);
  }
}

// Função para obter alertas do sistema
export function getSystemAlerts(): SystemAlert[] {
  try {
    const alertsData = localStorage.getItem("systemAlerts");
    return alertsData ? JSON.parse(alertsData) : [];
  } catch (error) {
    console.error("Erro ao obter alertas:", error);
    return [];
  }
}
