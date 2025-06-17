
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { checkEmailConfirmation, resendConfirmationEmail, isMobileDevice } from "@/utils/auth-utils";
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
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const { user } = useAuth();
  const isMobile = isMobileDevice();
  
  useEffect(() => {
    if (!user) return;
    
    // Verificar status de confirmação
    const checkConfirmation = async () => {
      try {
        const confirmed = await checkEmailConfirmation();
        setIsEmailConfirmed(confirmed);
        
        // Mostrar banner apenas se não estiver confirmado e não estiver temporariamente dispensado
        const now = Date.now();
        if (!confirmed && (!dismissUntil || now > dismissUntil)) {
          setShowBanner(true);
        } else if (confirmed && showBanner) {
          // Se foi confirmado, esconder banner e mostrar sucesso
          setShowBanner(false);
          if (now - lastCheckTime > 5000) { // Evitar spam de toasts
            toast.success("Email confirmado com sucesso!", {
              description: "Agora você tem acesso completo a todas as funcionalidades.",
              icon: <CheckCircle className="h-4 w-4 text-green-600" />
            });
            setLastCheckTime(now);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar confirmação de email:", error);
      }
    };
    
    checkConfirmation();
    
    // Verificar novamente a cada 30 segundos para detectar confirmação
    const intervalId = setInterval(checkConfirmation, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, dismissUntil, showBanner, lastCheckTime]);
  
  // Efeito para progresso de verificação
  useEffect(() => {
    if (!showBanner || isEmailConfirmed) return;
    
    let timer: NodeJS.Timeout;
    
    // Simular verificação em progresso apenas se o banner está visível
    timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + 2, 100);
        if (newProgress === 100) {
          clearInterval(timer);
          // Resetar progresso e verificar novamente
          setTimeout(() => {
            checkEmailConfirmation().then(confirmed => {
              setIsEmailConfirmed(confirmed);
              if (confirmed) {
                setShowBanner(false);
              } else {
                setProgress(0); // Resetar para próximo ciclo
              }
            }).catch(error => {
              console.error("Erro na verificação automática:", error);
              setProgress(0);
            });
          }, 1000);
        }
        return newProgress;
      });
    }, 2000); // Verificação mais lenta para não sobrecarregar
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showBanner, isEmailConfirmed]);
  
  const handleResendEmail = async () => {
    if (isResending) return;
    
    setIsResending(true);
    try {
      const success = await resendConfirmationEmail();
      
      if (success) {
        // Feedback diferenciado para mobile
        if (isMobile) {
          toast.success("Email enviado!", {
            description: "Verifique sua caixa de entrada.",
            icon: <Mail className="h-4 w-4 text-green-600" />
          });
        } else {
          toast.success("Email de confirmação enviado com sucesso!", {
            description: "Por favor, verifique sua caixa de entrada ou pasta de spam.",
            icon: <Mail className="h-4 w-4 text-green-600" />
          });
        }
        // Resetar progresso para começar verificação
        setProgress(0);
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      toast.error("Erro ao reenviar email. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  };
  
  const handleDismiss = (hours: number) => {
    try {
      // Esconder temporariamente por um determinado número de horas
      const until = Date.now() + (hours * 60 * 60 * 1000);
      setDismissUntil(until);
      localStorage.setItem("emailBannerDismissedUntil", until.toString());
      setShowBanner(false);
      
      toast.info(`Banner oculto por ${hours} hora${hours > 1 ? 's' : ''}`, {
        description: "Você pode reenviar o email a qualquer momento.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erro ao dispensar banner:", error);
      setShowBanner(false);
    }
  };
  
  if (!showBanner || !user || isEmailConfirmed) return null;
  
  return (
    <Alert 
      className={`bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-6 animate-in fade-in slide-in-from-top-4 duration-500 relative shadow-md ${
        isMobile ? 'mx-2' : ''
      }`}
      variant="default"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-2 mt-0.5">
          {progress > 0 && progress < 100 ? (
            <div className="h-5 w-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-amber-800 text-lg font-semibold mb-2 flex items-center">
            {isMobile ? "Confirme seu email" : "Confirme seu email para acesso completo"}
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-3">
              {isMobile ? (
                <>Enviamos um email para <strong className="font-medium text-amber-900">{user.email}</strong>. 
                Clique no link para confirmar.</>
              ) : (
                <>Enviamos um email de confirmação para <strong className="font-medium text-amber-900">{user.email}</strong>. 
                Para garantir acesso a todas as funcionalidades e receber notificações importantes,
                por favor clique no link de confirmação que enviamos automaticamente.</>
              )}
            </p>
            
            {progress > 0 && progress < 100 && (
              <div className="my-3">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-amber-600">Verificando confirmação...</span>
                  <span className="text-amber-600 font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-amber-200" />
              </div>
            )}
            
            <div className={`mt-4 flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-3'}`}>
              <Button 
                variant="default"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 border-none text-white shadow-sm"
                onClick={handleResendEmail}
                disabled={isResending}
                size={isMobile ? "default" : "default"}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isResending ? "Enviando..." : isMobile ? "Reenviar email" : "Reenviar email de confirmação"}
              </Button>
              <Button 
                variant="outline" 
                className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => handleDismiss(24)}
                size={isMobile ? "sm" : "sm"}
              >
                {isMobile ? "Mais tarde" : "Lembrar mais tarde"}
              </Button>
            </div>
            <div className="mt-3 text-sm text-amber-600">
              <p>
                {isMobile ? 
                  "📧 Verifique sua pasta de spam se não encontrar o email." :
                  "📧 Não encontrou o email? Verifique sua pasta de spam ou clique em \"Reenviar\"."
                }
              </p>
            </div>
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-full"
          onClick={() => handleDismiss(4)}
          title={isMobile ? "Dispensar" : "Dispensar por 4 horas"}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
