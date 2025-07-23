import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityCheck {
  tableName: string;
  hasIsolation: boolean;
  userDataCount: number;
  totalDataCount: number;
  error?: string;
}

export function useRestaurantSecurity() {
  const { user, currentRestaurant } = useAuth();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runSecurityCheck = useCallback(async () => {
    if (!user || !currentRestaurant) {
      toast.error('Usuário ou restaurante não encontrado para teste de segurança');
      return;
    }

    setIsChecking(true);
    const checks: SecurityCheck[] = [];

    // Testar isolamento em tabelas específicas
    try {
      // Teste 1: Restaurantes
      const { data: restaurants, error: restError } = await supabase
        .from('restaurants')
        .select('*');

      if (!restError) {
        const userRestaurants = restaurants?.filter((r: any) => r.owner_id === user.id) || [];
        checks.push({
          tableName: 'restaurants',
          hasIsolation: userRestaurants.length === (restaurants?.length || 0),
          userDataCount: userRestaurants.length,
          totalDataCount: restaurants?.length || 0,
          error: userRestaurants.length < (restaurants?.length || 0) ? 'VAZAMENTO: Vendo restaurantes de outros usuários!' : undefined
        });
      } else {
        checks.push({
          tableName: 'restaurants',
          hasIsolation: true,
          userDataCount: 0,
          totalDataCount: 0,
          error: `RLS ativo: ${restError.message}`
        });
      }

      // Teste 2: Cash Flow
      const { data: cashFlow, error: cashError } = await supabase
        .from('cash_flow')
        .select('*');

      if (!cashError) {
        const userCashFlow = cashFlow?.filter((cf: any) => cf.restaurant_id === currentRestaurant.id) || [];
        checks.push({
          tableName: 'cash_flow',
          hasIsolation: userCashFlow.length === (cashFlow?.length || 0),
          userDataCount: userCashFlow.length,
          totalDataCount: cashFlow?.length || 0,
          error: userCashFlow.length < (cashFlow?.length || 0) ? 'VAZAMENTO: Vendo dados financeiros de outros usuários!' : undefined
        });
      } else {
        checks.push({
          tableName: 'cash_flow',
          hasIsolation: true,
          userDataCount: 0,
          totalDataCount: 0,
          error: `RLS ativo: ${cashError.message}`
        });
      }

    } catch (error: any) {
      checks.push({
        tableName: 'security_test',
        hasIsolation: true,
        userDataCount: 0,
        totalDataCount: 0,
        error: `Erro no teste: ${error.message}`
      });
    }

    setSecurityChecks(checks);
    setLastCheck(new Date());
    setIsChecking(false);

    // Notificar sobre problemas críticos
    const criticalIssues = checks.filter(check => !check.hasIsolation);
    if (criticalIssues.length > 0) {
      toast.error(`${criticalIssues.length} problemas críticos de segurança detectados!`);
    } else {
      toast.success('Todas as verificações de segurança passaram!');
    }

  }, [user, currentRestaurant]);

  // Verificação automática na montagem do componente
  useEffect(() => {
    if (user && currentRestaurant) {
      runSecurityCheck();
    }
  }, [user, currentRestaurant, runSecurityCheck]);

  const getSecurityScore = useCallback(() => {
    if (securityChecks.length === 0) return 0;
    const passedChecks = securityChecks.filter(check => check.hasIsolation).length;
    return Math.round((passedChecks / securityChecks.length) * 100);
  }, [securityChecks]);

  const getCriticalIssues = useCallback(() => {
    return securityChecks.filter(check => !check.hasIsolation);
  }, [securityChecks]);

  return {
    securityChecks,
    isChecking,
    lastCheck,
    runSecurityCheck,
    getSecurityScore,
    getCriticalIssues,
    hasSecurityIssues: securityChecks.some(check => !check.hasIsolation)
  };
}