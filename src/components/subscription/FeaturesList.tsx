
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { CheckCircle, XCircle, Zap } from 'lucide-react';

interface Feature {
  key: keyof import('@/hooks/useSubscriptionPlan').PlanFeatures;
  name: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    key: 'hasSimuladorCenarios',
    name: 'Simulador de Cenários',
    description: 'Simule diferentes cenários financeiros e projete o futuro do negócio'
  },
  {
    key: 'hasFullAIAssistant',
    name: 'Assistente IA Completo',
    description: 'Acesso completo ao Gerente Virtual e Social Media IA'
  },
  {
    key: 'hasAdvancedReports',
    name: 'Relatórios Avançados',
    description: 'Relatórios detalhados e análises aprofundadas'
  },
  {
    key: 'hasInventoryManagement',
    name: 'Gestão de Estoque',
    description: 'Controle completo do inventário e insumos'
  },
  {
    key: 'hasFinancialAnalysis',
    name: 'Análise Financeira',
    description: 'Ferramentas avançadas de análise financeira'
  }
];

export function FeaturesList() {
  const { hasFeature, planType } = useSubscriptionPlan();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Funcionalidades do Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {FEATURES.map((feature) => {
          const isAvailable = hasFeature(feature.key);
          
          return (
            <div 
              key={feature.key}
              className="flex items-start justify-between p-3 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm">{feature.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              
              <Badge 
                variant={isAvailable ? 'default' : 'secondary'}
                className={`ml-2 flex-shrink-0 ${
                  isAvailable 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isAvailable ? 'Liberado' : 'Bloqueado'}
              </Badge>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-1">Plano Atual: {planType.toUpperCase()}</div>
          <div className="text-xs text-muted-foreground">
            {planType === 'profissional' && 'Acesso completo a todas as funcionalidades'}
            {planType === 'essencial' && 'Acesso limitado - algumas funcionalidades requerem upgrade'}
            {planType === 'free' && 'Plano gratuito com funcionalidades básicas'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
