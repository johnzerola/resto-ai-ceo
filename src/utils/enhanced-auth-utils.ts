
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSecurityService } from "@/services/EnhancedSecurityService";
import { toast } from "sonner";

/**
 * Registra um novo usuário com validação de segurança aprimorada
 */
export async function registerUserSecure(
  email: string, 
  password: string, 
  name?: string
) {
  try {
    // Validar força da senha antes de criar a conta
    const isSecure = await EnhancedSecurityService.isPasswordSecure(password);
    
    if (!isSecure) {
      const issues = await EnhancedSecurityService.getPasswordFeedback(password);
      toast.error("Senha não atende aos critérios de segurança", {
        description: issues.join(", ")
      });
      return { user: null, error: { message: "Senha não é segura" } };
    }

    // Verificar atividade suspeita
    const hasSuspiciousActivity = await EnhancedSecurityService.checkSuspiciousActivity(email);
    
    if (hasSuspiciousActivity) {
      toast.error("Muitas tentativas de login. Tente novamente mais tarde.");
      return { user: null, error: { message: "Atividade suspeita detectada" } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || 'Usuário',
          ip_address: 'client_ip',
          user_agent: navigator.userAgent
        }
      }
    });

    if (error) {
      await EnhancedSecurityService.logLoginAttempt(email, false, {
        error_message: error.message,
        action: 'registration_failed'
      });
      return { user: null, error };
    }

    if (data.user) {
      await EnhancedSecurityService.logAccountCreation(data.user.id, email);
      toast.success("Conta criada com sucesso! Verifique seu email para confirmação.");
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Erro no registro:", error);
    await EnhancedSecurityService.logSecurityEvent('registration_error', undefined, {
      email,
      error_message: error.message
    });
    return { user: null, error };
  }
}

/**
 * Login com logs de segurança aprimorados
 */
export async function loginUserSecure(email: string, password: string) {
  try {
    // Verificar atividade suspeita antes do login
    const hasSuspiciousActivity = await EnhancedSecurityService.checkSuspiciousActivity(email);
    
    if (hasSuspiciousActivity) {
      toast.error("Muitas tentativas de login falhadas. Conta temporariamente bloqueada.");
      return { user: null, error: { message: "Conta bloqueada temporariamente" } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Log da tentativa de login
    await EnhancedSecurityService.logLoginAttempt(email, !error, {
      user_id: data.user?.id,
      error_message: error?.message
    });

    if (error) {
      toast.error("Erro no login: " + error.message);
      return { user: null, error };
    }

    if (data.user) {
      toast.success("Login realizado com sucesso!");
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Erro no login:", error);
    await EnhancedSecurityService.logSecurityEvent('login_error', undefined, {
      email,
      error_message: error.message
    });
    return { user: null, error };
  }
}

/**
 * Alteração de senha com validação de segurança
 */
export async function changePasswordSecure(newPassword: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Validar força da nova senha
    const isSecure = await EnhancedSecurityService.isPasswordSecure(newPassword);
    
    if (!isSecure) {
      const issues = await EnhancedSecurityService.getPasswordFeedback(newPassword);
      toast.error("Nova senha não atende aos critérios de segurança", {
        description: issues.join(", ")
      });
      return { error: { message: "Senha não é segura" } };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    // Log da alteração de senha
    await EnhancedSecurityService.logPasswordChange(user.id);
    
    toast.success("Senha alterada com sucesso!");
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    toast.error("Erro ao alterar senha: " + error.message);
    return { error };
  }
}

/**
 * Obtém logs de segurança do usuário atual
 */
export async function getUserSecurityHistory(limit: number = 20) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    return await EnhancedSecurityService.getUserSecurityLogs(user.id, limit);
  } catch (error) {
    console.error("Erro ao buscar histórico de segurança:", error);
    return [];
  }
}
