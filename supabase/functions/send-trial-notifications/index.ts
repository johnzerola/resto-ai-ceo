import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationEmailData {
  email: string;
  name: string;
  daysRemaining: number;
  trialEndDate: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Buscar usuários que precisam receber notificações
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    logStep("Searching users for notifications", { 
      now: now.toISOString(),
      threeDaysFromNow: threeDaysFromNow.toISOString(),
      oneDayFromNow: oneDayFromNow.toISOString()
    });

    // Usuários com trial expirando em 3 dias
    const { data: users3Days, error: error3Days } = await supabaseClient
      .from('profiles')
      .select('id, name, email, trial_end, plan_status')
      .eq('plan_status', 'trial')
      .gte('trial_end', now.toISOString())
      .lte('trial_end', threeDaysFromNow.toISOString());

    if (error3Days) {
      logStep("Error fetching 3-day users", error3Days);
    } else {
      logStep("Found 3-day notification users", { count: users3Days?.length || 0 });
    }

    // Usuários com trial expirando em 1 dia
    const { data: users1Day, error: error1Day } = await supabaseClient
      .from('profiles')
      .select('id, name, email, trial_end, plan_status')
      .eq('plan_status', 'trial')
      .gte('trial_end', now.toISOString())
      .lte('trial_end', oneDayFromNow.toISOString());

    if (error1Day) {
      logStep("Error fetching 1-day users", error1Day);
    } else {
      logStep("Found 1-day notification users", { count: users1Day?.length || 0 });
    }

    // Usuários com trial expirado (hoje)
    const { data: expiredUsers, error: errorExpired } = await supabaseClient
      .from('profiles')
      .select('id, name, email, trial_end, plan_status')
      .eq('plan_status', 'trial')
      .lte('trial_end', now.toISOString());

    if (errorExpired) {
      logStep("Error fetching expired users", errorExpired);
    } else {
      logStep("Found expired users", { count: expiredUsers?.length || 0 });
    }

    let emailsSent = 0;
    let errors = 0;

    // Enviar emails para usuários com 3 dias restantes
    if (users3Days?.length) {
      for (const user of users3Days) {
        try {
          await sendTrialWarningEmail(user, 3);
          emailsSent++;
          logStep("3-day warning email sent", { email: user.email });
        } catch (error) {
          errors++;
          logStep("Error sending 3-day email", { email: user.email, error });
        }
      }
    }

    // Enviar emails para usuários com 1 dia restante
    if (users1Day?.length) {
      for (const user of users1Day) {
        try {
          await sendTrialUrgentEmail(user, 1);
          emailsSent++;
          logStep("1-day urgent email sent", { email: user.email });
        } catch (error) {
          errors++;
          logStep("Error sending 1-day email", { email: user.email, error });
        }
      }
    }

    // Enviar emails para usuários com trial expirado e atualizar status
    if (expiredUsers?.length) {
      for (const user of expiredUsers) {
        try {
          await sendTrialExpiredEmail(user);
          
          // Atualizar status do usuário para trial_expired
          await supabaseClient
            .from('profiles')
            .update({ 
              plan_status: 'trial_expired',
              status: 'suspended',
              updated_at: now.toISOString()
            })
            .eq('id', user.id);

          emailsSent++;
          logStep("Trial expired email sent and status updated", { email: user.email });
        } catch (error) {
          errors++;
          logStep("Error sending expired email", { email: user.email, error });
        }
      }
    }

    logStep("Function completed", { emailsSent, errors });

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent, 
      errors,
      message: `Enviados ${emailsSent} emails, ${errors} erros` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Function error", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function sendTrialWarningEmail(user: any, daysRemaining: number) {
  const daysRemaining3 = Math.max(0, Math.ceil((new Date(user.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  await resend.emails.send({
    from: "RestauranteCMV <noreply@restaurantecmv.com>",
    to: [user.email],
    subject: `⚠️ Seu trial expira em ${daysRemaining3} dias`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Seu trial expira em ${daysRemaining3} dias!</h2>
        
        <p>Olá ${user.name || 'Usuário'},</p>
        
        <p>Seu período de teste gratuito no <strong>RestauranteCMV</strong> expira em <strong>${daysRemaining3} dias</strong>.</p>
        
        <p>Não perca acesso às funcionalidades que estão transformando a gestão do seu restaurante:</p>
        
        <ul>
          <li>✅ Controle de CMV inteligente</li>
          <li>✅ Gestão completa de estoque</li>
          <li>✅ Análise financeira avançada</li>
          <li>✅ Relatórios de lucratividade</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL')}/assinatura" 
             style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Assinar Agora e Continuar Usando
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Se você não assinar antes do vencimento, sua conta será suspensa e você perderá acesso a todas as funcionalidades.
        </p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Equipe RestauranteCMV<br>
          Este é um email automático, não responda.
        </p>
      </div>
    `,
  });
}

async function sendTrialUrgentEmail(user: any, daysRemaining: number) {
  await resend.emails.send({
    from: "RestauranteCMV <noreply@restaurantecmv.com>",
    to: [user.email],
    subject: "🚨 URGENTE: Seu trial expira AMANHÃ!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 ÚLTIMA CHANCE: Seu trial expira AMANHÃ!</h2>
        
        <p>Olá ${user.name || 'Usuário'},</p>
        
        <p><strong>Esta é sua última chance!</strong> Seu período de teste no <strong>RestauranteCMV</strong> expira em menos de 24 horas.</p>
        
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>⏰ Expira em: MENOS DE 24 HORAS</strong></p>
        </div>
        
        <p>Não perca:</p>
        <ul>
          <li>🔥 Controle de CMV que já economizou milhares para nossos clientes</li>
          <li>🔥 Gestão de estoque que evita desperdícios</li>
          <li>🔥 Relatórios que aumentam sua lucratividade</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL')}/assinatura" 
             style="background-color: #dc2626; color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
            ASSINAR AGORA - ÚLTIMA CHANCE
          </a>
        </div>
        
        <p style="text-align: center; color: #dc2626; font-weight: bold;">
          ⚠️ Após o vencimento, sua conta será suspensa imediatamente!
        </p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Equipe RestauranteCMV<br>
          Este é um email automático, não responda.
        </p>
      </div>
    `,
  });
}

async function sendTrialExpiredEmail(user: any) {
  await resend.emails.send({
    from: "RestauranteCMV <noreply@restaurantecmv.com>",
    to: [user.email],
    subject: "❌ Seu trial expirou - Reative sua conta",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Seu trial expirou</h2>
        
        <p>Olá ${user.name || 'Usuário'},</p>
        
        <p>Seu período de teste no <strong>RestauranteCMV</strong> expirou e sua conta foi suspensa.</p>
        
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>📋 Status: Conta Suspensa</strong></p>
          <p style="margin: 10px 0 0 0; color: #dc2626;">Você não tem mais acesso às funcionalidades do sistema.</p>
        </div>
        
        <p><strong>Mas ainda dá tempo!</strong> Assine agora e:</p>
        <ul>
          <li>✅ Reative sua conta imediatamente</li>
          <li>✅ Mantenha todos os seus dados salvos</li>
          <li>✅ Continue de onde parou</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL')}/assinatura" 
             style="background-color: #059669; color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
            REATIVAR CONTA AGORA
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Seus dados estão seguros:</strong> Todos os restaurantes, receitas e dados financeiros que você cadastrou estão salvos e serão restaurados assim que você assinar um plano.
        </p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Equipe RestauranteCMV<br>
          Este é um email automático, não responda.
        </p>
      </div>
    `,
  });
}