import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-instance-id',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRANSACTION-RECORDED] ${step}${detailsStr}`);
};

interface TransactionRequest {
  text?: string;
  audio?: string;
  image?: string;
  phoneNumber: string;
  messageId: string;
  timestamp: string;
}

// Parser de texto natural para comandos WhatsApp
function parseTransaction(text: string): {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
} | null {
  const cleanText = text.toLowerCase().trim();
  
  // Padrões para identificar valores monetários
  const moneyPatterns = [
    /r\$\s?(\d+(?:[,.]?\d{1,2})?)/,
    /(\d+(?:[,.]?\d{1,2})?)\s?reais?/,
    /(\d+(?:[,.]?\d{1,2})?)/
  ];
  
  let amount = 0;
  for (const pattern of moneyPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(',', '.'));
      break;
    }
  }
  
  if (amount === 0) return null;
  
  // Identificar tipo (receita ou despesa)
  const incomeKeywords = ['vendi', 'vendeu', 'recebi', 'recebeu', 'ganhou', 'faturei', 'entrada'];
  const expenseKeywords = ['gastei', 'gastou', 'paguei', 'pagou', 'comprei', 'comprou', 'saída'];
  
  const isIncome = incomeKeywords.some(keyword => cleanText.includes(keyword));
  const isExpense = expenseKeywords.some(keyword => cleanText.includes(keyword));
  
  let type: 'income' | 'expense';
  if (isIncome && !isExpense) {
    type = 'income';
  } else if (isExpense && !isIncome) {
    type = 'expense';
  } else {
    // Se ambíguo, assume despesa por segurança
    type = 'expense';
  }
  
  // Identificar categoria baseada em palavras-chave
  const categoryMap = {
    'marketing': ['marketing', 'propaganda', 'publicidade', 'anúncio'],
    'ingredientes': ['ingrediente', 'insumo', 'comida', 'bebida'],
    'pessoal': ['salário', 'funcionário', 'pagamento'],
    'aluguel': ['aluguel', 'locação'],
    'energia': ['luz', 'energia', 'elétrica'],
    'água': ['água', 'saneamento'],
    'vendas': ['pizza', 'hambúrguer', 'bebida', 'venda']
  };
  
  let category = type === 'income' ? 'vendas' : 'operacional';
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => cleanText.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  return {
    type,
    amount,
    description: text.trim(),
    category
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    logStep('Function started');

    // Validar headers multi-tenant
    const tenantId = req.headers.get('x-tenant-id');
    const instanceId = req.headers.get('x-instance-id');
    
    if (!tenantId || !instanceId) {
      throw new Error('Headers X-Tenant-ID e X-Instance-ID são obrigatórios');
    }
    
    logStep('Multi-tenant headers validated', { tenantId, instanceId });

    // Verificar status da assinatura
    const { data: tenantInstance, error: tenantError } = await supabaseClient
      .from('tenant_instances')
      .select('status, subscription_tier, trial_end')
      .eq('tenant_id', tenantId)
      .eq('instance_id', instanceId)
      .single();

    if (tenantError || !tenantInstance) {
      throw new Error('Tenant não encontrado ou inválido');
    }

    if (tenantInstance.status !== 'active') {
      throw new Error('Assinatura inativa. Renove para continuar usando.');
    }

    // Verificar trial expirado
    if (tenantInstance.trial_end && new Date(tenantInstance.trial_end) < new Date()) {
      if (tenantInstance.subscription_tier === 'basic') {
        throw new Error('Trial expirado. Assine um plano para continuar.');
      }
    }

    logStep('Subscription validated', tenantInstance);

    const body: TransactionRequest = await req.json();
    logStep('Request body parsed', body);

    if (!body.text && !body.audio && !body.image) {
      throw new Error('Texto, áudio ou imagem são obrigatórios');
    }

    let parsedTransaction = null;

    // Processar texto
    if (body.text) {
      parsedTransaction = parseTransaction(body.text);
      logStep('Text parsed', parsedTransaction);
    }

    // TODO: Implementar processamento de áudio e imagem usando IA
    if (body.audio && !parsedTransaction) {
      // Integração futura com Groq/Whisper para transcrição
      logStep('Audio processing not implemented yet');
    }

    if (body.image && !parsedTransaction) {
      // Integração futura com OCR/Vision AI
      logStep('Image processing not implemented yet');
    }

    if (!parsedTransaction) {
      throw new Error('Não foi possível interpretar a transação');
    }

    // Buscar restaurant_id pelo tenant_id
    const { data: restaurant, error: restaurantError } = await supabaseClient
      .from('restaurants')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();

    if (restaurantError || !restaurant) {
      throw new Error('Restaurante não encontrado para este tenant');
    }

    // Inserir transação no cash_flow
    const { data: transaction, error: insertError } = await supabaseClient
      .from('cash_flow')
      .insert({
        tenant_id: tenantId,
        restaurant_id: restaurant.id,
        type: parsedTransaction.type,
        amount: parsedTransaction.amount,
        category: parsedTransaction.category,
        description: parsedTransaction.description,
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        payment_method: 'whatsapp_recorded',
        metadata: {
          source: 'whatsapp',
          phone_number: body.phoneNumber,
          message_id: body.messageId,
          timestamp: body.timestamp,
          original_text: body.text
        }
      })
      .select()
      .single();

    if (insertError) {
      logStep('Error inserting transaction', insertError);
      throw new Error(`Erro ao salvar transação: ${insertError.message}`);
    }

    logStep('Transaction saved successfully', transaction);

    return new Response(JSON.stringify({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description
      },
      parsed: parsedTransaction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});