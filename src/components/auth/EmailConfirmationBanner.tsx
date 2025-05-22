
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { checkEmailConfirmation, resendConfirmationEmail } from "@/utils/auth-utils";
import { useAuth } from "@/contexts/AuthContext";

export const EmailConfirmationBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Verificar status de confirmação
    const checkConfirmation = async () => {
      const confirmed = await checkEmailConfirmation();
      setIsEmailConfirmed(confirmed);
      setShowBanner(!confirmed);
    };
    
    checkConfirmation();
    
    // Verificar novamente a cada 5 minutos
    const intervalId = setInterval(checkConfirmation, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
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
  
  const handleDismiss = () => {
    setShowBanner(false);
    // Esconder temporariamente por 1 hora
    setTimeout(() => setShowBanner(!isEmailConfirmed), 60 * 60 * 1000);
  };
  
  if (!showBanner || !user) return null;
  
  return (
    <Alert 
      className="bg-amber-50 border-amber-200 mb-4 animate-fade-in relative"
      variant="default"
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-amber-800 mb-1">
            Confirme seu email para acesso completo
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Enviamos um email de confirmação para <strong>{user.email}</strong>. 
            Para garantir acesso a todas as funcionalidades e receber notificações importantes,
            por favor clique no link de confirmação no email.
          </AlertDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              <Mail className="mr-1 h-4 w-4" />
              {isResending ? "Enviando..." : "Reenviar email"}
            </Button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 text-amber-500 hover:text-amber-700 hover:bg-amber-100"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
