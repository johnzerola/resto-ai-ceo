import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, User, FileText, Calendar, Clock, DollarSign, TrendingUp, Target, Save, ArrowLeft } from "lucide-react";
import { useBusinessProfile, BusinessProfile } from "@/hooks/useBusinessProfile";
import { ModernLayout } from "@/components/restaurant/ModernLayout";

const businessProfileSchema = z.object({
  ownerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  cnpj: z.string().optional(),
  averageMonthlyRevenue: z.number().min(1000, "Faturamento deve ser pelo menos R$ 1.000"),
  averageTicket: z.number().min(10, "Ticket médio deve ser pelo menos R$ 10"),
  desiredProfitMargin: z.number().min(5).max(80, "Margem deve estar entre 5% e 80%"),
  fixedMonthlyCosts: z.number().min(0, "Valor deve ser positivo"),
  variableMonthlyCosts: z.number().min(0).max(50, "Valor deve estar entre 0% e 50%"),
  weeklyOperatingDays: z.number().min(1).max(7),
  dailyOperatingHours: z.string(),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

const BusinessProfilePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile, isLoading, saveProfile, updateRestaurantData } = useBusinessProfile();
  const navigate = useNavigate();

  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      ownerName: profile?.owner_name || "",
      cnpj: profile?.cnpj || "",
      averageMonthlyRevenue: profile?.average_monthly_revenue || 30000,
      averageTicket: profile?.average_ticket || 35,
      desiredProfitMargin: profile?.desired_profit_margin || 30,
      fixedMonthlyCosts: profile?.fixed_monthly_costs || 8000,
      variableMonthlyCosts: profile?.variable_monthly_costs || 15,
      weeklyOperatingDays: profile?.weekly_operating_days || 6,
      dailyOperatingHours: profile?.daily_operating_hours || "08:00-18:00",
    },
  });

  // Update form when profile loads
  useState(() => {
    if (profile) {
      form.reset({
        ownerName: profile.owner_name || "",
        cnpj: profile.cnpj || "",
        averageMonthlyRevenue: profile.average_monthly_revenue,
        averageTicket: profile.average_ticket,
        desiredProfitMargin: profile.desired_profit_margin,
        fixedMonthlyCosts: profile.fixed_monthly_costs,
        variableMonthlyCosts: profile.variable_monthly_costs,
        weeklyOperatingDays: profile.weekly_operating_days,
        dailyOperatingHours: profile.daily_operating_hours,
      });
    }
  });

  const onSubmit = async (values: BusinessProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Atualizar dados do restaurante
      await updateRestaurantData({
        owner_name: values.ownerName,
        cnpj: values.cnpj,
      });

      // Salvar perfil empresarial
      const success = await saveProfile({
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

      if (success) {
        toast.success("Dados do negócio atualizados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados do negócio");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do negócio...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dados do Negócio</h1>
            <p className="text-muted-foreground">
              Gerencie as informações empresariais e configurações do seu restaurante
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Insights Atuais */}
        {profile?.motivational_insights && Array.isArray(profile.motivational_insights) && profile.motivational_insights.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                📊 Insights do seu Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {profile.motivational_insights.slice(0, 3).map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <Badge variant="secondary" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-gray-700 flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              Informações Empresariais
            </CardTitle>
            <CardDescription>
              Mantenha os dados do seu negócio sempre atualizados para análises mais precisas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          CNPJ
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
                          Faturamento Mensal (R$)
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
                          Ticket Médio (R$)
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Custos Fixos Mensais (R$)
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
                          Custos Variáveis (%)
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
                              <SelectValue />
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
                              <SelectValue />
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

                <div className="flex justify-end gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
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

export default BusinessProfilePage;