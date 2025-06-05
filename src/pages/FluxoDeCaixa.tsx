
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { CashFlowOverview } from "@/components/restaurant/CashFlowOverview";
import { CashFlowForm } from "@/components/restaurant/CashFlowForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, FileDown, BarChart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SyncIndicator } from "@/components/restaurant/SyncIndicator";

const FluxoDeCaixa = () => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  const navigate = useNavigate();

  // Verificar se é a primeira visita à página
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedCashFlow");
    if (!hasVisited) {
      setShowIntegrationInfo(true);
      localStorage.setItem("hasVisitedCashFlow", "true");
    }
  }, []);

  const toggleAddEntry = () => {
    setIsAddingEntry(!isAddingEntry);
  };

  const goToDreCmv = () => {
    navigate('/dre');
  };

  const exportData = () => {
    try {
      const cashFlowData = localStorage.getItem("cashFlow");
      if (!cashFlowData) {
        toast.error("Nenhum dado disponível para exportar");
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(cashFlowData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `fluxo-caixa-${new Date().toLocaleDateString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast.success("Dados exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error("Erro na exportação:", error);
    }
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Controle de entradas e saídas financeiras
              <SyncIndicator />
            </p>
          </div>
          <div className="flex gap-2">
            {!isAddingEntry && (
              <>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={goToDreCmv}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Ver DRE
                </Button>
                <Button onClick={toggleAddEntry}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Transação
                </Button>
              </>
            )}
          </div>
        </div>

        {showIntegrationInfo && (
          <Alert className="border-blue-500 bg-blue-50">
            <AlertTitle className="text-blue-800">Integração Automática</AlertTitle>
            <AlertDescription className="text-blue-700">
              <p>Todas as transações registradas no fluxo de caixa são automaticamente sincronizadas com:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Demonstrativo de Resultados (DRE)</li>
                <li>Análise de Custo de Mercadoria Vendida (CMV)</li>
                <li>Dashboard Financeiro</li>
                <li>Metas e Indicadores de Desempenho</li>
              </ul>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="link" 
                  className="text-blue-800 p-0 h-auto font-semibold" 
                  onClick={() => setShowIntegrationInfo(false)}
                >
                  Entendi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isAddingEntry ? (
          <CashFlowForm 
            onCancel={toggleAddEntry} 
            onSuccess={() => {
              setIsAddingEntry(false);
              toast.success("Transação salva com sucesso");
            }}
          />
        ) : (
          <CashFlowOverview />
        )}
      </div>
    </ModernLayout>
  );
};

export default FluxoDeCaixa;
