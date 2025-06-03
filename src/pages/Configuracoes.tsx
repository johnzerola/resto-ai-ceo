
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
import { ModernLayout } from "@/components/restaurant/ModernLayout";

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
  
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedDarkMode);
    applyTheme(storedDarkMode);
    
    const loadRestaurantData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        const storedData = localStorage.getItem("restaurantData");
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const newConfigData = {
            businessName: parsedData.businessName || "Meu Restaurante",
            targetFoodCost: parsedData.targetFoodCost || 30,
            targetBeverageCost: parsedData.targetBeverageCost || 25,
            averageMonthlyRevenue: parsedData.averageMonthlyRevenue || 0
          };
          setConfigData(newConfigData);
          form.reset(newConfigData);
        } else {
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

  const applyTheme = (isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.setProperty('--background', '222.2 84% 4.9%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222.2 84% 4.9%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222.2 84% 4.9%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--primary', '210 100% 50%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '217.2 32.6% 17.5%');
      root.style.setProperty('--secondary-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '217.2 32.6% 17.5%');
      root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      root.style.setProperty('--accent', '217.2 32.6% 17.5%');
      root.style.setProperty('--accent-foreground', '210 40% 98%');
      root.style.setProperty('--destructive', '0 62.8% 30.6%');
      root.style.setProperty('--destructive-foreground', '210 40% 98%');
      root.style.setProperty('--border', '217.2 32.6% 17.5%');
      root.style.setProperty('--input', '217.2 32.6% 17.5%');
      root.style.setProperty('--ring', '212.7 26.8% 83.9%');
    } else {
      root.classList.remove("dark");
      root.style.setProperty('--background', '210 40% 98%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '222.2 47.4% 11.2%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--primary', '210 100% 50%');
      root.style.setProperty('--primary-foreground', '210 40% 98%');
      root.style.setProperty('--secondary', '210 40% 96.1%');
      root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
      root.style.setProperty('--muted', '210 40% 96.1%');
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
      root.style.setProperty('--accent', '210 40% 96.1%');
      root.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '210 40% 98%');
      root.style.setProperty('--border', '214.3 31.8% 91.4%');
      root.style.setProperty('--input', '214.3 31.8% 91.4%');
      root.style.setProperty('--ring', '210 100% 50%');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    applyTheme(newDarkMode);
    
    toast({
      title: "Tema alterado",
      description: `Modo ${newDarkMode ? 'escuro' : 'claro'} ativado com sucesso.`,
    });
  };

  const saveAndSync = async () => {
    setIsLoading(true);
    toast({
      title: "Salvando e sincronizando...",
      description: "Aguarde enquanto os dados são processados.",
    });

    try {
      const formData = form.getValues();
      
      localStorage.setItem("restaurantData", JSON.stringify({
        ...formData,
        lastUpdate: new Date().toISOString(),
        isNewUser: false
      }));
      
      window.dispatchEvent(new Event('configUpdated'));
      syncFinancialWithConfig();
      await startSync("configuracoes");

      toast({
        title: "Sucesso",
        description: "Configurações salvas e dados sincronizados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar e sincronizar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = (data: ConfigForm) => {
    saveAndSync();
  };

  return (
    <ModernLayout>
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
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Salvando e Sincronizando..." : "Salvar e Sincronizar"}
                  </Button>
                </div>
              </form>
            </Form>
            
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
};

export default Configuracoes;
