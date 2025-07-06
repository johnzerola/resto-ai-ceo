-- Garantir categorias financeiras padrão para todos os restaurantes
DO $$ 
DECLARE
    restaurant_record RECORD;
    categoria_count INTEGER;
BEGIN
    -- Para cada restaurante que não possui categorias financeiras
    FOR restaurant_record IN SELECT id FROM restaurants LOOP
        -- Verificar se o restaurante já tem categorias
        SELECT COUNT(*) INTO categoria_count 
        FROM categorias_financeiras 
        WHERE restaurant_id = restaurant_record.id;
        
        -- Se não tem categorias, criar as padrão
        IF categoria_count = 0 THEN
            -- Categorias de despesa que impactam CMV
            INSERT INTO categorias_financeiras (restaurant_id, nome, tipo, impacta_cmv, impacta_dre, cor, icone, ativa) VALUES
            (restaurant_record.id, 'Ingredientes', 'despesa', true, true, '#ef4444', 'utensils', true),
            (restaurant_record.id, 'Alimentos', 'despesa', true, true, '#f97316', 'apple', true),
            (restaurant_record.id, 'Bebidas', 'despesa', true, true, '#3b82f6', 'coffee', true),
            (restaurant_record.id, 'Insumos', 'despesa', true, true, '#8b5cf6', 'package', true),
            (restaurant_record.id, 'Embalagens', 'despesa', true, true, '#06b6d4', 'box', true);
            
            -- Categorias de despesa operacional (não impactam CMV)
            INSERT INTO categorias_financeiras (restaurant_id, nome, tipo, impacta_cmv, impacta_dre, cor, icone, ativa) VALUES
            (restaurant_record.id, 'Aluguel', 'despesa', false, true, '#64748b', 'home', true),
            (restaurant_record.id, 'Funcionários', 'despesa', false, true, '#10b981', 'users', true),
            (restaurant_record.id, 'Marketing', 'despesa', false, true, '#f59e0b', 'megaphone', true),
            (restaurant_record.id, 'Delivery', 'despesa', false, true, '#84cc16', 'truck', true),
            (restaurant_record.id, 'Equipamentos', 'despesa', false, true, '#6366f1', 'settings', true),
            (restaurant_record.id, 'Impostos', 'despesa', false, true, '#dc2626', 'file-text', true),
            (restaurant_record.id, 'Manutenção', 'despesa', false, true, '#7c3aed', 'wrench', true);
            
            -- Categorias de receita
            INSERT INTO categorias_financeiras (restaurant_id, nome, tipo, impacta_cmv, impacta_dre, cor, icone, ativa) VALUES
            (restaurant_record.id, 'Vendas Balcão', 'receita', false, true, '#22c55e', 'store', true),
            (restaurant_record.id, 'Vendas Delivery', 'receita', false, true, '#3b82f6', 'bike', true),
            (restaurant_record.id, 'Vendas iFood', 'receita', false, true, '#f59e0b', 'smartphone', true),
            (restaurant_record.id, 'Vendas Uber Eats', 'receita', false, true, '#000000', 'car', true),
            (restaurant_record.id, 'Outras Receitas', 'receita', false, true, '#8b5cf6', 'plus-circle', true);
            
        END IF;
    END LOOP;
END $$;