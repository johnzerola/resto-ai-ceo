
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrialValidation {
  isActive: boolean;
  daysRemaining: number;
  status: string;
  endDate: string | null;
  isValid: boolean;
}

export function TrialSystemValidator() {
  const { user } = useAuth();
  const [trialData, setTrialData] = useState<TrialValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const validateTrialSystem = async () => {
    if (!user?.email) {
      setTrialData(null);
      setIsLoading(false);
      return;
    }

    setIsValidating(true);
    try {
      // Verificar status do trial
      const { data: trialStatus, error } = await supabase.rpc('check_trial_status', {
        user_email: user.email
      });

      if (error) {
        console.error('Erro ao verificar trial:', error);
        toast.error('Erro ao validar sistema de trial');
        return;
      }

      if (trialStatus && trialStatus.length > 0) {
        const status = trialStatus[0];
        setTrialData({
          isActive: status.is_trial_active,
          daysRemaining: status.days_remaining,
          status: status.plan_status,
          endDate: status.trial_end_date,
          isValid: true
        });

        // Log da validação
        await supabase.rpc('log_security_event', {
          event_type: 'trial_validation',
          user_id: user.id,
          details: {
            trial_status: status.plan_status,
            days_remaining: status.days_remaining,
            validation_timestamp: new Date().toISOString()
          }
        });
      } else {
        setTrialData({
          isActive: false,
          daysRemaining: 0,
          status: 'not_found',
          endDate: null,
          isValid: false
        });
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      toast.error('Erro na validação do sistema de trial');
    } finally {
      setIsValidating(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateTrialSystem();
  }, [user]);

  const getStatusBadge = () => {
    if (!trialData) return null;

    if (trialData.isActive) {
      return <Badge className="bg-green-500 hover:bg-green-600">Trial Ativo</Badge>;
    } else if (trialData.status === 'expired' || trialData.status === 'trial_expired') {
      return <Badge variant="destructive">Trial Expirado</Badge>;
    } else if (trialData.status === 'not_found') {
      return <Badge variant="secondary">Trial Não Configurado</Badge>;
    } else {
      return <Badge variant="outline">{trialData.status}</Badge>;
    }
  };

  const getValidationIcon = () => {
    if (!trialData) return <Clock className="h-5 w-5 text-gray-500" />;
    
    if (trialData.isValid && trialData.isActive) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (trialData.status === 'expired' || trialData.status === 'trial_expired') {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Validando Sistema de Trial...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Verificando configurações do período gratuito</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Validação do Sistema de Trial
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trialData ? (
          <>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {getValidationIcon()}
              <div className="flex-1">
                <h4 className="font-medium">Status do Trial</h4>
                <p className="text-sm text-muted-foreground">
                  {trialData.isActive 
                    ? `Teste Grátis ativo - ${trialData.daysRemaining} dias restantes`
                    : trialData.status === 'not_found'
                    ? 'Sistema de trial não está configurado para este usuário'
                    : 'Trial não está ativo'
                  }
                </p>
              </div>
            </div>

            {trialData.endDate && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Data de Término:</p>
                  <p className="text-muted-foreground">
                    {new Date(trialData.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Dias Restantes:</p>
                  <p className="text-muted-foreground">
                    {trialData.daysRemaining} dias
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sistema Funcionando</h4>
                  <p className="text-sm text-muted-foreground">
                    {trialData.isValid 
                      ? 'O sistema de trial está configurado e funcionando corretamente'
                      : 'O sistema de trial precisa ser configurado'
                    }
                  </p>
                </div>
                <Button
                  onClick={validateTrialSystem}
                  disabled={isValidating}
                  size="sm"
                  variant="outline"
                >
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Sistema de Trial Não Encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O sistema de período gratuito não está configurado para este usuário.
            </p>
            <Button onClick={validateTrialSystem} disabled={isValidating}>
              {isValidating ? 'Verificando...' : 'Verificar Novamente'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
