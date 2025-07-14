import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-instance-id',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WHATSAPP-RESPONSE] ${step}${detailsStr}`);
};

interface ResponseRequest {
  phoneNumber: string;
  transactionType?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category?: string;
  inventoryType?: 'entrada' | 'saida';
  item?: string;
  quantity?: number;
  currentBalance?: number;
  errorMessage?: string;
  tenantId: string;
  instanceId: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

const formatSuccessMessage = (data: ResponseRequest): string => {
  const timestamp = new Date().toLocaleString('pt-BR');
  
  if (data.transactionType) {
    const emoji = data.transactionType === 'income' ? '💰' : '💸';
    const typeText = data.transactionType === 'income' ? 'Receita' : 'Despesa';
    
    let message = `${emoji} *${typeText.toUpperCase()} REGISTRADA*\n\n`;
    message += `📊 *Detalhes:*\n`;
    message += `• Valor: ${formatCurrency(data.amount || 0)}\n`;
    message += `• Categoria: ${data.category || 'Geral'}\n`;
    message += `• Descrição: ${data.description || 'N/A'}\n`;
    message += `• Data/Hora: ${timestamp}\n\n`;
    
    if (data.currentBalance !== undefined) {
      message += `💳 *Saldo Atual:* ${formatCurrency(data.currentBalance)}\n\n`;
    }
    
    message += `✅ Transação processada com sucesso!`;
    return message;
  }
  
  if (data.inventoryType) {
    const emoji = data.inventoryType === 'entrada' ? '📦' : '📤';
    const typeText = data.inventoryType === 'entrada' ? 'ENTRADA' : 'SAÍDA';
    
    let message = `${emoji} *${typeText} DE ESTOQUE*\n\n`;
    message += `📋 *Detalhes:*\n`;
    message += `• Item: ${data.item || 'N/A'}\n`;
    message += `• Quantidade: ${data.quantity || 0}\n`;
    message += `• Tipo: ${typeText}\n`;
    message += `• Data/Hora: ${timestamp}\n\n`;
    
    message += `✅ Estoque atualizado com sucesso!`;
    return message;
  }
  
  return `✅ *PROCESSADO COM SUCESSO*\n\nSua solicitação foi processada às ${timestamp}.`;
};

const formatErrorMessage = (errorMessage: string): string => {
  return `❌ *ERRO AO PROCESSAR*\n\n${errorMessage}\n\nTente novamente ou entre em contato com o suporte.`;
};

serve(async (req) => {
  logStep('Iniciando função whatsapp-response');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    logStep('Request body recebido', requestBody);

    const {
      phoneNumber,
      transactionType,
      amount,
      description,
      category,
      inventoryType,
      item,
      quantity,
      currentBalance,
      errorMessage,
      tenantId,
      instanceId
    } = requestBody;

    // Validar headers multi-tenant
    if (!tenantId || !instanceId) {
      logStep('Headers multi-tenant ausentes');
      return new Response(
        JSON.stringify({ 
          error: 'Headers multi-tenant são obrigatórios',
          details: 'x-tenant-id e x-instance-id devem ser fornecidos'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!phoneNumber) {
      logStep('Número de telefone ausente');
      return new Response(
        JSON.stringify({ error: 'Número de telefone é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Formatar mensagem
    const message = errorMessage 
      ? formatErrorMessage(errorMessage)
      : formatSuccessMessage(requestBody);

    logStep('Mensagem formatada', { message: message.substring(0, 100) + '...' });

    // TODO: Integrar com Evolution API para envio real
    // Por enquanto, apenas simular o envio
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      logStep('Credenciais Evolution API não configuradas - simulando envio');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Mensagem formatada (Evolution API não configurada)',
          formattedMessage: message,
          phoneNumber,
          tenantId,
          instanceId,
          simulated: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enviar via Evolution API
    const evolutionResponse = await fetch(`${evolutionApiUrl}/message/sendText/${instanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: message
      })
    });

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text();
      logStep('Erro ao enviar via Evolution API', { status: evolutionResponse.status, error: errorData });
      
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao enviar mensagem WhatsApp',
          details: errorData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const evolutionData = await evolutionResponse.json();
    logStep('Mensagem enviada com sucesso via Evolution API', { messageId: evolutionData.messageId });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Mensagem WhatsApp enviada com sucesso',
        messageId: evolutionData.messageId,
        phoneNumber,
        tenantId,
        instanceId,
        formattedMessage: message
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    logStep('Erro na função', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});