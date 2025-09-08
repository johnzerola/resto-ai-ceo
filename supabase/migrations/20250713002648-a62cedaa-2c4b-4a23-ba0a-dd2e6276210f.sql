-- Criar tabela para sistema de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID,
  type TEXT NOT NULL, -- 'trial_warning', 'trial_expired', 'payment_due', 'renewal_reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update notifications" ON public.notifications
  FOR UPDATE USING (true);

-- Função para bloquear usuários expirados
CREATE OR REPLACE FUNCTION public.block_expired_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Bloquear usuários com trial expirado
  UPDATE public.profiles 
  SET 
    status = 'suspended',
    plan_status = 'trial_expired',
    updated_at = NOW()
  WHERE 
    trial_end <= NOW() 
    AND plan_status = 'trial'
    AND status != 'suspended';

  -- Bloquear assinantes com plano expirado
  UPDATE public.subscribers 
  SET 
    plan_status = 'expired',
    subscribed = false,
    updated_at = NOW()
  WHERE 
    subscription_end <= NOW() 
    AND plan_status NOT IN ('expired', 'cancelled')
    AND subscribed = true;

  -- Log da operação
  INSERT INTO public.system_logs (
    source, type, message, severity, metadata, timestamp
  ) VALUES (
    'system', 'auto_suspend', 
    'Bloqueio automático de usuários expirados executado',
    'info',
    jsonb_build_object(
      'profiles_suspended', (
        SELECT COUNT(*) FROM public.profiles 
        WHERE status = 'suspended' AND updated_at::DATE = NOW()::DATE
      ),
      'subscribers_expired', (
        SELECT COUNT(*) FROM public.subscribers 
        WHERE plan_status = 'expired' AND updated_at::DATE = NOW()::DATE
      )
    ),
    NOW()
  );
END;
$$;

-- Função para gerar notificações automáticas
CREATE OR REPLACE FUNCTION public.generate_expiration_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Avisos 3 dias antes do vencimento do trial
  INSERT INTO public.notifications (
    user_id, tenant_id, type, title, message, scheduled_for, metadata
  )
  SELECT 
    p.id,
    r.tenant_id,
    'trial_warning',
    'Seu trial expira em 3 dias',
    'Seu período de teste gratuito expira em 3 dias. Assine agora para continuar usando todos os recursos.',
    NOW(),
    jsonb_build_object(
      'days_remaining', 3,
      'trial_end', p.trial_end,
      'action_required', true
    )
  FROM public.profiles p
  LEFT JOIN public.restaurants r ON r.owner_id = p.id
  WHERE 
    p.trial_end BETWEEN NOW() + INTERVAL '3 days' - INTERVAL '1 hour' 
    AND NOW() + INTERVAL '3 days' + INTERVAL '1 hour'
    AND p.plan_status = 'trial'
    AND p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = p.id 
      AND n.type = 'trial_warning' 
      AND n.created_at::DATE = NOW()::DATE
    );

  -- Avisos 1 dia antes do vencimento
  INSERT INTO public.notifications (
    user_id, tenant_id, type, title, message, scheduled_for, metadata
  )
  SELECT 
    p.id,
    r.tenant_id,
    'trial_urgent',
    'Seu trial expira AMANHÃ!',
    'Última chance! Seu período de teste expira amanhã. Assine agora para não perder acesso.',
    NOW(),
    jsonb_build_object(
      'days_remaining', 1,
      'trial_end', p.trial_end,
      'urgent', true
    )
  FROM public.profiles p
  LEFT JOIN public.restaurants r ON r.owner_id = p.id
  WHERE 
    p.trial_end BETWEEN NOW() + INTERVAL '1 day' - INTERVAL '1 hour' 
    AND NOW() + INTERVAL '1 day' + INTERVAL '1 hour'
    AND p.plan_status = 'trial'
    AND p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = p.id 
      AND n.type = 'trial_urgent' 
      AND n.created_at::DATE = NOW()::DATE
    );

  -- Notificação de expiração
  INSERT INTO public.notifications (
    user_id, tenant_id, type, title, message, scheduled_for, metadata
  )
  SELECT 
    p.id,
    r.tenant_id,
    'trial_expired',
    'Seu trial expirou',
    'Seu período de teste expirou. Assine agora para reativar sua conta e continuar usando nossos serviços.',
    NOW(),
    jsonb_build_object(
      'trial_end', p.trial_end,
      'action_required', true,
      'account_suspended', true
    )
  FROM public.profiles p
  LEFT JOIN public.restaurants r ON r.owner_id = p.id
  WHERE 
    p.trial_end <= NOW()
    AND p.plan_status = 'trial'
    AND p.status = 'suspended'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = p.id 
      AND n.type = 'trial_expired' 
      AND n.created_at::DATE = NOW()::DATE
    );
END;
$$;

-- Trigger para executar bloqueio automático
CREATE OR REPLACE FUNCTION public.auto_block_on_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o trial_end passou e ainda está ativo, bloquear
  IF NEW.trial_end <= NOW() AND OLD.plan_status = 'trial' AND NEW.plan_status = 'trial' THEN
    NEW.plan_status := 'trial_expired';
    NEW.status := 'suspended';
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger no profiles
DROP TRIGGER IF EXISTS trigger_auto_block_expired_profiles ON public.profiles;
CREATE TRIGGER trigger_auto_block_expired_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_block_on_expiration();