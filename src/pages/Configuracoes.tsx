
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
    toast({
      title: "Configurações salvas",
      description: "As configurações do seu restaurante foram atualizadas com sucesso.",
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variableExpenses">Despesas variáveis (%)</Label>
                <Input
                  id="variableExpenses"
                  type="number"
                  value={restaurantData.variableExpenses}
                  onChange={(e) => handleChange("variableExpenses", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desiredProfitMargin">Margem de lucro desejada (%)</Label>
                <Input
                  id="desiredProfitMargin"
                  type="number"
                  value={restaurantData.desiredProfitMargin}
                  onChange={(e) => handleChange("desiredProfitMargin", e.target.value)}
                />
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
