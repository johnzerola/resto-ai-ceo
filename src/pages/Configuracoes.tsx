
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFinancialData, dispatchFinancialDataEvent } from "@/services/FinancialDataService";
import { Info, Check } from "lucide-react";
import { SyncIndicator } from "@/components/restaurant/SyncIndicator";
import { startSync } from "@/services/SyncService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Configuracoes = () => {
  const { toast } = useToast();
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    businessName: "",
    businessType: "",
    averageMonthlySales: "",
    fixedExpenses: "",
    variableExpenses: "",
    desiredProfitMargin: "",
    targetFoodCost: "", // Novo campo para custo alvo de alimentos
    targetBeverageCost: "", // Novo campo para custo alvo de bebidas
    laborCostPercentage: "", // Novo campo para percentual de custo de mão de obra
    occupancyCostPercentage: "", // Novo campo para percentual de custo de ocupação
    averageTicket: "", // Novo campo para ticket médio
    averageOccupancy: "", // Novo campo para ocupação média
    tableCount: "", // Novo campo para número de mesas
    seatsPerTable: "", // Novo campo para assentos por mesa
  });
  
  useEffect(() => {
    // Carregar dados do restaurante do localStorage
    const savedData = localStorage.getItem("restaurantData");
    if (savedData) {
      setRestaurantData({...JSON.parse(savedData), 
        targetFoodCost: JSON.parse(savedData).targetFoodCost || "28", 
        targetBeverageCost: JSON.parse(savedData).targetBeverageCost || "20",
        laborCostPercentage: JSON.parse(savedData).laborCostPercentage || "25",
        occupancyCostPercentage: JSON.parse(savedData).occupancyCostPercentage || "10",
        averageTicket: JSON.parse(savedData).averageTicket || "",
        averageOccupancy: JSON.parse(savedData).averageOccupancy || "",
        tableCount: JSON.parse(savedData).tableCount || "",
        seatsPerTable: JSON.parse(savedData).seatsPerTable || "",
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }));
    // Resetar o status de sincronização quando houver alterações
    setSyncSuccess(false);
  };

  const handleSave = () => {
    localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
    
    // Iniciar sincronização com outros módulos
    startSync("configuracoes", ["dre", "cmv", "inventory"]);
    
    // Disparar evento de atualização financeira
    dispatchFinancialDataEvent();
    
    // Mostrar feedback visual de sincronização
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
    
    // Calcular e mostrar um resumo dos dados financeiros
    const fixedExpenses = parseFloat(restaurantData.fixedExpenses) || 0;
    const avgSales = parseFloat(restaurantData.averageMonthlySales) || 0;
    const variablePercentage = parseFloat(restaurantData.variableExpenses) || 0;
    const desiredMargin = parseFloat(restaurantData.desiredProfitMargin) || 0;
    
    // Calcular métricas de negócios para mostrar no toast
    let businessMetrics = "";
    
    if (fixedExpenses > 0 && avgSales > 0) {
      // Calcular custo fixo por venda
      const fixedCostPerSale = fixedExpenses / avgSales * 100;
      businessMetrics += `Custos fixos representam ${fixedCostPerSale.toFixed(1)}% das vendas. `;
      
      // Calcular ponto de equilíbrio
      const breakEven = fixedExpenses / (1 - (variablePercentage / 100));
      businessMetrics += `Ponto de equilíbrio: R$${breakEven.toFixed(2)}. `;
      
      // Calcular margem de contribuição
      const contributionMargin = 100 - variablePercentage;
      businessMetrics += `Margem de contribuição: ${contributionMargin.toFixed(1)}%.`;
    }
    
    toast({
      title: "Configurações salvas",
      description: `As configurações do seu restaurante foram atualizadas e sincronizadas com todos os módulos. ${businessMetrics}`,
      variant: "success"
    });
  };

  const calculateBusinessMetrics = () => {
    if (!restaurantData.averageMonthlySales || !restaurantData.fixedExpenses) {
      return null;
    }
    
    const avgSales = parseFloat(restaurantData.averageMonthlySales);
    const fixedCosts = parseFloat(restaurantData.fixedExpenses);
    const varCosts = parseFloat(restaurantData.variableExpenses) || 0;
    
    // Calcular ponto de equilíbrio
    const breakEven = fixedCosts / (1 - (varCosts / 100));
    
    // Calcular saúde financeira
    let financialHealth = "Em equilíbrio";
    if (avgSales > breakEven * 1.2) {
      financialHealth = "Saudável";
    } else if (avgSales < breakEven) {
      financialHealth = "Em risco";
    }
    
    return {
      breakEven,
      financialHealth,
      salesToBreakEven: breakEven - avgSales > 0 ? breakEven - avgSales : 0,
      salesAboveBreakEven: avgSales - breakEven > 0 ? avgSales - breakEven : 0
    };
  };

  const businessMetrics = calculateBusinessMetrics();
  const businessTypes = [
    "Restaurante Casual",
    "Restaurante Fino",
    "Fast Food",
    "Pizzaria",
    "Cafeteria",
    "Bar",
    "Padaria",
    "Outro"
  ];

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Gerencie os dados e preferências do seu restaurante
            <SyncIndicator />
          </p>
        </div>
      </div>

      <Tabs defaultValue="negocio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="negocio">Dados do Negócio</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
        </TabsList>
        
        <TabsContent value="negocio">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nome do negócio</Label>
                <Input
                  id="businessName"
                  value={restaurantData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de negócio</Label>
                <Select 
                  value={restaurantData.businessType}
                  onValueChange={(value) => handleChange("businessType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="averageMonthlySales">Média de vendas mensais (R$)</Label>
                <Input
                  id="averageMonthlySales"
                  type="number"
                  value={restaurantData.averageMonthlySales}
                  onChange={(e) => handleChange("averageMonthlySales", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Este valor é usado para calcular o impacto dos custos fixos em cada prato.
                </p>
              </div>

              {businessMetrics && (
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="text-sm font-medium mb-2">Métricas do Negócio:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Ponto de Equilíbrio:</span> R${businessMetrics.breakEven.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <div>
                      <span className="font-medium">Saúde Financeira:</span> {" "}
                      <span className={`font-medium ${
                        businessMetrics.financialHealth === "Saudável" ? "text-green-600" : 
                        businessMetrics.financialHealth === "Em risco" ? "text-red-600" : 
                        "text-amber-600"
                      }`}>{businessMetrics.financialHealth}</span>
                    </div>
                    {businessMetrics.salesToBreakEven > 0 && (
                      <div>
                        <span className="font-medium">Faltam:</span> R${businessMetrics.salesToBreakEven.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} para atingir o equilíbrio
                      </div>
                    )}
                    {businessMetrics.salesAboveBreakEven > 0 && (
                      <div>
                        <span className="font-medium">Excedente:</span> R${businessMetrics.salesAboveBreakEven.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} acima do ponto de equilíbrio
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Dados Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fixedExpenses">Despesas fixas mensais (R$)</Label>
                <Input
                  id="fixedExpenses"
                  type="number"
                  value={restaurantData.fixedExpenses}
                  onChange={(e) => handleChange("fixedExpenses", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Inclua aluguel, salários, contas fixas e outros custos mensais fixos.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variableExpenses">Despesas variáveis (%)</Label>
                <Input
                  id="variableExpenses"
                  type="number"
                  value={restaurantData.variableExpenses}
                  onChange={(e) => handleChange("variableExpenses", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Percentual sobre o valor de venda (impostos, comissões, taxas de cartão, etc).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desiredProfitMargin">Margem de lucro desejada (%)</Label>
                <Input
                  id="desiredProfitMargin"
                  type="number"
                  value={restaurantData.desiredProfitMargin}
                  onChange={(e) => handleChange("desiredProfitMargin", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Percentual de lucro desejado após cobrir todos os custos (fixos e variáveis).
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="targetFoodCost">CMV Alvo - Alimentos (%)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info className="h-4 w-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">Percentual alvo de custo de alimentos em relação ao preço de venda</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="targetFoodCost"
                    type="number"
                    value={restaurantData.targetFoodCost}
                    onChange={(e) => handleChange("targetFoodCost", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="targetBeverageCost">CMV Alvo - Bebidas (%)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info className="h-4 w-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">Percentual alvo de custo de bebidas em relação ao preço de venda</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="targetBeverageCost"
                    type="number"
                    value={restaurantData.targetBeverageCost}
                    onChange={(e) => handleChange("targetBeverageCost", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="laborCostPercentage">Custo de Mão de Obra (%)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info className="h-4 w-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">Percentual de custo com mão de obra em relação à receita</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="laborCostPercentage"
                    type="number"
                    value={restaurantData.laborCostPercentage}
                    onChange={(e) => handleChange("laborCostPercentage", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="occupancyCostPercentage">Custo de Ocupação (%)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info className="h-4 w-4 text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">Percentual de custo com aluguel e ocupação em relação à receita</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="occupancyCostPercentage"
                    type="number"
                    value={restaurantData.occupancyCostPercentage}
                    onChange={(e) => handleChange("occupancyCostPercentage", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg mt-4">
                <h3 className="text-sm font-medium mb-2">Como esses dados são usados:</h3>
                <p className="text-sm text-muted-foreground">
                  Estes valores são utilizados no cálculo automático de preços sugeridos nas suas fichas técnicas
                  e para análises financeiras em todo o sistema. Manter estes valores atualizados garante
                  análises mais precisas e precificação adequada para seu negócio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operacional">
          <Card>
            <CardHeader>
              <CardTitle>Dados Operacionais</CardTitle>
              <CardDescription>
                Métricas operacionais do seu restaurante para análises mais precisas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageTicket">Ticket Médio (R$)</Label>
                  <Input
                    id="averageTicket"
                    type="number"
                    value={restaurantData.averageTicket}
                    onChange={(e) => handleChange("averageTicket", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor médio gasto por cliente
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="averageOccupancy">Ocupação Média (%)</Label>
                  <Input
                    id="averageOccupancy"
                    type="number"
                    value={restaurantData.averageOccupancy}
                    onChange={(e) => handleChange("averageOccupancy", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentual médio de ocupação do estabelecimento
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tableCount">Número de Mesas</Label>
                  <Input
                    id="tableCount"
                    type="number"
                    value={restaurantData.tableCount}
                    onChange={(e) => handleChange("tableCount", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seatsPerTable">Média de Lugares por Mesa</Label>
                  <Input
                    id="seatsPerTable"
                    type="number"
                    value={restaurantData.seatsPerTable}
                    onChange={(e) => handleChange("seatsPerTable", e.target.value)}
                  />
                </div>
              </div>
              
              {restaurantData.tableCount && restaurantData.seatsPerTable && (
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="text-sm font-medium mb-2">Capacidade do Restaurante:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Capacidade Total:</span> {" "}
                      {parseInt(restaurantData.tableCount) * parseInt(restaurantData.seatsPerTable)} lugares
                    </div>
                    {restaurantData.averageOccupancy && (
                      <div>
                        <span className="font-medium">Ocupação Média:</span> {" "}
                        {Math.round(parseInt(restaurantData.tableCount) * parseInt(restaurantData.seatsPerTable) * parseInt(restaurantData.averageOccupancy) / 100)} lugares
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integracao">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure integrações com outros sistemas e serviços
              </p>
              <div className="space-y-2">
                {/* Futuras integrações seriam adicionadas aqui */}
                <p>Nenhuma integração disponível no momento.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {syncSuccess && (
            <span className="flex items-center text-green-600">
              <Check className="h-4 w-4 mr-1" />
              Dados sincronizados com todos os módulos
            </span>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          className="flex items-center"
        >
          Salvar e Sincronizar
        </Button>
      </div>
    </Layout>
  );
};

export default Configuracoes;
