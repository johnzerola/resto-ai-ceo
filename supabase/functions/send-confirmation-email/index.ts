
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  name?: string;
  user_id?: string;
  retry_attempt?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('[SEND-CONFIRMATION-EMAIL] Request received');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, name, user_id, retry_attempt }: EmailRequest = await req.json();
    
    console.log(`[SEND-CONFIRMATION-EMAIL] Processing email for: ${email}, attempt: ${retry_attempt || 1}`);

    if (!email) {
      throw new Error('Email is required');
    }

    // Buscar o usuário no banco para obter o token de confirmação
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id || '');
    
    if (userError) {
      console.error('[SEND-CONFIRMATION-EMAIL] Error fetching user:', userError);
      throw new Error(`User fetch error: ${userError.message}`);
    }

    // Se o usuário já está confirmado, não enviar email
    if (userData.user?.email_confirmed_at) {
      console.log('[SEND-CONFIRMATION-EMAIL] User already confirmed, skipping email');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already confirmed',
          user_confirmed: true 
        }), 
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Gerar um novo link de confirmação
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.vercel.app/login?confirmed=true`
      }
    });

    if (linkError) {
      console.error('[SEND-CONFIRMATION-EMAIL] Error generating link:', linkError);
      throw new Error(`Link generation error: ${linkError.message}`);
    }

    console.log('[SEND-CONFIRMATION-EMAIL] Confirmation link generated successfully');

    // Log de sucesso no sistema
    if (user_id) {
      await supabase.from('system_logs').insert({
        user_id: user_id,
        source: 'email',
        type: 'confirmation_generated',
        message: `Link de confirmação gerado (tentativa ${retry_attempt || 1})`,
        severity: 'info',
        metadata: {
          email: email,
          retry_attempt: retry_attempt || 1,
          link_generated: true
        }
      });
    }

    // Para demonstração, vamos apenas logar o link
    // Em produção, você integraria com um provedor de email como Resend
    console.log('[SEND-CONFIRMATION-EMAIL] Confirmation link:', linkData.properties?.action_link);

    const response = {
      success: true,
      message: 'Confirmation email processed successfully',
      email: email,
      retry_attempt: retry_attempt || 1,
      // Em desenvolvimento, retornar o link para debug
      debug_link: linkData.properties?.action_link
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('[SEND-CONFIRMATION-EMAIL] Error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
