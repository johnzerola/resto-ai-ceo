-- Criar tabela para armazenar dados detalhados de onboarding e perfil empresarial
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  owner_name TEXT,
  cnpj TEXT,
  average_monthly_revenue NUMERIC DEFAULT 0,
  average_ticket NUMERIC DEFAULT 0,
  desired_profit_margin NUMERIC DEFAULT 30,
  fixed_monthly_costs NUMERIC DEFAULT 0,
  variable_monthly_costs NUMERIC DEFAULT 0,
  weekly_operating_days INTEGER DEFAULT 6,
  daily_operating_hours TEXT DEFAULT '08:00-18:00',
  break_even_point NUMERIC DEFAULT 0,
  ideal_cmv_percentage NUMERIC DEFAULT 30,
  monthly_sales_target NUMERIC DEFAULT 0,
  ideal_net_margin NUMERIC DEFAULT 20,
  motivational_insights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their restaurant business profiles" 
ON public.business_profiles 
FOR ALL 
USING (restaurant_id IN (
  SELECT id FROM public.restaurants WHERE owner_id = auth.uid()  
));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_profiles_updated_at();

-- Adicionar campos faltantes na tabela restaurants se não existirem
DO $$
BEGIN
  -- Adicionar coluna owner_name se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'restaurants' AND column_name = 'owner_name') THEN
    ALTER TABLE public.restaurants ADD COLUMN owner_name TEXT;
  END IF;
  
  -- Adicionar coluna cnpj se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'restaurants' AND column_name = 'cnpj') THEN
    ALTER TABLE public.restaurants ADD COLUMN cnpj TEXT;
  END IF;
END $$;