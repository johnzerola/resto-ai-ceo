
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[OPENAI-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { message, context, conversationHistory } = await req.json();
    
    logStep('Processando chat com OpenAI', { messageLength: message?.length });

    // Preparar contexto do restaurante
    const systemPrompt = `Você é um assistente especializado em gestão de restaurantes. ${context || ''}
    
    Você tem acesso aos seguintes dados do restaurante:
    - Informações financeiras (vendas, custos, margens)
    - Dados de estoque e ingredientes
    - Histórico de transações
    - Metas e objetivos
    
    Forneça respostas práticas, específicas e acionáveis para ajudar na gestão do negócio.
    Seja direto e objetivo, mas também amigável e profissional.`;

    // Preparar histórico da conversa
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    logStep('Resposta gerada com sucesso');

    return new Response(
      JSON.stringify({ 
        reply,
        usage: data.usage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro no chat', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao processar mensagem',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
