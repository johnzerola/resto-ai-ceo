
-- Criação da tabela pricing_models para modelos de precificação por canal
CREATE TABLE IF NOT EXISTS pricing_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('salon', 'delivery', 'buffet', 'rodizio', 'ifood')),
  markup_percentage NUMERIC NOT NULL DEFAULT 250,
  delivery_fee NUMERIC DEFAULT 0,
  platform_commission NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(restaurant_id, channel)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_pricing_models_restaurant_id ON pricing_models(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_pricing_models_channel ON pricing_models(channel);
CREATE INDEX IF NOT EXISTS idx_pricing_models_active ON pricing_models(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pricing_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_models_updated_at_trigger
  BEFORE UPDATE ON pricing_models
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_models_updated_at();

-- Comentários para documentação
COMMENT ON TABLE pricing_models IS 'Modelos de precificação por canal de venda (salão, delivery, buffet, rodízio, iFood)';
COMMENT ON COLUMN pricing_models.channel IS 'Canal de venda: salon, delivery, buffet, rodizio, ifood';
COMMENT ON COLUMN pricing_models.markup_percentage IS 'Percentual de markup sobre o custo base';
COMMENT ON COLUMN pricing_models.delivery_fee IS 'Taxa de entrega fixa (aplicável ao delivery)';
COMMENT ON COLUMN pricing_models.platform_commission IS 'Comissão da plataforma (iFood, Uber Eats, etc)';
