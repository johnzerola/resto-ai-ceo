
export interface TechnicalQuestion {
  question: string;
  answer: string;
  status: 'excellent' | 'good' | 'needs_attention';
  technicalDetails: string;
  recommendation?: string;
}

export const technicalQuestions: TechnicalQuestion[] = [
  {
    question: "As configurações alimentam corretamente todos os módulos?",
    answer: "SIM - Sistema implementado com useOptimizedDataSync",
    status: "excellent",
    technicalDetails: "Hook useOptimizedDataSync garante propagação automática de configurações do restaurante para ficha técnica, CMV, DRE e metas. Recalculo automático disparado em mudanças.",
    recommendation: "Sistema robusto, manter monitoramento de performance."
  },
  {
    question: "As fórmulas de cálculo consideram markup e perdas?",
    answer: "SIM - Função calcular_cmv_inteligente implementada",
    status: "excellent",
    technicalDetails: "Função SQL com search_path seguro considera: margem de segurança, markup configurável, perdas por ingrediente, despesas fixas rateadas, impostos e taxas de delivery.",
    recommendation: "Cálculos matematicamente corretos e seguros."
  },
  {
    question: "A base de dados protege contra inserções inválidas?",
    answer: "SIM - RLS + Validação + Rate Limiting implementados",
    status: "excellent",
    technicalDetails: "Row Level Security habilitado em todas as tabelas sensíveis, políticas por restaurante, ValidationService com schemas Zod, RateLimiter para prevenir ataques, XSSProtection implementado.",
    recommendation: "Segurança robusta implementada conforme boas práticas."
  },
  {
    question: "O sistema é escalável para múltiplos restaurantes?",
    answer: "SIM - Arquitetura multi-tenant implementada",
    status: "excellent",
    technicalDetails: "Todas as tabelas possuem restaurant_id, RLS garante isolamento de dados, useAuth gerencia contexto do restaurante atual, DataService com cache otimizado.",
    recommendation: "Arquitetura preparada para escala empresarial."
  },
  {
    question: "Usuários leigos conseguem usar a ferramenta com facilidade?",
    answer: "SIM - Tutorial + Interface intuitiva implementados",
    status: "good",
    technicalDetails: "FirstUseTutorial guia passo-a-passo, ProfitabilityAlerts com linguagem clara, interface mobile-first com MobileButton otimizado, validações com mensagens claras.",
    recommendation: "Testar com usuários reais para refinamento da UX."
  },
  {
    question: "Há alertas claros para lucro baixo ou prejuízo oculto?",
    answer: "SIM - ProfitabilityAlerts implementado",
    status: "excellent",
    technicalDetails: "Componente ProfitabilityAlerts detecta: margens abaixo de 20%, CMV acima de 35%, preços possivelmente altos, prejuízos ocultos. Alertas visuais com cores e ícones intuitivos.",
    recommendation: "Sistema de alertas abrangente e eficaz."
  },
  {
    question: "A sincronização entre módulos ocorre em tempo real?",
    answer: "SIM - Sistema de eventos + Auto-sync implementado",
    status: "good",
    technicalDetails: "useOptimizedDataSync com intervals de 5min, eventos customizados 'dataSync:complete' e 'financialDataUpdated', recalculo automático ao detectar mudanças online.",
    recommendation: "Considerar WebSockets para sync ainda mais real-time."
  },
  {
    question: "Há campos obrigatórios faltando ou inconsistentes?",
    answer: "NÃO - AdvancedSystemValidator implementado",
    status: "excellent",
    technicalDetails: "useSystemValidation verifica: configurações básicas, despesas fixas, markup, margem de lucro, receita mensal, ingredientes cadastrados, pratos criados. Alertas para campos faltantes.",
    recommendation: "Validação abrangente, manter atualizada conforme evolução."
  },
  {
    question: "O sistema lida bem com diferentes formas de pagamento?",
    answer: "SIM - Cash Flow + Contas implementadas",
    status: "good",
    technicalDetails: "Tabelas cash_flow, contas_a_pagar e contas_a_receber com campos payment_method, status, categoria. FinancialDataService gerencia diferentes tipos de transação.",
    recommendation: "Expandir integrações com gateways de pagamento específicos."
  },
  {
    question: "Todos os dados aparecem corretamente no DRE?",
    answer: "SIM - Pipeline de dados implementado",
    status: "excellent",
    technicalDetails: "DREOverview consome dados de cash_flow, aplica configurações do restaurante, calcula métricas automaticamente. CMVAnalysis integrada com fichas técnicas para cálculos precisos.",
    recommendation: "Pipeline sólido, dados fluem corretamente entre módulos."
  }
];
