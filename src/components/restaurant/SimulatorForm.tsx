
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface SimulatorFormProps {
  onSimulate: (data: any) => void;
}

export function SimulatorForm({ onSimulate }: SimulatorFormProps) {
  const { toast } = useToast();
  
  // Valores iniciais baseados nos dados do restaurante
  const [restaurantData, setRestaurantData] = useState(() => {
    const savedData = localStorage.getItem("restaurantData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      monthlyRevenue: 50000,
      fixedExpenses: 15000,
      variableExpenses: 20000,
      desiredProfitMargin: 15
    };
  });

  // Estado para os parâmetros da simulação
  const [params, setParams] = useState({
    // Preços
    menuPriceAdjustment: 0,
    averageTicketChange: 0,
    
    // Custos
    foodCostReduction: 0,
    laborCostChange: 0,
    
    // Crescimento
    customerGrowth: 0,
    marketingInvestment: 0
  });

  // Cálculo base
  const currentRevenue = restaurantData.monthlyRevenue || 50000;
  const currentFoodCost = currentRevenue * 0.3; // 30% é o CMV médio
  const currentLaborCost = currentRevenue * 0.25; // 25% é o custo médio com mão de obra
  const currentRentCost = restaurantData.fixedExpenses * 0.4 || 6000;
  const currentUtilitiesCost = restaurantData.fixedExpenses * 0.2 || 3000;
  const currentMarketingCost = restaurantData.fixedExpenses * 0.1 || 1500;
  const currentOtherCosts = restaurantData.fixedExpenses * 0.3 || 4500;
  const currentProfit = currentRevenue - (currentFoodCost + currentLaborCost + currentRentCost + currentUtilitiesCost + currentMarketingCost + currentOtherCosts);
  const currentProfitMargin = (currentProfit / currentRevenue) * 100;

  // Preview da simulação
  const [preview, setPreview] = useState({
    revenue: currentRevenue,
    foodCost: currentFoodCost,
    laborCost: currentLaborCost,
    rentCost: currentRentCost,
    utilitiesCost: currentUtilitiesCost,
    marketingCost: currentMarketingCost,
    otherCosts: currentOtherCosts,
    profit: currentProfit,
    profitMargin: currentProfitMargin
  });

  // Atualizar preview quando os parâmetros mudarem
  const updatePreview = () => {
    // Calcular projeção de receita
    const revenueMultiplier = 1 + (params.menuPriceAdjustment + params.customerGrowth) / 100;
    const projectedRevenue = currentRevenue * revenueMultiplier;
    
    // Calcular custos projetados
    const foodCostMultiplier = 1 - (params.foodCostReduction / 100);
    const projectedFoodCost = (currentFoodCost * foodCostMultiplier) * (1 + (params.customerGrowth / 100));
    
    const laborCostMultiplier = 1 + (params.laborCostChange / 100);
    const projectedLaborCost = currentLaborCost * laborCostMultiplier;
    
    const projectedRentCost = currentRentCost; // Aluguel permanece o mesmo
    
    const projectedMarketingCost = currentMarketingCost * (1 + (params.marketingInvestment / 100));
    
    const projectedUtilitiesCost = currentUtilitiesCost * (1 + (params.customerGrowth / 100) * 0.3); // Utilities crescem parcialmente com volume
    
    const projectedOtherCosts = currentOtherCosts * (1 + (params.customerGrowth / 100) * 0.2); // Outros custos crescem parcialmente com volume
    
    // Calcular lucro e margem projetados
    const projectedProfit = projectedRevenue - (projectedFoodCost + projectedLaborCost + projectedRentCost + projectedUtilitiesCost + projectedMarketingCost + projectedOtherCosts);
    const projectedProfitMargin = (projectedProfit / projectedRevenue) * 100;
    
    setPreview({
      revenue: projectedRevenue,
      foodCost: projectedFoodCost,
      laborCost: projectedLaborCost,
      rentCost: projectedRentCost,
      utilitiesCost: projectedUtilitiesCost,
      marketingCost: projectedMarketingCost,
      otherCosts: projectedOtherCosts,
      profit: projectedProfit,
      profitMargin: projectedProfitMargin
    });
  };

  // Atualizar preview quando o formulário é alterado
  const handleParamChange = (key: keyof typeof params, value: number) => {
    setParams(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    
    // Chamamos com um timeout para não sobrecarregar com muitas atualizações
    setTimeout(updatePreview, 0);
  };

  // Executar simulação
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados para a simulação
    const simulationData = {
      current: {
        revenue: currentRevenue,
        foodCost: currentFoodCost,
        laborCost: currentLaborCost,
        rentCost: currentRentCost,
        utilitiesCost: currentUtilitiesCost,
        marketingCost: currentMarketingCost,
        otherCosts: currentOtherCosts,
        profit: currentProfit,
        profitMargin: currentProfitMargin
      },
      projected: preview,
      adjustments: params,
      changes: {
        revenueChange: preview.revenue - currentRevenue,
        revenueChangePercent: ((preview.revenue - currentRevenue) / currentRevenue) * 100,
        profitChange: preview.profit - currentProfit,
        profitChangePercent: ((preview.profit - currentProfit) / Math.abs(currentProfit)) * 100,
        marginChange: preview.profitMargin - currentProfitMargin
      }
    };
    
    toast({
      title: "Simulação concluída",
      description: "Os resultados da simulação estão prontos para análise."
    });
    
    onSimulate(simulationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px] mx-auto">
          <TabsTrigger value="prices">Preços</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
        </TabsList>
        
        {/* Aba de Preços */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes de Preço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ajuste de Preços no Cardápio */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="menuPriceAdjustment">Ajuste de Preços no Cardápio</Label>
                  <span className={`${params.menuPriceAdjustment > 0 ? 'text-green-600' : params.menuPriceAdjustment < 0 ? 'text-red-600' : ''} font-medium`}>
                    {params.menuPriceAdjustment > 0 ? '+' : ''}{params.menuPriceAdjustment}%
                  </span>
                </div>
                <Slider 
                  id="menuPriceAdjustment"
                  min={-20} 
                  max={20} 
                  step={0.5}
                  value={[params.menuPriceAdjustment]}
                  onValueChange={([value]) => handleParamChange('menuPriceAdjustment', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Ajuste os preços do cardápio em até ±20%
                </p>
              </div>
              
              {/* Variação do Ticket Médio */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="averageTicketChange">Variação do Ticket Médio</Label>
                  <span className={`${params.averageTicketChange > 0 ? 'text-green-600' : params.averageTicketChange < 0 ? 'text-red-600' : ''} font-medium`}>
                    {params.averageTicketChange > 0 ? '+' : ''}{params.averageTicketChange}%
                  </span>
                </div>
                <Slider 
                  id="averageTicketChange"
                  min={-15} 
                  max={15} 
                  step={0.5}
                  value={[params.averageTicketChange]}
                  onValueChange={([value]) => handleParamChange('averageTicketChange', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Variação esperada no valor médio gasto por cliente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Custos */}
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes de Custos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Redução no Custo de Alimentos */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="foodCostReduction">Redução no Custo de Alimentos</Label>
                  <span className={`${params.foodCostReduction > 0 ? 'text-green-600' : ''} font-medium`}>
                    {params.foodCostReduction > 0 ? '-' : ''}{params.foodCostReduction}%
                  </span>
                </div>
                <Slider 
                  id="foodCostReduction"
                  min={0} 
                  max={15} 
                  step={0.5}
                  value={[params.foodCostReduction]}
                  onValueChange={([value]) => handleParamChange('foodCostReduction', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Redução potencial nos custos de ingredientes
                </p>
              </div>
              
              {/* Variação no Custo de Mão de Obra */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="laborCostChange">Variação no Custo de Mão de Obra</Label>
                  <span className={`${params.laborCostChange < 0 ? 'text-green-600' : params.laborCostChange > 0 ? 'text-red-600' : ''} font-medium`}>
                    {params.laborCostChange > 0 ? '+' : ''}{params.laborCostChange}%
                  </span>
                </div>
                <Slider 
                  id="laborCostChange"
                  min={-10} 
                  max={15} 
                  step={0.5}
                  value={[params.laborCostChange]}
                  onValueChange={([value]) => handleParamChange('laborCostChange', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Variação esperada nos custos com funcionários
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Crescimento */}
        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estratégias de Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Investimento em Marketing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="marketingInvestment">Investimento em Marketing</Label>
                  <span className={`${params.marketingInvestment > 0 ? 'text-blue-600' : ''} font-medium`}>
                    {params.marketingInvestment > 0 ? '+' : ''}{params.marketingInvestment}%
                  </span>
                </div>
                <Slider 
                  id="marketingInvestment"
                  min={0} 
                  max={50} 
                  step={1}
                  value={[params.marketingInvestment]}
                  onValueChange={([value]) => handleParamChange('marketingInvestment', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Aumento percentual no investimento em marketing
                </p>
              </div>
              
              {/* Crescimento de Clientes */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="customerGrowth">Crescimento de Clientes</Label>
                  <span className={`${params.customerGrowth > 0 ? 'text-green-600' : params.customerGrowth < 0 ? 'text-red-600' : ''} font-medium`}>
                    {params.customerGrowth > 0 ? '+' : ''}{params.customerGrowth}%
                  </span>
                </div>
                <Slider 
                  id="customerGrowth"
                  min={-10} 
                  max={30} 
                  step={1}
                  value={[params.customerGrowth]}
                  onValueChange={([value]) => handleParamChange('customerGrowth', value)}
                />
                <p className="text-sm text-muted-foreground">
                  Variação esperada no número de clientes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Resumo e Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview da Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Faturamento</p>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-semibold">{formatCurrency(preview.revenue)}</p>
                <span className={`text-sm ${preview.revenue > currentRevenue ? 'text-green-600' : preview.revenue < currentRevenue ? 'text-red-600' : ''}`}>
                  {preview.revenue !== currentRevenue ? (
                    <>
                      {preview.revenue > currentRevenue ? '+' : ''}
                      {((preview.revenue - currentRevenue) / currentRevenue * 100).toFixed(1)}%
                    </>
                  ) : '—'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Lucro</p>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-semibold">{formatCurrency(preview.profit)}</p>
                <span className={`text-sm ${preview.profit > currentProfit ? 'text-green-600' : preview.profit < currentProfit ? 'text-red-600' : ''}`}>
                  {preview.profit !== currentProfit ? (
                    <>
                      {preview.profit > currentProfit ? '+' : ''}
                      {((preview.profit - currentProfit) / Math.abs(currentProfit) * 100).toFixed(1)}%
                    </>
                  ) : '—'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Margem</p>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-semibold">{preview.profitMargin.toFixed(1)}%</p>
                <span className={`text-sm ${preview.profitMargin > currentProfitMargin ? 'text-green-600' : preview.profitMargin < currentProfitMargin ? 'text-red-600' : ''}`}>
                  {preview.profitMargin !== currentProfitMargin ? (
                    <>
                      {preview.profitMargin > currentProfitMargin ? '+' : ''}
                      {(preview.profitMargin - currentProfitMargin).toFixed(1)}pp
                    </>
                  ) : '—'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-4 pt-4">
            <Button type="submit" className="w-full">Gerar Relatório Detalhado</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
