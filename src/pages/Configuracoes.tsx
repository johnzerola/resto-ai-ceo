
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Configuracoes = () => {
  const { toast } = useToast();
  const [restaurantData, setRestaurantData] = useState({
    businessName: "",
    businessType: "",
    averageMonthlySales: "",
    fixedExpenses: "",
    variableExpenses: "",
    desiredProfitMargin: ""
  });
  
  useEffect(() => {
    // Carregar dados do restaurante do localStorage
    const savedData = localStorage.getItem("restaurantData");
    if (savedData) {
      setRestaurantData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
    
    // Calcular e mostrar um resumo dos dados financeiros
    const fixedExpenses = parseFloat(restaurantData.fixedExpenses) || 0;
    const avgSales = parseFloat(restaurantData.averageMonthlySales) || 0;
    const variablePercentage = parseFloat(restaurantData.variableExpenses) || 0;
    const desiredMargin = parseFloat(restaurantData.desiredProfitMargin) || 0;
    
    // Mensagem personalizada sobre o impacto nos preços
    let impactMessage = "";
    if (fixedExpenses > 0 && avgSales > 0) {
      const fixedCostPerPlate = fixedExpenses / (avgSales / 50); // Estimando ticket médio de R$50
      impactMessage = `Com esses dados, cada prato inclui aproximadamente R$${fixedCostPerPlate.toFixed(2)} de custos fixos.`;
    }
    
    toast({
      title: "Configurações salvas",
      description: `As configurações do seu restaurante foram atualizadas com sucesso. ${impactMessage}`,
      variant: "success"
    });
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie os dados e preferências do seu restaurante
        </p>
      </div>

      <Tabs defaultValue="negocio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="negocio">Dados do Negócio</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
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
              
              <div className="bg-muted p-4 rounded-lg mt-4">
                <h3 className="text-sm font-medium mb-2">Como esses dados são usados:</h3>
                <p className="text-sm text-muted-foreground">
                  Estes valores são utilizados no cálculo automático de preços sugeridos nas suas fichas técnicas.
                  A fórmula considera o custo dos ingredientes, adiciona uma parte proporcional das despesas fixas 
                  mensais, calcula o impacto das despesas variáveis e aplica sua margem de lucro desejada.
                </p>
              </div>
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

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </Layout>
  );
};

export default Configuracoes;
