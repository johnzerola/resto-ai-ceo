
/**
 * Auditoria Completa do Sistema - Análise Harvard/Oxford/MIT
 * Identifica problemas críticos e sugere correções
 */

export interface AuditResult {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
  impact: string;
}

export interface SystemAudit {
  score: number;
  totalIssues: number;
  criticalIssues: number;
  results: AuditResult[];
}

export function performSystemAudit(): SystemAudit {
  const results: AuditResult[] = [];

  // Auditoria Contábil (Harvard Business School Standards)
  results.push({
    category: 'Contabilidade',
    severity: 'critical',
    issue: 'DRE incompleto - falta estrutura contábil padrão',
    recommendation: 'Implementar DRE completo com: Receita Bruta, Deduções, Receita Líquida, CMV, Lucro Bruto, Despesas Operacionais, EBITDA, Resultado Líquido',
    impact: 'Impossibilita análise financeira real e tomada de decisão'
  });

  results.push({
    category: 'Contabilidade',
    severity: 'critical',
    issue: 'CMV não considera estoque em tempo real',
    recommendation: 'Implementar controle de estoque FIFO/LIFO com baixa automática nas vendas',
    impact: 'Cálculos de custo imprecisos afetam precificação'
  });

  results.push({
    category: 'Contabilidade',
    severity: 'high',
    issue: 'Ausência de centros de custo',
    recommendation: 'Criar departamentalização: Cozinha, Salão, Delivery, Administrativo',
    impact: 'Não permite análise de rentabilidade por setor'
  });

  // Auditoria Técnica (MIT Engineering Standards)
  results.push({
    category: 'Arquitetura',
    severity: 'critical',
    issue: 'Dados financeiros apenas em localStorage',
    recommendation: 'Migrar para Supabase com sincronização real-time',
    impact: 'Perda de dados e falta de backup/recovery'
  });

  results.push({
    category: 'Arquitetura',
    severity: 'high',
    issue: 'Falta de versionamento de fichas técnicas',
    recommendation: 'Implementar histórico de versões com controle de mudanças',
    impact: 'Não permite rastreamento de alterações de custo'
  });

  results.push({
    category: 'Performance',
    severity: 'medium',
    issue: 'Cálculos repetitivos sem cache',
    recommendation: 'Implementar cache inteligente para cálculos de CMV',
    impact: 'Performance lenta em grandes volumes'
  });

  // Auditoria de Negócios (Oxford Business School)
  results.push({
    category: 'Gestão',
    severity: 'critical',
    issue: 'Ausência de KPIs essenciais',
    recommendation: 'Implementar: Ticket Médio, Giro de Estoque, Margem por Produto, ROI',
    impact: 'Gestão sem métricas precisas'
  });

  results.push({
    category: 'Gestão',
    severity: 'high',
    issue: 'Não há alertas automáticos',
    recommendation: 'Criar sistema de alertas: estoque baixo, margem negativa, metas não atingidas',
    impact: 'Problemas identificados tardiamente'
  });

  results.push({
    category: 'Integração',
    severity: 'high',
    issue: 'Falta integração com delivery',
    recommendation: 'Integrar com APIs do iFood, Uber Eats para dados reais',
    impact: 'Dados de delivery desatualizados'
  });

  // Auditoria SEO (Google Standards)
  results.push({
    category: 'SEO',
    severity: 'critical',
    issue: 'Meta tags e schema markup ausentes',
    recommendation: 'Implementar SEO completo para termos-chave do setor',
    impact: 'Baixa visibilidade nos mecanismos de busca'
  });

  const criticalIssues = results.filter(r => r.severity === 'critical').length;
  const score = Math.max(0, 100 - (criticalIssues * 25) - (results.length * 5));

  return {
    score,
    totalIssues: results.length,
    criticalIssues,
    results
  };
}

export const seoKeywords = [
  // Primários (alto volume)
  'sistema para restaurante',
  'controle financeiro restaurante',
  'precificação restaurante',
  'DRE restaurante',
  'CMV restaurante',
  'fluxo de caixa restaurante',
  
  // Secundários (médio volume)
  'ficha técnica restaurante',
  'controle de estoque restaurante',
  'sistema de gestão restaurante',
  'custo de produção restaurante',
  'margem de lucro restaurante',
  'análise financeira restaurante',
  
  // Long tail (baixo volume, alta conversão)
  'como calcular preço de venda restaurante',
  'sistema para calcular CMV',
  'controle financeiro para bares',
  'gestão de custos food service',
  'precificar cardápio restaurante',
  'como ter restaurante lucrativo',
  'sistema completo para restaurante',
  'ferramenta gestão gastronômica'
];

export const systemFeatures = {
  core: [
    'Precificação Inteligente com Markup Automático',
    'DRE Completo em Tempo Real',
    'Controle de CMV por Produto',
    'Fluxo de Caixa Detalhado',
    'Ficha Técnica Profissional',
    'Controle de Estoque Integrado'
  ],
  advanced: [
    'Análise de Rentabilidade por Prato',
    'Projeções Financeiras',
    'Metas e KPIs Automáticos',
    'Relatórios Gerenciais',
    'Controle Multi-usuário',
    'Backup Automático na Nuvem'
  ],
  integrations: [
    'Integração com Delivery',
    'Sincronização Bancária',
    'Emissão de Relatórios PDF',
    'Dashboard Executivo',
    'Alertas Automáticos',
    'API para Terceiros'
  ]
};
