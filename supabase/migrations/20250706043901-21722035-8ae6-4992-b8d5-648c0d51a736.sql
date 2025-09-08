-- Adicionar novos campos à tabela pratos para suportar configurações avançadas de precificação

ALTER TABLE public.pratos 
ADD COLUMN IF NOT EXISTS meta_lucro_percentual NUMERIC DEFAULT 30,
ADD COLUMN IF NOT EXISTS despesas_fixas_mensais NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS despesas_variaveis_mensais NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS markup_personalizado NUMERIC DEFAULT 250,
ADD COLUMN IF NOT EXISTS canal_venda TEXT DEFAULT 'balcao',
ADD COLUMN IF NOT EXISTS preco_concorrente NUMERIC DEFAULT 0;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.pratos.meta_lucro_percentual IS 'Meta de margem de lucro desejada (%)';
COMMENT ON COLUMN public.pratos.despesas_fixas_mensais IS 'Despesas fixas mensais para cálculo de custo por prato (R$)';
COMMENT ON COLUMN public.pratos.despesas_variaveis_mensais IS 'Despesas variáveis como percentual do custo dos ingredientes (%)';
COMMENT ON COLUMN public.pratos.markup_personalizado IS 'Markup personalizado para precificação (%)';
COMMENT ON COLUMN public.pratos.canal_venda IS 'Canal de venda: balcao, ifood, uber_eats';
COMMENT ON COLUMN public.pratos.preco_concorrente IS 'Preço de referência da concorrência (R$)';

-- Criar índice para otimizar consultas por canal de venda
CREATE INDEX IF NOT EXISTS idx_pratos_canal_venda ON public.pratos(canal_venda);

-- Verificar se a tabela tem as colunas necessárias
DO $$
BEGIN
    -- Verificar se todas as colunas foram criadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pratos' AND column_name = 'meta_lucro_percentual') THEN
        RAISE EXCEPTION 'Falha ao criar coluna meta_lucro_percentual';
    END IF;
    
    RAISE NOTICE 'Migração da tabela pratos concluída com sucesso!';
END $$;