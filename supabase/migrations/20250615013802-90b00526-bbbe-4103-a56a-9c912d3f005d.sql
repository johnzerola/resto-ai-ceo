
-- Inserir contextos abrangentes baseados na análise do sistema RestoAI CEO
INSERT INTO public.tabela_contexto (palavra_chave, contexto) VALUES 

-- Módulos principais do sistema
('dashboard', 'Painel principal do RestoAI CEO que apresenta visão geral do restaurante com métricas financeiras, indicadores de performance, alertas importantes e acesso rápido às principais funcionalidades. Inclui cards de projeções, fluxo de caixa, metas e relatórios.'),

('dre', 'Demonstração do Resultado do Exercício - relatório financeiro que mostra receitas, custos, despesas e lucro líquido do restaurante. O sistema gera DRE automatizada em tempo real com análise de lucratividade por produto e categorias.'),

('fluxo-caixa', 'Controle completo de entradas e saídas financeiras do restaurante. Permite registrar receitas, despesas, categorizar transações por tipo de pagamento e gerar projeções futuras para gestão financeira eficiente.'),

('cmv', 'Custo da Mercadoria Vendida - cálculo automático dos custos diretos dos pratos baseado nas fichas técnicas. O sistema calcula CMV por produto, categoria e período, essencial para precificação correta.'),

('ficha-tecnica', 'Padronização de receitas com cálculo automático de custos por ingrediente. Permite cadastrar ingredientes, quantidades, fatores de correção e gera automaticamente custo por porção, preço sugerido e margem de lucro.'),

('estoque', 'Controle inteligente de estoque com cadastro de produtos, controle de entradas/saídas, alertas de estoque mínimo e previsão de demanda. Integrado com fichas técnicas para cálculo automático de consumo.'),

('insumos', 'Cadastro de ingredientes e matérias-primas utilizadas nas receitas. Inclui informações de preço, unidade de medida, fornecedor e é base para cálculos de custo nas fichas técnicas.'),

('precificacao', 'Sistema inteligente de definição de preços baseado em custos, margem desejada, concorrência e análise de mercado. Inclui simulador de cenários e sugestões automáticas de preços por canal de venda.'),

('metas', 'Módulo de definição e acompanhamento de objetivos do restaurante. Permite criar metas de faturamento, redução de custos, margem de lucro e acompanhar progresso com indicadores visuais.'),

('relatorios', 'Conjunto de mais de 20 relatórios automáticos incluindo análise financeira, performance de produtos, comparativos de períodos, análise de custos e relatórios gerenciais para tomada de decisão.'),

-- Funcionalidades de IA
('assistente-ia', 'Assistente de inteligência artificial especializado em gestão de restaurantes. Oferece insights personalizados, sugestões de otimização, análise preditiva e recomendações estratégicas baseadas nos dados do estabelecimento.'),

('analise-preditiva', 'Funcionalidade de IA que prevê vendas futuras, demanda de produtos, necessidades de estoque e tendências do negócio baseado em histórico e padrões sazonais.'),

('recomendacoes-ia', 'Sistema de sugestões inteligentes para otimização de cardápio, precificação, redução de desperdícios e melhoria da margem de lucro baseado em análise de dados e machine learning.'),

-- Gestão e configurações
('restaurantes', 'Sistema multi-estabelecimento que permite gerenciar vários restaurantes em uma única conta. Cada restaurante possui dados independentes e controles de acesso específicos.'),

('usuarios', 'Gestão de usuários com diferentes níveis de acesso (proprietário, gerente, funcionário). Controla permissões por módulo e permite colaboração em equipe com segurança.'),

('configuracoes', 'Painel de configurações gerais do sistema incluindo dados do restaurante, preferências de relatórios, configurações de IA, integrações e personalização da interface.'),

-- Processos operacionais
('cardapio', 'Gestão completa do cardápio com organização por categorias, análise de performance de pratos, identificação de itens mais lucrativos e sugestões de otimização baseadas em dados.'),

('fornecedores', 'Cadastro e gestão de fornecedores com histórico de compras, comparativo de preços, avaliação de performance e integração com controle de estoque.'),

('promocoes', 'Sistema de criação e gestão de promoções e campanhas de marketing. Analisa impacto nas vendas e margem de lucro, com sugestões inteligentes de ofertas.'),

-- Análises e métricas
('kpis', 'Indicadores-chave de performance incluindo ticket médio, giro de estoque, margem de contribuição, custo por cliente e outras métricas essenciais para gestão eficiente.'),

('comparativos', 'Análises comparativas entre períodos, produtos, canais de venda e benchmarking com mercado. Identifica tendências e oportunidades de melhoria.'),

('margem-lucro', 'Cálculo e análise da margem de lucro por produto, categoria e geral. O sistema identifica produtos deficitários e sugere ações para otimização da rentabilidade.'),

-- Canais e integrações
('delivery', 'Gestão de vendas por delivery com análise de comissões de plataformas, precificação específica por canal e controle de performance de cada aplicativo.'),

('ifood', 'Integração e análise específica para iFood incluindo gestão de comissões, precificação otimizada, análise de performance e estratégias para aumentar vendas na plataforma.'),

('pos', 'Integração com sistemas de ponto de venda para sincronização automática de vendas, estoque e dados financeiros, garantindo informações sempre atualizadas.'),

-- Suporte e treinamento
('onboarding', 'Processo guiado de configuração inicial do sistema incluindo cadastro do restaurante, importação de dados, configuração de fichas técnicas e treinamento básico.'),

('treinamento', 'Material de capacitação incluindo tutoriais em vídeo, documentação completa, webinars e suporte especializado para máximo aproveitamento do sistema.'),

('migracao-dados', 'Processo de importação de dados de outros sistemas incluindo cardápio, estoque, fornecedores e histórico financeiro com suporte técnico especializado.'),

-- Planos e assinatura
('plano-basico', 'Plano Essencial com gestão financeira completa, controle de estoque até 500 produtos, fichas técnicas, relatórios automáticos e suporte por email. Ideal para restaurantes em crescimento.'),

('plano-premium', 'Plano Profissional com todas as funcionalidades do Essencial mais IA avançada, produtos ilimitados, análise preditiva, simulador de cenários e suporte prioritário 24/7.'),

('teste-gratuito', 'Período de 14 dias de teste gratuito com acesso completo a todas as funcionalidades para avaliar o sistema. Sem compromisso e sem necessidade de cartão de crédito.'),

-- Problemas e soluções
('desperdicio', 'Controle e redução de desperdícios através de gestão inteligente de estoque, previsão de demanda, controle de validade e otimização de compras. Sistema identifica padrões e sugere ações.'),

('custos-altos', 'Análise detalhada de custos com identificação de vazamentos financeiros, produtos deficitários, otimização de fornecedores e sugestões de redução de despesas operacionais.'),

('baixa-margem', 'Estratégias para aumento da margem de lucro incluindo otimização de preços, redução de custos, análise de mix de produtos e recomendações de IA para melhor rentabilidade.'),

('controle-financeiro', 'Sistema completo de gestão financeira com DRE automática, fluxo de caixa, análise de indicadores, controle de despesas e projeções para tomada de decisão estratégica.'),

-- Segurança e conformidade
('seguranca', 'Sistema com certificação de segurança, criptografia de dados, backups automáticos, controle de acesso e conformidade com LGPD para proteção total das informações.'),

('backup', 'Sistema automático de backup com múltiplas camadas de proteção, recuperação rápida de dados e garantia de continuidade operacional em qualquer situação.'),

('lgpd', 'Conformidade total com Lei Geral de Proteção de Dados incluindo políticas de privacidade, controle de consentimento e procedimentos de segurança adequados.');
