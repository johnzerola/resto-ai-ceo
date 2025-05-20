import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole, getUsers, getUserByEmail, registerUser } from "@/services/AuthService";
import { useAuth } from "@/services/AuthService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, UserCheck, UserPlus, X, Check } from "lucide-react";

// Schema de validação para o novo usuário
const newUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum([UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE], {
    required_error: "Selecione um tipo de usuário",
  }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const GerenciarUsuarios = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.EMPLOYEE,
    },
  });

  useEffect(() => {
    // Carregar usuários
    setUsers(getUsers());
  }, []);

  const onSubmit = async (data: NewUserFormValues) => {
    try {
      // Verificar se email já existe
      const existingUser = getUserByEmail(data.email);
      if (existingUser) {
        toast.error("Este email já está em uso");
        return;
      }

      // Registrar novo usuário
      const newUser = registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (newUser) {
        toast.success(`Usuário ${data.name} criado com sucesso`);
        setOpenDialog(false);
        form.reset();
        // Atualizar lista de usuários
        setUsers(getUsers());
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return "Proprietário";
      case UserRole.MANAGER:
        return "Gerente";
      case UserRole.EMPLOYEE:
        return "Funcionário";
      default:
        return role;
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <Layout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários e suas permissões no sistema
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário. A senha pode ser alterada posteriormente.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de usuário</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de usuário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.OWNER}>Proprietário</SelectItem>
                            <SelectItem value={UserRole.MANAGER}>Gerente</SelectItem>
                            <SelectItem value={UserRole.EMPLOYEE}>Funcionário</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Usuário</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Último Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.id === currentUser?.id && (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`${
                        user.role === UserRole.OWNER 
                          ? "bg-blue-100 text-blue-800" 
                          : user.role === UserRole.MANAGER 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-gray-100 text-gray-800"
                      } px-2 py-1 rounded-full text-xs font-medium`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString() 
                        : "Nunca"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Layout>
    </ProtectedRoute>
  );
};

export default GerenciarUsuarios;
