
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PasswordValidationResult {
  score: number;
  max_score: number;
  is_strong: boolean;
  issues: string[];
}

export interface SecurityEventDetails {
  event_type: string;
  user_id?: string;
  details?: Record<string, any>;
}

export class EnhancedSecurityService {
  /**
   * Valida a força da senha usando a função do Supabase
   */
  static async validatePasswordStrength(password: string): Promise<PasswordValidationResult | null> {
    try {
      const { data, error } = await supabase.rpc('validate_password_strength', {
        password_text: password
      });

      if (error) {
        console.error('Erro ao validar senha:', error);
        return null;
      }

      return data as PasswordValidationResult;
    } catch (error) {
      console.error('Erro na validação de senha:', error);
      return null;
    }
  }

  /**
   * Log de eventos de segurança usando a função do Supabase
   */
  static async logSecurityEvent(
    eventType: string, 
    userId?: string, 
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        event_type: eventType,
        user_id: userId || null,
        details: details
      });

      if (error) {
        console.error('Erro ao registrar evento de segurança:', error);
      }
    } catch (error) {
      console.error('Erro no log de segurança:', error);
    }
  }

  /**
   * Verifica se uma senha atende aos critérios mínimos de segurança
   */
  static async isPasswordSecure(password: string): Promise<boolean> {
    const validation = await this.validatePasswordStrength(password);
    return validation?.is_strong || false;
  }

  /**
   * Obtém feedback detalhado sobre a senha
   */
  static async getPasswordFeedback(password: string): Promise<string[]> {
    const validation = await this.validatePasswordStrength(password);
    return validation?.issues || [];
  }

  /**
   * Log de tentativa de login
   */
  static async logLoginAttempt(email: string, success: boolean, details: Record<string, any> = {}): Promise<void> {
    const eventType = success ? 'login_success' : 'login_failed';
    await this.logSecurityEvent(eventType, undefined, {
      email,
      success,
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Log de criação de conta
   */
  static async logAccountCreation(userId: string, email: string): Promise<void> {
    await this.logSecurityEvent('account_created', userId, {
      email,
      registration_method: 'email_password',
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de alteração de senha
   */
  static async logPasswordChange(userId: string): Promise<void> {
    await this.logSecurityEvent('password_changed', userId, {
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtém IP do cliente (simulado para demonstração)
   */
  private static getClientIP(): string {
    // Em produção, isso seria obtido do servidor
    return 'client_ip';
  }

  /**
   * Busca logs de segurança do usuário
   */
  static async getUserSecurityLogs(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('source', 'security')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar logs de segurança:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta de logs:', error);
      return [];
    }
  }

  /**
   * Monitora tentativas de login suspeitas
   */
  static async checkSuspiciousActivity(email: string): Promise<boolean> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('source', 'security')
        .eq('type', 'login_failed')
        .gte('timestamp', oneHourAgo.toISOString())
        .contains('metadata', { email });

      if (error) {
        console.error('Erro ao verificar atividade suspeita:', error);
        return false;
      }

      const failedAttempts = data?.length || 0;
      
      if (failedAttempts >= 5) {
        await this.logSecurityEvent('suspicious_activity_detected', undefined, {
          email,
          failed_attempts: failedAttempts,
          time_window: '1_hour',
          action: 'account_temporarily_blocked'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro na verificação de atividade suspeita:', error);
      return false;
    }
  }
}
