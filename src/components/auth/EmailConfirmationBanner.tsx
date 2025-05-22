
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { checkEmailConfirmation, resendConfirmationEmail } from "@/utils/auth-utils";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

export const EmailConfirmationBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [dismissUntil, setDismissUntil] = useState<number | null>(
    parseInt(localStorage.getItem("emailBannerDismissedUntil") || "0")
  );
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Verificar status de confirmação
    const checkConfirmation = async () => {
      const confirmed = await checkEmailConfirmation();
      setIsEmailConfirmed(confirmed);
      
      // Mostrar banner apenas se não estiver confirmado e não estiver temporariamente dispensado
      const now = Date.now();
      if (!confirmed && (!dismissUntil || now > dismissUntil)) {
        setShowBanner(true);
      }
    };
    
    checkConfirmation();
    
    // Verificar novamente a cada 3 minutos
    const intervalId = setInterval(checkConfirmation, 3 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, dismissUntil]);
  
  // Efeito para progresso de verificação
  useEffect(() => {
    if (!showBanner || isEmailConfirmed) return;
    
    // Simular verificação em progresso
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + 1, 100);
        if (newProgress === 100) {
          clearInterval(timer);
          checkEmailConfirmation().then(confirmed => {
            setIsEmailConfirmed(confirmed);
            if (confirmed) {
              setShowBanner(false);
              toast.success("Email confirmado com sucesso!", {
                description: "Agora você tem acesso completo a todas as funcionalidades."
              });
            } else {
              setProgress(0);
            }
          });
        }
        return newProgress;
      });
    }, 3000);
    
    return () => clearInterval(timer);
  }, [showBanner, isEmailConfirmed]);
  
  const handleResendEmail = async () => {
    if (isResending) return;
    
    setIsResending(true);
    const success = await resendConfirmationEmail();
    
    if (success) {
      toast.success("Email de confirmação enviado com sucesso!", {
        description: "Por favor, verifique sua caixa de entrada ou pasta de spam."
      });
    }
    
    setIsResending(false);
  };
  
  const handleDismiss = (hours: number) => {
    // Esconder temporariamente por um determinado número de horas
    const until = Date.now() + (hours * 60 * 60 * 1000);
    setDismissUntil(until);
    localStorage.setItem("emailBannerDismissedUntil", until.toString());
    setShowBanner(false);
  };
  
  if (!showBanner || !user || isEmailConfirmed) return null;
  
  return (
    <Alert 
      className="bg-amber-50 border-amber-200 mb-6 animate-in fade-in slide-in-from-top-4 duration-500 relative"
      variant="default"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 bg-amber-100 rounded-full p-2 mt-0.5">
          {progress > 0 && progress < 100 ? (
            <div className="h-5 w-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <AlertTitle className="text-amber-800 text-lg font-semibold mb-2 flex items-center">
            Confirme seu email para acesso completo
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-3">
              Enviamos um email de confirmação para <strong className="font-medium">{user.email}</strong>. 
              Para garantir acesso a todas as funcionalidades e receber notificações importantes,
              por favor clique no link de confirmação que enviamos.
            </p>
            
            {progress > 0 && progress < 100 && (
              <div className="my-3">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Verificando confirmação...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-amber-200" />
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-3">
              <Button 
                variant="default"
                className="bg-amber-600 hover:bg-amber-700 border-none text-white"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isResending ? "Enviando..." : "Reenviar email de confirmação"}
              </Button>
              <Button 
                variant="outline" 
                className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                onClick={() => handleDismiss(24)}
                size="sm"
              >
                Lembrar mais tarde
              </Button>
            </div>
            <div className="mt-3 text-sm text-amber-600">
              <p>
                Não encontrou o email? Verifique sua pasta de spam ou clique em "Reenviar".
              </p>
            </div>
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 text-amber-500 hover:text-amber-700 hover:bg-amber-100"
          onClick={() => handleDismiss(4)}
          title="Dispensar por 4 horas"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
