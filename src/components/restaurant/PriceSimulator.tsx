
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Users, Scale, Utensils, HelpCircle, TrendingUp, BookOpen, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { CompetitiveBenchmark } from "./CompetitiveBenchmark";
import { PricingTutorial } from "./PricingTutorial";
import { PricingAlerts } from "./PricingAlerts";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { 
  calculateAdvancedPricing, 
  loadRestaurantConfig, 
  type TaxRegime, 
  type PricingResult 
} from "@/utils/pricing-calculations";
import { useToast } from "@/components/ui/use-toast";

interface SimulationData {
  model: "rodizio" | "buffet_peso" | "traditional";
  costPerKg: number;
  averageConsumptionPerPerson: number;
  wastePercentage: number;
  operationalCostPercentage: number;
  desiredMarginPercentage: number;
  fixedCosts: number;
  expectedMonthlySales: number;
  marketPositioning: "economy" | "standard" | "premium";
  taxRegime: TaxRegime;
}

export function PriceSimulator() {
  const { toast } = useToast();
  const [showTutorial, setShowTutorial] = useState(false);
  const [config, setConfig] = useState(loadRestaurantConfig());
  
  const [simulationData, setSimulationData] = useState<SimulationData>(() => {
    // Sincronizar com dados de configuração
    return {
      model: "rodizio",
      costPerKg: 25,
      averageConsumptionPerPerson: 0.8,
      wastePercentage: 12,
      operationalCostPercentage: 30,
      desiredMarginPercentage: config.desiredProfitMargin,
      fixedCosts: config.fixedExpenses,
      expectedMonthlySales: 800,
      marketPositioning: "standard",
      taxRegime: "simples_nacional"
    };
  });

  // Listener para sincronização em tempo real com configurações
  useEffect(() => {
    const handleConfigUpdate = () => {
      const newConfig = loadRestaurantConfig();
      setConfig(newConfig);
      setSimulationData(prev => ({
        ...prev,
        desiredMarginPercentage: newConfig.desiredProfitMargin,
        fixedCosts: newConfig.fixedExpenses
      }));
      toast({
        title: "Configurações Sincronizadas",
        description: "Dados atualizados automaticamente com as configurações do restaurante",
      });
    };

    window.addEventListener('configUpdated', handleConfigUpdate);
    return () => window.removeEventListener('configUpdated', handleConfigUpdate);
  }, [toast]);

  // Verificar se é primeira visita
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenPricingTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem("hasSeenPricingTutorial", "true");
    }
  }, []);

  // Calcular resultados usando a nova engine de precificação
  const calculateResults = (): PricingResult => {
    let portionSize = 0.3; // Default para tradicional
    
    if (simulationData.model === "rodizio") {
      portionSize = simulationData.averageConsumptionPerPerson;
    } else if (simulationData.model === "buffet_peso") {
      portionSize = 1.0; // 1kg
    }

    return calculateAdvancedPricing(
      simulationData.costPerKg,
      portionSize,
      simulationData.wastePercentage,
      simulationData.operationalCostPercentage,
      simulationData.desiredMarginPercentage,
      simulationData.expectedMonthlySales,
      simulationData.taxRegime,
      simulationData.model
    );
  };

  const results = calculateResults();

  // Market positioning com base no preço calculado
  const getMarketPositioning = () => {
    const price = results.suggestedPrice;
    
    if (simulationData.model === "rodizio") {
      if (price <= 45) return { level: "Econômico", color: "bg-blue-500", description: "Foco em volume e acessibilidade" };
      if (price <= 65) return { level: "Padrão", color: "bg-green-500", description: "Equilibrio entre qualidade e preço" };
      if (price <= 85) return { level: "Premium", color: "bg-yellow-500", description: "Experiência diferenciada" };
      return { level: "Luxo", color: "bg-purple-500", description: "Público seleto e alta qualidade" };
    } else if (simulationData.model === "buffet_peso") {
      if (price <= 35) return { level: "Econômico", color: "bg-blue-500", description: "Foco em volume e acessibilidade" };
      if (price <= 50) return { level: "Padrão", color: "bg-green-500", description: "Equilibrio entre qualidade e preço" };
      if (price <= 70) return { level: "Premium", color: "bg-yellow-500", description: "Experiência diferenciada" };
      return { level: "Luxo", color: "bg-purple-500", description: "Público seleto e alta qualidade" };
    } else {
      if (price <= 25) return { level: "Econômico", color: "bg-blue-500", description: "Foco em volume e acessibilidade" };
      if (price <= 40) return { level: "Padrão", color: "bg-green-500", description: "Equilibrio entre qualidade e preço" };
      if (price <= 60) return { level: "Premium", color: "bg-yellow-500", description: "Experiência diferenciada" };
      return { level: "Luxo", color: "bg-purple-500", description: "Público seleto e alta qualidade" };
    }
  };

  const positioning = getMarketPositioning();

  const handleApplyExample = (example: any) => {
    setSimulationData(prev => ({
      ...prev,
      ...example.data
    }));
    toast({
      title: "Exemplo Aplicado",
      description: `Configuração para ${example.name} foi carregada com sucesso!`,
    });
  };

  const syncWithConfig = () => {
    const newConfig = loadRestaurantConfig();
    setConfig(newConfig);
    setSimulationData(prev => ({
      ...prev,
      desiredMarginPercentage: newConfig.desiredProfitMargin,
      fixedCosts: newConfig.fixedExpenses
    }));
    toast({
      title: "Dados Sincronizados",
      description: "Simulador atualizado com as configurações mais recentes",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Simulador Avançado de Precificação</h2>
            <p className="text-sm text-muted-foreground">
              Sincronizado com: {config.businessName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncWithConfig}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Sincronizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
              <BookOpen className="h-4 w-4 mr-1" />
              Tutorial
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Configuração do Simulador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                  <TabsTrigger value="taxes">Impostos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model" className="flex items-center gap-1">
                        Modelo de Negócio
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Escolha o modelo que melhor representa seu restaurante</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Select 
                        value={simulationData.model} 
                        onValueChange={(value: "rodizio" | "buffet_peso" | "traditional") => 
                          setSimulationData({...simulationData, model: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rodizio">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Rodízio
                            </div>
                          </SelectItem>
                          <SelectItem value="buffet_peso">
                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4" />
                              Buffet por Peso
                            </div>
                          </SelectItem>
                          <SelectItem value="traditional">
                            <div className="flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              Tradicional
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="costPerKg" className="flex items-center gap-1">
                        Custo por Kg
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Custo médio dos ingredientes por quilograma</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="costPerKg"
                        type="number"
                        value={simulationData.costPerKg}
                        onChange={(e) => setSimulationData({
                          ...simulationData,
                          costPerKg: Number(e.target.value)
                        })}
                        className="mt-1"
                      />
                    </div>

                    {simulationData.model === "rodizio" && (
                      <div>
                        <Label htmlFor="consumption" className="flex items-center gap-1">
                          Consumo Médio por Pessoa (kg)
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Quantidade média consumida por cliente em rodízios (normalmente 0.7-1.0kg)</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          id="consumption"
                          type="number"
                          step="0.1"
                          value={simulationData.averageConsumptionPerPerson}
                          onChange={(e) => setSimulationData({
                            ...simulationData,
                            averageConsumptionPerPerson: Number(e.target.value)
                          })}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="sales">Vendas Mensais Estimadas</Label>
                      <Input
                        id="sales"
                        type="number"
                        value={simulationData.expectedMonthlySales}
                        onChange={(e) => setSimulationData({
                          ...simulationData,
                          expectedMonthlySales: Number(e.target.value)
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-1">
                        Margem Desejada: {simulationData.desiredMarginPercentage}%
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Margem de lucro desejada sobre os custos (recomendado: mínimo 25%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Slider
                        value={[simulationData.desiredMarginPercentage]}
                        onValueChange={(value) => setSimulationData({
                          ...simulationData,
                          desiredMarginPercentage: value[0]
                        })}
                        max={50}
                        min={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        Desperdício: {simulationData.wastePercentage}%
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentual de desperdício de alimentos (típico: 8-15%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Slider
                        value={[simulationData.wastePercentage]}
                        onValueChange={(value) => setSimulationData({
                          ...simulationData,
                          wastePercentage: value[0]
                        })}
                        max={25}
                        min={5}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-1">
                        Custos Operacionais: {simulationData.operationalCostPercentage}%
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Custos variáveis como mão de obra direta, energia, etc. (típico: 25-35%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Slider
                        value={[simulationData.operationalCostPercentage]}
                        onValueChange={(value) => setSimulationData({
                          ...simulationData,
                          operationalCostPercentage: value[0]
                        })}
                        max={50}
                        min={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fixedCosts" className="flex items-center gap-1">
                        Custos Fixos Mensais
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sincronizado com configurações: aluguel, seguros, etc.</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="fixedCosts"
                        type="number"
                        value={simulationData.fixedCosts}
                        onChange={(e) => setSimulationData({
                          ...simulationData,
                          fixedCosts: Number(e.target.value)
                        })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="positioning">Posicionamento de Mercado</Label>
                      <Select 
                        value={simulationData.marketPositioning} 
                        onValueChange={(value: "economy" | "standard" | "premium") => 
                          setSimulationData({...simulationData, marketPositioning: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Econômico</SelectItem>
                          <SelectItem value="standard">Padrão</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="taxes" className="space-y-4">
                  <div>
                    <Label htmlFor="taxRegime" className="flex items-center gap-1">
                      Regime Tributário
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Define como os impostos são calculados</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Select 
                      value={simulationData.taxRegime} 
                      onValueChange={(value: TaxRegime) => 
                        setSimulationData({...simulationData, taxRegime: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-blue-900">Impostos Calculados</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• ISS: {formatCurrency(results.taxes.iss)}</p>
                      <p>• ICMS: {formatCurrency(results.taxes.icms)}</p>
                      {results.taxes.pis > 0 && <p>• PIS: {formatCurrency(results.taxes.pis)}</p>}
                      {results.taxes.cofins > 0 && <p>• COFINS: {formatCurrency(results.taxes.cofins)}</p>}
                      <p className="font-medium">• Total: {formatCurrency(results.taxes.total)}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Resultado da Simulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Preço Sugerido</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(results.suggestedPrice)}
                  {simulationData.model === "buffet_peso" && <span className="text-lg">/kg</span>}
                </p>
                <Badge className={`${positioning.color} text-white mt-2`}>
                  {positioning.level}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Custo Base:</span>
                  <span className="font-medium">{formatCurrency(results.baseCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Desperdício:</span>
                  <span className="font-medium">{formatCurrency(results.costWithWaste - results.baseCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Operacional:</span>
                  <span className="font-medium">{formatCurrency(results.operationalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Custo Fixo/Unid:</span>
                  <span className="font-medium">{formatCurrency(results.fixedCostPerUnit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Impostos:</span>
                  <span className="font-medium">{formatCurrency(results.taxes.total)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Custo Total:</span>
                    <span>{formatCurrency(results.totalCost)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Margem Líquida:</span>
                  <span>{results.netMargin.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Food Cost:</span>
                  <span className={`font-medium ${results.foodCostPercentage > 30 ? 'text-red-600' : 'text-green-600'}`}>
                    {results.foodCostPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm">Projeção Mensal</h4>
                <div className="flex justify-between text-sm">
                  <span>Receita:</span>
                  <span className="font-medium">{formatCurrency(results.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lucro Líquido:</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.monthlyProfit)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {positioning.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Alerts */}
        <PricingAlerts
          foodCostPercentage={results.foodCostPercentage}
          profitMargin={results.netMargin}
          suggestedPrice={results.suggestedPrice}
          model={simulationData.model}
          breakEvenPrice={results.breakEvenPrice}
        />

        {/* Break-even Analysis */}
        <BreakEvenAnalysis
          breakEvenPrice={results.breakEvenPrice}
          suggestedPrice={results.suggestedPrice}
          monthlySales={simulationData.expectedMonthlySales}
          fixedCosts={simulationData.fixedCosts}
          variableCostPerUnit={results.costWithWaste + results.operationalCost}
          model={simulationData.model}
        />

        {/* Analysis Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SensitivityAnalysis
            basePrice={results.suggestedPrice}
            baseCost={results.totalCost}
            baseRevenue={results.monthlyRevenue}
            baseProfit={results.monthlyProfit}
            baseMargin={results.netMargin}
            monthlySales={simulationData.expectedMonthlySales}
          />
          
          <CompetitiveBenchmark
            suggestedPrice={results.suggestedPrice}
            priceType={simulationData.model === "buffet_peso" ? "kg" : "pessoa"}
          />
        </div>

        {/* Tutorial Modal */}
        <PricingTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onApplyExample={handleApplyExample}
        />
      </div>
    </TooltipProvider>
  );
}
