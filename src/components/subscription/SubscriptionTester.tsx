
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { SubscriptionStatus } from './SubscriptionStatus';
import { FeaturesList } from './FeaturesList';

export function SubscriptionTester() {
  const { 
    subscription, 
    isLoading, 
    error, 
    refreshSubscription,
    planType 
  } = useSubscriptionPlan();

  const getSystemStatus = () => {
    if (error) return { icon: AlertTriangle, color: 'text-red-600', status: 'Erro na Conexão' };
    if (isLoading) return { icon: RefreshCw, color: 'text-yellow-600', status: 'Carregando...' };
    return { icon: CheckCircle, color: 'text-green-600', status: 'Sistema Operacional' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header com status do sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema de Planos - Status Geral
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshSubscription}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <systemStatus.icon className={`h-4 w-4 ${systemStatus.color}`} />
            <span className={`font-medium ${systemStatus.color}`}>
              {systemStatus.status}
            </span>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid com informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscriptionStatus />
        <FeaturesList />
      </div>

      {/* Dados brutos para debug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dados Técnicos (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Ver dados brutos da consulta Supabase
            </summary>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto mt-2">
              {JSON.stringify({
                subscription,
                planType,
                isLoading,
                error,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Como testar:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ✅ Verifique se seu plano está sendo exibido corretamente</li>
              <li>• ✅ Confirme quais funcionalidades estão liberadas/bloqueadas</li>
              <li>• ✅ Teste o botão "Atualizar" para forçar nova consulta</li>
              <li>• ✅ Navegue para páginas protegidas para testar o PlanGate</li>
              <li>• ✅ Verifique os logs no console do navegador (F12)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
