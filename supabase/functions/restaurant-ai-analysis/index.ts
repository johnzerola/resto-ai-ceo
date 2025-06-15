
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const { message, aiType, context, conversationHistory, restaurantId } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    // Extrair Authorization header para obter user_id
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização é obrigatório');
    }

    // Criar cliente Supabase para validar o token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validar token e extrair user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      logStep('Erro de autenticação', { error: authError });
      throw new Error('Token inválido ou expirado');
    }

    const userId = user.id;
    logStep('Usuário autenticado', { userId, email: user.email });

    // Buscar o restaurante do usuário
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (restaurantError || !restaurant) {
        logStep('Erro ao buscar restaurante', { error: restaurantError });
        throw new Error('Restaurante não encontrado para este usuário');
      }

      finalRestaurantId = restaurant.id;
      logStep('Restaurante encontrado', { restaurantId: finalRestaurantId });
    }

    logStep('Iniciando análise inteligente de IA', { message, aiType, restaurantId: finalRestaurantId, userId });

    // Determinar se a pergunta requer dados do sistema
    const requiresSystemData = await needsSystemData(message);
    
    let response;
    
    if (requiresSystemData) {
      // Consulta direta ao Supabase primeiro
      logStep('Pergunta requer dados do sistema, consultando Supabase diretamente');
      try {
        response = await querySupabaseDirectly(message, finalRestaurantId, aiType, supabase);
      } catch (error) {
        logStep('Erro na consulta direta, usando fallback n8n', { error: error.message });
        response = await queryWithN8n(message, finalRestaurantId, aiType, userId);
      }
    } else {
      // Resposta direta com IA
      logStep('Pergunta não requer dados específicos, usando IA direta');
      response = await directAIResponse(message, aiType, context, conversationHistory);
    }

    logStep('Análise concluída com sucesso');

    return new Response(
      JSON.stringify({
        reply: response,
        timestamp: new Date().toISOString(),
        type: requiresSystemData ? 'system_query' : 'direct_ai'
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

// Função para determinar se a pergunta precisa de dados do sistema
async function needsSystemData(message: string): Promise<boolean> {
  const systemKeywords = [
    'faturamento', 'vendas', 'receita', 'lucro', 'despesas', 'gastos',
    'estoque', 'inventário', 'ingredientes', 'insumos',
    'pratos', 'cardápio', 'menu', 'receitas', 'fichas técnicas',
    'metas', 'objetivos', 'resultados',
    'fluxo de caixa', 'entrada', 'saída', 'pagamentos',
    'semana passada', 'mês passado', 'hoje', 'ontem', 'último',
    'total', 'quanto', 'valor', 'preço', 'custo',
    'análise', 'relatório', 'dados', 'números'
  ];

  const messageLower = message.toLowerCase();
  return systemKeywords.some(keyword => messageLower.includes(keyword));
}

// Nova função para consultar Supabase diretamente
async function querySupabaseDirectly(message: string, restaurantId: string, aiType: string, supabase: any): Promise<string> {
  logStep('Iniciando consulta direta ao Supabase', { restaurantId });

  try {
    // 1. Buscar dados do restaurante
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restaurantError) {
      logStep('Erro ao buscar restaurante', { error: restaurantError });
      throw new Error('Erro ao acessar dados do restaurante');
    }

    // 2. Buscar fluxo de caixa (últimas 50 transações)
    const { data: cashFlow, error: cashFlowError } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('date', { ascending: false })
      .limit(50);

    if (cashFlowError) {
      logStep('Erro ao buscar fluxo de caixa', { error: cashFlowError });
    }

    // 3. Buscar estoque
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (inventoryError) {
      logStep('Erro ao buscar estoque', { error: inventoryError });
    }

    // 4. Buscar receitas/pratos
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (recipesError) {
      logStep('Erro ao buscar receitas', { error: recipesError });
    }

    // 5. Buscar metas
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (goalsError) {
      logStep('Erro ao buscar metas', { error: goalsError });
    }

    // Compilar contexto estruturado
    const contextData = await compileRestaurantContext(
      restaurant,
      cashFlow || [],
      inventory || [],
      recipes || [],
      goals || []
    );

    logStep('Contexto compilado', { 
      transacoes: cashFlow?.length || 0,
      itensEstoque: inventory?.length || 0,
      receitas: recipes?.length || 0,
      metas: goals?.length || 0
    });

    // Gerar resposta com Groq
    return await generateGroqResponse(message, contextData, aiType);

  } catch (error) {
    logStep('Erro na consulta direta ao Supabase', { error: error.message });
    throw error;
  }
}

// Função para compilar contexto do restaurante
async function compileRestaurantContext(restaurant: any, cashFlow: any[], inventory: any[], recipes: any[], goals: any[]): Promise<any> {
  // Calcular métricas financeiras
  const receitas = cashFlow
    .filter(item => item.type === 'income')
    .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

  const despesas = cashFlow
    .filter(item => item.type === 'expense')
    .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

  // Calcular itens com estoque baixo
  const itensEstoqueBaixo = inventory.filter(item => 
    parseFloat(item.quantity || 0) <= parseFloat(item.minimum_stock || 0)
  );

  // Calcular valor total do estoque
  const valorTotalEstoque = inventory.reduce((total, item) => 
    total + (parseFloat(item.quantity || 0) * parseFloat(item.cost_per_unit || 0)), 0
  );

  return {
    restaurante: {
      nome: restaurant?.name || 'Não informado',
      tipo: restaurant?.business_type || 'Não informado',
      id: restaurant?.id
    },
    financeiro: {
      receitas: receitas,
      despesas: despesas,
      saldoAtual: receitas - despesas,
      totalTransacoes: cashFlow.length,
      ultimasTransacoes: cashFlow.slice(0, 10).map(t => ({
        data: t.date,
        tipo: t.type,
        valor: t.amount,
        categoria: t.category,
        descricao: t.description
      }))
    },
    estoque: {
      totalItens: inventory.length,
      itensComEstoqueBaixo: itensEstoqueBaixo.length,
      valorTotalEstoque: valorTotalEstoque,
      alertasEstoque: itensEstoqueBaixo.map(item => ({
        nome: item.name,
        quantidadeAtual: item.quantity,
        estoqueMinimo: item.minimum_stock
      }))
    },
    cardapio: {
      totalReceitas: recipes.length,
      categorias: [...new Set(recipes.map(r => r.category).filter(Boolean))],
      receitasRecentes: recipes.slice(0, 5).map(r => ({
        nome: r.name,
        categoria: r.category,
        custo: r.cost,
        precoVenda: r.selling_price
      }))
    },
    metas: {
      total: goals.length,
      concluidas: goals.filter(m => m.completed).length,
      pendentes: goals.filter(m => !m.completed).length,
      porcentagemConclusao: goals.length > 0 ? 
        (goals.filter(m => m.completed).length / goals.length) * 100 : 0
    }
  };
}

// Função para gerar resposta com Groq
async function generateGroqResponse(message: string, contextData: any, aiType: string): Promise<string> {
  const groqApiKey = Deno.env.get('GROQ_API');
  
  if (!groqApiKey) {
    logStep('API key do Groq não encontrada');
    throw new Error('Configuração da IA não encontrada');
  }

  try {
    logStep('Enviando consulta para Groq API');

    const systemPrompt = aiType === 'social' 
      ? `Você é um especialista em marketing digital e redes sociais para restaurantes. 
         Analise os dados fornecidos e forneça insights criativos e estratégias de marketing.
         Sempre cite números específicos dos dados quando disponíveis.`
      : `Você é um gerente virtual especializado em restaurantes. 
         Analise os dados fornecidos e forneça insights precisos e acionáveis.
         Sempre cite números específicos dos dados quando disponíveis.
         Forneça análises detalhadas sobre finanças, estoque, metas e operações.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Pergunta: "${message}"\n\nDados do restaurante:\n${JSON.stringify(contextData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Erro na API do Groq', { status: response.status, error: errorText });
      throw new Error(`Erro na API do Groq: ${response.status}`);
    }

    const result = await response.json();
    logStep('Resposta do Groq recebida com sucesso');

    return result.choices[0].message.content;

  } catch (error) {
    logStep('Erro ao gerar resposta com Groq', { error: error.message });
    throw error;
  }
}

// Função para consultar via n8n workflow (fallback)
async function queryWithN8n(message: string, restaurantId: string, aiType: string, userId: string): Promise<string> {
  try {
    // URL do seu webhook n8n
    const n8nWebhookUrl = 'https://restauria.app.n8n.cloud/webhook/ai-assistant';
    
    logStep('Chamando n8n webhook', { 
      url: n8nWebhookUrl, 
      restaurantId, 
      aiType, 
      userId,
      messageLength: message.length 
    });

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        restaurantId: restaurantId,
        message: message,
        aiType: aiType || 'manager',
        timestamp: new Date().toISOString()
      })
    });

    logStep('Resposta do n8n webhook', { 
      status: webhookResponse.status, 
      statusText: webhookResponse.statusText 
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      logStep('Erro detalhado do webhook n8n', { 
        status: webhookResponse.status, 
        error: errorText 
      });
      throw new Error(`Erro no webhook n8n: ${webhookResponse.status} - ${errorText}`);
    }

    const result = await webhookResponse.json();
    logStep('Resultado processado do n8n', { hasResponse: !!result });

    // Tentar extrair a resposta de diferentes formatos possíveis
    let finalResponse = result.response || result.reply || result.message || result.answer;
    
    // Se a resposta vem do Groq, pode estar aninhada
    if (result.choices && result.choices[0] && result.choices[0].message) {
      finalResponse = result.choices[0].message.content;
    }

    if (!finalResponse && typeof result === 'string') {
      finalResponse = result;
    }

    if (!finalResponse) {
      logStep('Formato de resposta inesperado', { result });
      finalResponse = 'Resposta processada pelo sistema, mas formato não reconhecido.';
    }

    return finalResponse;
    
  } catch (error) {
    logStep('Erro ao consultar n8n', { error: error.message, stack: error.stack });
    
    // Fallback para resposta direta em caso de erro
    logStep('Usando fallback para resposta direta');
    return await directAIResponse(message, aiType, null, []);
  }
}

// Função para resposta direta da IA
async function directAIResponse(message: string, aiType: string, context: any, conversationHistory: any[]): Promise<string> {
  // Configuração de instruções para IA
  let systemPrompt = '';
  
  if (aiType === 'manager') {
    systemPrompt = `Você é um gerente virtual especializado em gestão de restaurantes. 
    Ajude com questões administrativas, operacionais, financeiras e estratégicas.
    Forneça conselhos práticos e baseados em boas práticas do setor.`;
  } else if (aiType === 'social') {
    systemPrompt = `Você é um especialista em marketing digital e redes sociais para restaurantes.
    Ajude a criar conteúdo, estratégias de marketing, campanhas e presença online.
    Foque em ideias criativas e tendências atuais do marketing gastronômico.`;
  }

  // Para demonstração, retornando uma resposta simulada
  // Em produção, você integraria com OpenAI ou outra IA
  const responses = {
    manager: [
      "Como gerente virtual, posso ajudar com estratégias operacionais e financeiras para seu restaurante.",
      "Vamos analisar sua questão e encontrar a melhor solução para seu negócio.",
      "Com base na minha experiência em gestão de restaurantes, recomendo que..."
    ],
    social: [
      "Como especialista em marketing digital, posso criar conteúdo atrativo para suas redes sociais.",
      "Vamos desenvolver uma estratégia de marketing que conecte com seus clientes.",
      "Para suas redes sociais, sugiro uma abordagem focada em..."
    ]
  };

  const typeResponses = responses[aiType as keyof typeof responses] || responses.manager;
  const randomResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];
  
  return `${randomResponse}\n\nSobre sua pergunta: "${message}"\n\nEsta é uma resposta simulada. Para funcionalidade completa, você pode integrar com OpenAI, Anthropic ou outro provedor de IA.`;
}
