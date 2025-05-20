
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { PaymentManager } from "@/components/restaurant/PaymentManager";
import { Card, CardContent } from "@/components/ui/card";
import { paymentService } from "@/services/PaymentService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const ContasFinanceiras = () => {
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Obter ID do restaurante selecionado
    const restaurantData = localStorage.getItem("restaurantData");
    if (restaurantData) {
      const data = JSON.parse(restaurantData);
      setRestaurantId(data.id || "");
    }
    
    // Verificar contas vencidas ao carregar a página
    if (restaurantId) {
      paymentService.checkOverduePayments(restaurantId);
    }
  }, [restaurantId]);

  if (!restaurantId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Configure os dados do restaurante para acessar esta funcionalidade.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Contas a Pagar e Receber</h1>
        <p className="text-muted-foreground">
          Gerencie suas finanças com eficiência, controlando pagamentos e recebimentos
        </p>
      </div>

      {showInfo && (
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertTitle className="text-blue-800">Gestão Financeira Integrada</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p>
              Todas as transações registradas neste módulo são automaticamente sincronizadas com o Fluxo de Caixa, 
              Demonstrativo de Resultados (DRE) e Dashboard Financeiro.
            </p>
            <div className="mt-2 flex justify-end">
              <button 
                className="text-blue-800 p-0 h-auto font-semibold" 
                onClick={() => setShowInfo(false)}
              >
                Entendi
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <PaymentManager restaurantId={restaurantId} />
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ContasFinanceiras;
