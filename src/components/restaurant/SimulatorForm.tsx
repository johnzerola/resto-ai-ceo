
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CircleHelp 
} from "lucide-react";

interface SimulationFormData {
  // Financial parameters
  monthlyRevenue: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  rentCost: number;
  utilitiesCost: number;
  marketingCostPercentage: number;
  otherCostsPercentage: number;
  
  // Scenario adjustments
  menuPriceAdjustment: number;
  foodCostReduction: number;
  laborCostChange: number;
  marketingInvestment: number;
  customerGrowth: number;
  averageTicketChange: number;
}

interface SimulatorFormProps {
  onSimulate: (data: any) => void;
}

export function SimulatorForm({ onSimulate }: SimulatorFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<SimulationFormData>({
    defaultValues: {
      // Financial parameters
      monthlyRevenue: 100000,
      foodCostPercentage: 30,
      laborCostPercentage: 25,
      rentCost: 10000,
      utilitiesCost: 5000,
      marketingCostPercentage: 5,
      otherCostsPercentage: 10,
      
      // Scenario adjustments
      menuPriceAdjustment: 0,
      foodCostReduction: 0,
      laborCostChange: 0,
      marketingInvestment: 0,
      customerGrowth: 0,
      averageTicketChange: 0
    }
  });
  
  const [activeTab, setActiveTab] = useState("parameters");
  
  // Watch all form values
  const formValues = watch();
  
  // Calculate current profitability
  const calculateCurrentProfitability = () => {
    const revenue = formValues.monthlyRevenue;
    const foodCost = revenue * (formValues.foodCostPercentage / 100);
    const laborCost = revenue * (formValues.laborCostPercentage / 100);
    const marketingCost = revenue * (formValues.marketingCostPercentage / 100);
    const otherCosts = revenue * (formValues.otherCostsPercentage / 100);
    const fixedCosts = formValues.rentCost + formValues.utilitiesCost;
    
    const totalCosts = foodCost + laborCost + marketingCost + otherCosts + fixedCosts;
    const profit = revenue - totalCosts;
    const profitMargin = (profit / revenue) * 100;
    
    return {
      revenue,
      foodCost,
      laborCost,
      rentCost: formValues.rentCost,
      utilitiesCost: formValues.utilitiesCost,
      marketingCost,
      otherCosts,
      totalCosts,
      profit,
      profitMargin
    };
  };
  
  const currentProfitability = calculateCurrentProfitability();
  
  // Handle form submission
  const onSubmit = (data: SimulationFormData) => {
    // Calculate current state
    const current = calculateCurrentProfitability();
    
    // Calculate projected state based on adjustments
    const projectedRevenue = current.revenue * (1 + data.menuPriceAdjustment / 100) * 
                            (1 + data.customerGrowth / 100) * 
                            (1 + data.averageTicketChange / 100);
    
    const projectedFoodCost = projectedRevenue * (data.foodCostPercentage / 100) * 
                              (1 - data.foodCostReduction / 100);
    
    const projectedLaborCost = current.laborCost * (1 + data.laborCostChange / 100);
    
    const projectedMarketingCost = current.marketingCost * (1 + data.marketingInvestment / 100);
    
    const projectedTotalCosts = projectedFoodCost + projectedLaborCost + 
                               data.rentCost + data.utilitiesCost + 
                               projectedMarketingCost + current.otherCosts;
    
    const projectedProfit = projectedRevenue - projectedTotalCosts;
    const projectedProfitMargin = (projectedProfit / projectedRevenue) * 100;
    
    // Prepare simulation result
    const simulationResult = {
      current,
      projected: {
        revenue: projectedRevenue,
        foodCost: projectedFoodCost,
        laborCost: projectedLaborCost,
        rentCost: data.rentCost,
        utilitiesCost: data.utilitiesCost,
        marketingCost: projectedMarketingCost,
        otherCosts: current.otherCosts,
        totalCosts: projectedTotalCosts,
        profit: projectedProfit,
        profitMargin: projectedProfitMargin
      },
      adjustments: {
        menuPriceAdjustment: data.menuPriceAdjustment,
        foodCostReduction: data.foodCostReduction,
        laborCostChange: data.laborCostChange,
        marketingInvestment: data.marketingInvestment,
        customerGrowth: data.customerGrowth,
        averageTicketChange: data.averageTicketChange
      },
      changes: {
        revenueChange: projectedRevenue - current.revenue,
        revenueChangePercent: ((projectedRevenue - current.revenue) / current.revenue) * 100,
        profitChange: projectedProfit - current.profit,
        profitChangePercent: ((projectedProfit - current.profit) / current.profit) * 100,
        marginChange: projectedProfitMargin - current.profitMargin
      }
    };
    
    onSimulate(simulationResult);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Helper function to clamp slider values
  const clampSliderValue = (value: number[], min: number, max: number) => {
    return Math.max(min, Math.min(max, value[0]));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parameters">Parâmetros Atuais</TabsTrigger>
          <TabsTrigger value="scenarios">Cenário Simulado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parameters" className="space-y-6">
          {/* Current Financial Health Card */}
          <Card>
            <CardHeader>
              <CardTitle>Saúde Financeira Atual</CardTitle>
              <CardDescription>
                Baseado nos parâmetros informados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 border-r pr-4 last:border-r-0">
                  <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                  <p className="text-xl font-semibold">{formatCurrency(currentProfitability.revenue)}</p>
                </div>
                <div className="space-y-2 border-r pr-4 last:border-r-0">
                  <p className="text-sm text-muted-foreground">Lucro Operacional</p>
                  <p className={`text-xl font-semibold ${currentProfitability.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(currentProfitability.profit)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                  <p className={`text-xl font-semibold ${currentProfitability.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {currentProfitability.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Revenue Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="monthlyRevenue">Faturamento Mensal (R$)</Label>
                    <span className="text-sm font-medium">
                      {formatCurrency(formValues.monthlyRevenue)}
                    </span>
                  </div>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    min="1000"
                    step="1000"
                    {...register("monthlyRevenue", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe o faturamento mensal médio do seu restaurante
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Costs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                Custos e Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Variable Costs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Custos Variáveis (% da receita)</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="foodCostPercentage">Custo de Alimentos e Bebidas (%)</Label>
                      <span className="text-sm font-medium">{formValues.foodCostPercentage}%</span>
                    </div>
                    <Input
                      id="foodCostPercentage"
                      type="number"
                      min="1"
                      max="100"
                      {...register("foodCostPercentage", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="laborCostPercentage">Custo de Mão de Obra (%)</Label>
                      <span className="text-sm font-medium">{formValues.laborCostPercentage}%</span>
                    </div>
                    <Input
                      id="laborCostPercentage"
                      type="number"
                      min="1"
                      max="100"
                      {...register("laborCostPercentage", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="marketingCostPercentage">Marketing e Propaganda (%)</Label>
                      <span className="text-sm font-medium">{formValues.marketingCostPercentage}%</span>
                    </div>
                    <Input
                      id="marketingCostPercentage"
                      type="number"
                      min="0"
                      max="100"
                      {...register("marketingCostPercentage", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="otherCostsPercentage">Outros Custos Variáveis (%)</Label>
                      <span className="text-sm font-medium">{formValues.otherCostsPercentage}%</span>
                    </div>
                    <Input
                      id="otherCostsPercentage"
                      type="number"
                      min="0"
                      max="100"
                      {...register("otherCostsPercentage", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                {/* Fixed Costs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Custos Fixos (R$)</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rentCost">Aluguel e Taxas (R$)</Label>
                      <span className="text-sm font-medium">{formatCurrency(formValues.rentCost)}</span>
                    </div>
                    <Input
                      id="rentCost"
                      type="number"
                      min="0"
                      step="100"
                      {...register("rentCost", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="utilitiesCost">Utilidades (Água, Luz, Gás) (R$)</Label>
                      <span className="text-sm font-medium">{formatCurrency(formValues.utilitiesCost)}</span>
                    </div>
                    <Input
                      id="utilitiesCost"
                      type="number"
                      min="0"
                      step="100"
                      {...register("utilitiesCost", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={() => setActiveTab("scenarios")}
              className="flex items-center"
            >
              Próximo: Simular Cenário
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-6">
          {/* Menu Price Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Ajuste de Preços
              </CardTitle>
              <CardDescription>
                Simule alterações nos preços do cardápio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="menuPriceAdjustment">Ajuste de Preços no Cardápio</Label>
                    <span className="text-sm font-medium">
                      {formValues.menuPriceAdjustment > 0 ? "+" : ""}{formValues.menuPriceAdjustment}%
                    </span>
                  </div>
                  <Slider
                    id="menuPriceAdjustment"
                    min={-20}
                    max={20}
                    step={1}
                    value={[formValues.menuPriceAdjustment]}
                    onValueChange={(value) => setValue("menuPriceAdjustment", clampSliderValue(value, -20, 20))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+20%</span>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <CircleHelp className="h-3 w-3 mr-1" />
                    {formValues.menuPriceAdjustment > 0 
                      ? `Um aumento de ${formValues.menuPriceAdjustment}% nos preços pode impactar o volume de clientes.`
                      : formValues.menuPriceAdjustment < 0
                      ? `Uma redução de ${Math.abs(formValues.menuPriceAdjustment)}% nos preços pode atrair mais clientes mas reduz margem.`
                      : "Sem alterações nos preços do cardápio."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="averageTicketChange">Variação do Ticket Médio</Label>
                    <span className="text-sm font-medium">
                      {formValues.averageTicketChange > 0 ? "+" : ""}{formValues.averageTicketChange}%
                    </span>
                  </div>
                  <Slider
                    id="averageTicketChange"
                    min={-20}
                    max={20}
                    step={1}
                    value={[formValues.averageTicketChange]}
                    onValueChange={(value) => setValue("averageTicketChange", clampSliderValue(value, -20, 20))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+20%</span>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <CircleHelp className="h-3 w-3 mr-1" />
                    Variação do valor médio gasto por cliente independente da alteração de preços.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cost Optimization Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Otimização de Custos
              </CardTitle>
              <CardDescription>
                Simule reduções e melhorias operacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="foodCostReduction">Redução no Custo de Alimentos</Label>
                    <span className="text-sm font-medium">
                      {formValues.foodCostReduction > 0 ? "-" : ""}{formValues.foodCostReduction}%
                    </span>
                  </div>
                  <Slider
                    id="foodCostReduction"
                    min={0}
                    max={15}
                    step={0.5}
                    value={[formValues.foodCostReduction]}
                    onValueChange={(value) => setValue("foodCostReduction", clampSliderValue(value, 0, 15))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>7.5%</span>
                    <span>15%</span>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <CircleHelp className="h-3 w-3 mr-1" />
                    Reduções através de renegociação com fornecedores, controle de desperdício ou substituição de insumos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="laborCostChange">Variação no Custo de Mão de Obra</Label>
                    <span className="text-sm font-medium">
                      {formValues.laborCostChange > 0 ? "+" : ""}{formValues.laborCostChange}%
                    </span>
                  </div>
                  <Slider
                    id="laborCostChange"
                    min={-15}
                    max={15}
                    step={0.5}
                    value={[formValues.laborCostChange]}
                    onValueChange={(value) => setValue("laborCostChange", clampSliderValue(value, -15, 15))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-15%</span>
                    <span>0%</span>
                    <span>+15%</span>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <CircleHelp className="h-3 w-3 mr-1" />
                    {formValues.laborCostChange > 0 
                      ? `Um aumento de ${formValues.laborCostChange}% na folha pode melhorar qualidade do atendimento.`
                      : formValues.laborCostChange < 0
                      ? `Uma redução de ${Math.abs(formValues.laborCostChange)}% na folha pode reduzir a qualidade do serviço.`
                      : "Sem alterações no custo de mão de obra."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Growth Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Crescimento de Clientes
              </CardTitle>
              <CardDescription>
                Simule alterações no fluxo de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="marketingInvestment">Investimento em Marketing</Label>
                    <span className="text-sm font-medium">
                      {formValues.marketingInvestment > 0 ? "+" : ""}{formValues.marketingInvestment}%
                    </span>
                  </div>
                  <Slider
                    id="marketingInvestment"
                    min={-20}
                    max={50}
                    step={1}
                    value={[formValues.marketingInvestment]}
                    onValueChange={(value) => setValue("marketingInvestment", clampSliderValue(value, -20, 50))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="customerGrowth">Crescimento no Número de Clientes</Label>
                    <span className="text-sm font-medium">
                      {formValues.customerGrowth > 0 ? "+" : ""}{formValues.customerGrowth}%
                    </span>
                  </div>
                  <Slider
                    id="customerGrowth"
                    min={-20}
                    max={30}
                    step={1}
                    value={[formValues.customerGrowth]}
                    onValueChange={(value) => setValue("customerGrowth", clampSliderValue(value, -20, 30))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+30%</span>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center">
                    <CircleHelp className="h-3 w-3 mr-1" />
                    Estimativa de crescimento baseada nas alterações de preço e marketing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setActiveTab("parameters")}
            >
              Voltar aos Parâmetros
            </Button>
            <Button type="submit">
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Simulação
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
