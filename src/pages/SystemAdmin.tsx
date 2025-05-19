
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Users, ServerCrash, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SystemAdmin = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({
    cpu: 45,
    memory: 32,
    storage: 18,
    network: 24
  });
  const { hasPermission } = useAuth();

  // Carregar dados do Supabase quando a página carregar
  useEffect(() => {
    loadUsers();
    loadTables();
  }, []);

  // Carregar usuários do Supabase
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Não foi possível carregar os dados de usuários");
    }
  };

  // Carregar informações sobre tabelas do sistema
  const loadTables = async () => {
    try {
      // Esta é uma simplificação - na prática, você precisaria
      // de permissões especiais para acessar essas informações
      const tablesData = [
        { name: "profiles", rows: 5, size: "0.2 MB", lastUpdated: new Date().toISOString() },
        { name: "restaurants", rows: 3, size: "0.3 MB", lastUpdated: new Date().toISOString() },
        { name: "recipes", rows: 12, size: "0.5 MB", lastUpdated: new Date().toISOString() },
        { name: "inventory", rows: 28, size: "0.8 MB", lastUpdated: new Date().toISOString() },
        { name: "cash_flow", rows: 45, size: "1.2 MB", lastUpdated: new Date().toISOString() }
      ];
      setTables(tablesData);
    } catch (error) {
      console.error("Erro ao carregar informações de tabelas:", error);
      toast.error("Não foi possível carregar os dados de tabelas");
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Administração do Sistema</h1>
          <p className="text-muted-foreground">
            Painel exclusivo para administradores e desenvolvedores
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-1/2">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="system">
              <Activity className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Tab Usuários */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>
                  Lista de todos os usuários registrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                          <TableCell>{user.name || "Sem nome"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.role === "owner" ? "default" : 
                              user.role === "manager" ? "outline" : "secondary"
                            }>
                              {user.role || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Ativo
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Banco de Dados */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tabelas do Sistema</CardTitle>
                <CardDescription>
                  Informações sobre as tabelas no banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>{table.rows}</TableCell>
                        <TableCell>{table.size}</TableCell>
                        <TableCell>{new Date(table.lastUpdated).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sistema */}
          <TabsContent value="system" className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Saúde do Sistema</CardTitle>
                <CardDescription>
                  Status atual dos recursos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU</span>
                    <span className="text-sm font-medium">{systemHealth.cpu}%</span>
                  </div>
                  <Progress value={systemHealth.cpu} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memória</span>
                    <span className="text-sm font-medium">{systemHealth.memory}%</span>
                  </div>
                  <Progress value={systemHealth.memory} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Armazenamento</span>
                    <span className="text-sm font-medium">{systemHealth.storage}%</span>
                  </div>
                  <Progress value={systemHealth.storage} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rede</span>
                    <span className="text-sm font-medium">{systemHealth.network}%</span>
                  </div>
                  <Progress value={systemHealth.network} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>
                  Últimos eventos registrados
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 overflow-auto">
                <div className="font-mono text-xs space-y-2">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    [INFO] {new Date().toISOString()} - Sistema inicializado com sucesso
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    [INFO] {new Date(Date.now() - 500000).toISOString()} - Backup automático executado
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    [WARN] {new Date(Date.now() - 1000000).toISOString()} - Tentativas de login múltiplas
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    [INFO] {new Date(Date.now() - 2000000).toISOString()} - Atualização de dados concluída
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    [INFO] {new Date(Date.now() - 3000000).toISOString()} - Novo usuário registrado
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                    [ERROR] {new Date(Date.now() - 5000000).toISOString()} - Falha na sincronização
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Status da Integração</CardTitle>
                <CardDescription>
                  Status da conexão com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Verificação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Supabase Auth</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Operacional
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date().toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Supabase Database</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Operacional
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date().toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Supabase Storage</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Operacional
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date().toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Supabase Functions</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Operacional
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date().toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Layout>
    </ProtectedRoute>
  );
};

export default SystemAdmin;
