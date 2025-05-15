
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AIAssistant } from "./AIAssistant";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    // Detectar atualizações nos dados financeiros
    const handleFinancialDataUpdate = () => {
      setDataUpdated(true);
      
      // Mostrar notificação
      toast.success("Dados financeiros atualizados com sucesso!", {
        description: "DRE e CMV foram sincronizados com o fluxo de caixa.",
        position: "bottom-right"
      });
      
      // Limpar estado após mostrar a notificação
      setTimeout(() => {
        setDataUpdated(false);
      }, 3000);
    };
    
    window.addEventListener("financialDataUpdated", handleFinancialDataUpdate);
    
    return () => {
      window.removeEventListener("financialDataUpdated", handleFinancialDataUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <AIAssistant />
      
      {/* Indicador de sincronização */}
      {dataUpdated && (
        <div className="fixed bottom-4 left-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md border border-green-200 animate-pulse">
          Dados financeiros sincronizados
        </div>
      )}
    </div>
  );
}
