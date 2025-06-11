
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calculator, Target, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ProfitForecasting() {
  const [parameters, setParameters] = useState({
    period: "6", // months
    currentRevenue: 0,
    growthRate: 5, // percentage
    costReduction: 0, // percentage
    marketingInvestment: 0,
    expectedROI: 200 // percentage
  });

  const [results, setResults] = useState<any>(null);
  const [projectionData, setProjectionData] = useState<any[]>([]);

  useEffect(() => {
    // Load current financial data
    loadCurrentData();
  }, []);

  const loadCurrentData = () => {
    const cashFlowData = localStorage.getItem('cashFlowEntries');
    if (cashFlowData) {
      try {
        const entries = JSON.parse(cashFlowData);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const currentMonthEntries = entries.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const revenue = currentMonthEntries
          .filter((entry: any) => entry.type === 'income')
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        setParameters(prev => ({ ...prev, currentRevenue: revenue }));
      } catch (error) {
        console.error('Error loading financial data:', error);
      }
    }
  };

  const calculateProjections = () => {
    const periods = parseInt(parameters.period);
    const monthlyGrowth = parameters.growthRate / 100 / 12;
    const costReductionRate = parameters.costReduction / 100;
    const marketingROI = parameters.expectedROI / 100;
    
    const projections = [];
    let currentRevenue = parameters.currentRevenue;
    
    for (let i = 1; i <= periods; i++) {
      // Apply growth
      currentRevenue = currentRevenue * (1 + monthlyGrowth);
      
      // Marketing impact
      const marketingImpact = (parameters.marketingInvestment * marketingROI) / periods;
      const adjustedRevenue = currentRevenue + marketingImpact;
      
      // Cost savings
      const estimatedCosts = adjustedRevenue * 0.7; // Assuming 70% cost ratio
      const savedCosts = estimatedCosts * costReductionRate;
      const netProfit = adjustedRevenue - (estimatedCosts - savedCosts);
      
      projections.push({
        month: `Mês ${i}`,
        receita: Math.round(adjustedRevenue),
        custos: Math.round(estimatedCosts - savedCosts),
        lucro: Math.round(netProfit),
        crescimento: ((adjustedRevenue / parameters.currentRevenue - 1) * 100).toFixed(1)
      });
    }
    
    setProjectionData(projections);
    
    // Calculate summary results
    const totalRevenue = projections.reduce((sum, p) => sum + p.receita, 0);
    const totalProfit = projections.reduce((sum, p) => sum + p.lucro, 0);
    const averageGrowth = projections[projections.length - 1]?.crescimento || 0;
    
    setResults({
      totalRevenue,
      totalProfit,
      averageGrowth: parseFloat(averageGrowth),
      ROI: parameters.marketingInvestment > 0 ? ((totalProfit / parameters.marketingInvestment) * 100).toFixed(1) : 0,
      breakEvenMonth: projections.findIndex(p => p.lucro > 0) + 1 || "N/A"
    });

    toast.success("Projeções calculadas com sucesso!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full overflow-hidden">
      <Tabs defaultValue="parameters" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
            <TabsTrigger value="parameters" className="text-xs sm:text-sm">Parâmetros</TabsTrigger>
            <TabsTrigger value="results" className="text-xs sm:text-sm">Resultados</TabsTrigger>
            <TabsTrigger value="projections" className="text-xs sm:text-sm">Projeções</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                Configurar Parâmetros da Projeção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period" className="text-sm">Período de Projeção</Label>
                  <Select value={parameters.period} onValueChange={(value) => setParameters(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentRevenue" className="text-sm">Receita Atual Mensal (R$)</Label>
                  <Input
                    id="currentRevenue"
                    type="number"
                    value={parameters.currentRevenue}
                    onChange={(e) => setParameters(prev => ({ ...prev, currentRevenue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growthRate" className="text-sm">Taxa de Crescimento Anual (%)</Label>
                  <Input
                    id="growthRate"
                    type="number"
                    value={parameters.growthRate}
                    onChange={(e) => setParameters(prev => ({ ...prev, growthRate: parseFloat(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costReduction" className="text-sm">Redução de Custos (%)</Label>
                  <Input
                    id="costReduction"
                    type="number"
                    value={parameters.costReduction}
                    onChange={(e) => setParameters(prev => ({ ...prev, costReduction: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketingInvestment" className="text-sm">Investimento em Marketing (R$)</Label>
                  <Input
                    id="marketingInvestment"
                    type="number"
                    value={parameters.marketingInvestment}
                    onChange={(e) => setParameters(prev => ({ ...prev, marketingInvestment: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedROI" className="text-sm">ROI Esperado do Marketing (%)</Label>
                  <Input
                    id="expectedROI"
                    type="number"
                    value={parameters.expectedROI}
                    onChange={(e) => setParameters(prev => ({ ...prev, expectedROI: parseFloat(e.target.value) || 0 }))}
                    placeholder="200"
                  />
                </div>
              </div>

              <Button onClick={calculateProjections} className="w-full text-sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Calcular Projeções
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total Projetada</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {formatCurrency(results.totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Total Projetado</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {formatCurrency(results.totalProfit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crescimento Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    {results.averageGrowth}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI Marketing</CardTitle>
                  <Calculator className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">
                    {results.ROI}%
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center text-sm">
                  Configure os parâmetros e clique em "Calcular Projeções" para ver os resultados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          {projectionData.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Projeção de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita" />
                        <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} name="Lucro" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Comparativo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="receita" fill="#10b981" name="Receita" />
                        <Bar dataKey="custos" fill="#ef4444" name="Custos" />
                        <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center text-sm">
                  Nenhuma projeção calculada ainda. Configure os parâmetros e calcule as projeções.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
