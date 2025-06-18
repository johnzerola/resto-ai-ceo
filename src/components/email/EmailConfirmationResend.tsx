
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resendConfirmationEmail } from '@/utils/auth-utils';
import { toast } from 'sonner';

export function EmailConfirmationResend() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleResend = async () => {
    if (isResending || !user) return;

    setIsResending(true);
    try {
      const success = await resendConfirmationEmail();
      
      if (success) {
        setLastSent(new Date());
        toast.success('Email de confirmação reenviado!', {
          description: 'Verifique sua caixa de entrada e pasta de spam.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const canResend = !lastSent || (Date.now() - lastSent.getTime()) > 60000; // 1 minuto

  if (!user || user.email_confirmed_at) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-800 font-medium">Email não confirmado</p>
            <p className="text-amber-700 text-sm">
              Confirme seu email para ter acesso completo à plataforma.
            </p>
            {lastSent && (
              <p className="text-amber-600 text-xs mt-1">
                Último envio: {lastSent.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleResend}
            disabled={isResending || !canResend}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {canResend ? 'Reenviar Email' : 'Aguarde...'}
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
