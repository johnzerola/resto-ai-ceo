
-- Verificar dados do usuário na tabela subscribers
SELECT 
    id,
    email,
    subscription_tier,
    plan_status,
    subscribed,
    subscription_end,
    created_at,
    updated_at,
    user_id,
    stripe_customer_id
FROM public.subscribers 
WHERE email = 'esdrasbalves10@gmail.com'
ORDER BY created_at DESC;

-- Verificar se existe mais de um registro para este email
SELECT COUNT(*) as total_records
FROM public.subscribers 
WHERE email = 'esdrasbalves10@gmail.com';

-- Verificar estrutura da tabela para garantir que os campos estão corretos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscribers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
