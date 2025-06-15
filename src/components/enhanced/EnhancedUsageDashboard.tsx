
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEnhancedSubscriptionPlan } from '@/hooks/useEnhancedSubscriptionPlan';
import { Building2, MessageSquare, Users, Crown } from 'lucide-react';

export function EnhancedUsageDashboard() {
  const { plan, dailyUsage, isLoading, planType } = useEnhancedSubscriptionPlan();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Carregando uso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Plano não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const getPlanDisplayName = () => {
    switch (planType) {
      case 'profissional': return 'Profissional';
      case 'essencial': return 'Essencial';
      default: return 'Gratuito';
    }
  };

  const getPlanColor = () => {
    switch (planType) {
      case 'profissional': return 'bg-purple-500 hover:bg-purple-600';
      case 'essencial': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((current / limit) * 100, 100);
  };

  const aiLimit = plan.limits.aiMessages;
  const aiUsed = dailyUsage?.messages_sent || 0;
  const aiPercentage = getUsagePercentage(aiUsed, aiLimit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uso do Plano</span>
          <Badge className={getPlanColor()}>
            <Crown className="h-3 w-3 mr-1" />
            {getPlanDisplayName()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uso de IA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Mensagens IA (hoje)</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {aiUsed} / {aiLimit === -1 ? '∞' : aiLimit}
            </div>
          </div>
          
          {aiLimit !== -1 && (
            <div className="space-y-1">
              <Progress 
                value={aiPercentage} 
                className={`h-2 ${
                  aiPercentage >= 100 ? 'bg-red-100' : 
                  aiPercentage >= 80 ? 'bg-yellow-100' : 'bg-green-100'
                }`}
              />
              {aiPercentage >= 100 && (
                <p className="text-xs text-red-600">
                  Limite diário atingido
                </p>
              )}
              {aiPercentage >= 80 && aiPercentage < 100 && (
                <p className="text-xs text-yellow-600">
                  Próximo ao limite ({aiPercentage.toFixed(0)}%)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Outros limites */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium">Restaurantes</div>
            <div className="text-xs text-muted-foreground">
              Até {plan.limits.maxRestaurants === -1 ? '∞' : plan.limits.maxRestaurants}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium">Equipe</div>
            <div className="text-xs text-muted-foreground">
              Até {plan.limits.teamMembers === -1 ? '∞' : plan.limits.teamMembers}
            </div>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-2">Funcionalidades Ativas:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {plan.features.hasInventoryManagement && (
              <span className="text-green-600">✓ Estoque</span>
            )}
            {plan.features.hasFinancialAnalysis && (
              <span className="text-green-600">✓ Análise Financeira</span>
            )}
            {plan.features.hasAdvancedReports && (
              <span className="text-green-600">✓ Relatórios</span>
            )}
            {plan.features.hasFullAIAssistant && (
              <span className="text-green-600">✓ IA Completa</span>
            )}
            {plan.features.hasSimuladorCenarios && (
              <span className="text-green-600">✓ Simulador</span>
            )}
            {plan.features.hasPrioritySupport && (
              <span className="text-green-600">✓ Suporte VIP</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
