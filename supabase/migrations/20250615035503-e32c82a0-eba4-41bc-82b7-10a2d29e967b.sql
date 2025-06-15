
-- Forçar atualização do plano para profissional
UPDATE public.subscribers 
SET 
  subscription_tier = 'profissional',
  subscribed = true,
  plan_status = 'active',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = NOW()
WHERE email = 'esdrasbalves10@gmail.com';

-- Se por algum motivo não existir, inserir o registro
INSERT INTO public.subscribers (
  email,
  subscription_tier,
  subscribed,
  plan_status,
  subscription_end,
  created_at,
  updated_at
)
SELECT 
  'esdrasbalves10@gmail.com',
  'profissional',
  true,
  'active',
  '2025-12-31 23:59:59+00',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscribers WHERE email = 'esdrasbalves10@gmail.com'
);

-- Verificar o resultado final
SELECT 
    id,
    email,
    subscription_tier,
    plan_status,
    subscribed,
    subscription_end,
    user_id,
    created_at,
    updated_at
FROM public.subscribers 
WHERE email = 'esdrasbalves10@gmail.com';
