import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-instance-id',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVENTORY-MOVEMENT] ${step}${detailsStr}`);
};

interface InventoryRequest {
  text?: string;
  audio?: string;
  image?: string;
  phoneNumber: string;
  messageId: string;
  timestamp: string;
}

// Parser para movimentações de estoque
function parseInventoryMovement(text: string): {
  type: 'entrada' | 'saida';
  item: string;
  quantity: number;
  unit?: string;
} | null {
  const cleanText = text.toLowerCase().trim();
  
  // Padrões para identificar quantidades
  const quantityPatterns = [
    /(\d+(?:[,.]?\d+)?)\s?(kg|quilos?|gramas?|g|litros?|l|unidades?|un|peças?|pç)/,
    /(\d+(?:[,.]?\d+)?)\s?(\w+)/,
    /(\d+(?:[,.]?\d+)?)/
  ];
  
  let quantity = 0;
  let unit = 'un';
  
  for (const pattern of quantityPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      quantity = parseFloat(match[1].replace(',', '.'));
      if (match[2]) {
        unit = match[2];
      }
      break;
    }
  }
  
  if (quantity === 0) return null;
  
  // Identificar tipo (entrada ou saída)
  const entryKeywords = ['comprei', 'comprou', 'chegou', 'recebeu', 'entrada', 'adicionei'];
  const exitKeywords = ['usei', 'usou', 'gastei', 'gastou', 'saída', 'acabou', 'terminou'];
  
  const isEntry = entryKeywords.some(keyword => cleanText.includes(keyword));
  const isExit = exitKeywords.some(keyword => cleanText.includes(keyword));
  
  let type: 'entrada' | 'saida';
  if (isEntry && !isExit) {
    type = 'entrada';
  } else if (isExit && !isEntry) {
    type = 'saida';
  } else {
    // Se ambíguo, assume saída (uso/consumo é mais comum)
    type = 'saida';
  }
  
  // Extrair nome do item
  let item = cleanText;
  
  // Remover palavras de ação e quantidade
  const removeWords = [
    ...entryKeywords, ...exitKeywords,
    quantity.toString(), unit,
    'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na'
  ];
  
  for (const word of removeWords) {
    item = item.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  
  item = item.trim().replace(/\s+/g, ' ');
  
  if (!item) {
    // Tentar extrair item de forma diferente
    const itemPatterns = [
      /(?:de|do|da)\s+([^0-9]+?)(?:\s|$)/,
      /([a-záêìôû]+(?:\s+[a-záêìôû]+)*)/
    ];
    
    for (const pattern of itemPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        item = match[1].trim();
        break;
      }
    }
  }
  
  if (!item) return null;
  
  return {
    type,
    item: item.charAt(0).toUpperCase() + item.slice(1),
    quantity,
    unit
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

    const body: InventoryRequest = await req.json();
    logStep('Request body parsed', body);

    if (!body.text && !body.audio && !body.image) {
      throw new Error('Texto, áudio ou imagem são obrigatórios');
    }

    let parsedMovement = null;

    // Processar texto
    if (body.text) {
      parsedMovement = parseInventoryMovement(body.text);
      logStep('Text parsed', parsedMovement);
    }

    if (!parsedMovement) {
      throw new Error('Não foi possível interpretar a movimentação de estoque');
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

    // Verificar se o item existe no inventário
    let { data: inventoryItem, error: inventoryError } = await supabaseClient
      .from('inventory')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('restaurant_id', restaurant.id)
      .ilike('name', `%${parsedMovement.item}%`)
      .limit(1)
      .single();

    if (inventoryError && inventoryError.code !== 'PGRST116') {
      logStep('Error fetching inventory item', inventoryError);
    }

    // Se item não existe, criar automaticamente
    if (!inventoryItem) {
      const { data: newItem, error: createError } = await supabaseClient
        .from('inventory')
        .insert({
          tenant_id: tenantId,
          restaurant_id: restaurant.id,
          name: parsedMovement.item,
          unit: parsedMovement.unit,
          quantity: parsedMovement.type === 'entrada' ? parsedMovement.quantity : 0,
          minimum_stock: 10,
          category: 'geral'
        })
        .select()
        .single();

      if (createError) {
        logStep('Error creating inventory item', createError);
        throw new Error(`Erro ao criar item no estoque: ${createError.message}`);
      }

      inventoryItem = newItem;
      logStep('New inventory item created', inventoryItem);
    }

    // Atualizar quantidade no estoque
    const currentQuantity = inventoryItem.quantity || 0;
    let newQuantity: number;

    if (parsedMovement.type === 'entrada') {
      newQuantity = currentQuantity + parsedMovement.quantity;
    } else {
      newQuantity = Math.max(0, currentQuantity - parsedMovement.quantity);
    }

    const { error: updateError } = await supabaseClient
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', inventoryItem.id);

    if (updateError) {
      logStep('Error updating inventory', updateError);
      throw new Error(`Erro ao atualizar estoque: ${updateError.message}`);
    }

    logStep('Inventory updated successfully', { 
      item: inventoryItem.name, 
      oldQuantity: currentQuantity,
      newQuantity 
    });

    return new Response(JSON.stringify({
      success: true,
      movement: {
        type: parsedMovement.type,
        item: parsedMovement.item,
        quantity: parsedMovement.quantity,
        unit: parsedMovement.unit,
        previousQuantity: currentQuantity,
        newQuantity
      }
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