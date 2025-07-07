import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface OnboardingCompletedProps {
  onContinue: () => void;
}

function OnboardingCompleted({ onContinue }: OnboardingCompletedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-lucrai-green-primary rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Configuração Concluída!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Seu restaurante foi configurado com sucesso. Agora você pode acessar todas as funcionalidades do Lucraí.
          </p>
          <button 
            onClick={onContinue}
            className="w-full bg-lucrai-blue-primary hover:bg-lucrai-blue-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ir para o Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

const Onboarding = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const { user, currentRestaurant, isLoading: authLoading } = useAuth();
  const { isComplete, isLoading: statusLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    setShowCompleted(true);
  };

  const handleContinueToDashboard = () => {
    navigate("/dashboard");
  };

  // Se está carregando autenticação ou status
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lucrai-blue-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se onboarding já está completo
  if (isComplete) {
    if (showCompleted) {
      return <OnboardingCompleted onContinue={handleContinueToDashboard} />;
    }
    // Redirecionar para dashboard se já completou
    navigate("/dashboard");
    return null;
  }

  // Se já tem restaurante, considerar onboarding completo
  if (currentRestaurant) {
    navigate("/dashboard");
    return null;
  }

  // Renderizar o wizard de onboarding
  return <OnboardingWizard onComplete={handleOnboardingComplete} />;
};

export default Onboarding;