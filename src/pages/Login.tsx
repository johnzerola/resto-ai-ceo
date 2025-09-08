
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Verificar se o usuário foi confirmado via URL
  const isConfirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Email confirmado com sucesso!", {
        description: "Agora você pode fazer login normalmente.",
        duration: 5000
      });
    }
  }, [isConfirmed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    console.log("Iniciando login para:", loginEmail);
    setIsSubmitting(true);
    
    try {
      const result = await login(loginEmail, loginPassword);
      
      if (result.ok) {
        console.log("Login bem-sucedido, redirecionando...");
        toast.success("Login realizado com sucesso!");
        // Usar replace para evitar problemas de navegação no mobile
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.error || "Erro no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro interno. Tente novamente em alguns instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    
    console.log("Iniciando registro...");
    setIsSubmitting(true);
    
    try {
      const result = await register(registerEmail, registerPassword, registerName);
      
      if (result.ok) {
        toast.success("Conta criada com sucesso!", {
          description: "Verifique seu email para confirmar sua conta.",
          duration: 5000
        });
        setActiveTab("login");
        // Limpar formulário de registro
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      toast.error("Erro interno no registro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${isMobile ? 'px-2' : 'px-4'}`}>
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <div className="text-center mb-8">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
            Resto<span className="text-primary">AI</span> CEO
          </h1>
          <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
            Sua plataforma completa de gestão para restaurantes
          </p>
        </div>

        {isConfirmed && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Sua conta foi confirmada com sucesso! Agora você pode fazer login.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className={isMobile ? 'pb-4' : ''}>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Bem-vindo</CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : ''}>
              Acesse sua conta para gerenciar seu restaurante
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardContent className={isMobile ? 'px-4' : ''}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className={isMobile ? 'text-sm' : ''}>Entrar</TabsTrigger>
                <TabsTrigger value="register" className={isMobile ? 'text-sm' : ''}>Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className={isMobile ? 'text-sm' : ''}>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Digite seu email"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password" className={isMobile ? 'text-sm' : ''}>Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Digite sua senha"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size={isMobile ? "default" : "default"}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" className={isMobile ? 'text-sm' : ''}>Nome</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-name"
                        placeholder="Digite seu nome completo"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email" className={isMobile ? 'text-sm' : ''}>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Digite seu email"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password" className={isMobile ? 'text-sm' : ''}>Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Crie uma senha segura"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password" className={isMobile ? 'text-sm' : ''}>Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirme sua senha"
                        className="pl-12"
                        disabled={isSubmitting}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size={isMobile ? "default" : "default"}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Registrando...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className={`flex flex-col space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
            <div className={`text-center w-full text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Ao se registrar, você concorda com nossos termos de uso
            </div>
          </CardFooter>
        </Card>
        
        <div className={`mt-6 text-center text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <p>© {new Date().getFullYear()} Lucraí. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
