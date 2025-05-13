
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { DREOverview } from "@/components/restaurant/DREOverview";
import { CMVAnalysis } from "@/components/restaurant/CMVAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DreCmv = () => {
  const [activeTab, setActiveTab] = useState("dre");

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">DRE & CMV</h1>
        <p className="text-muted-foreground">
          Demonstrativo de Resultados e Custo de Mercadoria Vendida
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
