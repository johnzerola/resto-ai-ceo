
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()

    let result;

    switch (action) {
      case 'get_contas_a_pagar':
        result = await supabaseClient
          .from('contas_a_pagar')
          .select('*')
          .eq('restaurant_id', data.restaurant_id)
          .order('data_vencimento', { ascending: true });
        break;

      case 'get_contas_a_receber':
        result = await supabaseClient
          .from('contas_a_receber')
          .select('*')
          .eq('restaurant_id', data.restaurant_id)
          .order('data_vencimento', { ascending: true });
        break;

      case 'insert_conta_a_pagar':
        result = await supabaseClient
          .from('contas_a_pagar')
          .insert(data);
        break;

      case 'insert_conta_a_receber':
        result = await supabaseClient
          .from('contas_a_receber')
          .insert(data);
        break;

      case 'update_conta_a_pagar':
        result = await supabaseClient
          .from('contas_a_pagar')
          .update(data.updates)
          .eq('id', data.id);
        break;

      case 'update_conta_a_receber':
        result = await supabaseClient
          .from('contas_a_receber')
          .update(data.updates)
          .eq('id', data.id);
        break;

      default:
        throw new Error('Ação não suportada');
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  }
})
