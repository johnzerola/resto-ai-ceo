
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard } from "lucide-react";

interface StatusSectionProps {
  subscriptionInfo: {
    subscribed: boolean;
    subscription_tier?: string;
  };
  syncState: {
    isOnline: boolean;
    syncStatus: 'idle' | 'syncing' | 'error';
    lastUpdate: number;
  };
}

const StatusSection = memo(({ subscriptionInfo, syncState }: StatusSectionProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Subscription Status */}
      <Card className={`border-0 shadow-sm ${
        subscriptionInfo.subscribed 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
          : 'bg-gradient-to-r from-orange-50 to-amber-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Plano Ativo</span>
            </div>
            {subscriptionInfo.subscribed && <Crown className="h-4 w-4 text-amber-500" />}
          </div>
          <div className="mt-2">
            <Badge 
              variant={subscriptionInfo.subscribed ? "default" : "secondary"}
              className={subscriptionInfo.subscribed ? "bg-green-500" : "bg-orange-500"}
            >
              {subscriptionInfo.subscribed ? `Plano ${subscriptionInfo.subscription_tier}` : 'Sem Assinatura'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Status do Sistema</CardTitle>
          <CardDescription>
            Monitoramento em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Conexão</span>
              <Badge variant="outline" className={`${
                syncState.isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {syncState.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Sincronização</span>
              <Badge variant="outline" className={`${
                syncState.syncStatus === 'idle' ? 'bg-green-50 text-green-700 border-green-200' :
                syncState.syncStatus === 'syncing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {syncState.syncStatus === 'idle' ? 'Ativo' :
                 syncState.syncStatus === 'syncing' ? 'Sincronizando' : 'Erro'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default StatusSection;
