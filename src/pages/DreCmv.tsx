
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { DREOverview } from "@/components/restaurant/DREOverview";
import { CMVAnalysis } from "@/components/restaurant/CMVAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyncIndicator } from "@/components/restaurant/SyncIndicator";
import { getSyncStatus, SYNC_EVENT } from "@/services/SyncService";

const DreCmv = () => {
  const [activeTab, setActiveTab] = useState("dre");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Monitorar atualizações de sincronização
  useEffect(() => {
    // Obter status inicial
    const status = getSyncStatus();
    setLastUpdate(status.lastSync);
    
    // Listener para atualizações de sincronização
    const handleSyncComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLastUpdate(customEvent.detail.timestamp);
    };
    
    window.addEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    
    return () => {
      window.removeEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    };
  }, []);
  
  // Formatar data de última atualização
  const getFormattedDate = () => {
    if (!lastUpdate) return "";
    
    try {
      const date = new Date(lastUpdate);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return "";
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">DRE & CMV</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          Demonstrativo de Resultados e Custo de Mercadoria Vendida
          <SyncIndicator />
          {lastUpdate && (
            <span className="text-xs text-muted-foreground ml-2">
              Última atualização: {getFormattedDate()}
            </span>
          )}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="cmv">CMV</TabsTrigger>
        </TabsList>
        <TabsContent value="dre">
          <DREOverview />
        </TabsContent>
        <TabsContent value="cmv">
          <CMVAnalysis />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default DreCmv;
