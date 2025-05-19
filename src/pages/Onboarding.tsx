
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store } from "lucide-react";

// Esquema de validação para o formulário de onboarding
const onboardingSchema = z.object({
  restaurantName: z.string().min(3, "Nome do restaurante deve ter pelo menos 3 caracteres"),
  businessType: z.string().min(1, "Selecione o tipo de negócio"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRestaurant, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      restaurantName: "",
      businessType: "",
    },
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um restaurante");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const restaurantId = await createRestaurant(values.restaurantName, values.businessType);
      
      if (restaurantId) {
        toast.success("Seu restaurante foi configurado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao configurar restaurante:", error);
      toast.error("Erro ao configurar restaurante");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resto<span className="text-primary">AI</span> CEO</h1>
          <p className="text-gray-600 mt-2">Vamos configurar seu restaurante</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name}!</CardTitle>
            <CardDescription>
              Vamos configurar seu restaurante para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Configurando..." : "Configurar Restaurante"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Você poderá ajustar mais configurações do seu restaurante depois.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
