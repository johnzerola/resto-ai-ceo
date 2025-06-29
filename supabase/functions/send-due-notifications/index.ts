
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Check accounts payable due tomorrow (1 day warning)
    const { data: payableTomorrow, error: payableError1 } = await supabaseClient
      .from('contas_a_pagar')
      .select('*')
      .eq('status', 'pendente')
      .eq('data_vencimento', tomorrow)
      .eq('notificacao_enviada_1_dia', false)

    if (!payableError1 && payableTomorrow && payableTomorrow.length > 0) {
      console.log(`Found ${payableTomorrow.length} accounts payable due tomorrow`)
      
      for (const account of payableTomorrow) {
        // Here you would integrate with your notification service
        // For now, we'll just log and mark as notified
        console.log(`Notification: Account ${account.descricao} due tomorrow - R$ ${account.valor}`)
        
        // Mark as notified
        await supabaseClient
          .from('contas_a_pagar')
          .update({ notificacao_enviada_1_dia: true })
          .eq('id', account.id)
      }
    }

    // Check accounts payable due today
    const { data: payableToday, error: payableError2 } = await supabaseClient
      .from('contas_a_pagar')
      .select('*')
      .eq('status', 'pendente')
      .eq('data_vencimento', today)
      .eq('notificacao_enviada_vencimento', false)

    if (!payableError2 && payableToday && payableToday.length > 0) {
      console.log(`Found ${payableToday.length} accounts payable due today`)
      
      for (const account of payableToday) {
        console.log(`URGENT: Account ${account.descricao} due TODAY - R$ ${account.valor}`)
        
        // Mark as notified
        await supabaseClient
          .from('contas_a_pagar')
          .update({ notificacao_enviada_vencimento: true })
          .eq('id', account.id)
      }
    }

    // Check accounts receivable due tomorrow
    const { data: receivableTomorrow, error: receivableError1 } = await supabaseClient
      .from('contas_a_receber')
      .select('*')
      .eq('status', 'pendente')
      .eq('data_vencimento', tomorrow)
      .eq('notificacao_enviada_1_dia', false)

    if (!receivableError1 && receivableTomorrow && receivableTomorrow.length > 0) {
      console.log(`Found ${receivableTomorrow.length} accounts receivable due tomorrow`)
      
      for (const account of receivableTomorrow) {
        console.log(`Reminder: Payment ${account.descricao} due tomorrow - R$ ${account.valor}`)
        
        // Mark as notified
        await supabaseClient
          .from('contas_a_receber')
          .update({ notificacao_enviada_1_dia: true })
          .eq('id', account.id)
      }
    }

    // Check accounts receivable due today
    const { data: receivableToday, error: receivableError2 } = await supabaseClient
      .from('contas_a_receber')
      .select('*')
      .eq('status', 'pendente')
      .eq('data_vencimento', today)
      .eq('notificacao_enviada_vencimento', false)

    if (!receivableError2 && receivableToday && receivableToday.length > 0) {
      console.log(`Found ${receivableToday.length} accounts receivable due today`)
      
      for (const account of receivableToday) {
        console.log(`COLLECT: Payment ${account.descricao} due TODAY - R$ ${account.valor}`)
        
        // Mark as notified
        await supabaseClient
          .from('contas_a_receber')
          .update({ notificacao_enviada_vencimento: true })
          .eq('id', account.id)
      }
    }

    const summary = {
      payable_tomorrow: payableTomorrow?.length || 0,
      payable_today: payableToday?.length || 0,
      receivable_tomorrow: receivableTomorrow?.length || 0,
      receivable_today: receivableToday?.length || 0,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications processed successfully',
        summary 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

/* To create the client */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
