
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SOCIAL-MEDIA-PUBLISHER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
    const facebookPageId = Deno.env.get('FACEBOOK_PAGE_ID');
    const instagramBusinessId = Deno.env.get('INSTAGRAM_BUSINESS_ID');
    
    const { 
      platform, 
      content, 
      imageUrl, 
      scheduledTime,
      hashtags = []
    } = await req.json();

    if (!platform || !content) {
      throw new Error('Platform e content são obrigatórios');
    }

    logStep('Publicando no', { platform, contentLength: content.length });

    let result = {};

    if (platform === 'facebook' || platform === 'both') {
      if (!facebookAccessToken || !facebookPageId) {
        throw new Error('Credenciais do Facebook não configuradas');
      }

      const postData: any = {
        message: content,
        access_token: facebookAccessToken
      };

      if (imageUrl) {
        postData.link = imageUrl;
      }

      if (scheduledTime) {
        postData.scheduled_publish_time = Math.floor(new Date(scheduledTime).getTime() / 1000);
        postData.published = false;
      }

      const facebookResponse = await fetch(
        `https://graph.facebook.com/v18.0/${facebookPageId}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        }
      );

      if (!facebookResponse.ok) {
        const errorData = await facebookResponse.json();
        throw new Error(`Facebook API error: ${errorData.error?.message || facebookResponse.status}`);
      }

      const facebookData = await facebookResponse.json();
      result = { ...result, facebook: facebookData };
    }

    if (platform === 'instagram' || platform === 'both') {
      if (!facebookAccessToken || !instagramBusinessId) {
        throw new Error('Credenciais do Instagram não configuradas');
      }

      let caption = content;
      if (hashtags.length > 0) {
        caption += '\n\n' + hashtags.join(' ');
      }

      // Para Instagram, precisamos primeiro criar um container
      const containerData: any = {
        caption: caption,
        access_token: facebookAccessToken
      };

      if (imageUrl) {
        containerData.image_url = imageUrl;
      }

      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramBusinessId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerData)
        }
      );

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        throw new Error(`Instagram container error: ${errorData.error?.message || containerResponse.status}`);
      }

      const containerResult = await containerResponse.json();
      const containerId = containerResult.id;

      // Aguardar um pouco antes de publicar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Publicar o container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramBusinessId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: facebookAccessToken
          })
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Instagram publish error: ${errorData.error?.message || publishResponse.status}`);
      }

      const publishResult = await publishResponse.json();
      result = { ...result, instagram: publishResult };
    }

    logStep('Publicação realizada com sucesso', { platform });

    return new Response(
      JSON.stringify({
        success: true,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro na publicação', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao publicar nas redes sociais',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
