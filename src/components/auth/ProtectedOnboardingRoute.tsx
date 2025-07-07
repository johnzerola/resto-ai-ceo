import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ProtectedOnboardingRouteProps {
  children: React.ReactNode;
  requireOnboardingComplete?: boolean;
}

export function ProtectedOnboardingRoute({ 
  children, 
  requireOnboardingComplete = true 
}: ProtectedOnboardingRouteProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    complete: boolean;
    step: number;
    loading: boolean;
  }>({
    complete: false,
    step: 0,
    loading: true
  });
  const location = useLocation();

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_complete, onboarding_step')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        
        // Se não encontrou o perfil, criar um novo
        if (error.code === 'PGRST116') {
          await supabase
            .from('profiles')
            .insert([{
              id: userId,
              onboarding_complete: false,
              onboarding_step: 0
            }]);
            
          setOnboardingStatus({
            complete: false,
            step: 0,
            loading: false
          });
          return;
        }
        
        // Para outros erros, assumir que precisa de onboarding
        setOnboardingStatus({
          complete: false,
          step: 0,
          loading: false
        });
        return;
      }

      setOnboardingStatus({
        complete: data?.onboarding_complete || false,
        step: data?.onboarding_step || 0,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
      setOnboardingStatus({
        complete: false,
        step: 0,
        loading: false
      });
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      checkOnboardingStatus(user.id);
    } else if (!authLoading && !user) {
      setOnboardingStatus(prev => ({ ...prev, loading: false }));
    }
  }, [user, authLoading]);

  const handleRetryCheck = () => {
    if (user) {
      setOnboardingStatus(prev => ({ ...prev, loading: true }));
      checkOnboardingStatus(user.id);
      toast.info("Verificando status do onboarding...");
    }
  };

  // Loading state
  if (authLoading || onboardingStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lucrai-blue-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está na página de onboarding, sempre permitir acesso
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // Se requer onboarding completo mas não está completo
  if (requireOnboardingComplete && !onboardingStatus.complete) {
    // Se ainda não iniciou o onboarding, redirecionar
    if (onboardingStatus.step === 0) {
      return <Navigate to="/onboarding" replace />;
    }

    // Se onboarding está incompleto, mostrar tela de aviso
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Configuração Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você precisa completar a configuração inicial antes de acessar esta funcionalidade.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-muted-foreground text-center">
              <p>Etapa atual: {onboardingStatus.step} de 4</p>
              <p className="mt-2">
                Complete o processo de configuração para ter acesso total ao sistema.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.href = '/onboarding'}
                className="w-full bg-lucrai-blue-primary hover:bg-lucrai-blue-secondary"
              >
                Continuar Configuração
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRetryCheck}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se chegou até aqui, pode renderizar o conteúdo
  return <>{children}</>;
}