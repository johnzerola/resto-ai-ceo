
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
    
    // O Supabase não fornece diretamente a informação se o email foi confirmado
    // Então vamos verificar se há alguma operação pendente de confirmação
    const { data: { user } } = await supabase.auth.getUser();
    
    // Se o usuário existe e tem email, consideramos confirmado
    // Esta é uma verificação básica - em um sistema real seria mais complexa
    return !!user && !!user.email;
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
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email
    });
    
    if (error) {
      toast.error(`Erro ao reenviar email: ${error.message}`);
      return false;
    }
    
    toast.success("Email de confirmação enviado com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao reenviar email de confirmação:", error);
    toast.error("Erro ao reenviar email de confirmação");
    return false;
  }
}
