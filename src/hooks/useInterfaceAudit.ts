
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
      '/fluxo-caixa',
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
    const menuItems = document.querySelectorAll('[role="menuitem"], a[href], button');
    const textMap = new Map<string, number>();
    const duplicates: string[] = [];

    menuItems.forEach((item) => {
      const text = item.textContent?.trim();
      if (text && text.length > 2) {
        const count = textMap.get(text) || 0;
        textMap.set(text, count + 1);
        if (count === 1) {
          duplicates.push(text);
        }
      }
    });

    return duplicates;
  }, []);

  // Verificar integridade dos dados
  const checkDataIntegrity = useCallback((): boolean => {
    try {
      // Verificar se elementos essenciais estão presentes
      const hasRequiredElements = auditConfig.requiredDataSelectors.every(selector => {
        return document.querySelector(selector) !== null;
      });

      // Verificar se há erros de console relacionados a dados
      const consoleErrors = (window as any).__consoleErrors || 0;
      
      return hasRequiredElements && consoleErrors < 5;
    } catch (error) {
      console.warn('Erro na verificação de integridade:', error);
      return false;
    }
  }, [auditConfig.requiredDataSelectors]);

  // Verificar consistência de design
  const checkDesignConsistency = useCallback((): boolean => {
    try {
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');
      
      // Verificar se botões têm classes consistentes
      const buttonClasses = Array.from(buttons).map(btn => 
        Array.from(btn.classList).filter(cls => cls.includes('btn') || cls.includes('button')).join(' ')
      );
      
      const uniqueButtonClasses = new Set(buttonClasses);
      const hasConsistentButtons = uniqueButtonClasses.size <= 3; // Máximo 3 tipos de botão

      // Verificar se inputs têm altura consistente
      const inputHeights = Array.from(inputs).map(input => 
        window.getComputedStyle(input).height
      );
      
      const uniqueHeights = new Set(inputHeights);
      const hasConsistentInputs = uniqueHeights.size <= 2; // Máximo 2 alturas diferentes

      return hasConsistentButtons && hasConsistentInputs;
    } catch (error) {
      console.warn('Erro na verificação de design:', error);
      return false;
    }
  }, []);

  // Executar auditoria completa
  const runFullAudit = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      const duplicateMenus = checkDuplicateMenus();
      const dataIntegrity = checkDataIntegrity();
      const designConsistency = checkDesignConsistency();
      
      // Verificar rotas inválidas
      const currentRoute = location.pathname;
      const invalidRoutes = auditConfig.validRoutes.includes(currentRoute) ? [] : [currentRoute];
      
      // Métricas de performance
      const loadTime = performance.now() - startTime;
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      const consoleErrors = (window as any).__consoleErrors || 0;

      setAuditResult({
        duplicateMenus,
        invalidRoutes,
        dataIntegrity,
        designConsistency,
        lastAudit: new Date().toISOString(),
        performanceMetrics: {
          loadTime,
          memoryUsage,
          consoleErrors
        }
      });

    } catch (error) {
      console.error('Erro na auditoria:', error);
    }
  }, [location.pathname, checkDuplicateMenus, checkDataIntegrity, checkDesignConsistency, auditConfig.validRoutes]);

  // Executar auditoria quando a rota mudar
  useEffect(() => {
    const timer = setTimeout(runFullAudit, 1000); // Aguardar 1s para a página carregar
    return () => clearTimeout(timer);
  }, [runFullAudit]);

  // Monitorar erros de console
  useEffect(() => {
    const originalError = console.error;
    (window as any).__consoleErrors = 0;

    console.error = (...args) => {
      (window as any).__consoleErrors++;
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Calcular se o sistema está saudável
  const isHealthy = auditResult.duplicateMenus.length === 0 && 
                   auditResult.invalidRoutes.length === 0 && 
                   auditResult.dataIntegrity && 
                   auditResult.designConsistency;

  // Calcular pontuação de performance
  const performanceScore = auditResult.performanceMetrics.loadTime < 100 && 
                          auditResult.performanceMetrics.consoleErrors < 3 ? 'good' : 'needs-improvement';

  return {
    auditResult,
    runFullAudit,
    runAudit: runFullAudit, // Alias for backward compatibility
    isHealthy,
    performanceScore
  };
}
