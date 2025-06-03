import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimulatorForm } from "@/components/restaurant/SimulatorForm";
import { SimulatorResults } from "@/components/restaurant/SimulatorResults";
import { PriceSimulator } from "@/components/restaurant/PriceSimulator";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

const Simulador = () => {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSimulate = (data: any) => {
    setSimulationData(data);
    setShowResults(true);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setSimulationData(null);
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulador Financeiro</h1>
          <p className="text-muted-foreground">
            Ferramentas de simulação para otimizar a gestão financeira do seu restaurante
          </p>
        </div>

        <Tabs defaultValue="price" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Simulador de Preços
            </TabsTrigger>
            <TabsTrigger value="scenario" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Simulador de Cenários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Simulador de Preços Inteligente
                </CardTitle>
                <p className="text-muted-foreground">
                  Calcule o preço ideal para maximizar seus lucros considerando todos os custos operacionais
                </p>
              </CardHeader>
              <CardContent>
                <PriceSimulator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenario" className="space-y-4">
            {!showResults ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Simulador de Cenários Financeiros
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Simule diferentes cenários de negócio e veja o impacto nas suas finanças
                  </p>
                </CardHeader>
                <CardContent>
                  <SimulatorForm onSimulate={handleSimulate} />
                </CardContent>
              </Card>
            ) : (
              <SimulatorResults data={simulationData} onBackToForm={handleBackToForm} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default Simulador;
