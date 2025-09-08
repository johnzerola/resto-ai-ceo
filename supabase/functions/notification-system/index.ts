import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔔 Iniciando sistema de notificações automáticas...');

    // 1. Executar bloqueio automático de usuários expirados
    console.log('⏰ Executando bloqueio automático...');
    const { error: blockError } = await supabase.rpc('block_expired_users');
    
    if (blockError) {
      console.error('❌ Erro no bloqueio automático:', blockError);
      throw blockError;
    }

    // 2. Gerar notificações de vencimento
    console.log('📧 Gerando notificações de vencimento...');
    const { error: notificationError } = await supabase.rpc('generate_expiration_notifications');
    
    if (notificationError) {
      console.error('❌ Erro ao gerar notificações:', notificationError);
      throw notificationError;
    }

    // 3. Buscar notificações pendentes para envio
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('❌ Erro ao buscar notificações:', fetchError);
      throw fetchError;
    }

    console.log(`📬 Encontradas ${pendingNotifications?.length || 0} notificações pendentes`);

    // 4. Enviar notificações por email (simulado por enquanto)
    let sentCount = 0;
    let failedCount = 0;

    for (const notification of pendingNotifications || []) {
      try {
        // Simular envio de email
        console.log(`📤 Enviando notificação: ${notification.title} para user ${notification.user_id}`);
        
        // Marcar como enviada
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', notification.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar status:', updateError);
          failedCount++;
        } else {
          sentCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar notificação ${notification.id}:`, error);
        
        // Marcar como falhou
        await supabase
          .from('notifications')
          .update({ status: 'failed' })
          .eq('id', notification.id);
        
        failedCount++;
      }
    }

    // 5. Verificar status geral do sistema
    const { data: stats } = await supabase
      .from('profiles')
      .select('plan_status, status')
      .not('plan_status', 'is', null);

    const statusStats = stats?.reduce((acc, profile) => {
      const key = `${profile.plan_status}_${profile.status}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('📊 Status dos usuários:', statusStats);

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      notifications: {
        sent: sentCount,
        failed: failedCount,
        pending: (pendingNotifications?.length || 0) - sentCount - failedCount
      },
      user_stats: statusStats,
      message: `Sistema executado com sucesso. ${sentCount} notificações enviadas.`
    };

    console.log('✅ Sistema de notificações executado com sucesso:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Erro crítico no sistema de notificações:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do sistema de notificações',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});