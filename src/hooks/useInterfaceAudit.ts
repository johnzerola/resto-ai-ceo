
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface AuditResult {
  duplicateMenus: string[];
  invalidRoutes: string[];
  dataIntegrity: boolean;
  designConsistency: boolean;
  lastAudit: string;
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
    lastAudit: ''
  });

  const defaultConfig: AuditConfig = {
    validRoutes: [
      '/',
      '/projecoes', 
      '/fluxo-de-caixa',
      '/dre',
      '/cmv',
      '/simulador',
      '/metas',
      '/estoque',
      '/cardapio',
      '/ai-assistant',
      '/gerenciar-usuarios',
      '/assinatura',
      '/configuracoes',
      '/documentacao',
      '/privacidade'
    ],
    requiredDataSelectors: [
      '[data-testid="dashboard-metrics"]',
      '[data-testid="financial-data"]',
      '[data-testid="goals-data"]'
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

  // Verificar consistência do design
  const checkDesignConsistency = useCallback((): boolean => {
    const oldDesignElements = document.querySelectorAll('.design-antigo');
    const newDesignElements = document.querySelectorAll('.dashboard-unificado, .bg-gradient-to-br');
    
    return oldDesignElements.length === 0 && newDesignElements.length > 0;
  }, []);

  // Executar auditoria completa
  const runAudit = useCallback(async () => {
    console.log('🔍 Iniciando auditoria de interface...');

    const duplicateMenus = checkDuplicateMenus();
    const invalidRoutes = checkInvalidRoutes();
    const dataIntegrity = checkDataIntegrity();
    const designConsistency = checkDesignConsistency();

    const result: AuditResult = {
      duplicateMenus,
      invalidRoutes,
      dataIntegrity,
      designConsistency,
      lastAudit: new Date().toISOString()
    };

    setAuditResult(result);

    // Log results
    if (duplicateMenus.length > 0) {
      console.warn('⚠️ Menus duplicados detectados:', duplicateMenus);
    }

    if (invalidRoutes.length > 0) {
      console.warn('⚠️ Rotas inválidas detectadas:', invalidRoutes);
    }

    if (!dataIntegrity) {
      console.error('❌ Alguns dados críticos não estão sendo carregados corretamente.');
    } else {
      console.log('✅ Dados operacionais carregados corretamente.');
    }

    if (!designConsistency) {
      console.warn('⚠️ Inconsistências de design detectadas.');
    } else {
      console.log('✅ Design consistente aplicado.');
    }

    console.log('✅ Auditoria visual e funcional concluída.');

    return result;
  }, [checkDuplicateMenus, checkInvalidRoutes, checkDataIntegrity, checkDesignConsistency]);

  // Auto-auditoria quando a rota muda
  useEffect(() => {
    const timer = setTimeout(() => {
      runAudit();
    }, 1000); // Aguarda 1 segundo após mudança de rota

    return () => clearTimeout(timer);
  }, [location.pathname, runAudit]);

  // Auditoria automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(runAudit, 30000);
    return () => clearInterval(interval);
  }, [runAudit]);

  return {
    auditResult,
    runAudit,
    isHealthy: auditResult.duplicateMenus.length === 0 && 
               auditResult.invalidRoutes.length === 0 && 
               auditResult.dataIntegrity && 
               auditResult.designConsistency
  };
}
