
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { MarketingAI } from "@/components/restaurant/MarketingAI";

const Marketing = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Marketing IA</h1>
        <p className="text-muted-foreground">
          Geração de conteúdo e estratégias de marketing assistidas por IA
        </p>
      </div>

      <MarketingAI />
    </Layout>
  );
};

export default Marketing;
