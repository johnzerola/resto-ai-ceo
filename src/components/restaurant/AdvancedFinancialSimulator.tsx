
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    revenueGrowth: number;
    costReduction: number;
    priceIncrease: number;
    volumeChange: number;
    marketingInvestment: number;
    efficiency: number;
  };
  results?: {
    revenue: number;
    costs: number;
    profit: number;
    margin: number;
    breakeven: number;
    roi: number;
  };
}

interface AdvancedFinancialSimulatorProps {
  restaurantId: string;
  initialData?: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    fixedCosts: number;
    variableCosts: number;
  };
}

export function AdvancedFinancialSimulator({ 
  restaurantId, 
  initialData = {
    monthlyRevenue: 50000,
    monthlyExpenses: 40000,
    fixedCosts: 25000,
    variableCosts: 15000
  }
}: AdvancedFinancialSimulatorProps) {
  
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: 'conservative',
      name: 'Cenário Conservador',
      description: 'Crescimento moderado com baixo risco',
      parameters: {
        revenueGrowth: 5,
        costReduction: 2,
        priceIncrease: 3,
        volumeChange: 2,
        marketingInvestment: 10,
        efficiency: 5
      }
    },
    {
      id: 'optimistic',
      name: 'Cenário Otimista',
      description: 'Crescimento acelerado com investimento',
      parameters: {
        revenueGrowth: 15,
        costReduction: 8,
        priceIncrease: 7,
        volumeChange: 10,
        marketingInvestment: 25,
        efficiency: 12
      }
    },
    {
      id: 'pessimistic',
      name: 'Cenário Pessimista',
      description: 'Cenário de crise ou dificuldades',
      parameters: {
        revenueGrowth: -5,
        costReduction: 15,
        priceIncrease: 0,
        volumeChange: -10,
        marketingInvestment: 0,
        efficiency: 8
      }
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(scenarios[0]);
  const [customScenario, setCustomScenario] = useState<SimulationScenario>({
    id: 'custom',
    name: 'Cenário Personalizado',
    description: 'Ajuste os parâmetros conforme necessário',
    parameters: {
      revenueGrowth: 10,
      costReduction: 5,
      priceIncrease: 5,
      volumeChange: 5,
      marketingInvestment: 15,
      efficiency: 8
    }
  });

  const [timeHorizon, setTimeHorizon] = useState(12); // meses
  const [projectionData, setProjectionData] = useState<any[]>([]);

  useEffect(() => {
    calculateScenarios();
  }, [selectedScenario, customScenario, timeHorizon]);

  const calculateScenarios = () => {
    const updatedScenarios = scenarios.map(scenario => ({
      ...scenario,
      results: calculateResults(scenario)
    }));

    setScenarios(updatedScenarios);
    generateProjectionData();
  };

  const calculateResults = (scenario: SimulationScenario) => {
    const { parameters } = scenario;
    const baseRevenue = initialData.monthlyRevenue;
    const baseExpenses = initialData.monthlyExpenses;

    // Calcular receita projetada
    const revenueMultiplier = 1 + (parameters.revenueGrowth / 100);
    const priceMultiplier = 1 + (parameters.priceIncrease / 100);
    const volumeMultiplier = 1 + (parameters.volumeChange / 100);
    
    const projectedRevenue = baseRevenue * revenueMultiplier * priceMultiplier * volumeMultiplier;

    // Calcular custos projetados
    const costReductionMultiplier = 1 - (parameters.costReduction / 100);
    const efficiencyMultiplier = 1 - (parameters.efficiency / 100);
    const marketingCosts = baseRevenue * (parameters.marketingInvestment / 100);
    
    const projectedCosts = (baseExpenses * costReductionMultiplier * efficiencyMultiplier) + marketingCosts;

    // Métricas finais
    const profit = projectedRevenue - projectedCosts;
    const margin = (profit / projectedRevenue) * 100;
    const breakeven = projectedCosts / (projectedRevenue / projectedRevenue); // Simplificado
    const roi = ((profit - marketingCosts) / marketingCosts) * 100;

    return {
      revenue: projectedRevenue,
      costs: projectedCosts,
      profit,
      margin,
      breakeven: projectedCosts / (projectedRevenue / 30), // dias para breakeven
      roi: isNaN(roi) ? 0 : roi
    };
  };

  const generateProjectionData = () => {
    const data = [];
    const scenario = selectedScenario.id === 'custom' ? customScenario : selectedScenario;
    
    for (let month = 1; month <= timeHorizon; month++) {
      const growthFactor = Math.pow(1 + (scenario.parameters.revenueGrowth / 100 / 12), month);
      const efficiencyFactor = Math.pow(1 - (scenario.parameters.efficiency / 100 / 12), month);
      
      const revenue = initialData.monthlyRevenue * growthFactor;
      const costs = initialData.monthlyExpenses * efficiencyFactor;
      const profit = revenue - costs;
      
      data.push({
        month: `Mês ${month}`,
        receita: revenue,
        custos: costs,
        lucro: profit,
        margem: (profit / revenue) * 100
      });
    }
    
    setProjectionData(data);
  };

  const updateCustomParameter = (parameter: keyof SimulationScenario['parameters'], value: number) => {
    setCustomScenario(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [parameter]: value
      }
    }));
  };

  const getScenarioColor = (scenarioId: string) => {
    switch (scenarioId) {
      case 'conservative': return 'bg-blue-500';
      case 'optimistic': return 'bg-green-500';
      case 'pessimistic': return 'bg-red-500';
      case 'custom': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const currentResults = selectedScenario.id === 'custom' ? 
    calculateResults(customScenario) : 
    selectedScenario.results;

  return (
    <div className="space-y-6">
      {/* Seleção de cenário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador Financeiro Avançado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  selectedScenario.id === scenario.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getScenarioColor(scenario.id)}>
                      {scenario.name}
                    </Badge>
                    {scenario.results && (
                      <span className={`text-sm font-medium ${
                        scenario.results.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {scenario.results.margin.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  {scenario.results && (
                    <div className="mt-2 text-sm">
                      <p>Lucro: <span className="font-medium">{formatCurrency(scenario.results.profit)}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Cenário Personalizado */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedScenario.id === 'custom' ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedScenario({ ...customScenario, id: 'custom' })}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-purple-500">Personalizado</Badge>
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">Configure seus próprios parâmetros</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
        </TabsList>

        {/* Aba de Parâmetros */}
        <TabsContent value="parameters" className="space-y-4">
          {selectedScenario.id === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle>Ajustar Parâmetros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Crescimento de Receita: {customScenario.parameters.revenueGrowth}%</Label>
                    <Slider
                      value={[customScenario.parameters.revenueGrowth]}
                      onValueChange={([value]) => updateCustomParameter('revenueGrowth', value)}
                      min={-20}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Redução de Custos: {customScenario.parameters.costReduction}%</Label>
                    <Slider
                      value={[customScenario.parameters.costReduction]}
                      onValueChange={([value]) => updateCustomParameter('costReduction', value)}
                      min={0}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Aumento de Preços: {customScenario.parameters.priceIncrease}%</Label>
                    <Slider
                      value={[customScenario.parameters.priceIncrease]}
                      onValueChange={([value]) => updateCustomParameter('priceIncrease', value)}
                      min={0}
                      max={20}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Variação de Volume: {customScenario.parameters.volumeChange}%</Label>
                    <Slider
                      value={[customScenario.parameters.volumeChange]}
                      onValueChange={([value]) => updateCustomParameter('volumeChange', value)}
                      min={-30}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Investimento Marketing: {customScenario.parameters.marketingInvestment}%</Label>
                    <Slider
                      value={[customScenario.parameters.marketingInvestment]}
                      onValueChange={([value]) => updateCustomParameter('marketingInvestment', value)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Melhoria Eficiência: {customScenario.parameters.efficiency}%</Label>
                    <Slider
                      value={[customScenario.parameters.efficiency]}
                      onValueChange={([value]) => updateCustomParameter('efficiency', value)}
                      min={0}
                      max={25}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedScenario.id !== 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros do {selectedScenario.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedScenario.parameters.revenueGrowth}%
                    </p>
                    <p className="text-sm text-muted-foreground">Crescimento Receita</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedScenario.parameters.costReduction}%
                    </p>
                    <p className="text-sm text-muted-foreground">Redução Custos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedScenario.parameters.priceIncrease}%
                    </p>
                    <p className="text-sm text-muted-foreground">Aumento Preços</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedScenario.parameters.volumeChange}%
                    </p>
                    <p className="text-sm text-muted-foreground">Variação Volume</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {selectedScenario.parameters.marketingInvestment}%
                    </p>
                    <p className="text-sm text-muted-foreground">Invest. Marketing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">
                      {selectedScenario.parameters.efficiency}%
                    </p>
                    <p className="text-sm text-muted-foreground">Melhoria Efic.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba de Resultados */}
        <TabsContent value="results" className="space-y-4">
          {currentResults && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Projetada</p>
                        <p className="text-xl font-bold">{formatCurrency(currentResults.revenue)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Custos Projetados</p>
                        <p className="text-xl font-bold">{formatCurrency(currentResults.costs)}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Lucro Projetado</p>
                        <p className={`text-xl font-bold ${currentResults.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(currentResults.profit)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Margem</p>
                        <p className={`text-xl font-bold ${currentResults.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentResults.margin.toFixed(1)}%
                        </p>
                      </div>
                      <PieChart className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Ponto de Equilíbrio</p>
                      <p className="text-2xl font-bold">{currentResults.breakeven.toFixed(0)} dias</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">ROI Projetado</p>
                      <p className={`text-2xl font-bold ${currentResults.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentResults.roi.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Aba de Projeções */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projeção Temporal</CardTitle>
                <div className="space-y-2">
                  <Label>Horizonte: {timeHorizon} meses</Label>
                  <Slider
                    value={[timeHorizon]}
                    onValueChange={([value]) => setTimeHorizon(value)}
                    min={6}
                    max={36}
                    step={1}
                    className="w-32"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'receita' ? 'Receita' : name === 'custos' ? 'Custos' : 'Lucro'
                    ]}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
