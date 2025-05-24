
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GOOGLE-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    const googleClientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    const googlePrivateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');
    const propertyId = Deno.env.get('GA4_PROPERTY_ID');
    
    if (!googleApiKey || !googleClientEmail || !googlePrivateKey || !propertyId) {
      throw new Error('Credenciais do Google Analytics não configuradas');
    }

    const { 
      startDate = '7daysAgo', 
      endDate = 'today',
      metrics = ['sessions', 'users', 'pageviews', 'bounceRate'],
      dimensions = ['date']
    } = await req.json();

    logStep('Consultando Google Analytics', { startDate, endDate, metrics, dimensions });

    // Criar JWT para autenticação
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: googleClientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const encoder = new TextEncoder();
    const headerEncoded = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadEncoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;
    
    // Importar chave privada
    const privateKeyFormatted = googlePrivateKey.replace(/\\n/g, '\n');
    const privateKeyObj = await crypto.subtle.importKey(
      'pkcs8',
      encoder.encode(privateKeyFormatted),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Assinar token
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKeyObj,
      encoder.encode(unsignedToken)
    );

    const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${unsignedToken}.${signatureEncoded}`;

    // Obter access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Falha na autenticação com Google Analytics');
    }

    // Fazer consulta ao GA4
    const reportRequest = {
      dateRanges: [{ startDate, endDate }],
      metrics: metrics.map(metric => ({ name: metric })),
      dimensions: dimensions.map(dimension => ({ name: dimension }))
    };

    const analyticsResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportRequest)
      }
    );

    if (!analyticsResponse.ok) {
      throw new Error(`Google Analytics API error: ${analyticsResponse.status}`);
    }

    const analyticsData = await analyticsResponse.json();

    logStep('Dados do Google Analytics obtidos com sucesso');

    return new Response(
      JSON.stringify({
        data: analyticsData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('Erro no Google Analytics', { error: error.message });
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao consultar Google Analytics',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
