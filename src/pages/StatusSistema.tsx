
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getSyncStatus, startSync, getSyncLogs } from "@/services/SyncService";
import { supabase, isValidTableName, getTableQueryBuilder, ExtendedTableName } from "@/integrations/supabase/client";
import { RefreshCcw, Database, Activity } from "lucide-react";
import { SyncTab } from "@/components/restaurant/StatusTabs/SyncTab";
import { DatabaseTab } from "@/components/restaurant/StatusTabs/DatabaseTab";
import { HealthTab } from "@/components/restaurant/StatusTabs/HealthTab";

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
        { name: "cash_flow", rows: await countRows('cash_flow'), size: "1.2 MB", lastUpdated: new Date().toISOString() },
        { name: "payments", rows: await countRows('payments'), size: "0.3 MB", lastUpdated: new Date().toISOString() }
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
      // Verificar se o nome da tabela é válido antes de fazer a consulta
      if (!isValidTableName(tableName)) {
        console.error(`Nome de tabela inválido: ${tableName}`);
        return 0;
      }
      
      // Usar nossa função auxiliar para obter um query builder tipado
      const { count, error } = await getTableQueryBuilder(tableName as ExtendedTableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Erro ao contar registros de ${tableName}:`, error);
      return 0;
    }
  };

  // Carregar logs de sincronização
  const loadSyncLogs = async () => {
    try {
      // Obter logs reais do serviço de sincronização
      const logs = getSyncLogs();
      
      // Mapear logs para o formato esperado pela UI
      const formattedLogs = logs.map((log, index) => ({
        id: index.toString(),
        timestamp: log.timestamp,
        type: log.success ? "success" : "error",
        source: log.source,
        message: log.details?.status === 'started' ? "Sincronização iniciada" :
                log.details?.status === 'completed' ? "Sincronização concluída com sucesso" :
                log.details?.status === 'failed' ? `Falha na sincronização: ${log.details?.error}` :
                "Evento de sincronização"
      }));
      
      setSyncLogs(formattedLogs);
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          <TabsContent value="sync">
            <SyncTab 
              isLoading={isLoading} 
              syncStatus={syncStatus}
              syncLogs={syncLogs}
              onSync={handleSync}
            />
          </TabsContent>

          {/* Tab Banco de Dados */}
          <TabsContent value="db">
            <DatabaseTab 
              isLoading={isLoading} 
              tables={tables}
              onRefresh={loadTables}
            />
          </TabsContent>

          {/* Tab Saúde do Sistema */}
          <TabsContent value="health">
            <HealthTab systemHealth={systemHealth} />
          </TabsContent>
        </Tabs>
      </Layout>
    </ProtectedRoute>
  );
};

export default StatusSistema;
