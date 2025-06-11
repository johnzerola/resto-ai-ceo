
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

const FluxoCaixa = () => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
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
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setIsAddingEntry(true);
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
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2">
              Controle de entradas e saídas financeiras
              <SyncIndicator />
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isAddingEntry && (
              <>
                <Button variant="outline" size="sm" onClick={exportData} className="text-xs sm:text-sm flex-1 sm:flex-none">
                  <FileDown className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Exportar</span>
                </Button>
                <Button variant="outline" size="sm" onClick={goToDreCmv} className="text-xs sm:text-sm flex-1 sm:flex-none">
                  <BarChart className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Ver DRE</span>
                </Button>
                <Button onClick={toggleAddEntry} size="sm" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Nova Transação</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {showIntegrationInfo && (
          <Alert className="border-blue-500 bg-blue-50">
            <AlertTitle className="text-blue-800 text-sm sm:text-base">Integração Automática</AlertTitle>
            <AlertDescription className="text-blue-700 text-xs sm:text-sm">
              <p>Todas as transações registradas no fluxo de caixa são automaticamente sincronizadas com:</p>
              <ul className="list-disc ml-4 sm:ml-6 mt-2 space-y-1">
                <li>Demonstrativo de Resultados (DRE)</li>
                <li>Análise de Custo de Mercadoria Vendida (CMV)</li>
                <li>Dashboard Financeiro</li>
                <li>Metas e Indicadores de Desempenho</li>
              </ul>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="link" 
                  className="text-blue-800 p-0 h-auto font-semibold text-xs sm:text-sm" 
                  onClick={() => setShowIntegrationInfo(false)}
                >
                  Entendi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full overflow-hidden">
          {isAddingEntry ? (
            <CashFlowForm 
              editingEntry={editingEntry}
              onEntryAdded={() => {
                // This callback is required by the interface but we handle success differently
              }}
              onEditComplete={() => {
                setIsAddingEntry(false);
                setEditingEntry(null);
                toast.success("Transação salva com sucesso");
              }}
            />
          ) : (
            <CashFlowOverview 
              onEdit={handleEditEntry}
            />
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default FluxoCaixa;
