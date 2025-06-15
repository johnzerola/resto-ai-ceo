
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

    logStep('Iniciando análise inteligente de IA', { message, aiType, restaurantId, userId });

    // Determinar se a pergunta requer dados do sistema
    const requiresSystemData = await needsSystemData(message);
    
    let response;
    
    if (requiresSystemData) {
      // Usar n8n workflow para consulta inteligente
      logStep('Pergunta requer dados do sistema, usando n8n workflow');
      response = await queryWithN8n(message, restaurantId || context?.restaurantData?.id, aiType, userId);
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

// Função para consultar via n8n workflow
async function queryWithN8n(message: string, restaurantId: string, aiType: string, userId: string): Promise<string> {
  try {
    // URL do seu webhook n8n atualizada
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
