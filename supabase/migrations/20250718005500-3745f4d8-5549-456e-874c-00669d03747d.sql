-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE movement_type AS ENUM ('entrada', 'saida', 'ajuste');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');

-- Create expense_keywords table for CMV classification
CREATE TABLE public.expense_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  impacts_cmv BOOLEAN DEFAULT false,
  impacts_dre BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default expense keywords
INSERT INTO public.expense_keywords (keyword, category, impacts_cmv, impacts_dre) VALUES
('ingrediente', 'cmv_alimentos', true, true),
('carne', 'cmv_alimentos', true, true),
('frango', 'cmv_alimentos', true, true),
('peixe', 'cmv_alimentos', true, true),
('verdura', 'cmv_alimentos', true, true),
('legume', 'cmv_alimentos', true, true),
('tempero', 'cmv_alimentos', true, true),
('bebida', 'cmv_bebidas', true, true),
('refrigerante', 'cmv_bebidas', true, true),
('suco', 'cmv_bebidas', true, true),
('cerveja', 'cmv_bebidas', true, true),
('vinho', 'cmv_bebidas', true, true),
('aluguel', 'despesas_fixas', false, true),
('energia', 'despesas_fixas', false, true),
('agua', 'despesas_fixas', false, true),
('internet', 'despesas_fixas', false, true),
('salario', 'despesas_pessoal', false, true),
('funcionario', 'despesas_pessoal', false, true),
('marketing', 'despesas_marketing', false, true),
('propaganda', 'despesas_marketing', false, true),
('delivery', 'despesas_delivery', false, true),
('ifood', 'despesas_delivery', false, true),
('uber', 'despesas_delivery', false, true);

-- Create subscribers table enhancements for multitenant
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS phone_numbers TEXT[];
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false;

-- Create whatsapp_integrations table
CREATE TABLE public.whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  is_authorized BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, phone_number)
);

-- Create stock_movements table
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  movement_type movement_type NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT DEFAULT 'un',
  current_stock DECIMAL,
  cost_per_unit DECIMAL,
  total_cost DECIMAL,
  notes TEXT,
  whatsapp_message_id TEXT,
  phone_number TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create whatsapp_transactions table
CREATE TABLE public.whatsapp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  category TEXT,
  auto_category TEXT,
  impacts_cmv BOOLEAN DEFAULT false,
  impacts_dre BOOLEAN DEFAULT true,
  whatsapp_message_id TEXT,
  phone_number TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "expense_keywords_public_read" ON public.expense_keywords
  FOR SELECT USING (true);

CREATE POLICY "whatsapp_integrations_tenant_access" ON public.whatsapp_integrations
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "stock_movements_tenant_access" ON public.stock_movements
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "whatsapp_transactions_tenant_access" ON public.whatsapp_transactions
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Create functions
CREATE OR REPLACE FUNCTION public.is_plan_active(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  subscriber_record RECORD;
BEGIN
  SELECT * INTO subscriber_record
  FROM public.subscribers
  WHERE email = user_email;
  
  IF subscriber_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if subscription is active and not expired
  RETURN subscriber_record.subscribed = true 
    AND subscriber_record.plan_status = 'active'
    AND (subscriber_record.subscription_end IS NULL OR subscriber_record.subscription_end > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.recalc_stock_levels(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update inventory table with latest stock levels from movements
  INSERT INTO public.inventory (tenant_id, name, quantity, updated_at)
  SELECT 
    sm.tenant_id,
    sm.item_name,
    COALESCE(SUM(
      CASE 
        WHEN sm.movement_type = 'entrada' THEN sm.quantity
        WHEN sm.movement_type = 'saida' THEN -sm.quantity
        ELSE 0
      END
    ), 0) as current_quantity,
    NOW()
  FROM public.stock_movements sm
  WHERE sm.tenant_id = p_tenant_id
  GROUP BY sm.tenant_id, sm.item_name
  ON CONFLICT (tenant_id, name) 
  DO UPDATE SET 
    quantity = EXCLUDED.quantity,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.recalc_dre(p_tenant_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS VOID AS $$
DECLARE
  v_receita_total DECIMAL := 0;
  v_cmv_total DECIMAL := 0;
  v_despesas_operacionais DECIMAL := 0;
BEGIN
  -- Calculate revenue from whatsapp transactions
  SELECT COALESCE(SUM(amount), 0) INTO v_receita_total
  FROM public.whatsapp_transactions
  WHERE tenant_id = p_tenant_id
    AND transaction_type = 'income'
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year;
  
  -- Calculate CMV
  SELECT COALESCE(SUM(amount), 0) INTO v_cmv_total
  FROM public.whatsapp_transactions
  WHERE tenant_id = p_tenant_id
    AND transaction_type = 'expense'
    AND impacts_cmv = true
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year;
  
  -- Calculate operational expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_despesas_operacionais
  FROM public.whatsapp_transactions
  WHERE tenant_id = p_tenant_id
    AND transaction_type = 'expense'
    AND impacts_cmv = false
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND EXTRACT(YEAR FROM created_at) = p_year;
  
  -- Insert or update DRE
  INSERT INTO public.dre_mensal (
    restaurant_id, mes, ano,
    receita_bruta, receita_liquida,
    cmv_total, lucro_bruto,
    despesas_outras, resultado_liquido,
    margem_bruta_percentual, margem_liquida_percentual
  ) VALUES (
    (SELECT id FROM public.restaurants WHERE tenant_id = p_tenant_id LIMIT 1),
    p_month, p_year,
    v_receita_total, v_receita_total,
    v_cmv_total, v_receita_total - v_cmv_total,
    v_despesas_operacionais, v_receita_total - v_cmv_total - v_despesas_operacionais,
    CASE WHEN v_receita_total > 0 THEN ((v_receita_total - v_cmv_total) / v_receita_total) * 100 ELSE 0 END,
    CASE WHEN v_receita_total > 0 THEN ((v_receita_total - v_cmv_total - v_despesas_operacionais) / v_receita_total) * 100 ELSE 0 END
  )
  ON CONFLICT (restaurant_id, mes, ano)
  DO UPDATE SET
    receita_bruta = EXCLUDED.receita_bruta,
    receita_liquida = EXCLUDED.receita_liquida,
    cmv_total = EXCLUDED.cmv_total,
    lucro_bruto = EXCLUDED.lucro_bruto,
    despesas_outras = EXCLUDED.despesas_outras,
    resultado_liquido = EXCLUDED.resultado_liquido,
    margem_bruta_percentual = EXCLUDED.margem_bruta_percentual,
    margem_liquida_percentual = EXCLUDED.margem_liquida_percentual,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_summary(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_cash_balance DECIMAL;
  v_cmv_percentage DECIMAL;
  v_critical_stock INTEGER;
  v_operational_expenses DECIMAL;
  result JSON;
BEGIN
  -- Calculate current cash balance
  SELECT COALESCE(SUM(
    CASE 
      WHEN transaction_type = 'income' THEN amount
      WHEN transaction_type = 'expense' THEN -amount
      ELSE 0
    END
  ), 0) INTO v_cash_balance
  FROM public.whatsapp_transactions
  WHERE tenant_id = p_tenant_id;
  
  -- Calculate CMV percentage for current month
  WITH month_data AS (
    SELECT 
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN transaction_type = 'expense' AND impacts_cmv = true THEN amount ELSE 0 END) as cmv
    FROM public.whatsapp_transactions
    WHERE tenant_id = p_tenant_id
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  )
  SELECT CASE WHEN revenue > 0 THEN (cmv / revenue) * 100 ELSE 0 END
  INTO v_cmv_percentage
  FROM month_data;
  
  -- Count critical stock items (quantity <= minimum_stock)
  SELECT COUNT(*) INTO v_critical_stock
  FROM public.inventory
  WHERE tenant_id = p_tenant_id
    AND quantity <= COALESCE(minimum_stock, 0);
  
  -- Calculate operational expenses for current month
  SELECT COALESCE(SUM(amount), 0) INTO v_operational_expenses
  FROM public.whatsapp_transactions
  WHERE tenant_id = p_tenant_id
    AND transaction_type = 'expense'
    AND impacts_cmv = false
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Build result JSON
  result := json_build_object(
    'cash_balance', v_cash_balance,
    'cmv_percentage', COALESCE(v_cmv_percentage, 0),
    'critical_stock_count', v_critical_stock,
    'operational_expenses', v_operational_expenses,
    'generated_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_stock_movements_tenant_created ON public.stock_movements(tenant_id, created_at DESC);
CREATE INDEX idx_whatsapp_transactions_tenant_created ON public.whatsapp_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_whatsapp_transactions_category ON public.whatsapp_transactions(tenant_id, category, created_at DESC);
CREATE INDEX idx_expense_keywords_category ON public.expense_keywords(category, impacts_cmv);

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_whatsapp_integrations_updated_at
  BEFORE UPDATE ON public.whatsapp_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions to service role
GRANT ALL ON public.expense_keywords TO service_role;
GRANT ALL ON public.whatsapp_integrations TO service_role;
GRANT ALL ON public.stock_movements TO service_role;
GRANT ALL ON public.whatsapp_transactions TO service_role;