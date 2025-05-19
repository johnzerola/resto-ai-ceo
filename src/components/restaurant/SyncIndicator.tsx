
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { getSyncStatus, SYNC_EVENT } from "@/services/SyncService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SyncIndicator() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState<string | null>(null);
  
  useEffect(() => {
    // Get initial status
    const status = getSyncStatus();
    setLastSyncTime(status.lastSync);
    setIsSyncing(status.inProgress);
    
    // Listener for sync start
    const handleSyncStart = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsSyncing(true);
      setSyncSource(customEvent.detail?.source || null);
    };
    
    // Listener for sync completion
    const handleSyncComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsSyncing(false);
      setLastSyncTime(customEvent.detail.timestamp);
      setSyncSource(null);
    };
    
    // Register listeners
    window.addEventListener(`${SYNC_EVENT}Start`, handleSyncStart);
    window.addEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    
    return () => {
      window.removeEventListener(`${SYNC_EVENT}Start`, handleSyncStart);
      window.removeEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    };
  }, []);
  
  // Format relative time
  const getRelativeTime = () => {
    if (!lastSyncTime) return "Nunca";
    
    try {
      return formatDistanceToNow(new Date(lastSyncTime), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return "Desconhecido";
    }
  };

  // Get tooltip message based on current state
  const getSyncTooltipMessage = () => {
    if (isSyncing) {
      return syncSource 
        ? `Sincronizando a partir de: ${getModuleName(syncSource)}` 
        : "Sincronizando todos os módulos...";
    }
    
    return `Última sincronização: ${getRelativeTime()}`;
  };
  
  // Function to get friendly module name
  const getModuleName = (moduleId: string): string => {
    const moduleNames: Record<string, string> = {
      "cashFlow": "Fluxo de Caixa",
      "inventory": "Estoque",
      "dre": "DRE",
      "cmv": "CMV",
      "configuracoes": "Configurações",
      "fichaTecnica": "Ficha Técnica"
    };
    
    return moduleNames[moduleId] || moduleId;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${
              isSyncing 
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            <RefreshCw 
              className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} 
            />
            <span className="text-xs">
              {isSyncing ? "Sincronizando..." : "Sincronizado"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getSyncTooltipMessage()}</p>
          <div className="text-xs mt-1">
            <p>Módulos atualizados: DRE, CMV, Ficha Técnica, Estoque</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
