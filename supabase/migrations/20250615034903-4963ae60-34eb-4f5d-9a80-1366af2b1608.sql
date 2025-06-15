
-- Atualizar o registro existente para o email esdrasbalves10@gmail.com
UPDATE public.subscribers 
SET 
  subscription_tier = 'profissional',
  subscribed = true,
  plan_status = 'active',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = NOW()
WHERE email = 'esdrasbalves10@gmail.com';

-- Verificar se a atualização foi aplicada
SELECT 
    id,
    email,
    subscription_tier,
    plan_status,
    subscribed,
    subscription_end,
    user_id
FROM public.subscribers 
WHERE email = 'esdrasbalves10@gmail.com';
