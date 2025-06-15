
-- 1. Atualizar tabela subscribers para ter estrutura completa
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}';

-- 2. Criar tabela de planos padronizada
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  access_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela de uso de IA
CREATE TABLE IF NOT EXISTS public.ia_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_used INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  plan_limit INTEGER DEFAULT 0,
  feature_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar tabela de logs de webhook para n8n
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB,
  response JSONB,
  webhook_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Criar tabela de logs do sistema
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Inserir planos padrão
INSERT INTO public.plans (plan_id, name, price, features, limits, access_level) VALUES 
('free', 'Gratuito', 0, 
 '{"hasAdvancedReports": false, "hasFullAIAssistant": false, "hasInventoryManagement": false, "hasFinancialAnalysis": false, "hasTeamManagement": false, "hasPrioritySupport": false, "hasSimuladorCenarios": false}',
 '{"maxRestaurants": 1, "menuItems": 50, "cashFlowEntries": 100, "teamMembers": 1, "aiMessages": 10}',
 1),
('essencial', 'Essencial', 97, 
 '{"hasAdvancedReports": true, "hasFullAIAssistant": false, "hasInventoryManagement": true, "hasFinancialAnalysis": true, "hasTeamManagement": false, "hasPrioritySupport": false, "hasSimuladorCenarios": false}',
 '{"maxRestaurants": 2, "menuItems": 500, "cashFlowEntries": 1000, "teamMembers": 3, "aiMessages": 100}',
 2),
('profissional', 'Profissional', 197, 
 '{"hasAdvancedReports": true, "hasFullAIAssistant": true, "hasInventoryManagement": true, "hasFinancialAnalysis": true, "hasTeamManagement": true, "hasPrioritySupport": true, "hasSimuladorCenarios": true}',
 '{"maxRestaurants": 5, "menuItems": -1, "cashFlowEntries": -1, "teamMembers": 10, "aiMessages": -1}',
 3)
ON CONFLICT (plan_id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  access_level = EXCLUDED.access_level,
  updated_at = now();

-- 7. Habilitar RLS nas novas tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS
CREATE POLICY "Plans são públicos para leitura" ON public.plans FOR SELECT TO public USING (true);

CREATE POLICY "Usuários podem ver seu próprio uso de IA" ON public.ia_usage 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio uso de IA" ON public.ia_usage 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios webhook logs" ON public.webhook_logs 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir webhook logs" ON public.webhook_logs 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Sistema pode inserir system logs" ON public.system_logs 
FOR INSERT WITH CHECK (true);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ia_usage_user_date ON public.ia_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON public.webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON public.system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON public.system_logs(severity);

-- 10. Atualizar função de trigger para tabelas com updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Adicionar triggers para updated_at
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON public.plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Adicionar campos ausentes em tabelas existentes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 13. Atualizar subscribers com dados mais consistentes
UPDATE public.subscribers 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL OR subscription_tier = '';

-- 14. Criar tabela para armazenar configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. Inserir configurações padrão do sistema
INSERT INTO public.system_config (key, value, description) VALUES 
('ai_default_limits', '{"free": 10, "essencial": 100, "profissional": -1}', 'Limites padrão de mensagens IA por plano'),
('webhook_retry_attempts', '3', 'Número de tentativas para webhooks falhados'),
('system_maintenance_mode', 'false', 'Modo de manutenção do sistema'),
('default_markup_percentage', '250', 'Markup padrão para precificação')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 16. Habilitar RLS na tabela de configuração
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System config é público para leitura" ON public.system_config FOR SELECT TO public USING (true);
