-- Criar função para configurar trial de 7 dias para novos usuários
CREATE OR REPLACE FUNCTION public.setup_7_day_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Criar perfil do usuário com trial de 7 dias
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    role, 
    status,
    trial_start,
    trial_end,
    plan_status
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    'owner',
    'active',
    NOW(),
    NOW() + INTERVAL '7 days',
    'trial'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    email = NEW.email,
    updated_at = NOW();
  
  -- Criar assinatura com trial de 7 dias
  INSERT INTO public.subscribers (
    user_id,
    email,
    subscription_tier,
    subscribed,
    plan_status,
    trial_start,
    trial_end,
    trial_used,
    subscription_end,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'free',
    true,
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days',
    false,
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    trial_start = CASE 
      WHEN subscribers.trial_used = false THEN NOW()
      ELSE subscribers.trial_start
    END,
    trial_end = CASE 
      WHEN subscribers.trial_used = false THEN NOW() + INTERVAL '7 days'
      ELSE subscribers.trial_end
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger para setup de trial de 7 dias
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.setup_7_day_trial();

-- Adicionar colunas necessárias à tabela profiles se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_start') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_start TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_end') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'plan_status') THEN
    ALTER TABLE public.profiles ADD COLUMN plan_status TEXT DEFAULT 'trial';
  END IF;
END $$;