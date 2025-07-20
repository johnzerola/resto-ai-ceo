import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      throw new Error("User not authenticated");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar cliente no Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let subscriptionStatus = {
      subscribed: false,
      subscription_tier: 'free',
      plan_status: 'inactive',
      subscription_end: null,
      stripe_customer_id: null
    };

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      subscriptionStatus.stripe_customer_id = customerId;

      // Verificar assinaturas ativas
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;
        
        // Determinar plano baseado no price ID
        let tier = 'Básico';
        if (priceId === 'price_1RgzwaRon1VrwJMGoESYbq1r') {
          tier = 'Profissional';
        } else if (priceId === 'price_1RgzvXRon1VrwJMGcv0TECIa') {
          tier = 'Básico';
        }

        subscriptionStatus = {
          subscribed: true,
          subscription_tier: tier,
          plan_status: 'active',
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: customerId
        };
      }
    }

    // Atualizar no Supabase
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        ...subscriptionStatus,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: subscriptionStatus 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});