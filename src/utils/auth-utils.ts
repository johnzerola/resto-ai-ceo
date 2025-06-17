
import { supabase } from "@/integrations/supabase/client";
import { initializeNewUserData } from "@/services/SyncService";
import { toast } from "sonner";

/**
 * Verifica se o usuário é novo e inicializa dados básicos
 */
export async function checkAndSetupNewUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    // Verificar se o usuário já tem dados registrados
    const { data: userData } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .maybeSingle();
    
    if (userData) {
      // Verificar se o usuário foi criado recentemente (últimas 24h)
      const createdAt = new Date(userData.created_at);
      const now = new Date();
      const hoursElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;
      
      if (hoursElapsed < 24) {
        const isInitialized = localStorage.getItem('dataInitialized') === 'true';
        
        if (!isInitialized) {
          console.log("Novo usuário detectado, inicializando dados...");
          await initializeNewUserData(userId);
          await setupDefaultSubscription(userId, userEmail);
          localStorage.setItem('isNewUser', 'true');
          localStorage.setItem('dataInitialized', 'true');
        }
      }
    }
  } catch (error) {
    console.error("Erro ao verificar novo usuário:", error);
  }
}

/**
 * Configura assinatura padrão para novos usuários
 */
async function setupDefaultSubscription(userId: string, email?: string) {
  try {
    // Verificar se já existe registro na tabela subscribers
    const { data: existingSubscription } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingSubscription && email) {
      // Criar registro de assinatura gratuita
      const { error } = await supabase
        .from('subscribers')
        .insert({
          user_id: userId,
          email: email,
          subscribed: false,
          subscription_tier: 'free',
          subscription_end: null
        });

      if (error) {
        console.error('Erro ao criar assinatura padrão:', error);
      } else {
        console.log('✅ Assinatura gratuita criada para novo usuário');
      }
    }
  } catch (error) {
    console.error("Erro ao configurar assinatura padrão:", error);
  }
}

/**
 * Verifica se o email foi confirmado
 */
export async function checkEmailConfirmation() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email_confirmed_at) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar confirmação de email:", error);
    return false;
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

/**
 * Envia novamente o email de confirmação - Otimizado para mobile
 */
export async function resendConfirmationEmail() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      toast.error("Usuário não tem email registrado");
      return false;
    }
    
    // Usar URL móvel-friendly com HTTPS
    const redirectUrl = window.location.protocol === 'https:' 
      ? `${window.location.origin}/login?confirmed=true`
      : `https://${window.location.host}/login?confirmed=true`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error("Erro ao reenviar email:", error);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('rate limit')) {
        toast.error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
      } else if (error.message.includes('email not confirmed')) {
        toast.error("Email ainda não foi confirmado. Verifique sua caixa de entrada.");
      } else {
        toast.error(`Erro ao reenviar email: ${error.message}`);
      }
      return false;
    }
    
    toast.success("Email de confirmação enviado!", {
      description: "Verifique sua caixa de entrada ou pasta de spam.",
      duration: 5000
    });
    return true;
  } catch (error) {
    console.error("Erro ao reenviar email de confirmação:", error);
    toast.error("Erro ao reenviar email de confirmação");
    return false;
  }
}

/**
 * Dispara evento de alternância do sidebar - Mobile friendly
 */
export function dispatchSidebarToggle(isCollapsed: boolean) {
  try {
    const event = new CustomEvent('sidebarToggle', { 
      detail: { isCollapsed },
      bubbles: true
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Erro ao disparar evento sidebar:", error);
  }
}

/**
 * Utilitário para upgrade de plano
 */
export async function upgradePlan(targetPlan: 'essencial' | 'profissional') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      return false;
    }

    // Aqui seria a integração com Stripe
    console.log(`Iniciando upgrade para plano ${targetPlan} para usuário ${user.id}`);
    
    // Por enquanto, apenas log
    toast.info(`Redirecionando para checkout do plano ${targetPlan}...`);
    
    return true;
  } catch (error) {
    console.error("Erro ao fazer upgrade:", error);
    toast.error("Erro ao processar upgrade");
    return false;
  }
}

/**
 * Utilitário para detectar se está em dispositivo móvel
 */
export function isMobileDevice() {
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch (error) {
    return false;
  }
}

/**
 * Utilitário para viewport móvel
 */
export function isMobileViewport() {
  try {
    return window.innerWidth <= 768;
  } catch (error) {
    return false;
  }
}

/**
 * Monitora logs de email do sistema para debugging
 */
export async function getEmailLogs(userId?: string) {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .in('source', ['email', 'auth'])
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar logs de email:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return [];
  }
}
