
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, User, Database } from 'lucide-react';

export function SubscriptionTester() {
  const { user } = useAuth();
  const { 
    subscription, 
    isLoading, 
    error, 
    hasFeature, 
    planType,
    refreshSubscription,
    features 
  } = useSubscriptionPlan();

  const testFeatures = [
    { key: 'hasSimuladorCenarios', name: 'Simulador de Cenários' },
    { key: 'hasFullAIAssistant', name: 'Assistente IA Completo' },
    { key: 'hasAdvancedReports', name: 'Relatórios Avançados' },
    { key: 'hasInventoryManagement', name: 'Gestão de Estoque' },
    { key: 'hasFinancialAnalysis', name: 'Análise Financeira' }
  ] as const;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Integração Supabase - Planos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status do usuário */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm">
            Usuário: {user?.email || 'Não logado'}
          </span>
          {user && (
            <Badge variant="outline" className="text-xs">
              ID: {user.id.slice(0, 8)}...
            </Badge>
          )}
        </div>

        {/* Status da assinatura */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Status da Assinatura</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshSubscription}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : error ? (
            <div className="text-sm text-red-600">Erro: {error}</div>
          ) : subscription ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'secondary'}
                >
                  {planType.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {subscription.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>ID: {subscription.id}</div>
                <div>Criado: {new Date(subscription.created_at).toLocaleDateString()}</div>
                {subscription.expires_at && (
                  <div>Expira: {new Date(subscription.expires_at).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma assinatura encontrada</div>
          )}
        </div>

        {/* Teste de features */}
        <div className="space-y-2">
          <h3 className="font-medium">Teste de Funcionalidades</h3>
          <div className="grid grid-cols-1 gap-2">
            {testFeatures.map((feature) => {
              const hasAccess = hasFeature(feature.key);
              return (
                <div 
                  key={feature.key}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <span>{feature.name}</span>
                  <Badge 
                    variant={hasAccess ? 'default' : 'secondary'}
                    className={hasAccess ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {hasAccess ? 'Liberado' : 'Bloqueado'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dados brutos para debug */}
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-medium">
            Dados Brutos (Debug)
          </summary>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify({ subscription, features, planType }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
