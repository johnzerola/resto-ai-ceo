
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STABILITY-AI] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stabilityApiKey = Deno.env.get('STABILITY_API_KEY');
    if (!stabilityApiKey) {
      throw new Error('STABILITY_API_KEY não configurada');
    }

    const { prompt, negativePrompt, width = 1024, height = 1024, steps = 30, cfgScale = 7 } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    logStep('Gerando imagem com Stability AI', { prompt, width, height });

    const formData = new FormData();
    formData.append('text_prompts[0][text]', prompt);
    formData.append('text_prompts[0][weight]', '1');
    
    if (negativePrompt) {
      formData.append('text_prompts[1][text]', negativePrompt);
      formData.append('text_prompts[1][weight]', '-1');
    }
    
    formData.append('cfg_scale', cfgScale.toString());
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    formData.append('steps', steps.toString());
    formData.append('samples', '1');

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Stability AI error: ${errorData.message || response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.artifacts[0]?.base64;

    if (!imageBase64) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    logStep('Imagem gerada com sucesso');

    return new Response(
      JSON.stringify({ 
        imageBase64: `data:image/png;base64,${imageBase64}`,
        seed: data.artifacts[0]?.seed,
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
