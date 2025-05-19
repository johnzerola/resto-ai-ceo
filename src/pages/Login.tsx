
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Esquema de validação para login
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Esquema de validação para registro
const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Login = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter a página de redirecionamento após login (se houver)
  const from = (location.state as { from?: string })?.from || "/";

  // Form para login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form para registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast.success("Login realizado com sucesso!");
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Erro de login:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await register(values.name, values.email, values.password);
      if (success) {
        toast.success("Registro realizado com sucesso! Agora você pode fazer login.");
        setActiveTab("login");
        registerForm.reset();
      }
    } catch (error) {
      console.error("Erro de registro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Resto<span className="text-primary">AI</span> CEO</h1>
          <p className="text-gray-600 mt-2">Sua plataforma completa de gestão para restaurantes</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar seu restaurante
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardContent>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="seu@email.com"
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Senha</FormLabel>
                            <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                              Esqueceu a senha?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                placeholder="Seu nome completo"
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
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="seu@email.com"
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
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="password"
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
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Registrando..." : "Registrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full">
              Ao se registrar, você concorda com nossos <Link to="/termos" className="text-primary font-semibold hover:underline">Termos de Serviço</Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} RestoAI CEO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
