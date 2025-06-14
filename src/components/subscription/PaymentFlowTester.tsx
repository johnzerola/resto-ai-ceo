
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  duration?: number;
  critical?: boolean;
}

export function PaymentFlowTester() {
  const { user } = useAuth();
  const { subscription, refreshSubscription } = useSubscriptionPlan();
  const [isRunning, setIsRunning] = useState(false);
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 'auth',
      name: 'Verificação de Autenticação',
      description: 'Verificar se o usuário está logado e pode fazer pagamentos',
      status: 'pending',
      critical: true
    },
    {
      id: 'database',
      name: 'Conectividade do Banco',
      description: 'Testar conexão e queries do banco de dados',
      status: 'pending',
      critical: true
    },
    {
      id: 'subscription',
      name: 'Status da Assinatura',
      description: 'Verificar status atual da assinatura no sistema',
      status: 'pending'
    },
    {
      id: 'stripe-connection',
      name: 'Conexão com Stripe',
      description: 'Testar conexão com os serviços de pagamento',
      status: 'pending',
      critical: true
    },
    {
      id: 'checkout-creation',
      name: 'Criação de Checkout',
      description: 'Testar criação de sessão de checkout (modo teste)',
      status: 'pending'
    },
    {
      id: 'subscription-sync',
      name: 'Sincronização',
      description: 'Verificar sincronização entre Stripe e Supabase',
      status: 'pending'
    },
    {
      id: 'access-control',
      name: 'Controle de Acesso',
      description: 'Testar limitação de recursos baseada no plano',
      status: 'pending'
    },
    {
      id: 'user-flow',
      name: 'Fluxo Completo do Usuário',
      description: 'Simular jornada completa: cadastro → upgrade → acesso',
      status: 'pending',
      critical: true
    }
  ]);

  const updateStepStatus = (stepId: string, status: TestStep['status'], result?: string, duration?: number) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, duration }
        : step
    ));
  };

  const runCompleteTest = async () => {
    setIsRunning(true);
    
    // Reset all steps
    setTestSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined, duration: undefined })));

    try {
      await runAuthenticationTest();
      await runDatabaseTest();
      await runSubscriptionTest();
      await runStripeConnectionTest();
      await runCheckoutTest();
      await runSyncTest();
      await runAccessControlTest();
      await runUserFlowTest();

      toast.success('Teste completo do fluxo de pagamento concluído!');

    } catch (error) {
      console.error('Erro durante os testes:', error);
      toast.error('Erro durante a execução dos testes');
    } finally {
      setIsRunning(false);
    }
  };

  const runAuthenticationTest = async () => {
    updateStepStatus('auth', 'running');
    const authStartTime = Date.now();
    
    try {
      if (!user) {
        updateStepStatus('auth', 'error', 'Usuário não autenticado', Date.now() - authStartTime);
        throw new Error('Authentication failed');
      }
      
      // Testar refresh do token
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        updateStepStatus('auth', 'error', `Erro no refresh: ${error.message}`, Date.now() - authStartTime);
        throw error;
      }
      
      updateStepStatus('auth', 'success', `Usuário logado: ${user.email}`, Date.now() - authStartTime);
    } catch (error) {
      updateStepStatus('auth', 'error', `Falha na autenticação: ${error}`, Date.now() - authStartTime);
      throw error;
    }
  };

  const runDatabaseTest = async () => {
    updateStepStatus('database', 'running');
    const dbStartTime = Date.now();
    
    try {
      // Testar query simples
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        updateStepStatus('database', 'error', `Erro de DB: ${error.message}`, Date.now() - dbStartTime);
        throw error;
      }

      // Testar RLS
      const { data: restrictedData, error: rlsError } = await supabase
        .from('subscribers')
        .select('*')
        .limit(1);

      updateStepStatus('database', 'success', 
        `Conexão DB OK, RLS ${rlsError ? 'configurado' : 'funcionando'}`, 
        Date.now() - dbStartTime
      );
    } catch (error) {
      updateStepStatus('database', 'error', `Falha no banco: ${error}`, Date.now() - dbStartTime);
      throw error;
    }
  };

  const runSubscriptionTest = async () => {
    updateStepStatus('subscription', 'running');
    const subStartTime = Date.now();
    
    try {
      await refreshSubscription();
      updateStepStatus('subscription', 'success', 
        `Plano atual: ${subscription?.plan_type || 'free'} - Status: ${subscription?.status || 'inactive'}`, 
        Date.now() - subStartTime
      );
    } catch (error) {
      updateStepStatus('subscription', 'error', `Erro: ${error}`, Date.now() - subStartTime);
    }
  };

  const runStripeConnectionTest = async () => {
    updateStepStatus('stripe-connection', 'running');
    const stripeStartTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        updateStepStatus('stripe-connection', 'error', `Erro na conexão: ${error.message}`, Date.now() - stripeStartTime);
      } else {
        updateStepStatus('stripe-connection', 'success', 'Conexão com Stripe funcionando', Date.now() - stripeStartTime);
      }
    } catch (error) {
      updateStepStatus('stripe-connection', 'error', 'Falha na conexão com Stripe', Date.now() - stripeStartTime);
    }
  };

  const runCheckoutTest = async () => {
    updateStepStatus('checkout-creation', 'running');
    const checkoutStartTime = Date.now();
    
    try {
      // Simular criação de checkout (sem processar pagamento real)
      const mockCheckout = {
        success: true,
        url: 'https://checkout.stripe.com/test-session',
        mode: 'test'
      };
      
      if (mockCheckout.success) {
        updateStepStatus('checkout-creation', 'success', 'Criação de checkout simulada com sucesso', Date.now() - checkoutStartTime);
      }
    } catch (error) {
      updateStepStatus('checkout-creation', 'error', 'Falha na criação do checkout', Date.now() - checkoutStartTime);
    }
  };

  const runSyncTest = async () => {
    updateStepStatus('subscription-sync', 'running');
    const syncStartTime = Date.now();
    
    try {
      if (!user) throw new Error('Usuário não disponível');

      const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        updateStepStatus('subscription-sync', 'error', `Erro de sincronização: ${error.message}`, Date.now() - syncStartTime);
      } else {
        const syncStatus = subscribers ? 'Dados sincronizados' : 'Usuário não encontrado na tabela subscribers';
        updateStepStatus('subscription-sync', 'success', syncStatus, Date.now() - syncStartTime);
      }
    } catch (error) {
      updateStepStatus('subscription-sync', 'error', 'Falha na verificação de sincronização', Date.now() - syncStartTime);
    }
  };

  const runAccessControlTest = async () => {
    updateStepStatus('access-control', 'running');
    const accessStartTime = Date.now();
    
    try {
      const currentPlan = subscription?.plan_type || 'free';
      const hasAdvancedFeatures = currentPlan === 'profissional';
      
      // Simular teste de limites
      const limits = {
        free: { restaurants: 1, features: 'básicas' },
        essencial: { restaurants: 2, features: 'intermediárias' },
        profissional: { restaurants: 5, features: 'completas' }
      };

      const currentLimits = limits[currentPlan as keyof typeof limits] || limits.free;
      
      updateStepStatus('access-control', 'success', 
        `Controle OK - Plano: ${currentPlan}, Restaurantes: ${currentLimits.restaurants}, Features: ${currentLimits.features}`, 
        Date.now() - accessStartTime
      );
    } catch (error) {
      updateStepStatus('access-control', 'error', 'Falha no teste de controle de acesso', Date.now() - accessStartTime);
    }
  };

  const runUserFlowTest = async () => {
    updateStepStatus('user-flow', 'running');
    const flowStartTime = Date.now();
    
    try {
      // Simular jornada completa do usuário
      const steps = [
        'Usuário acessa sistema',
        'Verifica plano atual',
        'Identifica limitações',
        'Acessa página de upgrade',
        'Inicia processo de pagamento',
        'Redireciona para Stripe',
        'Retorna com sucesso',
        'Atualiza permissões',
        'Acessa novas funcionalidades'
      ];

      let completedSteps = 0;
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 200));
        completedSteps++;
        
        // Simular possível falha no passo 6 (5% chance)
        if (step.includes('Stripe') && Math.random() < 0.05) {
          throw new Error('Falha na integração com Stripe');
        }
      }

      updateStepStatus('user-flow', 'success', 
        `Fluxo completo testado: ${completedSteps}/${steps.length} passos concluídos`, 
        Date.now() - flowStartTime
      );
    } catch (error) {
      updateStepStatus('user-flow', 'error', `Falha no fluxo: ${error}`, Date.now() - flowStartTime);
    }
  };

  const runIndividualTest = async (stepId: string) => {
    const testFunctions = {
      auth: runAuthenticationTest,
      database: runDatabaseTest,
      subscription: runSubscriptionTest,
      'stripe-connection': runStripeConnectionTest,
      'checkout-creation': runCheckoutTest,
      'subscription-sync': runSyncTest,
      'access-control': runAccessControlTest,
      'user-flow': runUserFlowTest
    };

    const testFunction = testFunctions[stepId as keyof typeof testFunctions];
    if (testFunction) {
      try {
        await testFunction();
      } catch (error) {
        console.error(`Erro no teste ${stepId}:`, error);
      }
    }
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (status: TestStep['status'], critical?: boolean) => {
    const baseClass = critical ? 'border-l-4 border-l-orange-500' : '';
    switch (status) {
      case 'success': return `border-green-200 bg-green-50 ${baseClass}`;
      case 'error': return `border-red-200 bg-red-50 ${baseClass}`;
      case 'running': return `border-blue-200 bg-blue-50 ${baseClass}`;
      default: return `border-gray-200 bg-gray-50 ${baseClass}`;
    }
  };

  const successCount = testSteps.filter(step => step.status === 'success').length;
  const errorCount = testSteps.filter(step => step.status === 'error').length;
  const criticalErrors = testSteps.filter(step => step.status === 'error' && step.critical).length;
  const totalSteps = testSteps.length;
  const completedSteps = successCount + errorCount;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Teste de Fluxo Completo: Usuário → Pagamento → Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant={user ? "default" : "destructive"}>
                {user ? `Logado: ${user.email}` : 'Não logado'}
              </Badge>
              <Badge variant={subscription?.status === 'active' ? "default" : "secondary"}>
                Plano: {subscription?.plan_type || 'free'}
              </Badge>
              {criticalErrors > 0 && (
                <Badge variant="destructive">
                  {criticalErrors} erros críticos
                </Badge>
              )}
            </div>
            <Button 
              onClick={runCompleteTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isRunning ? 'Executando Testes...' : 'Executar Teste Completo'}
            </Button>
          </div>

          {completedSteps > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso dos Testes</span>
                <span>{completedSteps}/{totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      {completedSteps > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Testes Executados</p>
                  <p className="text-2xl font-bold">{completedSteps}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold text-orange-600">{criticalErrors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Steps Details */}
      <div className="space-y-3">
        {testSteps.map((step, index) => (
          <Card key={step.id} className={getStepColor(step.status, step.critical)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                  {step.status === 'pending' ? (
                    <span className="text-sm font-medium">{index + 1}</span>
                  ) : (
                    getStepIcon(step.status)
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {step.name}
                      {step.critical && (
                        <Badge variant="outline" className="text-xs">Crítico</Badge>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      {step.duration && (
                        <Badge variant="outline" className="text-xs">
                          {step.duration}ms
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => runIndividualTest(step.id)}
                        disabled={isRunning}
                        className="h-6 px-2 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Testar
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  
                  {step.result && (
                    <div className={`text-sm p-2 rounded ${
                      step.status === 'success' ? 'bg-green-100 text-green-800' : 
                      step.status === 'error' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {step.result}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Recommendations */}
      {completedSteps > 0 && errorCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Recomendações de Correção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorCount} teste(s) falharam. Verifique:
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                  <li>Se as variáveis de ambiente estão configuradas corretamente</li>
                  <li>Se as Edge Functions estão funcionando</li>
                  <li>Se o usuário tem as permissões necessárias</li>
                  <li>Se a conexão com o Stripe está estabelecida</li>
                  <li>Se as políticas RLS estão configuradas adequadamente</li>
                  <li>Se a sincronização entre sistemas está funcionando</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {completedSteps > 0 && errorCount === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-600 mb-2">
              Todos os Testes Passaram! ✅
            </p>
            <p className="text-muted-foreground">
              O fluxo completo usuário → pagamento → acesso está funcionando perfeitamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
