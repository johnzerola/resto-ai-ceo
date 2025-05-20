
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/restaurant/StatsCard";
import { RevenueChart } from "@/components/restaurant/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { paymentService } from "@/services/PaymentService";
import { getFinancialData } from "@/services/FinancialDataService";
import { useNavigate } from "react-router-dom";
import { CreditCard, FileDigit, Receipt, TrendingUp } from "lucide-react";

export function DashboardFinancial({ restaurantId }: { restaurantId: string }) {
  const [financialData, setFinancialData] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState({
    payables: { pending: 0, overdue: 0, total: 0 },
    receivables: { pending: 0, overdue: 0, total: 0 }
  });
  const navigate = useNavigate();

  // Dados de exemplo para os gráficos - substituir por dados reais quando disponíveis
  const sampleRevenueData = [
    { name: "Jan", revenue: 12000 },
    { name: "Fev", revenue: 15000 },
    { name: "Mar", revenue: 18000 },
    { name: "Abr", revenue: 20000 },
    { name: "Mai", revenue: 19000 },
    { name: "Jun", revenue: 22000 },
  ];

  useEffect(() => {
    // Carregar dados financeiros
    loadFinancialData();
    
    // Carregar resumo de pagamentos
    if (restaurantId) {
      loadPaymentSummary();
    }
    
    // Configurar listeners para atualizações
    const handleFinancialUpdate = () => {
      loadFinancialData();
    };
    
    const handlePaymentUpdate = () => {
      loadPaymentSummary();
    };
    
    window.addEventListener('financialDataUpdated', handleFinancialUpdate);
    window.addEventListener('paymentDataUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('financialDataUpdated', handleFinancialUpdate);
      window.removeEventListener('paymentDataUpdated', handlePaymentUpdate);
    };
  }, [restaurantId]);
  
  // Carregar dados financeiros
  const loadFinancialData = () => {
    const data = getFinancialData();
    setFinancialData(data);
  };
  
  // Carregar resumo de pagamentos
  const loadPaymentSummary = async () => {
    if (restaurantId) {
      const summary = await paymentService.getPaymentSummary(restaurantId);
      setPaymentSummary(summary);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Faturamento Mensal" 
          value={formatCurrency(financialData?.revenue?.total || 0)} 
          description="Receita do mês" 
          trend={{ value: 7.2, isPositive: true }}
        />
        
        <StatsCard 
          title="CMV" 
          value={`${financialData?.cmvCategories?.[0]?.cmvPercentage?.toFixed(1) || 0}%`}
          description="Custo de Mercadoria Vendida" 
          trend={{ value: 1.5, isPositive: false }}
          trendDesirable="down"
        />
        
        <StatsCard 
          title="Contas a Pagar" 
          value={formatCurrency(paymentSummary.payables.pending)} 
          description="Pendentes para os próximos 30 dias" 
        />
        
        <StatsCard 
          title="Contas a Receber" 
          value={formatCurrency(paymentSummary.receivables.pending)} 
          description="Entradas previstas" 
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Vendas por Período</h3>
            <RevenueChart data={sampleRevenueData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-medium mb-2">Atalhos Financeiros</h3>
            
            <Button 
              onClick={() => navigate("/contas-financeiras")}
              variant="outline" 
              className="w-full justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Contas a Pagar/Receber
            </Button>
            
            <Button 
              onClick={() => navigate("/fluxo-caixa")}
              variant="outline" 
              className="w-full justify-start"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Fluxo de Caixa
            </Button>
            
            <Button 
              onClick={() => navigate("/dre-cmv")}
              variant="outline" 
              className="w-full justify-start"
            >
              <FileDigit className="h-4 w-4 mr-2" />
              DRE e Análise de CMV
            </Button>
            
            <Button 
              onClick={() => navigate("/ficha-tecnica")}
              variant="outline" 
              className="w-full justify-start"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Fichas Técnicas
            </Button>
            
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contas vencidas:</span>
                  <span className="font-medium text-red-600">{formatCurrency(paymentSummary.payables.overdue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recebimentos vencidos:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(paymentSummary.receivables.overdue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo projetado:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      paymentSummary.receivables.pending - paymentSummary.payables.pending
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
