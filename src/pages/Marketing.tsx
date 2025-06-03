
import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { MarketingAI } from "@/components/restaurant/MarketingAI";

const Marketing = () => {
  return (
    <ModernLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Marketing IA</h1>
        <p className="text-muted-foreground">
          Geração de conteúdo e estratégias de marketing assistidas por IA
        </p>
      </div>

      <MarketingAI />
    </ModernLayout>
  );
};

export default Marketing;
