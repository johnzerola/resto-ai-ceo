
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function EmailConfirmationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'confirmed' | 'error'>('pending');

  useEffect(() => {
    if (user) {
      // Check if email is already confirmed
      if (user.email_confirmed_at) {
        setConfirmationStatus('confirmed');
        setIsVisible(false);
      } else {
        setConfirmationStatus('pending');
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleResendConfirmation = async () => {
    if (isResending || !user?.email) return;

    setIsResending(true);
    try {
      // Use the edge function to send confirmation email
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: user.email,
          name: user.user_metadata?.name || 'Usuário',
          user_id: user.id,
          retry_attempt: 1
        }
      });

      if (error) {
        console.error('Erro ao reenviar email:', error);
        toast.error(`Erro ao reenviar email: ${error.message}`);
        setConfirmationStatus('error');
        return;
      }

      if (data?.success) {
        setLastSent(new Date());
        toast.success('Email de confirmação reenviado!', {
          description: 'Verifique sua caixa de entrada e pasta de spam.',
          duration: 5000
        });

        // Log do reenvio bem-sucedido
        await supabase.rpc('log_security_event', {
          event_type: 'email_resend_success',
          user_id: user.id,
          details: {
            email: user.email,
            timestamp: new Date().toISOString()
          }
        });

        // Em desenvolvimento, mostrar o link de debug
        if (data.debug_link && process.env.NODE_ENV === 'development') {
          console.log('🔗 Link de confirmação (DEBUG):', data.debug_link);
          toast.info('Link de confirmação disponível no console (modo debug)');
        }
      } else {
        toast.error('Falha ao reenviar email');
        setConfirmationStatus('error');
      }
    } catch (error) {
      console.error('Erro ao reenviar email de confirmação:', error);
      toast.error('Erro ao reenviar email de confirmação');
      setConfirmationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const canResend = !lastSent || (Date.now() - lastSent.getTime()) > 60000; // 1 minuto

  // Não mostrar se usuário não existe, email já confirmado, ou banner foi fechado
  if (!user || user.email_confirmed_at || !isVisible) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4 mx-4 mt-4 relative">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="flex items-center justify-between pr-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-amber-800 font-medium">Email não confirmado</p>
              {confirmationStatus === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {confirmationStatus === 'confirmed' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-amber-700 text-sm mb-2">
              Confirme seu email para ter acesso completo à plataforma.
            </p>
            {lastSent && (
              <p className="text-amber-600 text-xs">
                Último envio: {lastSent.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            onClick={handleResendConfirmation}
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
      
      {/* Botão de fechar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-amber-600 hover:text-amber-800"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
