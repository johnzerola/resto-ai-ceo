import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StripeCheckoutProps {
  planName: string;
  priceId: string;
  amount: number;
  isYearly?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripeCheckout({ 
  planName, 
  priceId, 
  amount, 
  isYearly = false,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para continuar");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          planName,
          isYearly,
          successUrl: `${window.location.origin}/dashboard?welcome=true&plan=${planName}`,
          cancelUrl: `${window.location.origin}/?checkout=cancelled`
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open in new tab for better UX
        window.open(data.url, '_blank');
        onSuccess?.();
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (error: any) {
      console.error('Erro no checkout:', error);
      const errorMessage = error.message || 'Erro ao processar pagamento';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Checkout Seguro
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Plano {planName}</h3>
          <div className="text-2xl font-bold text-primary">
            R$ {amount}
          </div>
          <p className="text-sm text-muted-foreground">
            {isYearly ? 'por mês (cobrado anualmente)' : 'por mês'}
          </p>
          
          {isYearly && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              2 meses grátis!
            </Badge>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Pagamento processado pelo Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>SSL 256-bit criptografia</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Garantia de reembolso 7 dias</span>
          </div>
        </div>

        <Button 
          onClick={handleCheckout}
          disabled={isLoading || !isAuthenticated}
          className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Finalizar Pagamento'
          )}
        </Button>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Faça login para continuar com o pagamento</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="text-primary hover:underline">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </CardContent>
    </Card>
  );
}