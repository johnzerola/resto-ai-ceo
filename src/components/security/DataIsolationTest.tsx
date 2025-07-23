import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityTest {
  name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  details?: string;
}

export function DataIsolationTest() {
  const { user, currentRestaurant } = useAuth();
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const securityTests: Omit<SecurityTest, 'status' | 'details'>[] = [
    {
      name: 'Isolamento de Restaurantes',
      description: 'Verificar se o usuário só acessa dados do próprio restaurante'
    },
    {
      name: 'Proteção de Cash Flow',
      description: 'Testar se não é possível acessar fluxo de caixa de outros usuários'
    },
    {
      name: 'Isolamento de Receitas',
      description: 'Verificar se receitas são isoladas por restaurante'
    },
    {
      name: 'Proteção de Estoque',
      description: 'Testar acesso ao inventário por usuário autorizado'
    },
    {
      name: 'Validação RLS Geral',
      description: 'Teste geral das políticas Row Level Security'
    }
  ];

  useEffect(() => {
    setTests(securityTests.map(test => ({ ...test, status: 'pending' })));
  }, []);

  const runSecurityTests = async () => {
    if (!user || !currentRestaurant) {
      toast.error('Usuário ou restaurante não encontrado');
      return;
    }

    setIsRunning(true);
    const updatedTests: SecurityTest[] = [];

    try {
      // Teste 1: Isolamento de Restaurantes
      try {
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('*');

        if (error) throw error;

        const userRestaurants = restaurants?.filter(r => r.owner_id === user.id) || [];
        const allRestaurants = restaurants || [];

        updatedTests.push({
          name: 'Isolamento de Restaurantes',
          description: 'Verificar se o usuário só acessa dados do próprio restaurante',
          status: userRestaurants.length === allRestaurants.length ? 'passed' : 'failed',
          details: `Acesso a ${userRestaurants.length}/${allRestaurants.length} restaurantes. ${
            userRestaurants.length === allRestaurants.length 
              ? 'RLS funcionando corretamente.' 
              : 'FALHA: Acesso a restaurantes de outros usuários!'
          }`
        });
      } catch (error) {
        updatedTests.push({
          name: 'Isolamento de Restaurantes',
          description: 'Verificar se o usuário só acessa dados do próprio restaurante',
          status: 'failed',
          details: `Erro no teste: ${error.message}`
        });
      }

      // Teste 2: Proteção de Cash Flow
      try {
        const { data: cashFlow, error } = await supabase
          .from('cash_flow')
          .select('*, restaurant_id');

        if (error) throw error;

        const userCashFlow = cashFlow?.filter(cf => 
          cf.restaurant_id === currentRestaurant.id
        ) || [];
        const allCashFlow = cashFlow || [];

        updatedTests.push({
          name: 'Proteção de Cash Flow',
          description: 'Testar se não é possível acessar fluxo de caixa de outros usuários',
          status: userCashFlow.length === allCashFlow.length ? 'passed' : 'failed',
          details: `Acesso a ${userCashFlow.length}/${allCashFlow.length} registros de cash flow. ${
            userCashFlow.length === allCashFlow.length 
              ? 'RLS funcionando corretamente.' 
              : 'FALHA: Acesso a dados financeiros de outros usuários!'
          }`
        });
      } catch (error) {
        updatedTests.push({
          name: 'Proteção de Cash Flow',
          description: 'Testar se não é possível acessar fluxo de caixa de outros usuários',
          status: 'failed',
          details: `Erro no teste: ${error.message}`
        });
      }

      // Teste 3: Isolamento de Receitas
      try {
        const { data: recipes, error } = await supabase
          .from('recipes')
          .select('*, restaurant_id');

        if (error) throw error;

        const userRecipes = recipes?.filter(r => 
          r.restaurant_id === currentRestaurant.id
        ) || [];
        const allRecipes = recipes || [];

        updatedTests.push({
          name: 'Isolamento de Receitas',
          description: 'Verificar se receitas são isoladas por restaurante',
          status: userRecipes.length === allRecipes.length ? 'passed' : 'failed',
          details: `Acesso a ${userRecipes.length}/${allRecipes.length} receitas. ${
            userRecipes.length === allRecipes.length 
              ? 'RLS funcionando corretamente.' 
              : 'FALHA: Acesso a receitas de outros restaurantes!'
          }`
        });
      } catch (error) {
        updatedTests.push({
          name: 'Isolamento de Receitas',
          description: 'Verificar se receitas são isoladas por restaurante',
          status: 'failed',
          details: `Erro no teste: ${error.message}`
        });
      }

      // Teste 4: Proteção de Estoque
      try {
        const { data: inventory, error } = await supabase
          .from('inventory')
          .select('*, restaurant_id');

        if (error) throw error;

        const userInventory = inventory?.filter(i => 
          i.restaurant_id === currentRestaurant.id
        ) || [];
        const allInventory = inventory || [];

        updatedTests.push({
          name: 'Proteção de Estoque',
          description: 'Testar acesso ao inventário por usuário autorizado',
          status: userInventory.length === allInventory.length ? 'passed' : 'failed',
          details: `Acesso a ${userInventory.length}/${allInventory.length} itens de estoque. ${
            userInventory.length === allInventory.length 
              ? 'RLS funcionando corretamente.' 
              : 'FALHA: Acesso a estoque de outros restaurantes!'
          }`
        });
      } catch (error) {
        updatedTests.push({
          name: 'Proteção de Estoque',
          description: 'Testar acesso ao inventário por usuário autorizado',
          status: 'failed',
          details: `Erro no teste: ${error.message}`
        });
      }

      // Teste 5: Validação RLS Geral
      const failedTests = updatedTests.filter(t => t.status === 'failed').length;
      const passedTests = updatedTests.filter(t => t.status === 'passed').length;

      updatedTests.push({
        name: 'Validação RLS Geral',
        description: 'Teste geral das políticas Row Level Security',
        status: failedTests === 0 ? 'passed' : 'failed',
        details: `${passedTests}/${updatedTests.length} testes passaram. ${
          failedTests === 0 
            ? 'Todos os testes de segurança passaram!' 
            : `${failedTests} testes falharam - REVISAR POLÍTICAS RLS!`
        }`
      });

      setTests(updatedTests);

      if (failedTests === 0) {
        toast.success('Todos os testes de segurança passaram!');
      } else {
        toast.error(`${failedTests} testes de segurança falharam!`);
      }

    } catch (error) {
      console.error('Erro nos testes de segurança:', error);
      toast.error('Erro ao executar testes de segurança');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Teste de Isolamento de Dados e Segurança
        </CardTitle>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este teste verifica se as políticas de segurança (RLS) estão funcionando corretamente,
            garantindo que cada usuário acesse apenas seus próprios dados.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Usuário: {user?.email} | Restaurante: {currentRestaurant?.name}
          </p>
          <Button onClick={runSecurityTests} disabled={isRunning}>
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                  {test.details && (
                    <p className="text-xs mt-2 p-2 bg-white/50 rounded border">
                      {test.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tests.some(t => t.status === 'failed') && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>ATENÇÃO:</strong> Alguns testes de segurança falharam! 
              Isso indica possíveis problemas nas políticas RLS que podem permitir 
              acesso não autorizado a dados de outros usuários.
            </AlertDescription>
          </Alert>
        )}

        {tests.every(t => t.status === 'passed') && tests.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Excelente!</strong> Todos os testes de segurança passaram. 
              O isolamento de dados está funcionando corretamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}