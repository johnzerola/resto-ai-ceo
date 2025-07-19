import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CheckoutTester() {
  const { user, isAuthenticated } = useAuth();

  const testCheckout = async (planName: string, priceId: string) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para testar o checkout');
      return;
    }

    try {
      console.log('🧪 Testando checkout:', { planName, priceId });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId,
          planName,
          successUrl: `${window.location.origin}/dashboard?welcome=true&plan=${planName.toLowerCase()}`,
          cancelUrl: `${window.location.origin}/?checkout=cancelled`
        }
      });

      if (error) {
        console.error('❌ Erro no teste:', error);
        toast.error(`Erro: ${error.message}`);
        return;
      }

      if (data?.url) {
        console.log('✅ URL recebida:', data.url);
        toast.success('Checkout URL gerada com sucesso!');
        // Abrir em nova aba para teste
        window.open(data.url, '_blank');
      } else {
        toast.error('Nenhuma URL de checkout recebida');
      }

    } catch (error: any) {
      console.error('💥 Erro no teste:', error);
      toast.error(`Erro no teste: ${error.message}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm">🧪 Teste de Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={() => testCheckout('Starter', 'price_1QS9XpJNcHH4pGhKCVcJ8Z1f')}
          size="sm" 
          className="w-full"
          disabled={!isAuthenticated}
        >
          Testar Starter (R$ 29,90)
        </Button>
        
        <Button 
          onClick={() => testCheckout('Pro', 'price_1QS9ZcJNcHH4pGhKLMnO9P3q')}
          size="sm" 
          className="w-full"
          disabled={!isAuthenticated}
        >
          Testar Pro (R$ 78,90)
        </Button>
        
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground">
            Faça login para testar
          </p>
        )}
      </CardContent>
    </Card>
  );
}