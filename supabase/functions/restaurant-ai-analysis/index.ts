
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import OpenAI from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESTAURANT-AI-ANALYSIS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { restaurantId, analysisType } = await req.json();
    
    if (!restaurantId) {
      throw new Error('ID do restaurante é obrigatório');
    }

    logStep('Iniciando análise de IA', { restaurantId, analysisType });

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coletar dados de acordo com o tipo de análise
    let analysisData: any = {};
    
    if (analysisType === 'financial' || analysisType === 'complete') {
      // Buscar dados financeiros
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: false })
        .limit(100);
        
      if (cashFlowError) throw cashFlowError;
      analysisData.cashFlow = cashFlowData;
      
      // Buscar metas financeiras
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('category', 'financial');
        
      if (goalsError) throw goalsError;
      analysisData.financialGoals = goalsData;
    }
    
    if (analysisType === 'inventory' || analysisType === 'complete') {
      // Buscar dados de estoque
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('restaurant_id', restaurantId);
        
      if (inventoryError) throw inventoryError;
      analysisData.inventory = inventoryData;
    }
    
    if (analysisType === 'recipes' || analysisType === 'complete') {
      // Buscar receitas e ingredientes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(*)
        `)
        .eq('restaurant_id', restaurantId);
        
      if (recipesError) throw recipesError;
      analysisData.recipes = recipesData;
    }
    
    // Configuração de instruções para IA
    let systemPrompt = 'Você é um analista especializado em gestão de restaurantes. ';
    let userPrompt = '';
    
    if (analysisType === 'financial') {
      systemPrompt += 'Analise os dados financeiros e forneça insights para melhorar a lucratividade.';
      userPrompt = 'Com base nos dados de fluxo de caixa e metas financeiras fornecidos, analise a saúde financeira do restaurante. Identifique tendências, indique áreas de melhoria e sugira estratégias para aumentar a lucratividade.';
    } else if (analysisType === 'inventory') {
      systemPrompt += 'Analise os dados de estoque e forneça estratégias para otimização.';
      userPrompt = 'Com base nos dados de estoque fornecidos, analise o gerenciamento de inventário do restaurante. Identifique itens com baixo estoque, possíveis desperdícios e sugira melhorias para otimizar o controle de estoque e reduzir custos.';
    } else if (analysisType === 'recipes') {
      systemPrompt += 'Analise as fichas técnicas e forneça sugestões para otimizar custos e aumentar margens.';
      userPrompt = 'Com base nas receitas e ingredientes fornecidos, analise a rentabilidade de cada item. Identifique receitas com baixa margem de lucro e sugira modificações ou substituições de ingredientes para aumentar a lucratividade sem comprometer a qualidade.';
    } else {
      systemPrompt += 'Analise todos os dados do restaurante e forneça um relatório completo de desempenho e sugestões estratégicas.';
      userPrompt = 'Realize uma análise completa do restaurante com base em todos os dados fornecidos. Identifique pontos fortes, fraquezas e oportunidades. Forneça um conjunto de recomendações estratégicas para melhorar o desempenho geral do negócio, incluindo aspectos financeiros, operacionais e de menu.';
    }
    
    // Integração com OpenAI
    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    logStep('Enviando dados para análise via OpenAI');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `${userPrompt}\n\nDados do restaurante:\n${JSON.stringify(analysisData, null, 2)}`
        }
      ],
      temperature: 0.7,
    });

    const analysis = response.choices[0]?.message?.content || 'Não foi possível gerar a análise.';
    
    logStep('Análise concluída com sucesso');

    return new Response(
      JSON.stringify({
        analysis,
        timestamp: new Date().toISOString(),
        type: analysisType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro na análise', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido ao processar a análise',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
