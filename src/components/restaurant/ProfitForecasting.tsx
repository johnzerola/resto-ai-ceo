
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Calculator, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ForecastData {
  fixedCosts: number;
  variableCostPercentage: number;
  averageTicket: number;
  estimatedMonthlyCustomers: number;
  wastePercentage: number;
  targetProfitMargin: number;
}

export function ProfitForecasting() {
  const [forecastData, setForecastData] = useState<ForecastData>({
    fixedCosts: 15000,
    variableCostPercentage: 35,
    averageTicket: 75,
    estimatedMonthlyCustomers: 800,
    wastePercentage: 8,
    targetProfitMargin: 20
  });

  const [projectionPeriod, setProjectionPeriod] = useState<3 | 6 | 12>(6);

  // Calculate key metrics
  const grossRevenue = forecastData.averageTicket * forecastData.estimatedMonthlyCustomers;
  const variableCosts = grossRevenue * (forecastData.variableCostPercentage / 100);
  const wasteCosts = grossRevenue * (forecastData.wastePercentage / 100);
  const totalCosts = forecastData.fixedCosts + variableCosts + wasteCosts;
  const netProfit = grossRevenue - totalCosts;
  const actualProfitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Generate projection data
  const generateProjectionData = () => {
    const months = [];
    const growthRate = 0.05; // 5% monthly growth assumption
    
    for (let i = 1; i <= projectionPeriod; i++) {
      const projectedCustomers = forecastData.estimatedMonthlyCustomers * Math.pow(1 + growthRate, i - 1);
      const projectedRevenue = forecastData.averageTicket * projectedCustomers;
      const projectedVariableCosts = projectedRevenue * (forecastData.variableCostPercentage / 100);
      const projectedWasteCosts = projectedRevenue * (forecastData.wastePercentage / 100);
      const projectedTotalCosts = forecastData.fixedCosts + projectedVariableCosts + projectedWasteCosts;
      const projectedProfit = projectedRevenue - projectedTotalCosts;
      
      months.push({
        month: `Mês ${i}`,
        revenue: projectedRevenue,
        costs: projectedTotalCosts,
        profit: projectedProfit,
        customers: Math.round(projectedCustomers)
      });
    }
    
    return months;
  };

  const projectionData = generateProjectionData();

  // Analysis and recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (actualProfitMargin < forecastData.targetProfitMargin) {
      const deficit = forecastData.targetProfitMargin - actualProfitMargin;
      recommendations.push({
        type: "warning",
        title: "Margem abaixo da meta",
        description: `Você está ${deficit.toFixed(1)}% abaixo da margem desejada.`,
        action: "Considere aumentar o ticket médio ou reduzir custos variáveis."
      });
    }
    
    if (forecastData.wastePercentage > 5) {
      recommendations.push({
        type: "error",
        title: "Desperdício muito alto",
        description: `${forecastData.wastePercentage}% de desperdício é acima do ideal (3-5%).`,
        action: "Implemente controles de porcionamento e gestão de estoque."
      });
    }
    
    if (forecastData.variableCostPercentage > 40) {
      recommendations.push({
        type: "warning",
        title: "Custos variáveis elevados",
        description: `${forecastData.variableCostPercentage}% está acima do recomendado (30-35%).`,
        action: "Revise fornecedores e negocie melhores preços."
      });
    }
    
    if (actualProfitMargin >= forecastData.targetProfitMargin) {
      recommendations.push({
        type: "success",
        title: "Meta atingida!",
        description: `Margem de ${actualProfitMargin.toFixed(1)}% está dentro do esperado.`,
        action: "Continue monitorando e considere investir em crescimento."
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Projeção Inteligente de Lucros
          </CardTitle>
          <p className="text-muted-foreground">
            Simule diferentes cenários e projete a lucratividade do seu restaurante
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="projections">Projeções</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fixedCosts">Custos Fixos Mensais</Label>
                    <Input
                      id="fixedCosts"
                      type="number"
                      value={forecastData.fixedCosts}
                      onChange={(e) => setForecastData({
                        ...forecastData,
                        fixedCosts: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="averageTicket">Ticket Médio</Label>
                    <Input
                      id="averageTicket"
                      type="number"
                      value={forecastData.averageTicket}
                      onChange={(e) => setForecastData({
                        ...forecastData,
                        averageTicket: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customers">Clientes Mensais Estimados</Label>
                    <Input
                      id="customers"
                      type="number"
                      value={forecastData.estimatedMonthlyCustomers}
                      onChange={(e) => setForecastData({
                        ...forecastData,
                        estimatedMonthlyCustomers: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Custos Variáveis: {forecastData.variableCostPercentage}%</Label>
                    <Slider
                      value={[forecastData.variableCostPercentage]}
                      onValueChange={(value) => setForecastData({
                        ...forecastData,
                        variableCostPercentage: value[0]
                      })}
                      max={60}
                      min={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Desperdício: {forecastData.wastePercentage}%</Label>
                    <Slider
                      value={[forecastData.wastePercentage]}
                      onValueChange={(value) => setForecastData({
                        ...forecastData,
                        wastePercentage: value[0]
                      })}
                      max={20}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Meta de Margem: {forecastData.targetProfitMargin}%</Label>
                    <Slider
                      value={[forecastData.targetProfitMargin]}
                      onValueChange={(value) => setForecastData({
                        ...forecastData,
                        targetProfitMargin: value[0]
                      })}
                      max={40}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(grossRevenue)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Custos Totais</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(totalCosts)}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(netProfit)}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {netProfit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Análise de Margem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Margem Atual:</span>
                        <Badge className={actualProfitMargin >= forecastData.targetProfitMargin ? "bg-green-500" : "bg-red-500"}>
                          {actualProfitMargin.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Meta de Margem:</span>
                        <Badge variant="outline">{forecastData.targetProfitMargin}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Diferença:</span>
                        <Badge className={actualProfitMargin >= forecastData.targetProfitMargin ? "bg-green-500" : "bg-red-500"}>
                          {(actualProfitMargin - forecastData.targetProfitMargin).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Breakdown de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Custos Fixos:</span>
                        <span className="text-sm font-medium">{formatCurrency(forecastData.fixedCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Custos Variáveis:</span>
                        <span className="text-sm font-medium">{formatCurrency(variableCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Desperdício:</span>
                        <span className="text-sm font-medium">{formatCurrency(wasteCosts)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatCurrency(totalCosts)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recomendações Inteligentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        rec.type === 'success' ? 'bg-green-50 border-green-200' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          {rec.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                            <p className="text-sm font-medium mt-2">{rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projections" className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Label>Período de Projeção:</Label>
                <div className="flex gap-2">
                  <Button
                    variant={projectionPeriod === 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionPeriod(3)}
                  >
                    3 meses
                  </Button>
                  <Button
                    variant={projectionPeriod === 6 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionPeriod(6)}
                  >
                    6 meses
                  </Button>
                  <Button
                    variant={projectionPeriod === 12 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionPeriod(12)}
                  >
                    12 meses
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Projeção de Receita vs Lucro</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Receita" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" name="Lucro" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="customers" fill="#8884d8" name="Clientes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary projections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Receita Total Projetada</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(projectionData.reduce((sum, month) => sum + month.revenue, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{projectionPeriod} meses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Lucro Total Projetado</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(projectionData.reduce((sum, month) => sum + month.profit, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{projectionPeriod} meses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Clientes Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {projectionData.reduce((sum, month) => sum + month.customers, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{projectionPeriod} meses</p>
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
