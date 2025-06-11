
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
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6 bg-background min-h-screen max-w-full overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">Simulador Financeiro</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Ferramentas de simulação para otimizar a gestão
          </p>
        </div>

        <div className="w-full min-w-0 overflow-hidden">
          <Tabs defaultValue="price" className="space-y-3 sm:space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="grid grid-cols-2 w-full max-w-xs sm:max-w-md mx-auto sm:mx-0 h-8 sm:h-10">
                <TabsTrigger value="price" className="flex items-center gap-1 text-xs sm:text-sm px-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Simulador de</span>
                  <span>Preços</span>
                </TabsTrigger>
                <TabsTrigger value="scenario" className="flex items-center gap-1 text-xs sm:text-sm px-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Simulador de</span>
                  <span>Cenários</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="price" className="space-y-3 sm:space-y-4">
              <Card className="w-full min-w-0">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span className="truncate">Simulador de Preços Inteligente</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Calcule o preço ideal considerando todos os custos
                  </p>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 w-full min-w-0 overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[280px] w-full">
                      <PriceSimulator />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenario" className="space-y-3 sm:space-y-4">
              {!showResults ? (
                <Card className="w-full min-w-0">
                  <CardHeader className="p-3 sm:p-4 lg:p-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">Simulador de Cenários Financeiros</span>
                    </CardTitle>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Simule diferentes cenários de negócio
                    </p>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 w-full min-w-0 overflow-hidden">
                    <SimulatorForm onSimulate={handleSimulate} />
                  </CardContent>
                </Card>
              ) : (
                <div className="w-full min-w-0 overflow-hidden">
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
