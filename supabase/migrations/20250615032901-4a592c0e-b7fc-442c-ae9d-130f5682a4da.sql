
-- Atualizar a assinatura do usuário para plano profissional
UPDATE public.subscribers 
SET 
  subscription_tier = 'profissional',
  subscribed = true,
  plan_status = 'active',
  subscription_end = (CURRENT_DATE + INTERVAL '30 days'),
  updated_at = NOW()
WHERE email = 'esdrasbalves10@gmail.com';

-- Se o registro não existir, criar um novo
INSERT INTO public.subscribers (
  user_id,
  email,
  subscription_tier,
  subscribed,
  plan_status,
  subscription_end,
  created_at,
  updated_at
)
SELECT 
  id,
  'esdrasbalves10@gmail.com',
  'profissional',
  true,
  'active',
  (CURRENT_DATE + INTERVAL '30 days'),
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'esdrasbalves10@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  subscription_tier = 'profissional',
  subscribed = true,
  plan_status = 'active',
  subscription_end = (CURRENT_DATE + INTERVAL '30 days'),
  updated_at = NOW();
