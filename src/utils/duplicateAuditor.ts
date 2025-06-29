
/**
 * SISTEMA DE AUDITORIA AVANÇADA - ELIMINAÇÃO TOTAL DE DUPLICAÇÕES
 * Engenharia Sênior - Zero Tolerância para Duplicações
 */

interface DuplicateReport {
  componentDuplicates: string[];
  cssDuplicates: string[];
  routeDuplicates: string[];
  codePatterns: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  totalDuplicates: number;
}

interface DesignSystemCompliance {
  compliantPages: string[];
  nonCompliantPages: string[];
  complianceScore: number;
  missingPatterns: string[];
}

export class DuplicateAuditor {
  private static instance: DuplicateAuditor;
  private auditResults: DuplicateReport | null = null;
  private designCompliance: DesignSystemCompliance | null = null;

  public static getInstance(): DuplicateAuditor {
    if (!DuplicateAuditor.instance) {
      DuplicateAuditor.instance = new DuplicateAuditor();
    }
    return DuplicateAuditor.instance;
  }

  /**
   * AUDITORIA RADICAL DE COMPONENTES DUPLICADOS
   */
  public auditComponentDuplicates(): string[] {
    const componentPatterns = [
      'ModernLayout',
      'Button',
      'Card',
      'Sidebar',
      'Header',
      'Navigation'
    ];

    const duplicates: string[] = [];
    const elementsFound = new Map<string, number>();

    // Verificar DOM atual
    componentPatterns.forEach(pattern => {
      const elements = document.querySelectorAll(`[class*="${pattern}"], [data-component*="${pattern}"]`);
      if (elements.length > 1) {
        const duplicate = `${pattern}: ${elements.length} instâncias encontradas`;
        duplicates.push(duplicate);
        elementsFound.set(pattern, elements.length);
      }
    });

    // Log crítico para duplicações
    if (duplicates.length > 0) {
      console.error('🚨 DUPLICAÇÕES CRÍTICAS DETECTADAS:', duplicates);
    }

    return duplicates;
  }

  /**
   * VERIFICAÇÃO PROFUNDA DE CSS DUPLICADO
   */
  public auditCSSPatterns(): string[] {
    const cssDuplicates: string[] = [];
    const styleSheets = Array.from(document.styleSheets);
    const ruleMap = new Map<string, number>();

    try {
      styleSheets.forEach(sheet => {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            const ruleText = rule.cssText;
            const count = ruleMap.get(ruleText) || 0;
            ruleMap.set(ruleText, count + 1);
          });
        }
      });

      // Identificar regras duplicadas
      ruleMap.forEach((count, rule) => {
        if (count > 1 && rule.length > 50) { // Apenas regras significativas
          cssDuplicates.push(`CSS duplicado (${count}x): ${rule.substring(0, 100)}...`);
        }
      });
    } catch (error) {
      console.warn('Erro ao auditar CSS:', error);
    }

    return cssDuplicates;
  }

  /**
   * VALIDAÇÃO DO DESIGN SYSTEM UNIFICADO
   */
  public validateDesignSystemCompliance(): DesignSystemCompliance {
    const requiredPatterns = [
      'dashboard-unificado',
      'bg-gradient-to-br',
      'from-slate-50',
      'restauria-',
      'modern-button',
      'stats-card'
    ];

    const compliantPages: string[] = [];
    const nonCompliantPages: string[] = [];
    let patternCount = 0;

    // Verificar padrões do design system
    requiredPatterns.forEach(pattern => {
      const elements = document.querySelectorAll(`[class*="${pattern}"]`);
      if (elements.length > 0) {
        patternCount++;
        compliantPages.push(`${pattern}: ${elements.length} elementos`);
      } else {
        nonCompliantPages.push(`FALTANDO: ${pattern}`);
      }
    });

    const complianceScore = (patternCount / requiredPatterns.length) * 100;

    this.designCompliance = {
      compliantPages,
      nonCompliantPages,
      complianceScore,
      missingPatterns: nonCompliantPages
    };

    return this.designCompliance;
  }

  /**
   * AUDITORIA COMPLETA - EXECUÇÃO TOTAL
   */
  public executeFullAudit(): DuplicateReport {
    console.log('🔍 INICIANDO AUDITORIA RADICAL - ELIMINAÇÃO TOTAL DE DUPLICAÇÕES');

    const componentDuplicates = this.auditComponentDuplicates();
    const cssDuplicates = this.auditCSSPatterns();
    const routeDuplicates = this.auditRouteDuplicates();
    const codePatterns = this.auditCodePatterns();

    const totalDuplicates = componentDuplicates.length + cssDuplicates.length + routeDuplicates.length;
    
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (totalDuplicates > 10) severity = 'CRITICAL';
    else if (totalDuplicates > 5) severity = 'HIGH';
    else if (totalDuplicates > 0) severity = 'MEDIUM';

    this.auditResults = {
      componentDuplicates,
      cssDuplicates,
      routeDuplicates,
      codePatterns,
      severity,
      totalDuplicates
    };

    // Relatório detalhado
    this.generateAuditReport();
    
    return this.auditResults;
  }

  private auditRouteDuplicates(): string[] {
    // Verificar rotas duplicadas no sistema
    const routes = [
      '/dashboard', '/projecoes', '/dre', '/cmv', '/fluxo-de-caixa',
      '/simulador', '/metas', '/estoque', '/cardapio', '/ai-assistant'
    ];

    const duplicates: string[] = [];
    const routeElements = document.querySelectorAll('a[href]');
    const routeMap = new Map<string, number>();

    routeElements.forEach(element => {
      const href = element.getAttribute('href');
      if (href && routes.includes(href)) {
        const count = routeMap.get(href) || 0;
        routeMap.set(href, count + 1);
      }
    });

    routeMap.forEach((count, route) => {
      if (count > 1) {
        duplicates.push(`Rota duplicada: ${route} (${count} links)`);
      }
    });

    return duplicates;
  }

  private auditCodePatterns(): string[] {
    // Verificar padrões de código duplicados
    const patterns: string[] = [];
    
    // Verificar se existem múltiplos componentes similares
    const buttons = document.querySelectorAll('button');
    const cards = document.querySelectorAll('[class*="card"]');
    const headers = document.querySelectorAll('h1, h2, h3');

    if (buttons.length > 20) {
      patterns.push(`Excesso de botões: ${buttons.length} (possível duplicação)`);
    }

    if (cards.length > 15) {
      patterns.push(`Excesso de cards: ${cards.length} (verificar reutilização)`);
    }

    return patterns;
  }

  private generateAuditReport(): void {
    if (!this.auditResults) return;

    console.log('\n📊 RELATÓRIO COMPLETO DE AUDITORIA - ELIMINAÇÃO DE DUPLICAÇÕES');
    console.log('=' .repeat(80));
    console.log(`🎯 SEVERIDADE: ${this.auditResults.severity}`);
    console.log(`📈 TOTAL DE DUPLICAÇÕES: ${this.auditResults.totalDuplicates}`);
    console.log('\n🔍 COMPONENTES DUPLICADOS:');
    this.auditResults.componentDuplicates.forEach(dup => console.log(`  ❌ ${dup}`));
    
    console.log('\n🎨 CSS DUPLICADO:');
    this.auditResults.cssDuplicates.forEach(dup => console.log(`  ❌ ${dup}`));
    
    console.log('\n🛣️ ROTAS DUPLICADAS:');
    this.auditResults.routeDuplicates.forEach(dup => console.log(`  ❌ ${dup}`));

    if (this.designCompliance) {
      console.log('\n🎯 COMPLIANCE DO DESIGN SYSTEM:');
      console.log(`  📊 Score: ${this.designCompliance.complianceScore.toFixed(1)}%`);
      console.log(`  ✅ Padrões encontrados: ${this.designCompliance.compliantPages.length}`);
      console.log(`  ❌ Padrões faltando: ${this.designCompliance.nonCompliantPages.length}`);
    }

    console.log('\n' + '=' .repeat(80));
    
    if (this.auditResults.totalDuplicates === 0) {
      console.log('✅ SISTEMA 100% LIMPO - ZERO DUPLICAÇÕES DETECTADAS');
    } else {
      console.log('🚨 AÇÃO IMEDIATA NECESSÁRIA - DUPLICAÇÕES CRÍTICAS ENCONTRADAS');
    }
  }

  /**
   * SISTEMA DE LIMPEZA AUTOMATIZADA
   */
  public autoCleanDuplicates(): void {
    console.log('🧹 INICIANDO LIMPEZA AUTOMATIZADA...');
    
    // Remover elementos duplicados automaticamente
    const duplicateSelectors = [
      '[data-duplicate="true"]',
      '.duplicate-element',
      '[class*="duplicate"]'
    ];

    duplicateSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        if (index > 0) { // Manter apenas o primeiro
          element.remove();
          console.log(`🗑️ Removido elemento duplicado: ${selector}`);
        }
      });
    });
  }
}

// Instância singleton global
export const duplicateAuditor = DuplicateAuditor.getInstance();
