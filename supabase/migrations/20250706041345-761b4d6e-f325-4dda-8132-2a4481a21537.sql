-- FASE 1: Correção Crítica do preco_unitario

-- Remover a constraint GENERATED da coluna preco_unitario se existir
DO $$ 
BEGIN
    -- Verificar se a coluna tem constraint GENERATED
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'insumos' 
        AND column_name = 'preco_unitario' 
        AND is_generated = 'ALWAYS'
    ) THEN
        -- Recriar a coluna sem GENERATED constraint
        ALTER TABLE public.insumos DROP COLUMN IF EXISTS preco_unitario;
        ALTER TABLE public.insumos ADD COLUMN preco_unitario NUMERIC;
    END IF;
END $$;

-- Criar trigger para calcular preco_unitario automaticamente
CREATE OR REPLACE FUNCTION public.calcular_preco_unitario()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular preço unitário automaticamente se não fornecido
  IF NEW.preco_unitario IS NULL OR NEW.preco_unitario = 0 THEN
    IF NEW.preco_pago > 0 AND NEW.volume_embalagem > 0 THEN
      NEW.preco_unitario := NEW.preco_pago / NEW.volume_embalagem;
    END IF;
  END IF;
  
  -- Validar se os valores são positivos
  IF NEW.preco_unitario < 0 THEN
    NEW.preco_unitario := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela insumos
DROP TRIGGER IF EXISTS trigger_calcular_preco_unitario ON public.insumos;
CREATE TRIGGER trigger_calcular_preco_unitario
  BEFORE INSERT OR UPDATE ON public.insumos
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_preco_unitario();

-- Atualizar registros existentes sem preco_unitario
UPDATE public.insumos 
SET preco_unitario = CASE 
  WHEN volume_embalagem > 0 THEN preco_pago / volume_embalagem 
  ELSE 0 
END
WHERE preco_unitario IS NULL OR preco_unitario = 0;