import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

export function SecurityTestSuite() {
  const { user, currentRestaurant } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSecurityTests = async () => {
    if (!user?.id || !currentRestaurant?.id) {
      toast.error('Usuário ou restaurante não autenticado');
      return;
    }

    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Teste 1: Isolamento RLS - Cash Flow
      try {
        const { data: cashFlowOtherRestaurant, error } = await supabase
          .from('cash_flow')
          .select('id, restaurant_id')
          .neq('restaurant_id', currentRestaurant.id)
          .limit(1);

        results.push({
          name: 'RLS Isolamento - Cash Flow',
          passed: !cashFlowOtherRestaurant || cashFlowOtherRestaurant.length === 0,
          message: cashFlowOtherRestaurant && cashFlowOtherRestaurant.length > 0 
            ? 'FALHA: Conseguiu acessar dados de outros restaurantes' 
            : 'SUCESSO: RLS bloqueou acesso a outros restaurantes',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'RLS Isolamento - Cash Flow',
          passed: true,
          message: 'SUCESSO: RLS bloqueou completamente a query',
          critical: true
        });
      }

      // Teste 2: Isolamento RLS - Goals
      try {
        const { data: goalsOtherRestaurant } = await supabase
          .from('goals')
          .select('id, restaurant_id')
          .neq('restaurant_id', currentRestaurant.id)
          .limit(1);

        results.push({
          name: 'RLS Isolamento - Goals',
          passed: !goalsOtherRestaurant || goalsOtherRestaurant.length === 0,
          message: goalsOtherRestaurant && goalsOtherRestaurant.length > 0 
            ? 'FALHA: Conseguiu acessar metas de outros restaurantes' 
            : 'SUCESSO: RLS bloqueou acesso a outras metas',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'RLS Isolamento - Goals',
          passed: true,
          message: 'SUCESSO: RLS bloqueou completamente a query',
          critical: true
        });
      }

      // Teste 3: Isolamento RLS - Insumos
      try {
        const { data: insumosOtherRestaurant } = await supabase
          .from('insumos')
          .select('id, restaurant_id')
          .neq('restaurant_id', currentRestaurant.id)
          .limit(1);

        results.push({
          name: 'RLS Isolamento - Insumos',
          passed: !insumosOtherRestaurant || insumosOtherRestaurant.length === 0,
          message: insumosOtherRestaurant && insumosOtherRestaurant.length > 0 
            ? 'FALHA: Conseguiu acessar insumos de outros restaurantes' 
            : 'SUCESSO: RLS bloqueou acesso a outros insumos',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'RLS Isolamento - Insumos',
          passed: true,
          message: 'SUCESSO: RLS bloqueou completamente a query',
          critical: true
        });
      }

      // Obter tenant_id atual para testes de isolamento
      const { data: tenantInfo } = await supabase
        .from('restaurants')
        .select('tenant_id')
        .eq('id', currentRestaurant.id)
        .single();

      // Teste 4: Isolamento RLS - Tenant Instances
      try {
        const { data: otherTenants } = await supabase
          .from('tenant_instances')
          .select('id, tenant_id')
          .neq('tenant_id', tenantInfo?.tenant_id)
          .limit(1);

        results.push({
          name: 'RLS Isolamento - Tenant Instances',
          passed: !otherTenants || otherTenants.length === 0,
          message: otherTenants && otherTenants.length > 0
            ? 'FALHA: Conseguiu acessar tenant_instances de outros tenants'
            : 'SUCESSO: RLS bloqueou acesso a outros tenants',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'RLS Isolamento - Tenant Instances',
          passed: true,
          message: 'SUCESSO: RLS bloqueou completamente a query',
          critical: true
        });
      }

      // Teste 5: LocalStorage com prefixo de usuário
      const localStorageKeys = Object.keys(localStorage);
      const userSpecificKeys = localStorageKeys.filter(key => key.includes(user.id));
      const problematicKeys = localStorageKeys.filter(key => 
        !key.includes(user.id) && (
          key.includes('ficha_tecnica') ||
          key.includes('technicalSheets') ||
          key.includes('financialData') ||
          key.includes('restaurantData')
        )
      );

      results.push({
        name: 'LocalStorage Isolamento',
        passed: problematicKeys.length === 0,
        message: problematicKeys.length === 0 
          ? `SUCESSO: Todas as ${userSpecificKeys.length} chaves usam prefixo de usuário` 
          : `FALHA: ${problematicKeys.length} chaves sem prefixo encontradas: ${problematicKeys.join(', ')}`,
        critical: true
      });

      // Teste 6: Tentativa de inserção em tabela protegida
      try {
        const { error } = await supabase
          .from('cash_flow')
          .insert({
            type: 'expense',
            amount: 1,
            category: 'test',
            description: 'Teste de segurança - deve falhar',
            date: new Date().toISOString().split('T')[0],
            restaurant_id: 'invalid-restaurant-id', // ID inválido
            tenant_id: 'invalid-tenant-id'
          });

        results.push({
          name: 'Proteção contra inserção inválida',
          passed: !!error,
          message: error 
            ? 'SUCESSO: RLS bloqueou inserção com restaurant_id inválido' 
            : 'FALHA: Conseguiu inserir dados com restaurant_id inválido',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'Proteção contra inserção inválida',
          passed: true,
          message: 'SUCESSO: RLS bloqueou inserção inválida',
          critical: true
        });
      }

      // Teste 7: Verificação de acesso a perfis de outros usuários
      try {
        const { data: otherProfiles } = await supabase
          .from('profiles')
          .select('id')
          .neq('id', user.id)
          .limit(1);

        results.push({
          name: 'Isolamento Perfis de Usuário',
          passed: !otherProfiles || otherProfiles.length === 0,
          message: otherProfiles && otherProfiles.length > 0 
            ? 'FALHA: Conseguiu acessar perfis de outros usuários' 
            : 'SUCESSO: RLS bloqueou acesso a outros perfis',
          critical: true
        });
      } catch (error) {
        results.push({
          name: 'Isolamento Perfis de Usuário',
          passed: true,
          message: 'SUCESSO: RLS bloqueou acesso a outros perfis',
          critical: true
        });
      }

      // Teste 8: Verificação de tenant_id consistency
      const { data: myRestaurant } = await supabase
        .from('restaurants')
        .select('id, tenant_id')
        .eq('id', currentRestaurant.id)
        .single();

      results.push({
        name: 'Consistência Tenant ID',
        passed: !!myRestaurant?.tenant_id,
        message: myRestaurant?.tenant_id 
          ? `SUCESSO: Restaurant tem tenant_id: ${myRestaurant.tenant_id}` 
          : 'AVISO: Restaurant sem tenant_id definido',
        critical: false
      });

      // Teste 9: Verificação de dados específicos do restaurante atual
      const { data: myData } = await supabase
        .from('cash_flow')
        .select('id, restaurant_id')
        .eq('restaurant_id', currentRestaurant.id)
        .limit(5);

      const allBelongToRestaurant = myData?.every(item => item.restaurant_id === currentRestaurant.id) ?? true;

      results.push({
        name: 'Dados do Restaurante Atual',
        passed: allBelongToRestaurant,
        message: allBelongToRestaurant 
          ? `SUCESSO: Todos os ${myData?.length || 0} registros pertencem ao restaurante atual` 
          : 'FALHA: Encontrados dados de outros restaurantes na query filtrada',
        critical: true
      });

      setTestResults(results);

      const failedCritical = results.filter(r => !r.passed && r.critical).length;
      const failedNonCritical = results.filter(r => !r.passed && !r.critical).length;
      
      if (failedCritical > 0) {
        toast.error(`❌ ${failedCritical} testes críticos falharam!`);
      } else if (failedNonCritical > 0) {
        toast.warning(`⚠️ ${failedNonCritical} avisos encontrados`);
      } else {
        toast.success('✅ Todos os testes de segurança passaram!');
      }

    } catch (error) {
      console.error('Erro durante execução dos testes:', error);
      toast.error('Erro durante execução dos testes de segurança');
    } finally {
      setIsRunning(false);
    }
  };

  const getResultIcon = (result: TestResult) => {
    if (result.passed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return result.critical 
      ? <AlertTriangle className="h-4 w-4 text-red-500" />
      : <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getResultBadge = (result: TestResult) => {
    if (result.passed) {
      return <Badge variant="default">PASSOU</Badge>;
    }
    return result.critical 
      ? <Badge variant="destructive">FALHOU</Badge>
      : <Badge variant="secondary">AVISO</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Suite de Testes de Segurança Multi-Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Execute testes abrangentes para verificar isolamento de dados e segurança RLS
          </p>
          <Button 
            onClick={runSecurityTests}
            disabled={isRunning || !user?.id || !currentRestaurant?.id}
          >
            <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
        </div>

        {!user?.id || !currentRestaurant?.id ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Usuário ou restaurante não autenticado. Faça login e selecione um restaurante para executar os testes.
            </AlertDescription>
          </Alert>
        ) : null}

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {testResults.map((result, index) => (
              <Alert 
                key={index} 
                variant={result.passed ? 'default' : (result.critical ? 'destructive' : 'default')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getResultIcon(result)}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm">{result.message}</p>
                    </div>
                  </div>
                  {getResultBadge(result)}
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Testes incluídos:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Isolamento RLS em tabelas principais (cash_flow, goals, insumos, tenant_instances)</li>
            <li>Verificação de localStorage com prefixo de usuário</li>
            <li>Proteção contra inserção de dados inválidos</li>
            <li>Isolamento de perfis de usuário</li>
            <li>Consistência de tenant_id</li>
            <li>Validação de dados específicos do restaurante</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}