
-- Criar tabela para DRE completo com estrutura contábil padrão
CREATE TABLE IF NOT EXISTS public.dre_mensal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  
  -- RECEITAS
  receita_bruta NUMERIC DEFAULT 0,
  deducoes_vendas NUMERIC DEFAULT 0, -- Devoluções, descontos
  receita_liquida NUMERIC DEFAULT 0,
  
  -- CUSTOS
  cmv_total NUMERIC DEFAULT 0,
  cmv_alimentos NUMERIC DEFAULT 0,
  cmv_bebidas NUMERIC DEFAULT 0,
  
  -- LUCRO BRUTO
  lucro_bruto NUMERIC DEFAULT 0,
  
  -- DESPESAS OPERACIONAIS
  despesas_pessoal NUMERIC DEFAULT 0,
  despesas_aluguel NUMERIC DEFAULT 0,
  despesas_marketing NUMERIC DEFAULT 0,
  despesas_delivery NUMERIC DEFAULT 0,
  despesas_administrativas NUMERIC DEFAULT 0,
  despesas_outras NUMERIC DEFAULT 0,
  
  -- EBITDA e RESULTADO
  ebitda NUMERIC DEFAULT 0,
  resultado_liquido NUMERIC DEFAULT 0,
  
  -- MÉTRICAS
  margem_bruta_percentual NUMERIC DEFAULT 0,
  margem_liquida_percentual NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(restaurant_id, mes, ano)
);

-- Criar tabela para controle de estoque em tempo real
CREATE TABLE IF NOT EXISTS public.movimentacao_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  insumo_id UUID REFERENCES public.insumos(id),
  tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida', 'perda', 'ajuste')),
  quantidade NUMERIC NOT NULL,
  preco_unitario NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  motivo TEXT,
  documento TEXT,
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usuario_responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para KPIs essenciais
CREATE TABLE IF NOT EXISTS public.kpis_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  data DATE NOT NULL,
  
  -- VENDAS
  receita_total NUMERIC DEFAULT 0,
  quantidade_pratos_vendidos INTEGER DEFAULT 0,
  ticket_medio NUMERIC DEFAULT 0,
  
  -- CUSTOS
  cmv_dia NUMERIC DEFAULT 0,
  cmv_percentual NUMERIC DEFAULT 0,
  
  -- OPERACIONAL
  despesas_dia NUMERIC DEFAULT 0,
  lucro_dia NUMERIC DEFAULT 0,
  margem_dia NUMERIC DEFAULT 0,
  
  -- DELIVERY
  receita_delivery NUMERIC DEFAULT 0,
  taxa_delivery_paga NUMERIC DEFAULT 0,
  
  -- METAS
  meta_receita NUMERIC DEFAULT 0,
  percentual_meta_atingido NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(restaurant_id, data)
);

-- Criar tabela para alertas automáticos
CREATE TABLE IF NOT EXISTS public.alertas_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id),
  tipo_alerta TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  dados_contexto JSONB DEFAULT '{}',
  resolvido BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Função para calcular DRE automaticamente
CREATE OR REPLACE FUNCTION calcular_dre_mensal(restaurant_uuid UUID, mes_param INTEGER, ano_param INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_receita_bruta NUMERIC := 0;
  v_deducoes NUMERIC := 0;
  v_cmv_total NUMERIC := 0;
  v_despesas_total NUMERIC := 0;
BEGIN
  -- Calcular receita bruta do mês
  SELECT COALESCE(SUM(amount), 0) INTO v_receita_bruta
  FROM public.cash_flow
  WHERE restaurant_id = restaurant_uuid
    AND type = 'income'
    AND EXTRACT(MONTH FROM date) = mes_param
    AND EXTRACT(YEAR FROM date) = ano_param;
  
  -- Calcular CMV do mês (aproximado pelos custos)
  SELECT COALESCE(SUM(amount), 0) INTO v_cmv_total
  FROM public.cash_flow
  WHERE restaurant_id = restaurant_uuid
    AND type = 'expense'
    AND category IN ('ingredientes', 'alimentos', 'bebidas', 'insumos')
    AND EXTRACT(MONTH FROM date) = mes_param
    AND EXTRACT(YEAR FROM date) = ano_param;
  
  -- Calcular despesas operacionais
  SELECT COALESCE(SUM(amount), 0) INTO v_despesas_total
  FROM public.cash_flow
  WHERE restaurant_id = restaurant_uuid
    AND type = 'expense'
    AND category NOT IN ('ingredientes', 'alimentos', 'bebidas', 'insumos')
    AND EXTRACT(MONTH FROM date) = mes_param
    AND EXTRACT(YEAR FROM date) = ano_param;
  
  -- Inserir ou atualizar DRE
  INSERT INTO public.dre_mensal (
    restaurant_id, mes, ano,
    receita_bruta, receita_liquida,
    cmv_total, lucro_bruto,
    despesas_outras, ebitda, resultado_liquido,
    margem_bruta_percentual, margem_liquida_percentual
  ) VALUES (
    restaurant_uuid, mes_param, ano_param,
    v_receita_bruta, v_receita_bruta - v_deducoes,
    v_cmv_total, v_receita_bruta - v_cmv_total,
    v_despesas_total, v_receita_bruta - v_cmv_total - v_despesas_total, v_receita_bruta - v_cmv_total - v_despesas_total,
    CASE WHEN v_receita_bruta > 0 THEN ((v_receita_bruta - v_cmv_total) / v_receita_bruta) * 100 ELSE 0 END,
    CASE WHEN v_receita_bruta > 0 THEN ((v_receita_bruta - v_cmv_total - v_despesas_total) / v_receita_bruta) * 100 ELSE 0 END
  )
  ON CONFLICT (restaurant_id, mes, ano)
  DO UPDATE SET
    receita_bruta = EXCLUDED.receita_bruta,
    receita_liquida = EXCLUDED.receita_liquida,
    cmv_total = EXCLUDED.cmv_total,
    lucro_bruto = EXCLUDED.lucro_bruto,
    despesas_outras = EXCLUDED.despesas_outras,
    ebitda = EXCLUDED.ebitda,
    resultado_liquido = EXCLUDED.resultado_liquido,
    margem_bruta_percentual = EXCLUDED.margem_bruta_percentual,
    margem_liquida_percentual = EXCLUDED.margem_liquida_percentual,
    updated_at = now();
END;
$$;

-- Função para gerar alertas automáticos
CREATE OR REPLACE FUNCTION gerar_alertas_automaticos(restaurant_uuid UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_config RECORD;
  v_cmv_atual NUMERIC;
  v_margem_atual NUMERIC;
  v_estoque_baixo INTEGER;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_config 
  FROM public.configuracoes_restaurante 
  WHERE restaurant_id = restaurant_uuid;
  
  -- Verificar CMV atual
  SELECT cmv_percentual INTO v_cmv_atual
  FROM public.kpis_diarios 
  WHERE restaurant_id = restaurant_uuid 
    AND data = CURRENT_DATE;
  
  -- Alerta de CMV alto
  IF v_cmv_atual > 35 THEN
    INSERT INTO public.alertas_sistema (restaurant_id, tipo_alerta, prioridade, titulo, mensagem)
    VALUES (restaurant_uuid, 'cmv_alto', 'alta', 'CMV Crítico', 
            'Seu CMV está em ' || v_cmv_atual::TEXT || '%, acima do recomendado (30%). Revise seus custos imediatamente.');
  END IF;
  
  -- Verificar estoque baixo
  SELECT COUNT(*) INTO v_estoque_baixo
  FROM public.insumos 
  WHERE restaurant_id = restaurant_uuid 
    AND estoque_atual <= estoque_minimo;
  
  IF v_estoque_baixo > 0 THEN
    INSERT INTO public.alertas_sistema (restaurant_id, tipo_alerta, prioridade, titulo, mensagem)
    VALUES (restaurant_uuid, 'estoque_baixo', 'media', 'Estoque Baixo', 
            v_estoque_baixo::TEXT || ' ingrediente(s) com estoque abaixo do mínimo.');
  END IF;
END;
$$;

-- Triggers para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION atualizar_estoque_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipo_movimento = 'entrada' THEN
    UPDATE public.insumos 
    SET estoque_atual = estoque_atual + NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.insumo_id;
  ELSIF NEW.tipo_movimento IN ('saida', 'perda') THEN
    UPDATE public.insumos 
    SET estoque_atual = estoque_atual - NEW.quantidade,
        updated_at = now()
    WHERE id = NEW.insumo_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON public.movimentacao_estoque
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_estoque_trigger();

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.dre_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de segurança (usuários só veem seus próprios dados)
CREATE POLICY "Users can manage their own DRE" ON public.dre_mensal
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own stock movements" ON public.movimentacao_estoque
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own KPIs" ON public.kpis_diarios
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own alerts" ON public.alertas_sistema
  FOR ALL USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));
