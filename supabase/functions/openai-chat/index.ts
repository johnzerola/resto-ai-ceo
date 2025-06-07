
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

    const { message, aiType, context, conversationHistory } = await req.json();
    
    logStep('Processando chat com OpenAI', { 
      aiType, 
      messageLength: message?.length,
      hasContext: !!context,
      historyLength: conversationHistory?.length 
    });

    // Definir prompts específicos para cada tipo de IA
    let systemPrompt = '';
    
    if (aiType === 'manager') {
      systemPrompt = `Você é um gerente virtual especialista em administração de restaurantes, economia e gestão de negócios, além de engenheiro de software para garantir respostas técnicas precisas. 

Auxilie o usuário com dúvidas sobre finanças, precificação, gestão, operação e estratégias para aumentar lucro e eficiência no restaurante.

DADOS DO RESTAURANTE DISPONÍVEIS:
${context ? JSON.stringify(context, null, 2) : 'Nenhum dado carregado'}

SUAS ESPECIALIDADES:
- Análise financeira e precificação
- Gestão de equipe e treinamento  
- Controle de custos e desperdício
- Estratégias de crescimento
- Solução de problemas operacionais
- Apoio emocional leve para gestores

DIRETRIZES:
- Considere os dados do sistema para contexualizar suas respostas
- Forneça explicações claras e práticas
- Use exemplos baseados no tipo de restaurante
- Seja empático e ofereca apoio quando necessário
- Sugira ações concretas e mensuráveis
- Sempre fundamente suas recomendações em dados financeiros sólidos`;

    } else if (aiType === 'social') {
      systemPrompt = `Você é uma assistente de marketing digital especialista em redes sociais para restaurantes. 

Ajude o usuário a criar posts, imagens e campanhas eficazes para o restaurante. 

DADOS DO RESTAURANTE DISPONÍVEIS:
${context ? JSON.stringify(context, null, 2) : 'Nenhum dado carregado'}

SUAS ESPECIALIDADES:
- Criação de conteúdo para Instagram, Facebook, TikTok
- Geração de imagens promocionais (descreva detalhadamente)
- Estratégias de engajamento e crescimento
- Hashtags e legendas criativas
- Calendário editorial e planejamento
- Análise de tendências e melhores horários

DIRETRIZES:
- Use as melhores práticas atuais de marketing digital
- Considere o público-alvo do restaurante
- Forneça sugestões criativas e exemplos práticos
- Quando solicitado, descreva imagens detalhadamente para geração posterior
- Foque em conversão e engajamento
- Adapte o tom e estilo conforme o tipo de restaurante`;
    }

    // Preparar histórico da conversa
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
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
        temperature: aiType === 'social' ? 0.8 : 0.7, // Social Media mais criativa
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    // Para Social Media, verificar se precisa gerar imagem
    let imageUrl = null;
    if (aiType === 'social' && (message.toLowerCase().includes('imagem') || message.toLowerCase().includes('criar') || message.toLowerCase().includes('gerar'))) {
      logStep('Gerando imagem para Social Media');
      
      try {
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Create a professional restaurant marketing image: ${message}. High quality, appetizing, modern design, suitable for social media.`,
            n: 1,
            size: "1024x1024",
            style: "vivid",
            quality: "standard"
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.data[0]?.url;
          logStep('Imagem gerada com sucesso', { imageUrl });
        }
      } catch (imageError) {
        logStep('Erro ao gerar imagem', { error: imageError.message });
      }
    }

    logStep('Resposta gerada com sucesso', { aiType });

    return new Response(
      JSON.stringify({ 
        reply,
        imageUrl,
        usage: data.usage,
        timestamp: new Date().toISOString(),
        aiType
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
