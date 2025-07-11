import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-instance-id',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FIXED-EXPENSE] ${step}${detailsStr}`);
};

interface FixedExpenseRequest {
  action: 'create' | 'update' | 'delete' | 'list';
  text?: string;
  audio?: string;
  image?: string;
  phoneNumber: string;
  messageId: string;
  timestamp: string;
  expenseId?: string;
}

// Parser para despesas fixas
function parseFixedExpense(text: string): {
  action: 'create' | 'update' | 'delete';
  name: string;
  amount?: number;
  dueDay?: number;
  category?: string;
} | null {
  const cleanText = text.toLowerCase().trim();
  
  // Identificar ação
  let action: 'create' | 'update' | 'delete';
  if (cleanText.includes('adicione') || cleanText.includes('criar') || cleanText.includes('nova')) {
    action = 'create';
  } else if (cleanText.includes('remova') || cleanText.includes('delete') || cleanText.includes('excluir')) {
    action = 'delete';
  } else if (cleanText.includes('altere') || cleanText.includes('modifique') || cleanText.includes('atualizar')) {
    action = 'update';
  } else {
    // Default para criar se tem valor monetário
    action = 'create';
  }
  
  // Extrair valor monetário
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
  
  // Extrair dia de vencimento
  const dayPatterns = [
    /todo\s+dia\s+(\d{1,2})/,
    /dia\s+(\d{1,2})/,
    /(\d{1,2})\s+de\s+cada\s+mês/
  ];
  
  let dueDay = 1;
  for (const pattern of dayPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const day = parseInt(match[1]);
      if (day >= 1 && day <= 31) {
        dueDay = day;
        break;
      }
    }
  }
  
  // Identificar categoria baseada em palavras-chave
  const categoryMap = {
    'aluguel': ['aluguel', 'locação', 'rent'],
    'energia': ['luz', 'energia', 'elétrica', 'eletrica'],
    'água': ['água', 'agua', 'saneamento'],
    'internet': ['internet', 'wifi', 'banda larga'],
    'telefone': ['telefone', 'celular', 'fone'],
    'seguro': ['seguro', 'insurance'],
    'software': ['software', 'sistema', 'app', 'aplicativo'],
    'marketing': ['marketing', 'propaganda', 'publicidade'],
    'pessoal': ['salário', 'salario', 'funcionário', 'funcionario']
  };
  
  let category = 'operacional';
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => cleanText.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Extrair nome da despesa
  let name = cleanText;
  
  // Remover palavras de ação, valores e dias
  const removeWords = [
    'adicione', 'criar', 'nova', 'remova', 'delete', 'excluir',
    'altere', 'modifique', 'atualizar', 'despesa', 'fixa',
    'todo', 'dia', 'de', 'cada', 'mês', 'mes',
    amount.toString(), dueDay.toString(),
    'r$', 'reais', 'real'
  ];
  
  for (const word of removeWords) {
    name = name.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  
  name = name.trim().replace(/\s+/g, ' ');
  
  // Se nome ficou vazio, tentar extrair de outra forma
  if (!name) {
    const namePatterns = [
      /(?:de|em|para)\s+([^0-9]+?)(?:\s|$)/,
      /([a-záêìôû]+(?:\s+[a-záêìôû]+)*)/
    ];
    
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }
  }
  
  if (!name) return null;
  
  return {
    action,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: amount > 0 ? amount : undefined,
    dueDay,
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

    const body: FixedExpenseRequest = await req.json();
    logStep('Request body parsed', body);

    // Buscar restaurant_id pelo tenant_id
    const { data: restaurant, error: restaurantError } = await supabaseClient
      .from('restaurants')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();

    if (restaurantError || !restaurant) {
      throw new Error('Restaurante não encontrado para este tenant');
    }

    // Processar ação de listar
    if (body.action === 'list') {
      const { data: expenses, error: listError } = await supabaseClient
        .from('fixed_expenses')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('restaurant_id', restaurant.id)
        .eq('active', true)
        .order('due_day');

      if (listError) {
        throw new Error(`Erro ao listar despesas: ${listError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        expenses
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Processar texto para outras ações
    if (!body.text && !body.audio && !body.image) {
      throw new Error('Texto, áudio ou imagem são obrigatórios');
    }

    let parsedExpense = null;

    if (body.text) {
      parsedExpense = parseFixedExpense(body.text);
      logStep('Text parsed', parsedExpense);
    }

    if (!parsedExpense) {
      throw new Error('Não foi possível interpretar a despesa fixa');
    }

    let result;

    switch (parsedExpense.action) {
      case 'create':
        if (!parsedExpense.amount) {
          throw new Error('Valor é obrigatório para criar despesa fixa');
        }

        const { data: newExpense, error: createError } = await supabaseClient
          .from('fixed_expenses')
          .insert({
            tenant_id: tenantId,
            restaurant_id: restaurant.id,
            name: parsedExpense.name,
            amount: parsedExpense.amount,
            due_day: parsedExpense.dueDay || 1,
            category: parsedExpense.category || 'operacional',
            active: true
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Erro ao criar despesa: ${createError.message}`);
        }

        result = { action: 'created', expense: newExpense };
        break;

      case 'update':
        // Buscar despesa existente
        const { data: existingExpense, error: findError } = await supabaseClient
          .from('fixed_expenses')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('restaurant_id', restaurant.id)
          .ilike('name', `%${parsedExpense.name}%`)
          .eq('active', true)
          .limit(1)
          .single();

        if (findError || !existingExpense) {
          throw new Error(`Despesa "${parsedExpense.name}" não encontrada`);
        }

        const updateData: any = {};
        if (parsedExpense.amount) updateData.amount = parsedExpense.amount;
        if (parsedExpense.dueDay) updateData.due_day = parsedExpense.dueDay;
        if (parsedExpense.category) updateData.category = parsedExpense.category;

        const { data: updatedExpense, error: updateError } = await supabaseClient
          .from('fixed_expenses')
          .update(updateData)
          .eq('id', existingExpense.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Erro ao atualizar despesa: ${updateError.message}`);
        }

        result = { action: 'updated', expense: updatedExpense };
        break;

      case 'delete':
        // Buscar e desativar despesa
        const { data: expenseToDelete, error: deleteError } = await supabaseClient
          .from('fixed_expenses')
          .update({ active: false })
          .eq('tenant_id', tenantId)
          .eq('restaurant_id', restaurant.id)
          .ilike('name', `%${parsedExpense.name}%`)
          .eq('active', true)
          .select()
          .single();

        if (deleteError || !expenseToDelete) {
          throw new Error(`Despesa "${parsedExpense.name}" não encontrada`);
        }

        result = { action: 'deleted', expense: expenseToDelete };
        break;
    }

    logStep('Operation completed successfully', result);

    return new Response(JSON.stringify({
      success: true,
      ...result,
      parsed: parsedExpense
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