
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { SystemAuditReport } from "@/components/system/SystemAuditReport";
import { SystemFeatures } from "@/components/seo/SystemFeatures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, BarChart3 } from "lucide-react";

const SystemAuditPage = () => {
  return (
    <ModernLayout>
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Auditoria do Sistema
          </h1>
          <p className="text-muted-foreground">
            Análise completa por especialistas Harvard/Oxford/MIT + Otimização SEO
          </p>
        </div>

        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Auditoria Técnica
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Funcionalidades
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO & Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-6">
            <SystemAuditReport />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <SystemFeatures />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Palavras-chave Primárias</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'sistema para restaurante',
                    'controle financeiro restaurante', 
                    'precificação restaurante',
                    'DRE restaurante',
                    'CMV restaurante',
                    'fluxo de caixa restaurante'
                  ].map((keyword, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Long Tail Keywords</h3>
                <div className="space-y-2">
                  {[
                    'como calcular preço de venda restaurante',
                    'sistema para calcular CMV',
                    'controle financeiro para bares',
                    'gestão de custos food service',
                    'precificar cardápio restaurante',
                    'como ter restaurante lucrativo'
                  ].map((keyword, index) => (
                    <div key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default SystemAuditPage;
