
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-REPORT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, reportType, dateRange } = await req.json();
    
    if (!restaurantId) {
      throw new Error('ID do restaurante é obrigatório');
    }

    logStep('Gerando relatório', { restaurantId, reportType, dateRange });

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Datas padrão se não especificadas
    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();
    const startDate = dateRange?.startDate 
      ? new Date(dateRange.startDate) 
      : new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());

    // Formatar datas para o formato do banco
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Objeto para armazenar dados do relatório
    let reportData: any = {
      restaurantId,
      generatedAt: new Date().toISOString(),
      reportType,
      dateRange: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    };

    // Buscar dados conforme o tipo de relatório
    if (reportType === 'financial' || reportType === 'complete') {
      // Receitas e despesas no período
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate)
        .order('date', { ascending: true });
        
      if (cashFlowError) throw cashFlowError;
      
      // Calcular totais por tipo (receita/despesa)
      const income = cashFlowData
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0);
        
      const expenses = cashFlowData
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0);
        
      // Calcular totais por categoria
      const categorySummary = cashFlowData.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = {};
        if (!acc[item.type][item.category]) acc[item.type][item.category] = 0;
        acc[item.type][item.category] += Number(item.amount);
        return acc;
      }, {});
      
      reportData.financial = {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        profitMargin: income > 0 ? ((income - expenses) / income) * 100 : 0,
        byCategory: categorySummary,
        transactions: cashFlowData
      };
    }
    
    if (reportType === 'inventory' || reportType === 'complete') {
      // Dados atuais do estoque
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);
        
      if (inventoryError) throw inventoryError;
      
      // Calcular valor total do estoque
      const totalInventoryValue = inventoryData.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.cost_per_unit || 0));
      }, 0);
      
      // Identificar itens com estoque baixo
      const lowStockItems = inventoryData.filter(item => {
        return item.minimum_stock && item.quantity <= item.minimum_stock;
      });
      
      reportData.inventory = {
        totalItems: inventoryData.length,
        totalValue: totalInventoryValue,
        lowStockItems: lowStockItems,
        inventoryItems: inventoryData
      };
    }
    
    if (reportType === 'menu' || reportType === 'complete') {
      // Buscar dados de receitas
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .eq('restaurant_id', restaurantId);
        
      if (recipesError) throw recipesError;
      
      // Calcular média de custo e preço de venda
      const totalCost = recipesData.reduce((sum, recipe) => sum + Number(recipe.cost || 0), 0);
      const totalSale = recipesData.reduce((sum, recipe) => sum + Number(recipe.selling_price || 0), 0);
      
      // Calcular margem média
      const avgCost = recipesData.length > 0 ? totalCost / recipesData.length : 0;
      const avgPrice = recipesData.length > 0 ? totalSale / recipesData.length : 0;
      const avgMargin = avgPrice > 0 ? ((avgPrice - avgCost) / avgPrice) * 100 : 0;
      
      reportData.menu = {
        totalRecipes: recipesData.length,
        averageCost: avgCost,
        averagePrice: avgPrice,
        averageMargin: avgMargin,
        recipes: recipesData
      };
    }
    
    if (reportType === 'complete') {
      // Buscar dados do restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
        
      if (restaurantError) throw restaurantError;
      
      // Adicionar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId);
        
      if (goalsError) throw goalsError;
      
      // Calcular progresso das metas
      const goalsWithProgress = goalsData.map(goal => {
        const progressPercent = goal.target > 0 
          ? (Number(goal.current) / Number(goal.target)) * 100 
          : 0;
          
        return {
          ...goal,
          progressPercent: Math.min(progressPercent, 100)
        };
      });
      
      reportData.general = {
        restaurant: restaurantData,
        goals: goalsWithProgress
      };
    }
    
    logStep('Relatório gerado com sucesso');

    return new Response(
      JSON.stringify(reportData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro ao gerar relatório', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido ao gerar relatório',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
