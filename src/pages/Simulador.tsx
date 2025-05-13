
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { SimulatorForm } from "@/components/restaurant/SimulatorForm";
import { SimulatorResults } from "@/components/restaurant/SimulatorResults";

const Simulador = () => {
  const [showResults, setShowResults] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  const handleSimulation = (data: any) => {
    setSimulationData(data);
    setShowResults(true);
  };

  const handleBackToForm = () => {
    setShowResults(false);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Simulador de Cenários</h1>
        <p className="text-muted-foreground">
          Projete resultados de mudanças operacionais e financeiras
        </p>
      </div>

      {showResults ? (
        <SimulatorResults data={simulationData} onBackToForm={handleBackToForm} />
      ) : (
        <SimulatorForm onSimulate={handleSimulation} />
      )}
    </Layout>
  );
};

export default Simulador;
