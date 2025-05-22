
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
    
    // Obter a URL para criar o email personalizado
    const confirmationUrl = data.properties.action_link;
    
    // Criar o conteúdo HTML do e-mail com branding personalizado
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu e-mail - RestoAI CEO</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .email-header {
            background-color: #1a56db;
            padding: 24px;
            text-align: center;
          }
          .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .email-content {
            padding: 32px 24px;
          }
          .email-footer {
            background-color: #f4f5f7;
            padding: 16px 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .btn {
            display: inline-block;
            background-color: #1a56db;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 600;
            margin: 16px 0;
            text-align: center;
          }
          .btn:hover {
            background-color: #1245b5;
          }
          .highlight {
            color: #1a56db;
            font-weight: 600;
          }
          .note {
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
            margin-top: 24px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
          }
          .logo span {
            color: #4ade80;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="logo">Resto<span>AI</span> CEO</div>
          </div>
          <div class="email-content">
            <h2>Olá, ${name || "Usuário"}!</h2>
            <p>Bem-vindo(a) ao <span class="highlight">RestoAI CEO</span>, a plataforma completa para gestão inteligente do seu restaurante.</p>
            <p>Para começar a usar todas as funcionalidades, confirme seu e-mail clicando no botão abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="btn">Confirmar meu e-mail</a>
            </div>
            
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; background-color: #f4f5f7; padding: 10px; border-radius: 4px;">
              ${confirmationUrl}
            </p>
            
            <p class="note">Se você não solicitou esta mensagem, pode ignorá-la com segurança.</p>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.</p>
            <p>Sua plataforma completa de gestão para restaurantes</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Aqui enviaria o e-mail personalizado usando um serviço como SendGrid, Resend, etc.
    // Por enquanto, apenas simulamos o envio
    console.log(`[Simulação] Email HTML enviado para ${email}`);

    // Sucesso!
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
