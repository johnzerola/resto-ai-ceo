-- Atualizar tabela pratos para incluir todos os campos necessários da ficha técnica
DO $$ 
BEGIN
  -- Adicionar colunas se não existirem
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN meta_lucro_percentual NUMERIC DEFAULT 30;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN despesas_fixas_mensais NUMERIC DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN despesas_variaveis_mensais NUMERIC DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN markup_personalizado NUMERIC DEFAULT 250;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN canal_venda TEXT DEFAULT 'balcao';
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN preco_concorrente NUMERIC DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.pratos ADD COLUMN custo_por_porcao NUMERIC DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Criar função para validar que preço nunca seja menor que custo
CREATE OR REPLACE FUNCTION validate_preco_above_custo()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se preço sugerido é menor que custo
  IF NEW.preco_sugerido < NEW.custo_total THEN
    RAISE EXCEPTION 'Preço sugerido (%) não pode ser menor que custo total (%)', 
      NEW.preco_sugerido, NEW.custo_total;
  END IF;
  
  -- Verificar se preço praticado é menor que custo
  IF NEW.preco_praticado IS NOT NULL AND NEW.preco_praticado < NEW.custo_total THEN
    RAISE EXCEPTION 'Preço praticado (%) não pode ser menor que custo total (%)', 
      NEW.preco_praticado, NEW.custo_total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação
DROP TRIGGER IF EXISTS trigger_validate_preco_above_custo ON public.pratos;
CREATE TRIGGER trigger_validate_preco_above_custo
  BEFORE INSERT OR UPDATE ON public.pratos
  FOR EACH ROW
  EXECUTE FUNCTION validate_preco_above_custo();

-- Função melhorada para cálculo de CMV considerando TODOS os campos
CREATE OR REPLACE FUNCTION public.calcular_cmv_completo_melhorado(prato_uuid uuid)
RETURNS TABLE(
  custo_ingredientes numeric,
  despesas_fixas_prato numeric,
  despesas_variaveis_prato numeric,
  custo_total_final numeric,
  custo_por_porcao numeric,
  preco_sugerido_calculado numeric,
  margem_bruta_percentual numeric,
  margem_liquida_percentual numeric,
  status_viabilidade text,
  alertas jsonb
)
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  v_prato RECORD;
  v_custo_ingredientes NUMERIC := 0;
  v_despesas_fixas_prato NUMERIC := 0;
  v_despesas_variaveis_prato NUMERIC := 0;
  v_alertas JSONB := '[]'::jsonb;
  v_meta_pratos_mes INTEGER := 1000;
BEGIN
  -- Buscar dados completos do prato
  SELECT * INTO v_prato FROM public.pratos WHERE id = prato_uuid;
  
  IF v_prato IS NULL THEN
    RAISE EXCEPTION 'Prato não encontrado';
  END IF;
  
  -- Calcular custo dos ingredientes
  SELECT COALESCE(SUM(ipp.custo_total), 0) INTO v_custo_ingredientes
  FROM public.ingredientes_por_prato ipp
  WHERE ipp.prato_id = prato_uuid;
  
  -- Calcular despesas fixas por prato
  v_despesas_fixas_prato := COALESCE(v_prato.despesas_fixas_mensais, 0) / v_meta_pratos_mes;
  
  -- Calcular despesas variáveis
  v_despesas_variaveis_prato := v_custo_ingredientes * (COALESCE(v_prato.despesas_variaveis_mensais, 0) / 100);
  
  -- Custo total final
  custo_total_final := v_custo_ingredientes + v_despesas_fixas_prato + v_despesas_variaveis_prato;
  
  -- Custo por porção
  custo_por_porcao := custo_total_final / GREATEST(COALESCE(v_prato.rendimento_porcoes, 1), 1);
  
  -- Taxa do canal
  DECLARE
    v_taxa_canal NUMERIC := 0;
  BEGIN
    CASE COALESCE(v_prato.canal_venda, 'balcao')
      WHEN 'ifood' THEN v_taxa_canal := 0.15;
      WHEN 'uber_eats' THEN v_taxa_canal := 0.12;
      ELSE v_taxa_canal := 0;
    END CASE;
  END;
  
  -- Preço sugerido
  preco_sugerido_calculado := custo_por_porcao * (COALESCE(v_prato.markup_personalizado, 250) / 100);
  IF v_taxa_canal > 0 THEN
    preco_sugerido_calculado := preco_sugerido_calculado / (1 - v_taxa_canal);
  END IF;
  
  -- Calcular margens
  margem_bruta_percentual := CASE 
    WHEN preco_sugerido_calculado > 0 THEN 
      ((preco_sugerido_calculado - custo_por_porcao) / preco_sugerido_calculado) * 100 
    ELSE 0 
  END;
  
  margem_liquida_percentual := margem_bruta_percentual - (v_taxa_canal * 100) - 15; -- 15% impostos
  
  -- Status de viabilidade
  status_viabilidade := CASE
    WHEN margem_liquida_percentual < 0 THEN 'prejuizo'
    WHEN margem_liquida_percentual < COALESCE(v_prato.meta_lucro_percentual, 30) THEN 'atencao'
    ELSE 'saudavel'
  END;
  
  -- Gerar alertas
  IF margem_liquida_percentual < 0 THEN
    v_alertas := v_alertas || '["🚨 PREJUÍZO: Margem líquida negativa!"]'::jsonb;
  END IF;
  
  IF preco_sugerido_calculado < custo_por_porcao THEN
    v_alertas := v_alertas || '["🚨 ERRO CRÍTICO: Preço menor que custo!"]'::jsonb;
  END IF;
  
  IF margem_liquida_percentual >= 0 AND margem_liquida_percentual < COALESCE(v_prato.meta_lucro_percentual, 30) THEN
    v_alertas := v_alertas || format('["⚠️ Meta de lucro não atingida. Atual: %s%%"]', ROUND(margem_liquida_percentual, 1))::jsonb;
  END IF;
  
  -- Retornar resultados
  custo_ingredientes := v_custo_ingredientes;
  despesas_fixas_prato := v_despesas_fixas_prato;
  despesas_variaveis_prato := v_despesas_variaveis_prato;
  alertas := v_alertas;
  
  RETURN NEXT;
END;
$$;