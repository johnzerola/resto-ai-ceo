import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-TRIAL-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Auto trial notifications started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Inicializar Resend se a chave estiver disponível
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    // Executar as funções de notificação automaticamente
    const results = await Promise.allSettled([
      // Enviar notificações de trial
      sendTrialNotifications(supabaseClient, resend),
      
      // Bloquear usuários expirados
      blockExpiredUsers(supabaseClient),
      
      // Limpar dados antigos
      cleanupOldData(supabaseClient)
    ]);

    let successCount = 0;
    let errorCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        logStep(`Task ${index + 1} completed successfully`);
      } else {
        errorCount++;
        logStep(`Task ${index + 1} failed`, { error: result.reason });
      }
    });

    logStep("Auto notifications completed", { successCount, errorCount });

    return new Response(JSON.stringify({ 
      success: true,
      tasksCompleted: successCount,
      tasksErrored: errorCount,
      message: `Processamento automático concluído: ${successCount} sucessos, ${errorCount} erros`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Auto notifications error", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function blockExpiredUsers(supabaseClient: any) {
  logStep("Starting user blocking process");
  
  const now = new Date();
  
  // Buscar usuários com trial expirado
  const { data: expiredUsers, error } = await supabaseClient
    .from('profiles')
    .select('id, email, trial_end, plan_status')
    .eq('plan_status', 'trial')
    .lte('trial_end', now.toISOString());

  if (error) {
    throw new Error(`Error fetching expired users: ${error.message}`);
  }

  if (!expiredUsers?.length) {
    logStep("No expired users found");
    return;
  }

  logStep("Found expired users", { count: expiredUsers.length });

  // Atualizar status dos usuários expirados
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ 
      plan_status: 'trial_expired',
      status: 'suspended',
      updated_at: now.toISOString()
    })
    .in('id', expiredUsers.map(u => u.id));

  if (updateError) {
    throw new Error(`Error updating expired users: ${updateError.message}`);
  }

  logStep("Users blocked successfully", { count: expiredUsers.length });
}

async function sendTrialNotifications(supabaseClient: any, resend: any) {
  logStep("Starting trial notifications");
  
  if (!resend) {
    logStep("Resend API key not configured, skipping email notifications");
    return;
  }

  const now = new Date();
  
  // Buscar usuários em trial
  const { data: trialUsers, error } = await supabaseClient
    .from('profiles')
    .select('id, email, name, trial_end, plan_status')
    .eq('plan_status', 'trial')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Error fetching trial users: ${error.message}`);
  }

  if (!trialUsers?.length) {
    logStep("No trial users found");
    return;
  }

  logStep("Found trial users", { count: trialUsers.length });

  for (const user of trialUsers) {
    const trialEnd = new Date(user.trial_end);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    logStep(`User ${user.email}: ${daysRemaining} days remaining`);

    try {
      // Notificação 3 dias antes
      if (daysRemaining === 3) {
        await sendTrialWarningEmail(resend, user, daysRemaining);
      }
      // Notificação 1 dia antes
      else if (daysRemaining === 1) {
        await sendTrialUrgentEmail(resend, user, daysRemaining);
      }
    } catch (emailError) {
      logStep(`Email error for ${user.email}`, emailError);
    }
  }
}

async function sendTrialWarningEmail(resend: any, profile: any, daysRemaining: number) {
  await resend.emails.send({
    from: "Sistema RestauranteGPT <noreply@restaurantegpt.com>",
    to: [profile.email],
    subject: "Seu trial expira em 3 dias! 🚨",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">⏰ Seu trial expira em ${daysRemaining} dias!</h1>
        <p>Olá, ${profile.name || 'usuário'}!</p>
        <p>Seu período de teste gratuito do RestauranteGPT expira em <strong>${daysRemaining} dias</strong>.</p>
        <p>Não perca acesso às funcionalidades premium:</p>
        <ul>
          <li>✅ Dashboard completo com métricas financeiras</li>
          <li>✅ Gestão inteligente de estoque</li>
          <li>✅ Controle de receitas e custos</li>
          <li>✅ Análises financeiras automatizadas</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL') || 'https://restaurantegpt.com'}/assinatura" 
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            💎 ASSINAR AGORA
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Tem dúvidas? Responda este email que nossa equipe te ajuda!
        </p>
      </div>
    `,
  });
  logStep(`Warning email sent to ${profile.email}`);
}

async function sendTrialUrgentEmail(resend: any, profile: any, daysRemaining: number) {
  await resend.emails.send({
    from: "Sistema RestauranteGPT <noreply@restaurantegpt.com>",
    to: [profile.email],
    subject: "🚨 URGENTE: Seu trial expira AMANHÃ!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <h1 style="color: #ef4444; margin: 0;">🚨 ÚLTIMA CHANCE!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
            Seu trial expira AMANHÃ!
          </p>
        </div>
        
        <p>Olá, ${profile.name || 'usuário'}!</p>
        <p><strong>Seu período de teste do RestauranteGPT expira em menos de 24 horas!</strong></p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
          <a href="${Deno.env.get('SITE_URL') || 'https://restaurantegpt.com'}/assinatura" 
             style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            🔥 ASSINAR AGORA - ÚLTIMAS HORAS
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Precisa de ajuda? Responda este email imediatamente!
        </p>
      </div>
    `,
  });
  logStep(`Urgent email sent to ${profile.email}`);
}

async function cleanupOldData(supabaseClient: any) {
  logStep("Starting data cleanup");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Limpar logs antigos de sistema
    const { error: logsError } = await supabaseClient
      .from('system_logs')
      .delete()
      .lte('timestamp', thirtyDaysAgo.toISOString());

    if (logsError) {
      logStep("Error cleaning system logs", logsError);
    } else {
      logStep("Old system logs cleaned");
    }

  } catch (error) {
    logStep("Cleanup error", error);
  }
}