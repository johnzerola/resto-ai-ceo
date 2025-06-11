
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calculator, Target, Calendar, DollarSign } from "lucide-react";

export function ProfitForecasting() {
  const [parameters, setParameters] = useState({
    currentRevenue: 0,
    currentExpenses: 0,
    growthRate: 5,
    targetMargin: 20,
    forecastMonths: 12
  });

  const [forecastData, setForecastData] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentData();
  }, []);

  useEffect(() => {
    generateForecast();
    generateScenarios();
  }, [parameters]);

  const loadCurrentData = () => {
    try {
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      if (cashFlowData) {
        const entries = JSON.parse(cashFlowData);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const monthEntries = entries.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const revenue = monthEntries
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        const expenses = monthEntries
          .filter((entry: any) => entry.type === 'expense')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        setParameters(prev => ({
          ...prev,
          currentRevenue: revenue,
          currentExpenses: expenses
        }));
      }
    } catch (error) {
      console.error('Error loading current data:', error);
    }
  };

  const generateForecast = () => {
    const data = [];
    const monthlyGrowthRate = parameters.growthRate / 100 / 12;
    
    for (let i = 0; i <= parameters.forecastMonths; i++) {
      const projectedRevenue = parameters.currentRevenue * Math.pow(1 + monthlyGrowthRate, i);
      const projectedExpenses = parameters.currentExpenses * Math.pow(1 + (monthlyGrowthRate * 0.8), i);
      const projectedProfit = projectedRevenue - projectedExpenses;
      
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      data.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receita: Math.round(projectedRevenue),
        despesas: Math.round(projectedExpenses),
        lucro: Math.round(projectedProfit),
        margem: projectedRevenue > 0 ? ((projectedProfit / projectedRevenue) * 100).toFixed(1) : 0
      });
    }
    
    setForecastData(data);
  };

  const generateScenarios = () => {
    const baseRevenue = parameters.currentRevenue;
    const baseExpenses = parameters.currentExpenses;
    
    const scenarioList = [
      {
        name: "Conservador",
        description: "Crescimento de 2% a.a.",
        growthRate: 2,
        color: "bg-blue-100 text-blue-800",
        revenue: baseRevenue * 1.02,
        expenses: baseExpenses * 1.01,
      },
      {
        name: "Moderado",
        description: "Crescimento de 5% a.a.",
        growthRate: 5,
        color: "bg-green-100 text-green-800",
        revenue: baseRevenue * 1.05,
        expenses: baseExpenses * 1.03,
      },
      {
        name: "Otimista",
        description: "Crescimento de 10% a.a.",
        growthRate: 10,
        color: "bg-purple-100 text-purple-800",
        revenue: baseRevenue * 1.10,
        expenses: baseExpenses * 1.05,
      }
    ];

    const calculatedScenarios = scenarioList.map(scenario => ({
      ...scenario,
      profit: scenario.revenue - scenario.expenses,
      margin: scenario.revenue > 0 ? ((scenario.revenue - scenario.expenses) / scenario.revenue * 100).toFixed(1) : 0
    }));

    setScenarios(calculatedScenarios);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden">
      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Projeções Inteligentes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Baseado nos dados reais do seu fluxo de caixa
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 w-full overflow-hidden">
          <Tabs defaultValue="parametros" className="w-full">
            <div className="w-full overflow-x-auto mb-3 sm:mb-4">
              <TabsList className="grid w-full grid-cols-3 min-w-[280px] h-8 sm:h-10">
                <TabsTrigger value="parametros" className="text-xs sm:text-sm px-1 sm:px-2">
                  Parâmetros
                </TabsTrigger>
                <TabsTrigger value="resultados" className="text-xs sm:text-sm px-1 sm:px-2">
                  Resultados
                </TabsTrigger>
                <TabsTrigger value="projecoes" className="text-xs sm:text-sm px-1 sm:px-2">
                  Projeções
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="parametros" className="space-y-3 sm:space-y-4 w-full overflow-hidden">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentRevenue" className="text-xs sm:text-sm">Receita Mensal Atual</Label>
                  <Input
                    id="currentRevenue"
                    type="number"
                    value={parameters.currentRevenue}
                    onChange={(e) => setParameters(prev => ({ ...prev, currentRevenue: Number(e.target.value) }))}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentExpenses" className="text-xs sm:text-sm">Despesas Mensais Atuais</Label>
                  <Input
                    id="currentExpenses"
                    type="number"
                    value={parameters.currentExpenses}
                    onChange={(e) => setParameters(prev => ({ ...prev, currentExpenses: Number(e.target.value) }))}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="growthRate" className="text-xs sm:text-sm">Taxa de Crescimento Anual (%)</Label>
                  <Input
                    id="growthRate"
                    type="number"
                    value={parameters.growthRate}
                    onChange={(e) => setParameters(prev => ({ ...prev, growthRate: Number(e.target.value) }))}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forecastMonths" className="text-xs sm:text-sm">Período de Projeção (meses)</Label>
                  <Input
                    id="forecastMonths"
                    type="number"
                    min="3"
                    max="24"
                    value={parameters.forecastMonths}
                    onChange={(e) => setParameters(prev => ({ ...prev, forecastMonths: Number(e.target.value) }))}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resultados" className="space-y-3 sm:space-y-4 w-full overflow-hidden">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                {scenarios.map((scenario, index) => (
                  <Card key={index} className="w-full">
                    <CardHeader className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm sm:text-base">{scenario.name}</CardTitle>
                        <Badge className={`${scenario.color} text-xs`}>
                          {scenario.growthRate}% a.a.
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {scenario.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Receita:</span>
                          <span className="text-xs sm:text-sm font-medium text-green-600">
                            {formatCurrency(scenario.revenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Lucro:</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {formatCurrency(scenario.profit)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Margem:</span>
                          <span className="text-xs sm:text-sm font-medium">
                            {scenario.margin}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projecoes" className="space-y-3 sm:space-y-4 w-full overflow-hidden">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[300px] w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" strokeWidth={2} />
                      <Line type="monotone" dataKey="despesas" stroke="#ef4444" name="Despesas" strokeWidth={2} />
                      <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="w-full">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Receita Projetada</p>
                        <p className="text-sm sm:text-base font-bold text-green-600">
                          {forecastData.length > 0 ? formatCurrency(forecastData[forecastData.length - 1]?.receita) : formatCurrency(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lucro Projetado</p>
                        <p className="text-sm sm:text-base font-bold text-blue-600">
                          {forecastData.length > 0 ? formatCurrency(forecastData[forecastData.length - 1]?.lucro) : formatCurrency(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Margem Final</p>
                        <p className="text-sm sm:text-base font-bold text-purple-600">
                          {forecastData.length > 0 ? `${forecastData[forecastData.length - 1]?.margem}%` : '0%'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="text-sm sm:text-base font-bold text-orange-600">
                          {parameters.forecastMonths} meses
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
