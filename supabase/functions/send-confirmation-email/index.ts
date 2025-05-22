
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com solicitação CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    
    // Criar cliente Supabase com a chave de serviço para acessar APIs restritas
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Gerar um link de confirmação de email
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: `${Deno.env.get("FRONTEND_URL") || req.headers.get("origin") || "http://localhost:5173"}/login?confirmed=true`
      }
    });

    if (error) {
      throw error;
    }
    
    // Usar a URL para criar o email personalizado com sua função preferida
    const confirmationUrl = data.properties.action_link;
    
    // TODO: Enviar email personalizado usando um serviço como SendGrid, Resend, etc.
    // Por enquanto, vamos apenas simular o envio
    console.log(`[Simulação] Email enviado para ${email} com link: ${confirmationUrl}`);

    // Sucesso! É retornado o URL para o frontend para debugging
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmação enviado com sucesso.",
        // Não enviar a URL completa em produção por segurança
        debug: process.env.NODE_ENV === "development" ? confirmationUrl : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
