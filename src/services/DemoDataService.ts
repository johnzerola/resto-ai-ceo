
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class DemoDataService {
  static async populateRestaurantDemoData(restaurantId: string, userId: string): Promise<void> {
    try {
      console.log('🎯 [DemoDataService] Iniciando população de dados de demonstração...');

      // 1. Atualizar dados do restaurante
      await this.updateRestaurantData(restaurantId);

      // 2. Popular cash flow (receitas e despesas)
      await this.populateCashFlow(restaurantId);

      // 3. Popular inventory (estoque)
      await this.populateInventory(restaurantId);

      // 4. Popular pratos/recipes
      await this.populateRecipes(restaurantId);

      // 5. Popular goals (metas)
      await this.populateGoals(restaurantId);

      console.log('✅ [DemoDataService] Dados de demonstração populados com sucesso!');
      toast.success('Dados de demonstração carregados com sucesso!');

    } catch (error) {
      console.error('❌ [DemoDataService] Erro ao popular dados:', error);
      toast.error('Erro ao carregar dados de demonstração');
    }
  }

  private static async updateRestaurantData(restaurantId: string): Promise<void> {
    const restaurantData = {
      average_monthly_sales: 45000,
      fixed_expenses: 12000,
      variable_expenses: 8500,
      desired_profit_margin: 25,
      target_food_cost: 30,
      target_beverage_cost: 20,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('id', restaurantId);

    if (error) throw error;
    console.log('✅ [DemoDataService] Dados do restaurante atualizados');
  }

  private static async populateCashFlow(restaurantId: string): Promise<void> {
    // Verificar se já existem dados
    const { data: existing } = await supabase
      .from('cash_flow')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️ [DemoDataService] Cash flow já possui dados, pulando...');
      return;
    }

    const cashFlowData = [];
    const today = new Date();

    // Gerar 30 dias de dados
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Receitas diárias (vendas)
      const dailySales = 1200 + Math.random() * 800; // R$ 1200-2000
      cashFlowData.push({
        restaurant_id: restaurantId,
        amount: dailySales,
        date: dateStr,
        type: 'income',
        category: 'vendas',
        description: `Vendas do dia ${dateStr}`,
        payment_method: 'misto',
        status: 'confirmed'
      });

      // Despesas ocasionais
      if (Math.random() > 0.7) {
        const expense = 200 + Math.random() * 500; // R$ 200-700
        cashFlowData.push({
          restaurant_id: restaurantId,
          amount: expense,
          date: dateStr,
          type: 'expense',
          category: 'operacional',
          description: `Compra de insumos - ${dateStr}`,
          payment_method: 'cartao',
          status: 'confirmed'
        });
      }
    }

    // Despesas fixas mensais
    const fixedExpenses = [
      { amount: 2500, category: 'aluguel', description: 'Aluguel do estabelecimento' },
      { amount: 800, category: 'energia', description: 'Conta de energia elétrica' },
      { amount: 300, category: 'agua', description: 'Conta de água' },
      { amount: 1200, category: 'funcionarios', description: 'Salários' },
      { amount: 400, category: 'internet', description: 'Internet e telefone' }
    ];

    fixedExpenses.forEach(expense => {
      cashFlowData.push({
        restaurant_id: restaurantId,
        amount: expense.amount,
        date: today.toISOString().split('T')[0],
        type: 'expense',
        category: expense.category,
        description: expense.description,
        payment_method: 'transferencia',
        status: 'confirmed'
      });
    });

    const { error } = await supabase
      .from('cash_flow')
      .insert(cashFlowData);

    if (error) throw error;
    console.log('✅ [DemoDataService] Cash flow populado com', cashFlowData.length, 'registros');
  }

  private static async populateInventory(restaurantId: string): Promise<void> {
    // Verificar se já existem dados
    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️ [DemoDataService] Inventory já possui dados, pulando...');
      return;
    }

    const inventoryItems = [
      { name: 'Frango (kg)', category: 'carnes', quantity: 25, unit: 'kg', cost_per_unit: 8.50, minimum_stock: 10 },
      { name: 'Carne Bovina (kg)', category: 'carnes', quantity: 15, unit: 'kg', cost_per_unit: 28.00, minimum_stock: 8 },
      { name: 'Arroz (kg)', category: 'grãos', quantity: 50, unit: 'kg', cost_per_unit: 4.20, minimum_stock: 20 },
      { name: 'Feijão (kg)', category: 'grãos', quantity: 30, unit: 'kg', cost_per_unit: 6.80, minimum_stock: 15 },
      { name: 'Tomate (kg)', category: 'vegetais', quantity: 12, unit: 'kg', cost_per_unit: 5.50, minimum_stock: 8 },
      { name: 'Cebola (kg)', category: 'vegetais', quantity: 18, unit: 'kg', cost_per_unit: 3.20, minimum_stock: 10 },
      { name: 'Alface (unidade)', category: 'vegetais', quantity: 24, unit: 'unidade', cost_per_unit: 2.50, minimum_stock: 12 },
      { name: 'Óleo de Soja (litro)', category: 'condimentos', quantity: 8, unit: 'litro', cost_per_unit: 6.90, minimum_stock: 5 },
      { name: 'Sal (kg)', category: 'condimentos', quantity: 5, unit: 'kg', cost_per_unit: 2.80, minimum_stock: 2 },
      { name: 'Açúcar (kg)', category: 'condimentos', quantity: 10, unit: 'kg', cost_per_unit: 4.50, minimum_stock: 5 },
      { name: 'Cerveja (unidade)', category: 'bebidas', quantity: 48, unit: 'unidade', cost_per_unit: 3.20, minimum_stock: 24 },
      { name: 'Refrigerante (litro)', category: 'bebidas', quantity: 36, unit: 'litro', cost_per_unit: 4.80, minimum_stock: 20 }
    ];

    const inventoryData = inventoryItems.map(item => ({
      ...item,
      restaurant_id: restaurantId
    }));

    const { error } = await supabase
      .from('inventory')
      .insert(inventoryData);

    if (error) throw error;
    console.log('✅ [DemoDataService] Inventory populado com', inventoryData.length, 'itens');
  }

  private static async populateRecipes(restaurantId: string): Promise<void> {
    // Verificar se já existem dados
    const { data: existing } = await supabase
      .from('recipes')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️ [DemoDataService] Recipes já possui dados, pulando...');
      return;
    }

    const recipes = [
      {
        name: 'Prato Feito Tradicional',
        description: 'Arroz, feijão, bife, ovo e salada',
        category: 'pratos principais',
        portion_size: 1,
        portion_unit: 'prato',
        cost: 8.50,
        selling_price: 18.00,
        restaurant_id: restaurantId
      },
      {
        name: 'Frango Grelhado com Legumes',
        description: 'Peito de frango grelhado com legumes refogados',
        category: 'pratos principais',
        portion_size: 1,
        portion_unit: 'prato',
        cost: 7.20,
        selling_price: 16.00,
        restaurant_id: restaurantId
      },
      {
        name: 'Salada Caesar',
        description: 'Alface, croutons, parmesão e molho caesar',
        category: 'saladas',
        portion_size: 1,
        portion_unit: 'prato',
        cost: 4.80,
        selling_price: 12.00,
        restaurant_id: restaurantId
      },
      {
        name: 'Hambúrguer Artesanal',
        description: 'Hambúrguer 180g com batata frita',
        category: 'lanches',
        portion_size: 1,
        portion_unit: 'unidade',
        cost: 9.50,
        selling_price: 22.00,
        restaurant_id: restaurantId
      },
      {
        name: 'Refrigerante 350ml',
        description: 'Refrigerante gelado',
        category: 'bebidas',
        portion_size: 350,
        portion_unit: 'ml',
        cost: 2.40,
        selling_price: 6.00,
        restaurant_id: restaurantId
      },
      {
        name: 'Cerveja Long Neck',
        description: 'Cerveja gelada 355ml',
        category: 'bebidas',
        portion_size: 355,
        portion_unit: 'ml',
        cost: 3.20,
        selling_price: 8.00,
        restaurant_id: restaurantId
      }
    ];

    const { error } = await supabase
      .from('recipes')
      .insert(recipes);

    if (error) throw error;
    console.log('✅ [DemoDataService] Recipes populado com', recipes.length, 'pratos');
  }

  private static async populateGoals(restaurantId: string): Promise<void> {
    // Verificar se já existem dados
    const { data: existing } = await supabase
      .from('goals')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('⚠️ [DemoDataService] Goals já possui dados, pulando...');
      return;
    }

    const goals = [
      {
        title: 'Faturamento Mensal',
        description: 'Atingir R$ 50.000 de faturamento no mês',
        target: 50000,
        current: 32500,
        unit: 'R$',
        category: 'financial',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
        completed: false,
        restaurant_id: restaurantId
      },
      {
        title: 'Reduzir CMV',
        description: 'Manter CMV abaixo de 30%',
        target: 30,
        current: 28,
        unit: '%',
        category: 'financial',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        completed: false,
        restaurant_id: restaurantId
      },
      {
        title: 'Controle de Estoque',
        description: 'Manter todos os itens acima do estoque mínimo',
        target: 100,
        current: 85,
        unit: '%',
        category: 'inventory',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        completed: false,
        restaurant_id: restaurantId
      },
      {
        title: 'Satisfação do Cliente',
        description: 'Manter avaliação média acima de 4.5 estrelas',
        target: 4.5,
        current: 4.2,
        unit: 'estrelas',
        category: 'customer',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias
        completed: false,
        restaurant_id: restaurantId
      },
      {
        title: 'Vendas Diárias',
        description: 'Atingir 80 pratos vendidos por dia',
        target: 80,
        current: 65,
        unit: 'pratos',
        category: 'sales',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 dias
        completed: false,
        restaurant_id: restaurantId
      }
    ];

    const { error } = await supabase
      .from('goals')
      .insert(goals);

    if (error) throw error;
    console.log('✅ [DemoDataService] Goals populado com', goals.length, 'metas');
  }

  static async checkAndPopulateIfNeeded(restaurantId: string, userId: string): Promise<void> {
    try {
      // Verificar se precisa popular dados
      const [restaurantData, cashFlowData, inventoryData, recipesData, goalsData] = await Promise.all([
        supabase.from('restaurants').select('average_monthly_sales').eq('id', restaurantId).single(),
        supabase.from('cash_flow').select('id').eq('restaurant_id', restaurantId).limit(1),
        supabase.from('inventory').select('id').eq('restaurant_id', restaurantId).limit(1),
        supabase.from('recipes').select('id').eq('restaurant_id', restaurantId).limit(1),
        supabase.from('goals').select('id').eq('restaurant_id', restaurantId).limit(1)
      ]);

      const needsPopulation = (
        !restaurantData.data?.average_monthly_sales ||
        !cashFlowData.data?.length ||
        !inventoryData.data?.length ||
        !recipesData.data?.length ||
        !goalsData.data?.length
      );

      if (needsPopulation) {
        console.log('🎯 [DemoDataService] Dados insuficientes detectados, populando...');
        await this.populateRestaurantDemoData(restaurantId, userId);
      } else {
        console.log('✅ [DemoDataService] Dados já estão completos');
      }

    } catch (error) {
      console.error('❌ [DemoDataService] Erro ao verificar dados:', error);
    }
  }
}
