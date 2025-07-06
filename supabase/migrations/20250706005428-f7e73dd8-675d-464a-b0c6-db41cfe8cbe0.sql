-- Verificar e adicionar colunas de notificação se não existirem
DO $$ 
BEGIN
    -- Adicionar colunas na tabela contas_a_pagar se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contas_a_pagar' 
                   AND column_name='notificacao_enviada_1_dia') THEN
        ALTER TABLE public.contas_a_pagar 
        ADD COLUMN notificacao_enviada_1_dia BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contas_a_pagar' 
                   AND column_name='notificacao_enviada_vencimento') THEN
        ALTER TABLE public.contas_a_pagar 
        ADD COLUMN notificacao_enviada_vencimento BOOLEAN DEFAULT false;
    END IF;

    -- Adicionar colunas na tabela contas_a_receber se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contas_a_receber' 
                   AND column_name='notificacao_enviada_1_dia') THEN
        ALTER TABLE public.contas_a_receber 
        ADD COLUMN notificacao_enviada_1_dia BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contas_a_receber' 
                   AND column_name='notificacao_enviada_vencimento') THEN
        ALTER TABLE public.contas_a_receber 
        ADD COLUMN notificacao_enviada_vencimento BOOLEAN DEFAULT false;
    END IF;
    
    -- Adicionar campos impacta_cmv e impacta_dre ao cash_flow se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='cash_flow' 
                   AND column_name='impacta_cmv') THEN
        ALTER TABLE public.cash_flow 
        ADD COLUMN impacta_cmv BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='cash_flow' 
                   AND column_name='impacta_dre') THEN
        ALTER TABLE public.cash_flow 
        ADD COLUMN impacta_dre BOOLEAN DEFAULT true;
    END IF;
END $$;