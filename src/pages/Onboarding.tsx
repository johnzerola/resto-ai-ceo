
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, Info, DollarSign, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Esquema de validação para o formulário de onboarding
const onboardingSchema = z.object({
  restaurantName: z.string().min(3, "Nome do restaurante deve ter pelo menos 3 caracteres"),
  businessType: z.string().min(1, "Selecione o tipo de negócio"),
  targetFoodCost: z.number().min(10).max(50).default(30),
  targetBeverageCost: z.number().min(10).max(50).default(25),
  averageMonthlySales: z.number().min(1000).default(30000),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRestaurant, user, currentRestaurant } = useAuth();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      restaurantName: "",
      businessType: "",
      targetFoodCost: 30,
      targetBeverageCost: 25,
      averageMonthlySales: 30000,
    },
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um restaurante");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Criar restaurante com dados básicos
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: values.restaurantName,
            owner_id: user.id,
            business_type: values.businessType,
            target_food_cost: values.targetFoodCost,
            target_beverage_cost: values.targetBeverageCost,
            average_monthly_sales: values.averageMonthlySales,
            desired_profit_margin: 30, // Valor padrão
          }
        ])
        .select()
        .single();

      if (restaurantError) {
        throw restaurantError;
      }

      // Criar configurações iniciais do restaurante
      if (restaurantData) {
        await supabase
          .from('configuracoes_restaurante')
          .insert([
            {
              restaurant_id: restaurantData.id,
              receita_mensal_esperada: values.averageMonthlySales,
              markup_padrao: 250,
              margem_lucro_esperada: 30,
              custo_medio_por_prato: 12,
              meta_vendas_diaria: values.averageMonthlySales / 30,
              ticket_medio_esperado: 35,
              pratos_vendidos_dia_meta: Math.ceil((values.averageMonthlySales / 30) / 35),
            }
          ]);
      }

      // Atualizar contexto usando a função existente
      await createRestaurant(values.restaurantName);
      
      toast.success("Restaurante configurado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao configurar restaurante:", error);
      toast.error("Erro ao configurar restaurante");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se já tem restaurante, redirecionar
  if (currentRestaurant) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resto<span className="text-primary">AI</span> CEO</h1>
          <p className="text-gray-600 mt-2">Vamos configurar seu restaurante</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Bem-vindo, {userName}!
            </CardTitle>
            <CardDescription>
              Configure as informações básicas do seu restaurante para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome do Restaurante</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Store className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Ex: Cantina Italiana da Nonna"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tipo de Negócio</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de estabelecimento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Restaurante">Restaurante</SelectItem>
                            <SelectItem value="Pizzaria">Pizzaria</SelectItem>
                            <SelectItem value="Hamburgueria">Hamburgueria</SelectItem>
                            <SelectItem value="Food Truck">Food Truck</SelectItem>
                            <SelectItem value="Padaria">Padaria</SelectItem>
                            <SelectItem value="Lanchonete">Lanchonete</SelectItem>
                            <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                            <SelectItem value="Bar">Bar</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetFoodCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          CMV Alvo - Alimentos (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="10"
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Recomendado: 28-35%
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetBeverageCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          CMV Alvo - Bebidas (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="10"
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Recomendado: 20-30%
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="averageMonthlySales"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Receita Média Mensal (R$)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              min="1000"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Estimativa do faturamento mensal atual ou desejado
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Para uma análise mais precisa e configurações avançadas, 
                    acesse <strong>Configurações → Aba Empresarial</strong> após finalizar este processo. 
                    Lá você poderá definir despesas fixas, variáveis, markup personalizado e outras configurações importantes.
                  </AlertDescription>
                </Alert>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Configurando..." : "Configurar Restaurante"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Você poderá ajustar todas essas configurações e adicionar mais detalhes depois.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
