
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
    
    if (!email) {
      throw new Error("Email é obrigatório");
    }
    
    // Criar cliente Supabase com a chave de serviço para acessar APIs restritas
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Determinar URL de redirecionamento - usar HTTPS sempre em produção
    const frontendUrl = Deno.env.get("FRONTEND_URL") || 
                        req.headers.get("origin") || 
                        "https://0005761a-44b8-44a3-8399-ec161dcc8416.lovableproject.com";
    
    const redirectUrl = `${frontendUrl}/login?confirmed=true`;
    
    console.log(`Gerando link de confirmação para: ${email}`);
    console.log(`URL de redirecionamento: ${redirectUrl}`);
    
    // Gerar um link de confirmação de email com configurações seguras
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: redirectUrl,
        data: {
          name: name || "Usuário"
        }
      }
    });

    if (error) {
      console.error("Erro ao gerar link:", error);
      throw error;
    }
    
    // Obter a URL para criar o email personalizado
    const confirmationUrl = data.properties?.action_link;
    
    if (!confirmationUrl) {
      throw new Error("URL de confirmação não foi gerada");
    }
    
    console.log(`Link de confirmação gerado com sucesso`);
    
    // Criar o conteúdo HTML do e-mail otimizado para mobile
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu e-mail - RestoAI CEO</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            margin: 0;
            padding: 16px;
            background-color: #f9f9f9;
            color: #333;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #1a56db 0%, #1245b5 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .email-content {
            padding: 40px 24px;
          }
          .email-footer {
            background-color: #f8f9fa;
            padding: 20px 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #1a56db 0%, #1245b5 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
            min-width: 200px;
            transition: all 0.3s ease;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(26, 86, 219, 0.3);
          }
          .highlight {
            color: #1a56db;
            font-weight: 600;
          }
          .note {
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
            margin-top: 32px;
            padding: 16px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
          }
          .logo span {
            color: #4ade80;
          }
          .url-box {
            word-break: break-all; 
            font-size: 12px; 
            background-color: #f4f5f7; 
            padding: 12px; 
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin: 16px 0;
          }
          @media (max-width: 600px) {
            body {
              padding: 8px;
            }
            .email-container {
              margin: 0;
              border-radius: 8px;
            }
            .email-content {
              padding: 24px 16px;
            }
            .email-header {
              padding: 24px 16px;
            }
            .btn {
              width: 100%;
              padding: 16px 24px;
              font-size: 16px;
            }
            .logo {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="logo">Resto<span>AI</span> CEO</div>
          </div>
          <div class="email-content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Olá, ${name || "Usuário"}!</h2>
            <p style="margin-bottom: 20px;">Bem-vindo(a) ao <span class="highlight">RestoAI CEO</span>, a plataforma completa para gestão inteligente do seu restaurante.</p>
            <p style="margin-bottom: 24px;">Para começar a usar todas as funcionalidades, confirme seu e-mail clicando no botão abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="btn" style="color: #ffffff;">Confirmar meu e-mail</a>
            </div>
            
            <p style="margin: 24px 0 8px 0; font-size: 14px;">Ou copie e cole o link abaixo no seu navegador:</p>
            <div class="url-box">
              ${confirmationUrl}
            </div>
            
            <div class="note">
              <p style="margin: 0;">Se você não solicitou esta mensagem, pode ignorá-la com segurança.</p>
            </div>
          </div>
          <div class="email-footer">
            <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.</p>
            <p style="margin: 0;">Sua plataforma completa de gestão para restaurantes</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Log para debug
    console.log(`[Email] Template gerado para ${email}`);
    console.log(`[Debug] Tamanho do email: ${emailHtml.length} caracteres`);

    // Sucesso!
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmação gerado com sucesso.",
        email: email,
        redirectUrl: redirectUrl,
        debug: {
          emailSize: emailHtml.length,
          hasConfirmationUrl: !!confirmationUrl
        }
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
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
