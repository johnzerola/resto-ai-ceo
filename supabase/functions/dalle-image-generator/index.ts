
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DALLE-GENERATOR] ${step}${detailsStr}`);
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

    const { prompt, size = "1024x1024", style = "vivid", quality = "standard" } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    logStep('Gerando imagem com DALL-E', { prompt, size, style, quality });

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        style: style,
        quality: quality,
        response_format: "url"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DALL-E API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    logStep('Imagem gerada com sucesso', { imageUrl });

    return new Response(
      JSON.stringify({ 
        imageUrl,
        revisedPrompt: data.data[0]?.revised_prompt,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro na geração de imagem', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao gerar imagem',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
