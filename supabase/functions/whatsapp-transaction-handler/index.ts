import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  phoneNumber: string;
  messageId: string;
  text?: string;
  image?: string;
  audio?: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { phoneNumber, messageId, text, image, audio, timestamp }: WhatsAppMessage = await req.json();

    console.log('Processing WhatsApp message:', { phoneNumber, messageId, hasText: !!text, hasImage: !!image, hasAudio: !!audio });

    // Get tenant_id from phone number
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('tenant_id, is_authorized')
      .eq('phone_number', phoneNumber)
      .single();

    if (integrationError || !integration) {
      console.error('Phone number not registered:', phoneNumber);
      return new Response(JSON.stringify({ 
        error: 'Phone number not registered',
        message: 'Para usar este serviço, você precisa estar cadastrado. Entre em contato com nosso suporte.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!integration.is_authorized) {
      console.error('Phone number not authorized:', phoneNumber);
      return new Response(JSON.stringify({ 
        error: 'Phone number not authorized',
        message: 'Seu número não está autorizado. Entre em contato com nosso suporte para ativação.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user has active subscription
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('email, subscribed, plan_status, subscription_end')
      .eq('tenant_id', integration.tenant_id)
      .single();

    if (!subscriber || !subscriber.subscribed || subscriber.plan_status !== 'active') {
      console.error('Subscription not active for tenant:', integration.tenant_id);
      return new Response(JSON.stringify({ 
        error: 'Premium subscription required',
        message: '🚀 Para usar nosso bot via WhatsApp, você precisa de uma assinatura Premium.\n\n💰 Assine agora e tenha controle total do seu estoque e fluxo de caixa pelo WhatsApp!\n\nAcesse: https://lucrai.com/pricing' 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let processedText = text || '';

    // Process audio if present
    if (audio) {
      try {
        const { data: audioResult } = await supabase.functions.invoke('transcribe-audio', {
          body: { audioUrl: audio }
        });
        
        if (audioResult?.text) {
          processedText = audioResult.text;
          console.log('Audio transcribed:', processedText);
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    }

    // Process image if present
    if (image) {
      try {
        const { data: imageResult } = await supabase.functions.invoke('process-image', {
          body: { imageUrl: image }
        });
        
        if (imageResult?.text) {
          processedText = imageResult.text;
          console.log('Image OCR processed:', processedText);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    if (!processedText) {
      return new Response(JSON.stringify({ 
        error: 'No content to process',
        message: 'Não consegui processar sua mensagem. Tente enviar texto, áudio ou uma imagem com dados financeiros.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine if it's a stock movement or transaction
    const isStockMovement = /entrada|saida|estoque|kg|un|litro|pacote/i.test(processedText);
    
    if (isStockMovement) {
      // Process as stock movement
      const stockData = parseStockMovement(processedText);
      
      if (stockData) {
        const { data: stockMovement, error: stockError } = await supabase
          .from('stock_movements')
          .insert({
            tenant_id: integration.tenant_id,
            item_name: stockData.item,
            movement_type: stockData.type,
            quantity: stockData.quantity,
            unit: stockData.unit || 'un',
            cost_per_unit: stockData.costPerUnit,
            total_cost: stockData.totalCost,
            notes: processedText,
            whatsapp_message_id: messageId,
            phone_number: phoneNumber
          })
          .select()
          .single();

        if (stockError) {
          console.error('Error inserting stock movement:', stockError);
          throw stockError;
        }

        // Recalculate stock levels
        await supabase.rpc('recalc_stock_levels', { p_tenant_id: integration.tenant_id });

        return new Response(JSON.stringify({
          success: true,
          message: `✅ Estoque atualizado!\n\n📦 Item: ${stockData.item}\n📊 ${stockData.type === 'entrada' ? 'Entrada' : 'Saída'}: ${stockData.quantity} ${stockData.unit}\n💰 Valor: R$ ${stockData.totalCost?.toFixed(2) || '0,00'}\n\n🎯 Use "resumo" para ver o painel completo!`,
          data: stockMovement
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Process as financial transaction
      const transactionData = parseTransaction(processedText);
      
      if (transactionData) {
        // Auto-categorize transaction
        const { data: keywords } = await supabase
          .from('expense_keywords')
          .select('*');

        let autoCategory = 'outros';
        let impactsCmv = false;
        let impactsDre = true;

        if (keywords) {
          for (const keyword of keywords) {
            if (processedText.toLowerCase().includes(keyword.keyword.toLowerCase())) {
              autoCategory = keyword.category;
              impactsCmv = keyword.impacts_cmv;
              impactsDre = keyword.impacts_dre;
              break;
            }
          }
        }

        const { data: transaction, error: transactionError } = await supabase
          .from('whatsapp_transactions')
          .insert({
            tenant_id: integration.tenant_id,
            transaction_type: transactionData.type,
            amount: transactionData.amount,
            description: transactionData.description,
            category: transactionData.category,
            auto_category: autoCategory,
            impacts_cmv: impactsCmv,
            impacts_dre: impactsDre,
            whatsapp_message_id: messageId,
            phone_number: phoneNumber
          })
          .select()
          .single();

        if (transactionError) {
          console.error('Error inserting transaction:', transactionError);
          throw transactionError;
        }

        // Recalculate DRE for current month
        const now = new Date();
        await supabase.rpc('recalc_dre', {
          p_tenant_id: integration.tenant_id,
          p_month: now.getMonth() + 1,
          p_year: now.getFullYear()
        });

        return new Response(JSON.stringify({
          success: true,
          message: `✅ Transação registrada!\n\n💰 ${transactionData.type === 'income' ? 'Receita' : 'Despesa'}: R$ ${transactionData.amount.toFixed(2)}\n📝 Descrição: ${transactionData.description}\n🏷️ Categoria: ${autoCategory}\n${impactsCmv ? '📊 Impacta CMV' : '📈 Despesa operacional'}\n\n🎯 Use "resumo" para ver o painel completo!`,
          data: transaction
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // If no valid data found, return help message
    return new Response(JSON.stringify({
      success: false,
      message: `❓ Não consegui entender sua mensagem.\n\n📖 Exemplos de uso:\n\n💰 Transações:\n"Receita venda R$ 450"\n"Gasto energia R$ 120"\n\n📦 Estoque:\n"Entrada frango 5kg R$ 45"\n"Saída tomate 2kg"\n\n📊 Consultas:\n"resumo" - Ver painel\n"estoque" - Ver estoque crítico\n"dre" - Ver DRE mensal`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Erro interno. Tente novamente em alguns minutos.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseStockMovement(text: string) {
  // Parse stock movement from text
  const patterns = [
    /(?:entrada|recebeu|chegou|comprou)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|un|litro|pacote)?(?:\s+(?:r\$|valor)?\s*(\d+(?:\.\d+)?))?/i,
    /(?:saida|vendeu|usou|gastou)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|un|litro|pacote)?/i,
    /(.+?)\s+(?:entrada|saida)\s+(\d+(?:\.\d+)?)\s*(kg|un|litro|pacote)?(?:\s+(?:r\$|valor)?\s*(\d+(?:\.\d+)?))?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const isEntrada = /entrada|recebeu|chegou|comprou/i.test(text);
      const item = match[1].trim();
      const quantity = parseFloat(match[2]);
      const unit = match[3] || 'un';
      const totalCost = match[4] ? parseFloat(match[4]) : undefined;
      
      return {
        item,
        type: isEntrada ? 'entrada' : 'saida' as 'entrada' | 'saida',
        quantity,
        unit,
        totalCost,
        costPerUnit: totalCost ? totalCost / quantity : undefined
      };
    }
  }
  
  return null;
}

function parseTransaction(text: string) {
  // Parse financial transaction from text
  const patterns = [
    /(?:receita|venda|recebeu|entrada)\s+(?:r\$)?\s*(\d+(?:\.\d+)?)\s*(.+)?/i,
    /(?:gasto|despesa|pagou|saida)\s+(.+?)\s+(?:r\$)?\s*(\d+(?:\.\d+)?)/i,
    /(?:r\$)?\s*(\d+(?:\.\d+)?)\s+(?:receita|venda|recebeu)/i,
    /(?:r\$)?\s*(\d+(?:\.\d+)?)\s+(?:gasto|despesa|pagou)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const isIncome = /receita|venda|recebeu|entrada/i.test(text);
      let amount: number;
      let description: string;
      
      if (isIncome) {
        amount = parseFloat(match[1]);
        description = match[2] || 'Receita via WhatsApp';
      } else {
        if (match.length === 3) {
          description = match[1].trim();
          amount = parseFloat(match[2]);
        } else {
          amount = parseFloat(match[1]);
          description = 'Despesa via WhatsApp';
        }
      }
      
      return {
        type: isIncome ? 'income' : 'expense' as 'income' | 'expense',
        amount,
        description: description.trim(),
        category: 'whatsapp'
      };
    }
  }
  
  return null;
}