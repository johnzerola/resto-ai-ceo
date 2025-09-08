import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-instance-id',
}

interface SubscriptionStatus {
  isActive: boolean;
  planStatus: string;
  userStatus: string;
  trialEnd?: string;
  subscriptionEnd?: string;
  canAccess: boolean;
  reason?: string;
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

    // Extrair headers necessários
    const authHeader = req.headers.get('authorization');
    const tenantId = req.headers.get('x-tenant-id');
    const instanceId = req.headers.get('x-instance-id');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização obrigatório' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair user ID do token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar token com Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Verificando assinatura para usuário: ${user.id}`);

    // Buscar dados do perfil e assinatura
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados de assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const now = new Date();
    const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
    const subscriptionEnd = subscription?.subscription_end ? new Date(subscription.subscription_end) : null;

    // Determinar status da assinatura
    const status: SubscriptionStatus = {
      isActive: false,
      planStatus: profile.plan_status || 'none',
      userStatus: profile.status || 'inactive',
      trialEnd: profile.trial_end,
      subscriptionEnd: subscription?.subscription_end,
      canAccess: false
    };

    // Verificar se pode acessar
    if (profile.status === 'suspended') {
      status.canAccess = false;
      status.reason = 'Conta suspensa';
    } else if (profile.plan_status === 'trial') {
      if (trialEnd && trialEnd > now) {
        status.isActive = true;
        status.canAccess = true;
        status.reason = 'Trial ativo';
      } else {
        status.canAccess = false;
        status.reason = 'Trial expirado';
        
        // Auto-bloquear se necessário
        await supabase
          .from('profiles')
          .update({ 
            status: 'suspended', 
            plan_status: 'trial_expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    } else if (subscription?.subscribed && subscription?.plan_status === 'active') {
      if (subscriptionEnd && subscriptionEnd > now) {
        status.isActive = true;
        status.canAccess = true;
        status.reason = 'Assinatura ativa';
      } else {
        status.canAccess = false;
        status.reason = 'Assinatura expirada';
      }
    } else {
      status.canAccess = false;
      status.reason = 'Sem assinatura válida';
    }

    console.log(`📊 Status verificado:`, status);

    // Verificar se tem acesso ao tenant solicitado (se fornecido)
    if (tenantId && status.canAccess) {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, tenant_id')
        .eq('owner_id', user.id)
        .eq('tenant_id', tenantId)
        .single();

      if (restaurantError || !restaurant) {
        status.canAccess = false;
        status.reason = 'Acesso negado ao tenant';
      }
    }

    // Resposta baseada no método
    if (req.method === 'GET') {
      // Apenas retornar status
      return new Response(
        JSON.stringify(status),
        { 
          status: status.canAccess ? 200 : 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Para outros métodos, bloquear se não tem acesso
    if (!status.canAccess) {
      return new Response(
        JSON.stringify({ 
          error: 'Acesso negado',
          reason: status.reason,
          status: status
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Se chegou aqui, pode prosseguir
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: user.id,
        tenant_id: tenantId,
        instance_id: instanceId,
        status: status,
        message: 'Acesso autorizado'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erro no middleware de assinatura:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do middleware',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});