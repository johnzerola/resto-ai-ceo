
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { SimulatorForm } from "@/components/restaurant/SimulatorForm";
import { SimulatorResults } from "@/components/restaurant/SimulatorResults";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Simulador = () => {
  const [showResults, setShowResults] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [simulationHistory, setSimulationHistory] = useState<any[]>(() => {
    const savedHistory = localStorage.getItem('simulationHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [activeTab, setActiveTab] = useState<string>("simulation");

  const handleSimulation = (data: any) => {
    // Adicionar timestamp ao histórico de simulações
    const simulationWithMeta = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      name: `Simulação ${simulationHistory.length + 1}`
    };
    
    // Salvar dados da simulação
    setSimulationData(simulationWithMeta);
    setShowResults(true);
    
    // Adicionar ao histórico
    const updatedHistory = [simulationWithMeta, ...simulationHistory].slice(0, 10); // Manter apenas as 10 últimas
    setSimulationHistory(updatedHistory);
    localStorage.setItem('simulationHistory', JSON.stringify(updatedHistory));
  };

  const handleBackToForm = () => {
    setShowResults(false);
  };
  
  const handleViewSavedSimulation = (simulation: any) => {
    setSimulationData(simulation);
    setShowResults(true);
    setActiveTab("simulation");
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Simulador de Cenários</h1>
        <p className="text-muted-foreground">
          Projete resultados de mudanças operacionais e financeiras
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="simulation">Simulação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulation">
          <Alert className="mb-6 border-blue-100 bg-blue-50">
            <AlertTitle className="text-blue-800">Ferramenta de Planejamento</AlertTitle>
            <AlertDescription className="text-blue-700">
              Use este simulador para projetar o impacto de mudanças em preços, custos e estratégias de crescimento.
              Os resultados são baseados nos dados atuais do seu negócio.
            </AlertDescription>
          </Alert>
          
          {showResults ? (
            <SimulatorResults data={simulationData} onBackToForm={handleBackToForm} />
          ) : (
            <SimulatorForm onSimulate={handleSimulation} />
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {simulationHistory.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Simulações Anteriores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simulationHistory.map((simulation) => (
                  <Card 
                    key={simulation.id} 
                    className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleViewSavedSimulation(simulation)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{simulation.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{simulation.date}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Receita Projetada</p>
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(simulation.projected.revenue)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Lucro Projetado</p>
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(simulation.projected.profit)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Variação de Receita</p>
                          <p className={`text-sm font-medium ${simulation.changes.revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {simulation.changes.revenueChangePercent > 0 ? '+' : ''}
                            {simulation.changes.revenueChangePercent.toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Variação de Lucro</p>
                          <p className={`text-sm font-medium ${simulation.changes.profitChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {simulation.changes.profitChangePercent > 0 ? '+' : ''}
                            {simulation.changes.profitChangePercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma simulação salva ainda.</p>
              <p className="mt-2">Crie sua primeira simulação na aba Simulação.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Simulador;
