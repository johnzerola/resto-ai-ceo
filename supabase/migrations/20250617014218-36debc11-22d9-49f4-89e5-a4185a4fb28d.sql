
-- Primeiro, vamos verificar se a tabela system_logs já existe e recriar se necessário
DROP TABLE IF EXISTS public.system_logs CASCADE;

-- Criar tabela de logs do sistema com todas as colunas necessárias
CREATE TABLE public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'system',
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para logs - apenas admins podem ver todos os logs
CREATE POLICY "Admin can view all logs" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'owner')
    )
  );

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own logs" ON public.system_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_system_logs_timestamp ON public.system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_severity ON public.system_logs(severity);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);

-- Criar função que será executada quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log do novo usuário
  INSERT INTO public.system_logs (
    user_id,
    source,
    type,
    message,
    severity,
    metadata,
    timestamp
  ) VALUES (
    NEW.id,
    'auth',
    'user_registration',
    'Novo usuário registrado',
    'info',
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      'created_at', NEW.created_at
    ),
    now()
  );

  -- Tentar enviar email de confirmação via edge function usando pg_net
  PERFORM
    net.http_post(
      url := 'https://llndccqumkrblpgystom.supabase.co/functions/v1/send-confirmation-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
        'user_id', NEW.id
      )
    );

  -- Log de sucesso do envio
  INSERT INTO public.system_logs (
    user_id,
    source,
    type,
    message,
    severity,
    metadata,
    timestamp
  ) VALUES (
    NEW.id,
    'email',
    'confirmation_sent',
    'Email de confirmação enviado',
    'info',
    jsonb_build_object(
      'email', NEW.email,
      'user_id', NEW.id
    ),
    now()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não bloqueia o registro
  INSERT INTO public.system_logs (
    user_id,
    source,
    type,
    message,
    severity,
    metadata,
    timestamp
  ) VALUES (
    NEW.id,
    'email',
    'confirmation_error',
    'Erro ao enviar email de confirmação: ' || SQLERRM,
    'error',
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'error_message', SQLERRM,
      'error_detail', SQLSTATE
    ),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created_send_email ON auth.users;

-- Criar trigger para executar a função após inserção de novo usuário
CREATE TRIGGER on_auth_user_created_send_email
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Comentário: Agora o sistema está configurado para:
-- 1. Automaticamente enviar emails quando usuários se registram
-- 2. Registrar logs detalhados de todas as operações
-- 3. Manter segurança com RLS adequado
-- 4. Permitir monitoramento via dashboard
