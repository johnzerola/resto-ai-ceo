
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Building2, DollarSign, Target, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateRestaurantConfig } from "@/services/EnhancedValidationService";
import { RestaurantConfigSchema } from "@/services/EnhancedValidationService";
import { z } from "zod";

type OnboardingFormValues = z.infer<typeof RestaurantConfigSchema>;

export function EnhancedOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { user, createRestaurant } = useAuth();
  const navigate = useNavigate();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(RestaurantConfigSchema),
    defaultValues: {
      name: "",
      business_type: "",
      target_food_cost: 30,
      target_beverage_cost: 25,
      average_monthly_sales: 30000,
      fixed_expenses: 0,
      variable_expenses: 0,
      desired_profit_margin: 30,
    },
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const businessTypes = [
    "Restaurante",
    "Pizzaria", 
    "Hamburgueria",
    "Food Truck",
    "Padaria",
    "Lanchonete",
    "Cafeteria",
    "Bar",
    "Outro"
  ];

  const handleNext = async () => {
    const currentStepFields = getFieldsForStep(step);
    const isValid = await form.trigger(currentStepFields);
    
    if (!isValid) {
      toast.error("Por favor, corrija os erros antes de continuar");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getFieldsForStep = (stepNumber: number): (keyof OnboardingFormValues)[] => {
    switch (stepNumber) {
      case 1:
        return ['name', 'business_type'];
      case 2:
        return ['target_food_cost', 'target_beverage_cost'];
      case 3:
        return ['average_monthly_sales'];
      case 4:
        return ['fixed_expenses', 'variable_expenses', 'desired_profit_margin'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um restaurante");
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      const formData = form.getValues();
      
      // Validação adicional com sanitização
      const validation = validateRestaurantConfig(formData);
      
      if (!validation.success) {
        setValidationErrors(validation.errors);
        toast.error("Dados inválidos detectados");
        return;
      }

      // Criar restaurante no Supabase
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          ...validation.data,
          owner_id: user.id,
        }])
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // Criar configurações avançadas
      if (restaurantData) {
        await supabase
          .from('configuracoes_restaurante')
          .insert([{
            restaurant_id: restaurantData.id,
            receita_mensal_esperada: validation.data.average_monthly_sales,
            markup_padrao: 250,
            margem_lucro_esperada: validation.data.desired_profit_margin || 30,
            custo_medio_por_prato: 12,
            meta_vendas_diaria: validation.data.average_monthly_sales / 30,
            ticket_medio_esperado: 35,
            pratos_vendidos_dia_meta: Math.ceil((validation.data.average_monthly_sales / 30) / 35),
            despesas_fixas_mensais: validation.data.fixed_expenses || 0,
            despesas_variaveis_mensais: validation.data.variable_expenses || 0,
          }]);

        // Salvar também no localStorage para compatibilidade
        const userRestaurantKey = `restaurantData_${user.id}`;
        localStorage.setItem(userRestaurantKey, JSON.stringify({
          ...validation.data,
          id: restaurantData.id,
          lastUpdate: new Date().toISOString(),
          isNewUser: false
        }));
      }

      // Atualizar contexto de autenticação
      await createRestaurant(validation.data.name);
      
      toast.success("Restaurante configurado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao configurar restaurante:", error);
      toast.error("Erro ao configurar restaurante. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Informações Básicas</h2>
              <p className="text-muted-foreground">Vamos começar com os dados do seu negócio</p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Restaurante *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Restaurante Sabor & Arte"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Negócio *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de estabelecimento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Metas de CMV</h2>
              <p className="text-muted-foreground">Defina suas metas de Custo de Mercadoria Vendida</p>
            </div>

            <FormField
              control={form.control}
              name="target_food_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CMV Alvo - Alimentos (%)</FormLabel>
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
                    Recomendado: 28-35% para alimentos
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_beverage_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CMV Alvo - Bebidas (%)</FormLabel>
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
                    Recomendado: 20-30% para bebidas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Faturamento</h2>
              <p className="text-muted-foreground">Informe sua receita mensal atual ou desejada</p>
            </div>

            <FormField
              control={form.control}
              name="average_monthly_sales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receita Média Mensal (R$)</FormLabel>
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
                    Este valor é usado para calcular projeções e metas de vendas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Custos e Metas</h2>
              <p className="text-muted-foreground">Defina seus custos fixos e metas de lucro</p>
            </div>

            <FormField
              control={form.control}
              name="fixed_expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Despesas Fixas Mensais (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
              name="variable_expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Despesas Variáveis (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Impostos, comissões, taxas de cartão sobre vendas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desired_profit_margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Margem de Lucro Desejada (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="80"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Meta de lucro líquido sobre as vendas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resto<span className="text-primary">AI</span> CEO</h1>
          <p className="text-gray-600 mt-2">Configure seu restaurante em poucos passos</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Passo {step} de {totalSteps}</CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          
          <CardContent>
            {validationErrors.length > 0 && (
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form className="space-y-6">
                {renderStep()}
                
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                  )}
                  <Button 
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={step === 1 ? "ml-auto" : ""}
                  >
                    {isSubmitting ? "Configurando..." : 
                     step === totalSteps ? "Finalizar Configuração" : "Próximo"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Todas as configurações podem ser ajustadas posteriormente nas configurações do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
