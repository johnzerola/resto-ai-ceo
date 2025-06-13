
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionPlan } from '@/hooks/useSubscriptionPlan';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, AlertCircle } from 'lucide-react';

export function SubscriptionStatus() {
  const { user } = useAuth();
  const { subscription, isLoading, error, planType } = useSubscriptionPlan();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Verificando plano...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPlanBadgeVariant = () => {
    switch (planType) {
      case 'profissional': return 'default';
      case 'essencial': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanDisplayName = () => {
    switch (planType) {
      case 'profissional': return 'Profissional';
      case 'essencial': return 'Essencial';
      default: return 'Gratuito';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{user?.email}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getPlanBadgeVariant()}>
            {getPlanDisplayName()}
          </Badge>
          {subscription?.status && (
            <Badge variant="outline" className="text-xs">
              {subscription.status}
            </Badge>
          )}
        </div>

        {subscription?.expires_at && (
          <div className="text-xs text-muted-foreground">
            Expira em: {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
