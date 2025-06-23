
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

    // 5. Buscar pratos completos
    const { data: pratos, error: pratosError } = await supabase
      .from('pratos')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (pratosError) {
      logStep('Erro ao buscar pratos', { error: pratosError });
    }

    // 6. Buscar metas
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (goalsError) {
      logStep('Erro ao buscar metas', { error: goalsError });
    }

    // 7. Buscar insumos
    const { data: insumos, error: insumosError } = await supabase
      .from('insumos')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (insumosError) {
      logStep('Erro ao buscar insumos', { error: insumosError });
    }

    // 8. Buscar configurações do restaurante
    const { data: config, error: configError } = await supabase
      .from('configuracoes_restaurante')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (configError) {
      logStep('Configurações não encontradas, usando padrões', { error: configError });
    }

    // Compilar contexto estruturado
    const contextData = await compileRestaurantContext(
      restaurant,
      cashFlow || [],
      inventory || [],
      recipes || [],
      pratos || [],
      goals || [],
      insumos || [],
      config
    );

    logStep('Contexto compilado', { 
      transacoes: cashFlow?.length || 0,
      itensEstoque: inventory?.length || 0,
      receitas: recipes?.length || 0,
      pratos: pratos?.length || 0,
      metas: goals?.length || 0,
      insumos: insumos?.length || 0
    });

    // Gerar resposta com Groq
    return await generateGroqResponse(message, contextData, aiType);

  } catch (error) {
    logStep('Erro na consulta direta ao Supabase', { error: error.message });
    throw error;
  }
}

// Função para compilar contexto do restaurante com dados completos
async function compileRestaurantContext(
  restaurant: any, 
  cashFlow: any[], 
  inventory: any[], 
  recipes: any[],
  pratos: any[],
  goals: any[],
  insumos: any[],
  config: any
): Promise<any> {
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

  // Preparar dados completos dos pratos
  const pratosCompletos = pratos.map(prato => ({
    id: prato.id,
    nome_prato: prato.nome_prato || 'Não informado',
    categoria: prato.categoria || 'Geral',
    custo_total: parseFloat(prato.custo_total || 0),
    custo_por_porcao: parseFloat(prato.custo_por_porcao || 0),
    preco_sugerido: parseFloat(prato.preco_sugerido || 0),
    preco_praticado: parseFloat(prato.preco_praticado || 0),
    lucro_estimado: parseFloat(prato.lucro_estimado || 0),
    margem_percentual: parseFloat(prato.margem_percentual || 0),
    rendimento_porcoes: parseFloat(prato.rendimento_porcoes || 1),
    tempo_preparo_min: parseInt(prato.tempo_preparo_min || 15),
    status_viabilidade: prato.status_viabilidade || 'não_calculado',
    ativo: prato.ativo !== false,
    vendas_dia: parseInt(prato.vendas_dia || 0),
    created_at: prato.created_at,
    updated_at: prato.updated_at
  }));

  // Preparar dados completos do inventário
  const inventarioCompleto = inventory.map(item => ({
    id: item.id,
    name: item.name || 'Item sem nome',
    quantity: parseFloat(item.quantity || 0),
    unit: item.unit || 'un',
    cost_per_unit: parseFloat(item.cost_per_unit || 0),
    minimum_stock: parseFloat(item.minimum_stock || 0),
    category: item.category || 'Geral',
    valor_total: parseFloat(item.quantity || 0) * parseFloat(item.cost_per_unit || 0),
    status_estoque: parseFloat(item.quantity || 0) <= parseFloat(item.minimum_stock || 0) ? 'baixo' : 'ok',
    created_at: item.created_at,
    updated_at: item.updated_at
  }));

  // Preparar dados completos do fluxo de caixa
  const fluxoCaixaCompleto = cashFlow.map(transacao => ({
    id: transacao.id,
    type: transacao.type || 'expense',
    description: transacao.description || 'Transação sem descrição',
    amount: parseFloat(transacao.amount || 0),
    date: transacao.date,
    category: transacao.category || 'Geral',
    payment_method: transacao.payment_method || 'dinheiro',
    status: transacao.status || 'completed',
    conta_tipo: transacao.conta_tipo || 'operacional',
    centro_custo: transacao.centro_custo || null,
    pessoa_responsavel: transacao.pessoa_responsavel || null,
    created_at: transacao.created_at
  }));

  // Preparar dados completos das metas
  const metasCompletas = goals.map(meta => ({
    id: meta.id,
    title: meta.title || 'Meta sem título',
    description: meta.description || null,
    target: parseFloat(meta.target || 0),
    current: parseFloat(meta.current || 0),
    unit: meta.unit || 'unidade',
    category: meta.category || 'Geral',
    completed: meta.completed === true,
    deadline: meta.deadline,
    percentual_atingido: parseFloat(meta.target || 0) > 0 ? 
      (parseFloat(meta.current || 0) / parseFloat(meta.target || 0)) * 100 : 0,
    status: meta.completed ? 'concluída' : 
            (meta.deadline && new Date(meta.deadline) < new Date()) ? 'vencida' : 'em_andamento',
    reward: meta.reward || null,
    created_at: meta.created_at,
    updated_at: meta.updated_at
  }));

  // Preparar dados dos insumos
  const insumosCompletos = insumos.map(insumo => ({
    id: insumo.id,
    nome: insumo.nome || 'Insumo sem nome',
    categoria: insumo.categoria || 'Geral',
    preco_unitario: parseFloat(insumo.preco_unitario || 0),
    preco_pago: parseFloat(insumo.preco_pago || 0),
    volume_embalagem: parseFloat(insumo.volume_embalagem || 1),
    unidade_medida: insumo.unidade_medida || 'un',
    estoque_atual: parseFloat(insumo.estoque_atual || 0),
    estoque_minimo: parseFloat(insumo.estoque_minimo || 0),
    fornecedor: insumo.fornecedor || 'Não informado',
    validade_dias: parseInt(insumo.validade_dias || 30),
    perda_media_percentual: parseFloat(insumo.perda_media_percentual || 5),
    status_estoque: parseFloat(insumo.estoque_atual || 0) <= parseFloat(insumo.estoque_minimo || 0) ? 'baixo' : 'ok',
    created_at: insumo.created_at,
    updated_at: insumo.updated_at
  }));

  // Preparar dados das receitas
  const receitasCompletas = recipes.map(receita => ({
    id: receita.id,
    name: receita.name || 'Receita sem nome',
    description: receita.description || null,
    category: receita.category || 'Geral',
    portion_size: parseFloat(receita.portion_size || 1),
    portion_unit: receita.portion_unit || 'porção',
    cost: parseFloat(receita.cost || 0),
    selling_price: parseFloat(receita.selling_price || 0),
    profit_margin: receita.selling_price > 0 && receita.cost > 0 ? 
      ((parseFloat(receita.selling_price) - parseFloat(receita.cost)) / parseFloat(receita.selling_price)) * 100 : 0,
    created_at: receita.created_at,
    updated_at: receita.updated_at
  }));

  return {
    restaurante: {
      id: restaurant?.id,
      nome: restaurant?.name || 'Não informado',
      tipo: restaurant?.business_type || 'Não informado',
      vendas_mensais_media: parseFloat(restaurant?.average_monthly_sales || 0),
      despesas_fixas: parseFloat(restaurant?.fixed_expenses || 0),
      despesas_variaveis: parseFloat(restaurant?.variable_expenses || 0),
      margem_lucro_desejada: parseFloat(restaurant?.desired_profit_margin || 0),
      meta_cmv_comida: parseFloat(restaurant?.target_food_cost || 0),
      meta_cmv_bebida: parseFloat(restaurant?.target_beverage_cost || 0),
      created_at: restaurant?.created_at,
      updated_at: restaurant?.updated_at
    },
    financeiro: {
      receitas_total: receitas,
      despesas_total: despesas,
      saldo_atual: receitas - despesas,
      total_transacoes: cashFlow.length,
      receitas_mes_atual: fluxoCaixaCompleto
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0),
      despesas_mes_atual: fluxoCaixaCompleto
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0),
      transacoes_detalhadas: fluxoCaixaCompleto.slice(0, 20)
    },
    estoque: {
      total_itens: inventory.length,
      itens_estoque_baixo: itensEstoqueBaixo.length,
      valor_total_estoque: valorTotalEstoque,
      categorias_estoque: [...new Set(inventarioCompleto.map(i => i.category))],
      itens_detalhados: inventarioCompleto,
      alertas_estoque: itensEstoqueBaixo.map(item => ({
        nome: item.name,
        quantidade_atual: item.quantity,
        estoque_minimo: item.minimum_stock,
        categoria: item.category
      }))
    },
    cardapio: {
      total_pratos: pratos.length,
      pratos_ativos: pratosCompletos.filter(p => p.ativo).length,
      categorias: [...new Set(pratosCompletos.map(p => p.categoria))],
      pratos_detalhados: pratosCompletos,
      custo_medio_prato: pratosCompletos.length > 0 ? 
        pratosCompletos.reduce((sum, p) => sum + p.custo_por_porcao, 0) / pratosCompletos.length : 0,
      preco_medio_prato: pratosCompletos.length > 0 ? 
        pratosCompletos.reduce((sum, p) => sum + p.preco_sugerido, 0) / pratosCompletos.length : 0,
      margem_media: pratosCompletos.length > 0 ? 
        pratosCompletos.reduce((sum, p) => sum + p.margem_percentual, 0) / pratosCompletos.length : 0,
      pratos_prejuizo: pratosCompletos.filter(p => p.status_viabilidade === 'prejuizo').length,
      pratos_margem_baixa: pratosCompletos.filter(p => p.status_viabilidade === 'margem_baixa').length
    },
    receitas: {
      total_receitas: recipes.length,
      receitas_detalhadas: receitasCompletas,
      categorias_receitas: [...new Set(receitasCompletas.map(r => r.category))]
    },
    insumos: {
      total_insumos: insumos.length,
      insumos_detalhados: insumosCompletos,
      categorias_insumos: [...new Set(insumosCompletos.map(i => i.categoria))],
      fornecedores: [...new Set(insumosCompletos.map(i => i.fornecedor))],
      valor_total_insumos: insumosCompletos.reduce((sum, i) => sum + (i.estoque_atual * i.preco_unitario), 0),
      insumos_estoque_baixo: insumosCompletos.filter(i => i.status_estoque === 'baixo').length
    },
    metas: {
      total_metas: goals.length,
      metas_concluidas: metasCompletas.filter(m => m.completed).length,
      metas_pendentes: metasCompletas.filter(m => !m.completed).length,
      metas_vencidas: metasCompletas.filter(m => m.status === 'vencida').length,
      percentual_conclusao_geral: goals.length > 0 ? 
        (metasCompletas.filter(m => m.completed).length / goals.length) * 100 : 0,
      metas_detalhadas: metasCompletas,
      categorias_metas: [...new Set(metasCompletas.map(m => m.category))]
    },
    configuracoes: {
      markup_padrao: parseFloat(config?.markup_padrao || 250),
      margem_lucro_esperada: parseFloat(config?.margem_lucro_esperada || 30),
      despesas_fixas_mensais: parseFloat(config?.despesas_fixas_mensais || 0),
      despesas_variaveis_mensais: parseFloat(config?.despesas_variaveis_mensais || 0),
      receita_mensal_esperada: parseFloat(config?.receita_mensal_esperada || 0),
      taxa_ifood: parseFloat(config?.taxa_ifood || 15),
      taxa_impostos: parseFloat(config?.taxa_impostos || 12),
      ticket_medio_esperado: parseFloat(config?.ticket_medio_esperado || 0),
      meta_vendas_diaria: parseFloat(config?.meta_vendas_diaria || 0)
    },
    metricas_calculadas: {
      ticket_medio_real: receitas > 0 && fluxoCaixaCompleto.filter(t => t.type === 'income').length > 0 ? 
        receitas / fluxoCaixaCompleto.filter(t => t.type === 'income').length : 0,
      cmv_medio_percentual: pratosCompletos.length > 0 ? 
        pratosCompletos.reduce((sum, p) => sum + (100 - p.margem_percentual), 0) / pratosCompletos.length : 0,
      margem_lucro_real: receitas > 0 ? ((receitas - despesas) / receitas) * 100 : 0,
      crescimento_mensal: 0, // Seria necessário dados históricos para calcular
      produtividade_diaria: pratosCompletos.reduce((sum, p) => sum + p.vendas_dia, 0)
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
