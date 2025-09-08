-- Phase 1: System Audit & Database Optimization

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'developer', 'affiliate', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  restaurant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can manage roles" ON public.user_roles
FOR ALL USING (
  restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
);

-- Developer access permissions table
CREATE TABLE public.developer_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL,
  resource_access JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.developer_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view their permissions" ON public.developer_permissions
FOR SELECT USING (auth.uid() = user_id);

-- Branding assets table
CREATE TABLE public.branding_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'colors', 'typography', 'logos', 'components'
  asset_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.branding_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view branding assets" ON public.branding_assets
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Developers can manage branding assets" ON public.branding_assets
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'developer'
  )
);

-- Affiliate system tables
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own data" ON public.affiliates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own data" ON public.affiliates
FOR UPDATE USING (auth.uid() = user_id);

-- Affiliate referrals table
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id),
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  conversion_date TIMESTAMP WITH TIME ZONE,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their referrals" ON public.affiliate_referrals
FOR SELECT USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Discount coupons table
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  affiliate_id UUID REFERENCES public.affiliates(id),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active coupons" ON public.discount_coupons
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Feedback system tables
CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  feedback_type TEXT NOT NULL, -- 'reaction', 'survey', 'bug_report', 'suggestion'
  content JSONB NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit feedback" ON public.feedback_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Developers can view all feedback" ON public.feedback_submissions
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'developer'
  )
);

-- System monitoring table
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restaurant_id UUID
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view system metrics" ON public.system_metrics
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'developer'
  )
);

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_discount_coupons_code ON public.discount_coupons(code);
CREATE INDEX idx_feedback_type ON public.feedback_submissions(feedback_type);
CREATE INDEX idx_system_metrics_type ON public.system_metrics(metric_type);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to generate affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT 'AFF' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
$$;

-- Trigger to auto-generate affiliate codes
CREATE OR REPLACE FUNCTION public.set_affiliate_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.affiliate_code IS NULL THEN
    NEW.affiliate_code := public.generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_affiliate_code_trigger
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_affiliate_code();

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_branding_assets_updated_at
  BEFORE UPDATE ON public.branding_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();