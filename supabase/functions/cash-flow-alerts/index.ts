import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  restaurantId: string;
  daysBeforeDue?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { restaurantId, daysBeforeDue = 3 }: AlertRequest = await req.json();
    
    console.log(`Verificando alertas para restaurante: ${restaurantId}`);
    
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + daysBeforeDue);
    
    // Buscar contas a pagar próximas do vencimento
    const { data: contasPagar, error: errorPagar } = await supabase
      .from('contas_a_pagar')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pendente')
      .lte('data_vencimento', alertDate.toISOString().split('T')[0])
      .is('notificacao_enviada_vencimento', false);

    if (errorPagar) {
      console.error('Erro ao buscar contas a pagar:', errorPagar);
    }

    // Buscar contas a receber próximas do vencimento
    const { data: contasReceber, error: errorReceber } = await supabase
      .from('contas_a_receber')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pendente')
      .lte('data_vencimento', alertDate.toISOString().split('T')[0])
      .is('notificacao_enviada_vencimento', false);

    if (errorReceber) {
      console.error('Erro ao buscar contas a receber:', errorReceber);
    }

    const alerts = [];
    
    // Processar contas a pagar
    if (contasPagar && contasPagar.length > 0) {
      for (const conta of contasPagar) {
        const daysUntilDue = Math.ceil((new Date(conta.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        alerts.push({
          type: 'conta_pagar',
          id: conta.id,
          description: conta.descricao,
          amount: conta.valor,
          dueDate: conta.data_vencimento,
          daysUntilDue,
          fornecedor: conta.fornecedor
        });

        // Marcar como notificação enviada
        await supabase
          .from('contas_a_pagar')
          .update({ 
            notificacao_enviada_vencimento: true,
            notificacao_enviada_1_dia: daysUntilDue <= 1 
          })
          .eq('id', conta.id);
      }
    }

    // Processar contas a receber
    if (contasReceber && contasReceber.length > 0) {
      for (const conta of contasReceber) {
        const daysUntilDue = Math.ceil((new Date(conta.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        alerts.push({
          type: 'conta_receber',
          id: conta.id,
          description: conta.descricao,
          amount: conta.valor,
          dueDate: conta.data_vencimento,
          daysUntilDue,
          cliente: conta.cliente
        });

        // Marcar como notificação enviada
        await supabase
          .from('contas_a_receber')
          .update({ 
            notificacao_enviada_vencimento: true,
            notificacao_enviada_1_dia: daysUntilDue <= 1 
          })
          .eq('id', conta.id);
      }
    }

    // Criar alertas no sistema se houver contas próximas do vencimento
    if (alerts.length > 0) {
      const systemAlerts = alerts.map(alert => ({
        restaurant_id: restaurantId,
        tipo_alerta: alert.type === 'conta_pagar' ? 'vencimento_pagar' : 'vencimento_receber',
        prioridade: alert.daysUntilDue <= 1 ? 'alta' : 'media',
        titulo: alert.type === 'conta_pagar' ? 'Conta a Pagar Vencendo' : 'Conta a Receber Vencendo',
        mensagem: `${alert.description} - Valor: R$ ${alert.amount.toLocaleString('pt-BR')} - Vence em ${alert.daysUntilDue} dia(s)`,
        dados_contexto: alert
      }));

      const { error: alertError } = await supabase
        .from('alertas_sistema')
        .insert(systemAlerts);

      if (alertError) {
        console.error('Erro ao criar alertas:', alertError);
      }
    }

    console.log(`Processados ${alerts.length} alertas para o restaurante ${restaurantId}`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsProcessed: alerts.length,
        alerts: alerts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na função de alertas:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);