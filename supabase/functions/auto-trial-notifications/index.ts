import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Executar as funções de notificação automaticamente
    const results = await Promise.allSettled([
      // Enviar notificações de trial
      supabaseClient.functions.invoke('send-trial-notifications'),
      
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

    // Limpar notificações antigas
    const { error: notificationsError } = await supabaseClient
      .from('notifications')
      .delete()
      .lte('created_at', thirtyDaysAgo.toISOString())
      .eq('read', true);

    if (notificationsError) {
      logStep("Error cleaning notifications", notificationsError);
    } else {
      logStep("Old notifications cleaned");
    }

  } catch (error) {
    logStep("Cleanup error", error);
  }
}