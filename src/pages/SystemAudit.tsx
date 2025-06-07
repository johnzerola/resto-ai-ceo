
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartRecommendationEngine } from "@/components/restaurant/SmartRecommendationEngine";
import { BusinessKPIDashboard } from "@/components/restaurant/BusinessKPIDashboard";
import { DataConsistencyValidator } from "@/components/restaurant/DataConsistencyValidator";
import { PriorityActionCenter } from "@/components/restaurant/PriorityActionCenter";
import { Shield, Brain, Target, Zap } from "lucide-react";

const SystemAudit = () => {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sistema de Auditoria Inteligente</h1>
          <p className="text-muted-foreground">
            Análise completa, recomendações automáticas e ações prioritárias para maximizar lucros
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendações</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Validação</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Ações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Motor de Recomendações com IA
                </CardTitle>
                <p className="text-muted-foreground">
                  Análise automática dos seus dados com sugestões personalizadas para aumentar lucros
                </p>
              </CardHeader>
              <CardContent>
                <SmartRecommendationEngine />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Dashboard de KPIs em Tempo Real
                </CardTitle>
                <p className="text-muted-foreground">
                  Acompanhe os indicadores mais importantes do seu negócio com alertas automáticos
                </p>
              </CardHeader>
              <CardContent>
                <BusinessKPIDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Validação de Consistência
                </CardTitle>
                <p className="text-muted-foreground">
                  Verificação automática da integridade e consistência dos seus dados
                </p>
              </CardHeader>
              <CardContent>
                <DataConsistencyValidator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Centro de Ações Prioritárias
                </CardTitle>
                <p className="text-muted-foreground">
                  Lista organizada de ações por prioridade com passos detalhados para execução
                </p>
              </CardHeader>
              <CardContent>
                <PriorityActionCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default SystemAudit;
