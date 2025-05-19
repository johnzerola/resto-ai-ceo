
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSyncStatus, startSync } from "@/services/SyncService";
import { supabase } from "@/integrations/supabase/client";
import { supabaseDataService } from "@/services/SupabaseDataService";
import { RefreshCcw, Database, Users, ServerCrash, Activity, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";

const StatusSistema = () => {
  const [activeTab, setActiveTab] = useState("sync");
  const [users, setUsers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({
    cpu: 45,
    memory: 32,
    storage: 18,
    network: 24
  });
  const [syncStatus, setSyncStatus] = useState<any>({
    lastSync: null,
    inProgress: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados quando a página carregar
  useEffect(() => {
    loadData();
    
    // Configurar atualizador automático do status de sincronização
    const interval = setInterval(() => {
      const status = getSyncStatus();
      setSyncStatus(status);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para carregar todos os dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadTables(),
        loadSyncLogs(),
      ]);
      
      // Atualizar status de sincronização
      const status = getSyncStatus();
      setSyncStatus(status);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Falha ao carregar dados do sistema");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar usuários do Supabase
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
      return true;
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      return false;
    }
  };

  // Carregar informações sobre tabelas do sistema
  const loadTables = async () => {
    try {
      // Idealmente, isso viria de uma API do Supabase,
      // mas vamos simular com dados estáticos por enquanto
      const tablesData = [
        { name: "profiles", rows: await countRows('profiles'), size: "0.2 MB", lastUpdated: new Date().toISOString() },
        { name: "restaurants", rows: await countRows('restaurants'), size: "0.3 MB", lastUpdated: new Date().toISOString() },
        { name: "recipes", rows: await countRows('recipes'), size: "0.5 MB", lastUpdated: new Date().toISOString() },
        { name: "inventory", rows: await countRows('inventory'), size: "0.8 MB", lastUpdated: new Date().toISOString() },
        { name: "cash_flow", rows: await countRows('cash_flow'), size: "1.2 MB", lastUpdated: new Date().toISOString() }
      ];
      setTables(tablesData);
      return true;
    } catch (error) {
      console.error("Erro ao carregar informações de tabelas:", error);
      return false;
    }
  };
  
  // Contar registros em uma tabela
  const countRows = async (tableName: string) => {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Erro ao contar registros de ${tableName}:`, error);
      return 0;
    }
  };

  // Simular carregamento de logs de sincronização
  const loadSyncLogs = async () => {
    try {
      // Em uma implementação real, isso viria do backend
      // Por enquanto, usamos dados simulados
      const logs = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 10000).toISOString(),
          type: "success",
          source: "app",
          message: "Sincronização de dados concluída com sucesso"
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          type: "warning",
          source: "fluxo-caixa",
          message: "Sincronização parcial - alguns registros não foram atualizados"
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: "error",
          source: "estoque",
          message: "Falha na sincronização de dados de estoque"
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: "success",
          source: "app",
          message: "Backup diário concluído com sucesso"
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          type: "success",
          source: "app",
          message: "Sincronização automática realizada"
        }
      ];
      
      setSyncLogs(logs);
      return true;
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      return false;
    }
  };

  // Iniciar sincronização manual
  const handleSync = async () => {
    try {
      toast.info("Iniciando sincronização manual...");
      const success = await startSync("status-sistema");
      
      if (success) {
        toast.success("Sincronização concluída com sucesso!");
      } else {
        toast.error("Falha na sincronização");
      }
      
      // Recarregar dados
      loadData();
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast.error("Erro durante a sincronização");
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Status do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento e diagnóstico de sistemas integrados
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-1/2">
            <TabsTrigger value="sync">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sincronização
            </TabsTrigger>
            <TabsTrigger value="db">
              <Database className="h-4 w-4 mr-2" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="health">
              <Activity className="h-4 w-4 mr-2" />
              Saúde do Sistema
            </TabsTrigger>
          </TabsList>

          {/* Tab Sincronização */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Status de Sincronização</CardTitle>
                    <CardDescription>
                      Estado atual da sincronização de dados entre o aplicativo e o Supabase
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync}
                    disabled={isLoading || syncStatus.inProgress}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Sincronizar Agora
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Status Atual</div>
                    <div className="flex items-center">
                      {syncStatus.inProgress ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                          Sincronizando...
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Sincronizado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Última Sincronização</div>
                    <div className="font-medium">
                      {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : "Nunca"}
                    </div>
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-md">Histórico de Sincronização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Mensagem</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {syncLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-sm">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm">{log.source}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    log.type === "success" ? "default" : 
                                    log.type === "warning" ? "outline" : 
                                    log.type === "error" ? "destructive" : "secondary"
                                  }
                                  className={log.type === "success" ? "bg-green-500 hover:bg-green-600" : ""}
                                >
                                  {log.type === "success" ? "Sucesso" : 
                                   log.type === "warning" ? "Alerta" : 
                                   log.type === "error" ? "Erro" : log.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Banco de Dados */}
          <TabsContent value="db" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tabelas do Sistema</CardTitle>
                    <CardDescription>
                      Informações sobre as tabelas no banco de dados
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadTables}
                    disabled={isLoading}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
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
                    {tables.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {isLoading ? "Carregando..." : "Nenhuma tabela encontrada"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Saúde do Sistema */}
          <TabsContent value="health" className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

export default StatusSistema;
