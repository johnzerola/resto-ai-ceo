
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
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Simulador Financeiro</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Ferramentas de simulação para otimizar a gestão financeira
          </p>
        </div>

        <div className="w-full overflow-hidden">
          <Tabs defaultValue="price" className="space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto sm:mx-0">
                <TabsTrigger value="price" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Simulador de</span> Preços
                </TabsTrigger>
                <TabsTrigger value="scenario" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Simulador de</span> Cenários
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="price" className="space-y-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Simulador de Preços Inteligente
                  </CardTitle>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Calcule o preço ideal considerando todos os custos operacionais
                  </p>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 w-full overflow-hidden">
                  <PriceSimulator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenario" className="space-y-4">
              {!showResults ? (
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Simulador de Cenários Financeiros
                    </CardTitle>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Simule diferentes cenários de negócio e veja o impacto nas suas finanças
                    </p>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 w-full overflow-hidden">
                    <SimulatorForm onSimulate={handleSimulate} />
                  </CardContent>
                </Card>
              ) : (
                <div className="w-full overflow-hidden">
                  <SimulatorResults data={simulationData} onBackToForm={handleBackToForm} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
};

export default Simulador;
