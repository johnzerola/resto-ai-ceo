import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Store, 
  DollarSign, 
  UtensilsCrossed, 
  Target, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft 
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface OnboardingData {
  // Etapa 1: Dados do Negócio
  restaurantName: string;
  businessType: string;
  ownerName: string;
  cnpj: string;
  
  // Etapa 2: Configuração Financeira
  averageMonthlyRevenue: number;
  fixedMonthlyCosts: number;
  variableCostsPercentage: number;
  desiredProfitMargin: number;
  
  // Etapa 3: Primeiro Item do Cardápio
  firstItemName: string;
  firstItemCost: number;
  firstItemPrice: number;
  firstItemCategory: string;
  
  // Etapa 4: Metas Iniciais
  monthlyRevenueGoal: number;
  dailySalesGoal: number;
  averageTicketGoal: number;
}

const BUSINESS_TYPES = [
  "Restaurante", "Pizzaria", "Hamburgueria", "Food Truck", 
  "Padaria", "Lanchonete", "Cafeteria", "Bar", "Sorveteria", "Outro"
];

const FOOD_CATEGORIES = [
  "Pratos Principais", "Entradas", "Sobremesas", "Bebidas", 
  "Lanches", "Pizzas", "Hambúrgueres", "Saladas", "Outros"
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { user, createRestaurant } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<OnboardingData>({
    restaurantName: "",
    businessType: "",
    ownerName: user?.user_metadata?.name || "",
    cnpj: "",
    averageMonthlyRevenue: 25000,
    fixedMonthlyCosts: 8000,
    variableCostsPercentage: 15,
    desiredProfitMargin: 30,
    firstItemName: "",
    firstItemCost: 0,
    firstItemPrice: 0,
    firstItemCategory: "",
    monthlyRevenueGoal: 30000,
    dailySalesGoal: 50,
    averageTicketGoal: 35
  });

  // Validações por etapa
  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    setValidationErrors([]);

    switch (step) {
      case 1:
        if (!formData.restaurantName.trim()) errors.push("Nome do restaurante é obrigatório");
        if (!formData.businessType) errors.push("Tipo de negócio é obrigatório");
        if (!formData.ownerName.trim()) errors.push("Nome do responsável é obrigatório");
        break;
        
      case 2:
        if (formData.averageMonthlyRevenue <= 0) errors.push("Faturamento deve ser maior que zero");
        if (formData.fixedMonthlyCosts < 0) errors.push("Custos fixos não podem ser negativos");
        if (formData.variableCostsPercentage < 0 || formData.variableCostsPercentage > 50) {
          errors.push("Custos variáveis devem estar entre 0% e 50%");
        }
        if (formData.desiredProfitMargin <= 0 || formData.desiredProfitMargin > 80) {
          errors.push("Margem de lucro deve estar entre 1% e 80%");
        }
        break;
        
      case 3:
        if (!formData.firstItemName.trim()) errors.push("Nome do item é obrigatório");
        if (formData.firstItemCost <= 0) errors.push("Custo do item deve ser maior que zero");
        if (formData.firstItemPrice <= formData.firstItemCost) {
          errors.push("Preço de venda deve ser maior que o custo");
        }
        if (!formData.firstItemCategory) errors.push("Categoria é obrigatória");
        break;
        
      case 4:
        if (formData.monthlyRevenueGoal <= formData.averageMonthlyRevenue) {
          errors.push("Meta de faturamento deve ser maior que o faturamento atual");
        }
        if (formData.dailySalesGoal <= 0) errors.push("Meta de vendas diárias deve ser maior que zero");
        if (formData.averageTicketGoal <= 0) errors.push("Meta de ticket médio deve ser maior que zero");
        break;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando usuário começar a corrigir
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Validar todas as etapas antes de submeter
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Criar restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          name: formData.restaurantName,
          owner_id: user.id,
          owner_name: formData.ownerName,
          business_type: formData.businessType,
          cnpj: formData.cnpj || null,
          average_monthly_sales: formData.averageMonthlyRevenue,
          desired_profit_margin: formData.desiredProfitMargin,
        }])
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // 2. Criar perfil empresarial
      await supabase
        .from('business_profiles')
        .insert([{
          restaurant_id: restaurantData.id,
          owner_name: formData.ownerName,
          cnpj: formData.cnpj,
          average_monthly_revenue: formData.averageMonthlyRevenue,
          fixed_monthly_costs: formData.fixedMonthlyCosts,
          variable_monthly_costs: formData.variableCostsPercentage,
          desired_profit_margin: formData.desiredProfitMargin,
        }]);

      // 3. Criar configurações do restaurante
      await supabase
        .from('configuracoes_restaurante')
        .insert([{
          restaurant_id: restaurantData.id,
          receita_mensal_esperada: formData.averageMonthlyRevenue,
          markup_padrao: 250,
          margem_lucro_esperada: formData.desiredProfitMargin,
        }]);

      // 4. Criar primeiro item do cardápio
      await supabase
        .from('pratos')
        .insert([{
          restaurant_id: restaurantData.id,
          nome_prato: formData.firstItemName,
          categoria: formData.firstItemCategory,
          custo_total: formData.firstItemCost,
          preco_sugerido: formData.firstItemPrice,
          preco_praticado: formData.firstItemPrice,
        }]);

      // 5. Criar metas iniciais
      await supabase
        .from('goals')
        .insert([
          {
            restaurant_id: restaurantData.id,
            title: "Meta de Faturamento Mensal",
            target: formData.monthlyRevenueGoal,
            current: 0,
            unit: "R$",
            category: "financeiro",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            restaurant_id: restaurantData.id,
            title: "Meta de Vendas Diárias",
            target: formData.dailySalesGoal,
            current: 0,
            unit: "vendas",
            category: "vendas",
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);

      // 6. Marcar onboarding como completo
      await supabase
        .from('profiles')
        .update({ 
          onboarding_complete: true, 
          onboarding_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // 7. Atualizar contexto
      await createRestaurant(formData.restaurantName);

      toast.success("🎉 Onboarding concluído! Bem-vindo ao Lucraí!");
      onComplete();
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Erro no onboarding:", error);
      toast.error("Erro ao configurar restaurante. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-lucrai-blue-primary" />
              <h3 className="text-lg font-semibold">Dados do Negócio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="restaurantName">Nome do Restaurante *</Label>
                <Input
                  id="restaurantName"
                  value={formData.restaurantName}
                  onChange={(e) => updateFormData("restaurantName", e.target.value)}
                  placeholder="Ex: Restaurante Sabor & Arte"
                />
              </div>
              
              <div>
                <Label htmlFor="businessType">Tipo de Negócio *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => updateFormData("businessType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ownerName">Nome do Responsável *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData("ownerName", e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => updateFormData("cnpj", e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-lucrai-green-primary" />
              <h3 className="text-lg font-semibold">Configuração Financeira</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="averageMonthlyRevenue">Faturamento Mensal Atual (R$) *</Label>
                <Input
                  id="averageMonthlyRevenue"
                  type="number"
                  value={formData.averageMonthlyRevenue}
                  onChange={(e) => updateFormData("averageMonthlyRevenue", Number(e.target.value))}
                  min="1000"
                />
              </div>
              
              <div>
                <Label htmlFor="fixedMonthlyCosts">Custos Fixos Mensais (R$) *</Label>
                <Input
                  id="fixedMonthlyCosts"
                  type="number"
                  value={formData.fixedMonthlyCosts}
                  onChange={(e) => updateFormData("fixedMonthlyCosts", Number(e.target.value))}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="variableCostsPercentage">Custos Variáveis (%) *</Label>
                <Input
                  id="variableCostsPercentage"
                  type="number"
                  value={formData.variableCostsPercentage}
                  onChange={(e) => updateFormData("variableCostsPercentage", Number(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>
              
              <div>
                <Label htmlFor="desiredProfitMargin">Margem de Lucro Desejada (%) *</Label>
                <Input
                  id="desiredProfitMargin"
                  type="number"
                  value={formData.desiredProfitMargin}
                  onChange={(e) => updateFormData("desiredProfitMargin", Number(e.target.value))}
                  min="1"
                  max="80"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        const margin = formData.firstItemPrice > 0 && formData.firstItemCost > 0 
          ? ((formData.firstItemPrice - formData.firstItemCost) / formData.firstItemPrice * 100).toFixed(1)
          : "0";
          
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-5 w-5 text-lucrai-yellow-primary" />
              <h3 className="text-lg font-semibold">Primeiro Item do Cardápio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstItemName">Nome do Prato/Item *</Label>
                <Input
                  id="firstItemName"
                  value={formData.firstItemName}
                  onChange={(e) => updateFormData("firstItemName", e.target.value)}
                  placeholder="Ex: Hambúrguer Especial"
                />
              </div>
              
              <div>
                <Label htmlFor="firstItemCategory">Categoria *</Label>
                <Select
                  value={formData.firstItemCategory}
                  onValueChange={(value) => updateFormData("firstItemCategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="firstItemCost">Custo do Item (R$) *</Label>
                <Input
                  id="firstItemCost"
                  type="number"
                  value={formData.firstItemCost}
                  onChange={(e) => updateFormData("firstItemCost", Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="firstItemPrice">Preço de Venda (R$) *</Label>
                <Input
                  id="firstItemPrice"
                  type="number"
                  value={formData.firstItemPrice}
                  onChange={(e) => updateFormData("firstItemPrice", Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            
            {formData.firstItemPrice > 0 && formData.firstItemCost > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Margem de lucro calculada: <span className="font-semibold">{margin}%</span>
                  {parseFloat(margin) < 20 && (
                    <span className="text-red-600 ml-2">⚠️ Margem baixa - considere ajustar o preço</span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-lucrai-blue-primary" />
              <h3 className="text-lg font-semibold">Metas Iniciais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRevenueGoal">Meta de Faturamento Mensal (R$) *</Label>
                <Input
                  id="monthlyRevenueGoal"
                  type="number"
                  value={formData.monthlyRevenueGoal}
                  onChange={(e) => updateFormData("monthlyRevenueGoal", Number(e.target.value))}
                  min={formData.averageMonthlyRevenue + 1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deve ser maior que o faturamento atual (R$ {formData.averageMonthlyRevenue.toLocaleString()})
                </p>
              </div>
              
              <div>
                <Label htmlFor="dailySalesGoal">Meta de Vendas Diárias *</Label>
                <Input
                  id="dailySalesGoal"
                  type="number"
                  value={formData.dailySalesGoal}
                  onChange={(e) => updateFormData("dailySalesGoal", Number(e.target.value))}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="averageTicketGoal">Meta de Ticket Médio (R$) *</Label>
                <Input
                  id="averageTicketGoal"
                  type="number"
                  value={formData.averageTicketGoal}
                  onChange={(e) => updateFormData("averageTicketGoal", Number(e.target.value))}
                  min="1"
                  step="0.01"
                />
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Suas configurações estão prontas! Clique em "Finalizar" para criar seu restaurante no sistema.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Configuração Inicial - Etapa {currentStep} de 4
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% concluído
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {renderStepContent()}
          
          <Separator />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-lucrai-blue-primary hover:bg-lucrai-blue-secondary"
            >
              {isSubmitting ? (
                "Processando..."
              ) : currentStep === 4 ? (
                "Finalizar"
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}