
import { supabase } from "@/integrations/supabase/client";
import { initializeNewUserData } from "@/services/SyncService";
import { toast } from "sonner";

/**
 * Verifica se o usuário é novo para inicializar dados
 */
export async function checkAndSetupNewUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    const userId = session.user.id;
    
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
      const hoursElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 36e5; // ms para horas
      
      // Se for um usuário novo (criado há menos de 24h)
      if (hoursElapsed < 24) {
        // Verificar se a inicialização já foi feita
        const isInitialized = localStorage.getItem('dataInitialized') === 'true';
        
        if (!isInitialized) {
          console.log("Novo usuário detectado, inicializando dados...");
          await initializeNewUserData(userId);
          localStorage.setItem('isNewUser', 'true');
          localStorage.setItem('dataInitialized', 'true');
        }
      } else {
        localStorage.setItem('isNewUser', 'false');
      }
    }
  } catch (error) {
    console.error("Erro ao verificar novo usuário:", error);
  }
}

/**
 * Verifica se o email foi confirmado
 */
export async function checkEmailConfirmation() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    // Verificar se o email está confirmado
    const { data: { user } } = await supabase.auth.getUser();
    
    // Verificar status de confirmação de email do usuário
    if (user?.email_confirmed_at) {
      return true;
    }
    
    // Verificar via API se o email foi confirmado recentemente
    const { data, error } = await supabase.functions.invoke('check-email-confirmation', {
      body: { user_id: user?.id }
    });
    
    if (error) {
      console.error("Erro ao verificar confirmação de email:", error);
      return false;
    }
    
    return data?.confirmed || false;
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
 * Envia novamente o email de confirmação
 */
export async function resendConfirmationEmail() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      toast.error("Usuário não tem email registrado");
      return false;
    }
    
    // Usar a nova Edge Function para enviar email com template personalizado
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: { 
        email: user.email,
        name: user.user_metadata?.name || 'Usuário',
      }
    });
    
    if (error) {
      console.error("Erro ao reenviar email:", error);
      toast.error(`Erro ao reenviar email: ${error.message}`);
      return false;
    }
    
    // Fallback para método padrão caso a função não esteja disponível
    if (!data?.success) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (resendError) {
        toast.error(`Erro ao reenviar email: ${resendError.message}`);
        return false;
      }
    }
    
    toast.success("Email de confirmação enviado com sucesso!", {
      description: "Por favor, verifique sua caixa de entrada ou pasta de spam."
    });
    return true;
  } catch (error) {
    console.error("Erro ao reenviar email de confirmação:", error);
    toast.error("Erro ao reenviar email de confirmação");
    return false;
  }
}

/**
 * Dispara evento de alternância do sidebar
 */
export function dispatchSidebarToggle(isCollapsed: boolean) {
  const event = new CustomEvent('sidebarToggle', { detail: { isCollapsed } });
  window.dispatchEvent(event);
}

