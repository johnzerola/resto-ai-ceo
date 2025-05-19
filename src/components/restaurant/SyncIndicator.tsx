
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { getSyncStatus, SYNC_EVENT } from "@/services/SyncService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SyncIndicator() {
  const [isSync, setIsSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  useEffect(() => {
    // Obter status inicial
    const status = getSyncStatus();
    setLastSyncTime(status.lastSync);
    setIsSync(status.isSync);
    
    // Listener para início de sincronização
    const handleSyncStart = () => {
      setIsSync(true);
    };
    
    // Listener para fim de sincronização
    const handleSyncComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsSync(false);
      setLastSyncTime(customEvent.detail.timestamp);
    };
    
    // Registrar listeners
    window.addEventListener(SYNC_EVENT, handleSyncStart);
    window.addEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSyncStart);
      window.removeEventListener(`${SYNC_EVENT}Complete`, handleSyncComplete);
    };
  }, []);
  
  // Formatar tempo relativo
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
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${
              isSync 
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            <RefreshCw 
              className={`h-3 w-3 ${isSync ? "animate-spin" : ""}`} 
            />
            <span className="text-xs">
              {isSync ? "Sincronizando..." : "Sincronizado"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Última sincronização: {getRelativeTime()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
