
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Users, Scale, Utensils, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { CompetitiveBenchmark } from "./CompetitiveBenchmark";
import { SmartAlerts } from "./SmartAlerts";

interface SimulationData {
  model: "rodizio" | "buffet_peso" | "traditional";
  costPerKg: number;
  averageConsumptionPerPerson: number; // kg for buffet, fixed for rodizio
  wastePercentage: number;
  operationalCostPercentage: number;
  desiredMarginPercentage: number;
  fixedCosts: number;
  expectedMonthlySales: number;
  marketPositioning: "economy" | "standard" | "premium";
}

export function PriceSimulator() {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    model: "rodizio",
    costPerKg: 25,
    averageConsumptionPerPerson: 0.8,
    wastePercentage: 12,
    operationalCostPercentage: 30,
    desiredMarginPercentage: 25,
    fixedCosts: 15000,
    expectedMonthlySales: 800,
    marketPositioning: "standard"
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core calculation logic
  const calculatePrice = () => {
    let baseCost = 0;
    
    if (simulationData.model === "rodizio") {
      // For rodizio, calculate based on average consumption
      baseCost = simulationData.costPerKg * simulationData.averageConsumptionPerPerson;
    } else if (simulationData.model === "buffet_peso") {
      // For buffet by weight, cost per kg is the base
      baseCost = simulationData.costPerKg;
    } else {
      // Traditional model
      baseCost = simulationData.costPerKg * 0.3; // Assuming 300g portion
    }

    // Add waste
    const costWithWaste = baseCost * (1 + simulationData.wastePercentage / 100);
    
    // Add operational costs
    const totalCost = costWithWaste * (1 + simulationData.operationalCostPercentage / 100);
    
    // Apply desired margin
    const suggestedPrice = totalCost / (1 - simulationData.desiredMarginPercentage / 100);
    
    return {
      baseCost,
      costWithWaste,
      totalCost,
      suggestedPrice,
      margin: simulationData.desiredMarginPercentage,
      monthlyRevenue: suggestedPrice * simulationData.expectedMonthlySales,
      monthlyProfit: (suggestedPrice - totalCost) * simulationData.expectedMonthlySales
    };
  };

  const results = calculatePrice();

  // Market positioning recommendations
  const getMarketPositioning = () => {
    const price = results.suggestedPrice;
    
    if (simulationData.model === "rodizio") {
      if (price <= 45) return { level: "Econômico", color: "bg-blue-500", description: "Foco em volume e acessibilidade" };
      if (price <= 65) return { level: "Padrão", color: "bg-green-500", description: "Equilibrio entre qualidade e preço" };
      if (price <= 85) return { level: "Premium", color: "bg-yellow-500", description: "Experiência diferenciada" };
      return { level: "Luxo", color: "bg-purple-500", description: "Público seleto e alta qualidade" };
    } else {
      // Buffet by weight
      if (price <= 35) return { level: "Econômico", color: "bg-blue-500", description: "Foco em volume e acessibilidade" };
      if (price <= 50) return { level: "Padrão", color: "bg-green-500", description: "Equilibrio entre qualidade e preço" };
      if (price <= 70) return { level: "Premium", color: "bg-yellow-500", description: "Experiência diferenciada" };
      return { level: "Luxo", color: "bg-purple-500", description: "Público seleto e alta qualidade" };
    }
  };

  const positioning = getMarketPositioning();

  // Smart recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (simulationData.wastePercentage > 15) {
      recommendations.push({
        type: "warning" as const,
        title: "Desperdício Alto",
        description: `${simulationData.wastePercentage}% de desperdício impacta significativamente seus custos`,
        suggestion: "Implemente controles de porcionamento e treinamento da equipe"
      });
    }
    
    if (simulationData.desiredMarginPercentage < 20) {
      recommendations.push({
        type: "error" as const,
        title: "Margem Baixa",
        description: "Margem abaixo de 20% pode ser insustentável",
        suggestion: "Considere aumentar a margem ou reduzir custos operacionais"
      });
    }
    
    if (results.suggestedPrice > 100 && simulationData.model === "rodizio") {
      recommendations.push({
        type: "warning" as const,
        title: "Preço Elevado",
        description: "Preço acima de R$ 100 pode reduzir significativamente a demanda",
        suggestion: "Avalie estratégias de diferenciação para justificar o preço premium"
      });
    }
    
    if (simulationData.operationalCostPercentage > 35) {
      recommendations.push({
        type: "warning" as const,
        title: "Custos Operacionais Elevados",
        description: `${simulationData.operationalCostPercentage}% está acima da média do setor (25-30%)`,
        suggestion: "Revise processos e fornecedores para otimizar custos"
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model">Modelo de Negócio</Label>
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
                    <Label htmlFor="costPerKg">Custo por Kg</Label>
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
                      <Label htmlFor="consumption">Consumo Médio por Pessoa (kg)</Label>
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
                    <Label>Margem Desejada: {simulationData.desiredMarginPercentage}%</Label>
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
                    <Label>Desperdício: {simulationData.wastePercentage}%</Label>
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
                    <Label>Custos Operacionais: {simulationData.operationalCostPercentage}%</Label>
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
                    <Label htmlFor="fixedCosts">Custos Fixos Mensais</Label>
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

                {/* Additional advanced controls can be added here */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Configurações Avançadas</h4>
                  <p className="text-sm text-blue-700">
                    Use essas configurações para simular cenários mais específicos do seu negócio.
                    Considere sazonalidade, localização e perfil do cliente.
                  </p>
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
                <span className="font-medium">{formatCurrency(results.totalCost - results.costWithWaste)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Custo Total:</span>
                  <span>{formatCurrency(results.totalCost)}</span>
                </div>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Margem de Lucro:</span>
                <span>{results.margin}%</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-sm">Projeção Mensal</h4>
              <div className="flex justify-between text-sm">
                <span>Receita:</span>
                <span className="font-medium">{formatCurrency(results.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lucro Bruto:</span>
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
      <SmartAlerts recommendations={recommendations} />

      {/* Analysis Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensitivityAnalysis
          basePrice={results.suggestedPrice}
          baseCost={results.totalCost}
          baseRevenue={results.monthlyRevenue}
          baseProfit={results.monthlyProfit}
          baseMargin={results.margin}
          monthlySales={simulationData.expectedMonthlySales}
        />
        
        <CompetitiveBenchmark
          suggestedPrice={results.suggestedPrice}
          priceType={simulationData.model === "buffet_peso" ? "kg" : "pessoa"}
        />
      </div>

      {/* Model-specific insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights do Modelo {simulationData.model === "rodizio" ? "Rodízio" : simulationData.model === "buffet_peso" ? "Buffet por Peso" : "Tradicional"}</CardTitle>
        </CardHeader>
        <CardContent>
          {simulationData.model === "rodizio" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Controle de Consumo</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Monitore o consumo médio por cliente. Valores entre 0.7-1.0kg são típicos para rodízios.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Gestão de Filas</h4>
                <p className="text-sm text-green-700 mt-1">
                  Rodízios dependem de rotatividade. Otimize o tempo de permanência para maximizar receita.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Variedade do Cardápio</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Mantenha variedade e qualidade constantes para justificar o preço fixo.
                </p>
              </div>
            </div>
          )}

          {simulationData.model === "buffet_peso" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Balança e Precisão</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Invista em balanças precisas e confiáveis. A transparência é essencial.
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">Controle de Peso</h4>
                <p className="text-sm text-red-700 mt-1">
                  Monitore o peso médio dos pratos. Clientes conscientes tendem a pesar entre 300-500g.
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900">Organização do Buffet</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  Organize estrategicamente: saladas primeiro, pratos principais no meio, sobremesas por último.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
