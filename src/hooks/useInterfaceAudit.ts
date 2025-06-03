
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface AuditResult {
  duplicateMenus: string[];
  invalidRoutes: string[];
  dataIntegrity: boolean;
  designConsistency: boolean;
  lastAudit: string;
  performanceMetrics: {
    loadTime: number;
    memoryUsage: number;
    consoleErrors: number;
  };
}

interface AuditConfig {
  validRoutes: string[];
  requiredDataSelectors: string[];
}

export function useInterfaceAudit(config?: AuditConfig) {
  const location = useLocation();
  const [auditResult, setAuditResult] = useState<AuditResult>({
    duplicateMenus: [],
    invalidRoutes: [],
    dataIntegrity: false,
    designConsistency: false,
    lastAudit: '',
    performanceMetrics: {
      loadTime: 0,
      memoryUsage: 0,
      consoleErrors: 0
    }
  });

  const defaultConfig: AuditConfig = {
    validRoutes: [
      '/',
      '/dashboard',
      '/projecoes',
      '/dre',
      '/cmv',
      '/dre-cmv',
      '/fluxo-de-caixa',
      '/simulador',
      '/metas',
      '/estoque',
      '/cardapio',
      '/akguns-abas',
      '/ai-assistant',
      '/gerenciar-usuarios',
      '/assinatura',
      '/configuracoes',
      '/documentacao',
      '/privacidade',
      '/status-sistema',
      '/vendas',
      '/security-center',
      '/admin'
    ],
    requiredDataSelectors: [
      '[data-testid="dashboard-metrics"]',
      '[data-testid="quick-access"]',
      '[data-testid="system-status"]'
    ]
  };

  const auditConfig = config || defaultConfig;

  // Verificar menus duplicados
  const checkDuplicateMenus = useCallback((): string[] => {
    const menuItems = document.querySelectorAll('[data-sidebar-menu-item]');
    const menuTexts: string[] = [];
    const duplicates: string[] = [];

    menuItems.forEach(item => {
      const text = item.textContent?.trim() || '';
      if (menuTexts.includes(text) && !duplicates.includes(text)) {
        duplicates.push(text);
      }
      menuTexts.push(text);
    });

    return duplicates;
  }, []);

  // Verificar rotas inválidas
  const checkInvalidRoutes = useCallback((): string[] => {
    const menuLinks = document.querySelectorAll('[data-sidebar-menu-item] a');
    const invalidRoutes: string[] = [];

    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !auditConfig.validRoutes.includes(href)) {
        invalidRoutes.push(href);
      }
    });

    return invalidRoutes;
  }, [auditConfig.validRoutes]);

  // Verificar integridade dos dados
  const checkDataIntegrity = useCallback((): boolean => {
    return auditConfig.requiredDataSelectors.every(selector => {
      const element = document.querySelector(selector);
      return element && element.textContent && element.textContent.trim().length > 0;
    });
  }, [auditConfig.requiredDataSelectors]);

  // Verificar consistência do design moderno
  const checkDesignConsistency = useCallback((): boolean => {
    const modernDesignElements = document.querySelectorAll('.dashboard-unificado, .bg-gradient-to-br');
    const hasModernLayout = document.querySelector('.dashboard-unificado') !== null;
    
    return hasModernLayout && modernDesignElements.length > 0;
  }, []);

  // Métricas de performance
  const checkPerformanceMetrics = useCallback(() => {
    const loadTime = performance.now();
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    const consoleErrors = (console as any).errorCount || 0;

    return {
      loadTime,
      memoryUsage,
      consoleErrors
    };
  }, []);

  // Executar auditoria completa
  const runAudit = useCallback(async () => {
    console.log('🔍 Iniciando auditoria completa de interface...');

    const duplicateMenus = checkDuplicateMenus();
    const invalidRoutes = checkInvalidRoutes();
    const dataIntegrity = checkDataIntegrity();
    const designConsistency = checkDesignConsistency();
    const performanceMetrics = checkPerformanceMetrics();

    const result: AuditResult = {
      duplicateMenus,
      invalidRoutes,
      dataIntegrity,
      designConsistency,
      performanceMetrics,
      lastAudit: new Date().toISOString()
    };

    setAuditResult(result);

    // Log dos resultados
    if (duplicateMenus.length > 0) {
      console.warn('⚠️ Menus duplicados detectados:', duplicateMenus);
    }

    if (invalidRoutes.length > 0) {
      console.warn('⚠️ Rotas inválidas detectadas:', invalidRoutes);
    }

    if (!dataIntegrity) {
      console.error('❌ Alguns dados críticos não estão sendo carregados.');
    } else {
      console.log('✅ Dados operacionais carregados corretamente.');
    }

    if (!designConsistency) {
      console.warn('⚠️ Design moderno não detectado corretamente.');
    } else {
      console.log('✅ Design moderno unificado aplicado.');
    }

    console.log('📊 Métricas de performance:', performanceMetrics);
    console.log('✅ Auditoria completa concluída.');

    return result;
  }, [checkDuplicateMenus, checkInvalidRoutes, checkDataIntegrity, checkDesignConsistency, checkPerformanceMetrics]);

  // Auto-auditoria quando a rota muda
  useEffect(() => {
    const timer = setTimeout(() => {
      runAudit();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname, runAudit]);

  return {
    auditResult,
    runAudit,
    isHealthy: auditResult.duplicateMenus.length === 0 && 
               auditResult.invalidRoutes.length === 0 && 
               auditResult.dataIntegrity && 
               auditResult.designConsistency,
    performanceScore: auditResult.performanceMetrics.loadTime < 2000 ? 'good' : 'needs-improvement'
  };
}
