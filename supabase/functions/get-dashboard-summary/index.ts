import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's restaurant and tenant_id
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('tenant_id')
      .eq('owner_id', user.id)
      .single();

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Get dashboard summary using the database function
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_summary', { p_tenant_id: restaurant.tenant_id });

    if (summaryError) {
      console.error('Error getting summary:', summaryError);
      throw summaryError;
    }

    // Get 7-day cash flow trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: cashFlowTrend } = await supabase
      .from('whatsapp_transactions')
      .select('created_at, amount, transaction_type')
      .eq('tenant_id', restaurant.tenant_id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Process trend data for chart
    const trendData = [];
    const dailyBalances = new Map();
    let runningBalance = 0;

    if (cashFlowTrend) {
      for (const transaction of cashFlowTrend) {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        const amount = transaction.transaction_type === 'income' 
          ? transaction.amount 
          : -transaction.amount;
        
        if (!dailyBalances.has(date)) {
          dailyBalances.set(date, runningBalance);
        }
        dailyBalances.set(date, dailyBalances.get(date) + amount);
        runningBalance += amount;
      }

      // Convert to array format for charts
      for (const [date, balance] of dailyBalances) {
        trendData.push({
          date,
          balance: Number(balance.toFixed(2))
        });
      }
    }

    // Get top 5 SKUs by movement
    const { data: topSkus } = await supabase
      .from('stock_movements')
      .select('item_name, quantity, movement_type')
      .eq('tenant_id', restaurant.tenant_id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const skuData = new Map();
    if (topSkus) {
      for (const movement of topSkus) {
        const key = movement.item_name;
        if (!skuData.has(key)) {
          skuData.set(key, { name: key, movements: 0 });
        }
        skuData.get(key).movements += Math.abs(movement.quantity);
      }
    }

    const topSkusArray = Array.from(skuData.values())
      .sort((a, b) => b.movements - a.movements)
      .slice(0, 5);

    // Get recent activities
    const { data: recentTransactions } = await supabase
      .from('whatsapp_transactions')
      .select('*')
      .eq('tenant_id', restaurant.tenant_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentStockMovements } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('tenant_id', restaurant.tenant_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine and sort recent activities
    const recentActivities = [
      ...(recentTransactions || []).map(t => ({
        id: t.id,
        type: 'transaction',
        description: `${t.transaction_type === 'income' ? 'Receita' : 'Despesa'}: ${t.description}`,
        amount: t.amount,
        created_at: t.created_at
      })),
      ...(recentStockMovements || []).map(s => ({
        id: s.id,
        type: 'stock',
        description: `${s.movement_type === 'entrada' ? 'Entrada' : 'Saída'}: ${s.item_name}`,
        quantity: s.quantity,
        unit: s.unit,
        created_at: s.created_at
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 10);

    return new Response(JSON.stringify({
      summary,
      trends: {
        cashFlow: trendData,
        topSkus: topSkusArray
      },
      recentActivities
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});