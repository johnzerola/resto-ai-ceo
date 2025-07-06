
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, Info, DollarSign, TrendingUp, Target, User, FileText, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

// Esquema de validação expandido para o formulário de onboarding
const onboardingSchema = z.object({
  restaurantName: z.string().min(3, "Nome do restaurante deve ter pelo menos 3 caracteres"),
  ownerName: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres"),
  businessType: z.string().min(1, "Selecione o tipo de negócio"),
  cnpj: z.string().optional(),
  averageMonthlyRevenue: z.number().min(1000, "Faturamento deve ser pelo menos R$ 1.000").default(30000),
  averageTicket: z.number().min(10, "Ticket médio deve ser pelo menos R$ 10").default(35),
  desiredProfitMargin: z.number().min(5).max(80, "Margem deve estar entre 5% e 80%").default(30),
  fixedMonthlyCosts: z.number().min(0, "Valor deve ser positivo").default(8000),
  variableMonthlyCosts: z.number().min(0).max(50, "Valor deve estar entre 0% e 50%").default(15),
  weeklyOperatingDays: z.number().min(1).max(7).default(6),
  dailyOperatingHours: z.string().default("08:00-18:00"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const { createRestaurant, user, currentRestaurant } = useAuth();
  const { saveProfile, generateMotivationalInsights } = useBusinessProfile();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      restaurantName: "",
      ownerName: "",
      businessType: "",
      cnpj: "",
      averageMonthlyRevenue: 30000,
      averageTicket: 35,
      desiredProfitMargin: 30,
      fixedMonthlyCosts: 8000,
      variableMonthlyCosts: 15,
      weeklyOperatingDays: 6,
      dailyOperatingHours: "08:00-18:00",
    },
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um restaurante");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Criar restaurante com dados completos
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: values.restaurantName,
            owner_id: user.id,
            owner_name: values.ownerName,
            business_type: values.businessType,
            cnpj: values.cnpj || null,
            target_food_cost: 30,
            target_beverage_cost: 25,
            average_monthly_sales: values.averageMonthlyRevenue,
            desired_profit_margin: values.desiredProfitMargin,
          }
        ])
        .select()
        .single();

      if (restaurantError) {
        throw restaurantError;
      }

      // Salvar perfil empresarial detalhado
      const profileSuccess = await saveProfile({
        restaurant_id: restaurantData.id,
        owner_name: values.ownerName,
        cnpj: values.cnpj,
        average_monthly_revenue: values.averageMonthlyRevenue,
        average_ticket: values.averageTicket,
        desired_profit_margin: values.desiredProfitMargin,
        fixed_monthly_costs: values.fixedMonthlyCosts,
        variable_monthly_costs: values.variableMonthlyCosts,
        weekly_operating_days: values.weeklyOperatingDays,
        daily_operating_hours: values.dailyOperatingHours,
      });

      // Criar configurações iniciais do restaurante
      if (restaurantData) {
        await supabase
          .from('configuracoes_restaurante')
          .insert([
            {
              restaurant_id: restaurantData.id,
              receita_mensal_esperada: values.averageMonthlyRevenue,
              markup_padrao: 250,
              margem_lucro_esperada: values.desiredProfitMargin,
              custo_medio_por_prato: values.averageTicket * 0.3, // Estimar custo baseado no ticket
              meta_vendas_diaria: values.averageMonthlyRevenue / 30,
              ticket_medio_esperado: values.averageTicket,
              pratos_vendidos_dia_meta: Math.ceil((values.averageMonthlyRevenue / 30) / values.averageTicket),
            }
          ]);
      }

      // Gerar insights motivacionais
      const generatedInsights = generateMotivationalInsights({
        average_monthly_revenue: values.averageMonthlyRevenue,
        break_even_point: values.fixedMonthlyCosts + (values.averageMonthlyRevenue * values.variableMonthlyCosts / 100),
        ideal_cmv_percentage: 30,
        monthly_sales_target: (values.fixedMonthlyCosts + (values.averageMonthlyRevenue * values.variableMonthlyCosts / 100)) / (1 - values.desiredProfitMargin / 100),
        ideal_net_margin: values.desiredProfitMargin * 0.7,
        weekly_operating_days: values.weeklyOperatingDays,
        average_ticket: values.averageTicket
      });

      setInsights(generatedInsights);
      setShowInsights(true);

      // Atualizar contexto usando a função existente
      await createRestaurant(values.restaurantName);
      
    } catch (error) {
      console.error("Erro ao configurar restaurante:", error);
      toast.error("Erro ao configurar restaurante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToDashboard = () => {
    toast.success("Bem-vindo ao LucrAÍ! Vamos começar a gerenciar seu restaurante!");
    navigate("/dashboard");
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nome do Responsável
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: João Silva"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CNPJ (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0001-00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="averageMonthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Faturamento Mensal Estimado (R$)
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

                  <FormField
                    control={form.control}
                    name="averageTicket"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Ticket Médio Aproximado (R$)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              min="10"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Valor médio por cliente/pedido
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="desiredProfitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Margem de Lucro Desejada (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="5"
                            max="80"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Entre 5% e 80% - recomendado: 20-40%
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fixedMonthlyCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Gastos Fixos Mensais (R$)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Aluguel, salários, contas fixas, etc.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="variableMonthlyCosts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Gastos Variáveis (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          % sobre vendas (impostos, comissões, taxas)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weeklyOperatingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Dias de Funcionamento/Semana
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione os dias" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 dias (Segunda a Sexta)</SelectItem>
                            <SelectItem value="6">6 dias (Segunda a Sábado)</SelectItem>
                            <SelectItem value="7">7 dias (Todos os dias)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyOperatingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horário de Funcionamento
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="06:00-14:00">06:00 - 14:00 (Café da manhã)</SelectItem>
                            <SelectItem value="08:00-18:00">08:00 - 18:00 (Comercial)</SelectItem>
                            <SelectItem value="11:00-15:00,18:00-23:00">11:00-15:00 e 18:00-23:00 (Almoço/Jantar)</SelectItem>
                            <SelectItem value="18:00-02:00">18:00 - 02:00 (Noturno)</SelectItem>
                            <SelectItem value="24hrs">24 horas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                {showInsights && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        🎉 Parabéns! Seu negócio está configurado!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl">{insight.split(' ')[0]}</div>
                          <p className="text-sm text-gray-700 flex-1">
                            {insight.substring(insight.indexOf(' ') + 1)}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-center pt-4">
                        <Button onClick={handleContinueToDashboard} size="lg" className="px-8">
                          🚀 Começar a Gerenciar meu Restaurante!
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {!showInsights && (
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Configurando..." : "🎯 Finalizar Configuração"}
                  </Button>
                )}
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
