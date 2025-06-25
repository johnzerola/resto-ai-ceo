
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AutoCalculationService {
  // Calcular totais financeiros automaticamente
  static async updateRestaurantFinancials(restaurantId: string): Promise<void> {
    try {
      console.log('🧮 [AutoCalculation] Calculando dados financeiros para:', restaurantId);

      // Buscar transações do cash flow
      const { data: transactions } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!transactions) return;

      // Calcular totais
      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const averageMonthlyRevenue = totalRevenue > 0 ? totalRevenue / 12 : 0;
      const fixedExpenses = transactions
        .filter(t => t.type === 'expense' && ['aluguel', 'funcionarios', 'energia', 'agua'].includes(t.category))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const variableExpenses = totalExpenses - fixedExpenses;
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

      // Atualizar dados do restaurante
      await supabase
        .from('restaurants')
        .update({
          average_monthly_sales: averageMonthlyRevenue,
          fixed_expenses: fixedExpenses,
          variable_expenses: variableExpenses,
          desired_profit_margin: Math.max(profitMargin, 20), // Mínimo 20%
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      console.log('✅ [AutoCalculation] Dados financeiros atualizados');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao calcular financials:', error);
    }
  }

  // Calcular custos de receitas automaticamente
  static async updateRecipeCosts(restaurantId: string): Promise<void> {
    try {
      console.log('🍽️ [AutoCalculation] Calculando custos de receitas para:', restaurantId);

      // Buscar receitas
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!recipes) return;

      // Buscar itens do inventário para calcular custos
      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!inventory) return;

      for (const recipe of recipes) {
        // Estimar custo baseado no tipo de prato e ingredientes disponíveis
        let estimatedCost = 0;
        
        // Lógica básica de estimativa baseada na categoria
        switch (recipe.category?.toLowerCase()) {
          case 'pizza':
          case 'pizzas':
            estimatedCost = 8.50; // Custo base para pizza
            break;
          case 'pratos principais':
          case 'principal':
            estimatedCost = 12.00;
            break;
          case 'lanches':
          case 'lanche':
            estimatedCost = 6.50;
            break;
          case 'bebidas':
          case 'bebida':
            estimatedCost = 2.80;
            break;
          case 'saladas':
          case 'salada':
            estimatedCost = 5.20;
            break;
          default:
            estimatedCost = 9.00;
        }

        // Calcular preço sugerido com markup de 250%
        const suggestedPrice = estimatedCost * 2.5;

        // Atualizar receita com custos calculados
        await supabase
          .from('recipes')
          .update({
            cost: estimatedCost,
            selling_price: suggestedPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', recipe.id);
      }

      console.log('✅ [AutoCalculation] Custos de receitas atualizados');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao calcular recipe costs:', error);
    }
  }

  // Atualizar metas automaticamente baseado em dados reais
  static async updateGoalsProgress(restaurantId: string): Promise<void> {
    try {
      console.log('🎯 [AutoCalculation] Atualizando progresso das metas para:', restaurantId);

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!goals) return;

      const { data: transactions } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId);

      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);

      for (const goal of goals) {
        let currentProgress = goal.current || 0;

        // Calcular progresso baseado na categoria da meta
        switch (goal.category) {
          case 'financial':
            if (goal.title.toLowerCase().includes('faturamento')) {
              const monthlyRevenue = transactions
                ?.filter(t => t.type === 'income')
                .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
              currentProgress = monthlyRevenue;
            }
            break;
          
          case 'inventory':
            if (goal.title.toLowerCase().includes('estoque')) {
              const totalItems = inventory?.length || 0;
              const itemsAboveMin = inventory?.filter(item => 
                item.quantity >= (item.minimum_stock || 0)
              ).length || 0;
              currentProgress = totalItems > 0 ? (itemsAboveMin / totalItems) * 100 : 0;
            }
            break;
        }

        // Atualizar progresso da meta
        const completed = currentProgress >= goal.target;
        
        await supabase
          .from('goals')
          .update({
            current: currentProgress,
            completed: completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id);
      }

      console.log('✅ [AutoCalculation] Progresso das metas atualizado');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro ao atualizar goals:', error);
    }
  }

  // Função principal que executa todos os cálculos
  static async runAllCalculations(restaurantId: string): Promise<void> {
    try {
      console.log('🚀 [AutoCalculation] Executando todos os cálculos para:', restaurantId);
      
      await Promise.all([
        this.updateRestaurantFinancials(restaurantId),
        this.updateRecipeCosts(restaurantId),
        this.updateGoalsProgress(restaurantId)
      ]);

      console.log('✅ [AutoCalculation] Todos os cálculos concluídos');
    } catch (error) {
      console.error('❌ [AutoCalculation] Erro nos cálculos automáticos:', error);
    }
  }

  // Executar cálculos quando novos dados forem inseridos
  static async onDataInserted(restaurantId: string, dataType: string): Promise<void> {
    console.log(`📊 [AutoCalculation] Dados inseridos (${dataType}), recalculando...`);
    
    // Aguardar um pouco para garantir que os dados foram inseridos
    setTimeout(() => {
      this.runAllCalculations(restaurantId);
    }, 1000);
  }
}
