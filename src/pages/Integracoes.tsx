import React from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";

export function Integracoes() {
  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Integrações Revolucionárias
          </h1>
          <p className="text-muted-foreground">
            Primeira solução no Brasil com gestão completa por WhatsApp
          </p>
        </div>
        
        <WhatsAppIntegration />
      </div>
    </ModernLayout>
  );
}