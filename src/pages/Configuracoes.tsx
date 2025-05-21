
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { startSync } from "@/services/SyncService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { syncFinancialWithConfig } from "@/services/FinancialStorageService";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

interface ConfigForm {
  businessName: string;
  targetFoodCost: number;
  targetBeverageCost: number;
  averageMonthlyRevenue: number;
}

const Configuracoes = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [configData, setConfigData] = useState<ConfigForm>({
    businessName: "Meu Restaurante",
    targetFoodCost: 30,
    targetBeverageCost: 25,
    averageMonthlyRevenue: 0
  });
  
  const form = useForm<ConfigForm>({
    defaultValues: configData,
  });
  
  // Carregar configurações salvas
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Carregar configurações do restaurante
    const loadRestaurantData = async () => {
      // Verificar se é um novo usuário
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        // Tentar carregar do localStorage primeiro
        const storedData = localStorage.getItem("restaurantData");
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setConfigData({
            businessName: parsedData.businessName || "Meu Restaurante",
            targetFoodCost: parsedData.targetFoodCost || 30,
            targetBeverageCost: parsedData.targetBeverageCost || 25,
            averageMonthlyRevenue: parsedData.averageMonthlyRevenue || 0
          });
          form.reset({
            businessName: parsedData.businessName || "Meu Restaurante",
            targetFoodCost: parsedData.targetFoodCost || 30,
            targetBeverageCost: parsedData.targetBeverageCost || 25,
            averageMonthlyRevenue: parsedData.averageMonthlyRevenue || 0
          });
        } else {
          // Se não houver dados no localStorage, iniciar com valores padrão
          const defaultData = {
            businessName: "Meu Restaurante",
            targetFoodCost: 30,
            targetBeverageCost: 25,
            averageMonthlyRevenue: 0,
            isNewUser: true
          };
          localStorage.setItem("restaurantData", JSON.stringify(defaultData));
          setConfigData(defaultData);
          form.reset(defaultData);
        }
      }
    };
    
    loadRestaurantData();
  }, [form]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    toast({
      title: "Sincronizando dados...",
      description: "Aguarde enquanto os dados são sincronizados.",
    });

    try {
      // Salvar as configurações atuais
      saveConfig(form.getValues());
      
      // Sincronizar dados financeiros com as configurações
      syncFinancialWithConfig();
      
      // Iniciar sincronização geral
      await startSync("configuracoes");

      toast({
        title: "Sincronização concluída",
        description: "Os dados foram sincronizados com sucesso.",
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro ao sincronizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveConfig = (data: ConfigForm) => {
    try {
      // Salvar no localStorage
      localStorage.setItem("restaurantData", JSON.stringify({
        ...data,
        lastUpdate: new Date().toISOString(),
        isNewUser: false
      }));
      
      // Notificar outros componentes
      window.dispatchEvent(new Event('configUpdated'));
      
      syncFinancialWithConfig();
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  };
  
  const onSubmit = (data: ConfigForm) => {
    saveConfig(data);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Gerencie as configurações do seu restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Label htmlFor="dark-mode">Usar modo escuro</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do negócio</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do seu restaurante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetFoodCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMV Alvo - Alimentos (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Percentual ideal do custo de alimentos sobre as vendas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetBeverageCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMV Alvo - Bebidas (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Percentual ideal do custo de bebidas sobre as vendas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="averageMonthlyRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receita Mensal Média (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Usado para calcular projeções financeiras.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" variant="secondary">Salvar Configurações</Button>
                <Button 
                  onClick={handleSync} 
                  disabled={isLoading}
                >
                  {isLoading ? "Sincronizando..." : "Sincronizar Dados"}
                </Button>
              </div>
            </form>
          </Form>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
