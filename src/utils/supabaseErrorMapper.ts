import { AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export function mapSupabaseAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();
  
  // Mapear erros específicos do Supabase para mensagens amigáveis em PT-BR
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'E-mail já cadastrado';
  }
  
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Credenciais inválidas';
  }
  
  if (message.includes('email not confirmed') || 
      message.includes('user not found') ||
      message.includes('signup disabled')) {
    return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  }
  
  if (message.includes('unable to validate email redirect') || 
      message.includes('redirect url')) {
    return 'URL de redirecionamento não permitida. Confira a configuração no Supabase → Auth → URL Configuration';
  }
  
  if (message.includes('weak password') || message.includes('password')) {
    return 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números.';
  }
  
  if (message.includes('email rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Problema de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Fallback para outros erros
  return `Erro inesperado: ${error.message}`;
}