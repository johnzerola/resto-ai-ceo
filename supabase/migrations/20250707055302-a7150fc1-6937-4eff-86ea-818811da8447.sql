-- Clean Slate Onboarding Migration
-- Adicionar campos de controle de onboarding e limpeza automática

-- 1. Adicionar flag de onboarding completo na tabela profiles (se não existir, criar)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'owner',
  status TEXT DEFAULT 'active',
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos se a tabela já existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_complete') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Função para limpar todos os dados de um usuário (Clean Slate)
CREATE OR REPLACE FUNCTION public.clean_user_data(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log da limpeza
  INSERT INTO public.system_logs (
    user_id, source, type, message, severity, metadata, timestamp
  ) VALUES (
    user_uuid, 'onboarding', 'data_cleanup', 'Limpeza automática de dados iniciada', 'info',
    jsonb_build_object('user_id', user_uuid, 'timestamp', NOW()), NOW()
  );

  -- Limpar dados de restaurantes (mantém o registro mas limpa dados associados)
  DELETE FROM public.goals WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.cash_flow WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.insumos WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.pratos WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.movimentacao_estoque WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.contas_a_pagar WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.contas_a_receber WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  -- Reset configurações para padrão
  DELETE FROM public.configuracoes_restaurante WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );
  
  DELETE FROM public.business_profiles WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = user_uuid
  );

  -- Log de conclusão
  INSERT INTO public.system_logs (
    user_id, source, type, message, severity, metadata, timestamp
  ) VALUES (
    user_uuid, 'onboarding', 'data_cleanup_complete', 'Limpeza automática concluída', 'info',
    jsonb_build_object('user_id', user_uuid, 'cleaned_at', NOW()), NOW()
  );
END;
$$;

-- 5. Função para detectar usuários novos e limpar dados automaticamente
CREATE OR REPLACE FUNCTION public.auto_clean_new_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user RECORD;
BEGIN
  -- Encontrar usuários criados nas últimas 24 horas que ainda não completaram onboarding
  FOR new_user IN 
    SELECT p.id, p.created_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.created_at > NOW() - INTERVAL '24 hours'
    AND (p.onboarding_complete = false OR p.onboarding_complete IS NULL)
  LOOP
    -- Limpar dados do usuário novo
    PERFORM public.clean_user_data(new_user.id);
  END LOOP;
END;
$$;

-- 6. Trigger para criar perfil automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, onboarding_complete, onboarding_step, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    false,
    0,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 7. Função para validar dados de negócio obrigatórios
CREATE OR REPLACE FUNCTION public.validate_business_data(
  restaurant_uuid UUID,
  selling_price NUMERIC,
  cost_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::jsonb;
  errors TEXT[] := '{}';
BEGIN
  -- Validar preço de venda maior que custo
  IF selling_price <= cost_price THEN
    errors := array_append(errors, 'Preço de venda deve ser maior que o custo');
  END IF;
  
  -- Validar valores positivos
  IF selling_price <= 0 THEN
    errors := array_append(errors, 'Preço de venda deve ser positivo');
  END IF;
  
  IF cost_price < 0 THEN
    errors := array_append(errors, 'Custo não pode ser negativo');
  END IF;
  
  -- Construir resultado
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', array_to_json(errors)
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 8. Atualizar triggers existentes de updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();