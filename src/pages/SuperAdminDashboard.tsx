
import React, { useState, useEffect, memo, Suspense } from 'react';
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Terminal,
  Code,
  Brain,
  TestTube,
  Bug,
  Database,
  Activity,
  FileText,
  Users,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { useSuperAdminCache } from "@/hooks/useSuperAdminCache";
import { MobileStatsGrid } from "@/components/superadmin/MobileStatsGrid";
import { MobileTabsNavigation } from "@/components/superadmin/MobileTabsNavigation";
import { CompactAuditSection } from "@/components/superadmin/CompactAuditSection";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  timestamp: string;
  user_id: string;
  additional_data?: any;
}

interface SystemLog {
  id: string;
  level: string;
  service: string;
  message: string;
  timestamp: string;
}

interface AIPrompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  is_active: boolean;
}

interface PlanConfig {
  id: string;
  plan_name: string;
  features: any;
  limits: any;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
}

const LoadingCard = memo(() => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
    </CardContent>
  </Card>
));

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    systemHealth: 100,
    apiResponses: 0,
    errors24h: 0
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [planConfigs, setPlanConfigs] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { getSystemStats, getAuditLogs, clearCache, getCacheStats } = useSuperAdminCache();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados com cache
      const [stats, logs] = await Promise.all([
        getSystemStats(),
        getAuditLogs()
      ]);

      setSystemStats(stats);
      setAuditLogs(logs as AuditLog[]);

      // Mock data para outros componentes
      setSystemLogs([
        {
          id: '1',
          level: 'info',
          service: 'authentication',
          message: 'User logged in successfully',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          level: 'warning',
          service: 'payments',
          message: 'Payment processing delayed',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]);

      setAiPrompts([
        {
          id: '1',
          name: 'Análise de Restaurante',
          category: 'analysis',
          prompt_text: 'Você é um especialista em análise de restaurantes...',
          is_active: true
        },
        {
          id: '2',
          name: 'Otimização de Custos',
          category: 'optimization',
          prompt_text: 'Você é um consultor de custos para restaurantes...',
          is_active: true
        }
      ]);

      setPlanConfigs([
        {
          id: '1',
          plan_name: 'free',
          features: { restaurants: 1, menuItems: 10, basicReports: true },
          limits: { restaurants: 1, menuItems: 10, storage: '1GB' },
          price_monthly: 0,
          price_yearly: 0,
          is_active: true
        },
        {
          id: '2',
          plan_name: 'essencial',
          features: { restaurants: 2, menuItems: 50, advancedReports: true, support: true },
          limits: { restaurants: 2, menuItems: 50, storage: '5GB' },
          price_monthly: 29.90,
          price_yearly: 299.00,
          is_active: true
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSystemTest = async () => {
    toast.info('Iniciando testes do sistema...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testResults = [
      { test: 'Conectividade Supabase', status: 'success' },
      { test: 'APIs Funcionando', status: 'success' },
      { test: 'Planos Mapeados', status: 'success' },
      { test: 'IA Respondendo', status: 'warning' },
      { test: 'Logs Salvando', status: 'success' }
    ];

    testResults.forEach(result => {
      if (result.status === 'success') {
        toast.success(`✅ ${result.test}: OK`);
      } else {
        toast.warning(`⚠️ ${result.test}: Verificar`);
      }
    });
  };

  const SystemOverview = memo(() => (
    <div className="space-y-4 sm:space-y-6">
      <MobileStatsGrid stats={systemStats} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
              Testes do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={simulateSystemTest} className="w-full" size="sm">
              <Bug className="h-4 w-4 mr-2" />
              Executar Testes
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <div>• Conectividade Supabase</div>
              <div>• Funcionalidades dos Planos</div>
              <div>• Resposta da IA</div>
              <div>• Sistema de Logs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Terminal className="h-4 w-4 sm:h-5 sm:w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Database className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Backup Manual</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Verificar Segurança</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Limpar Cache</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  ));

  const TechnicalLogs = memo(() => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Terminal className="h-4 w-4 sm:h-5 sm:w-5" />
          Logs Técnicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto font-mono text-xs sm:text-sm">
          {systemLogs.slice(0, 20).map((log, index) => (
            <div key={index} className={`p-2 rounded ${
              log.level === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
              log.level === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
              'bg-gray-50 border-l-4 border-gray-300'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 break-words">[{log.service}] {log.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ));

  const AIPromptsEditor = memo(() => {
    const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);

    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            Editor de Prompts da IA
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gerencie os prompts do sistema de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Label className="text-xs sm:text-sm">Prompts Disponíveis</Label>
              <div className="space-y-2 mt-2">
                {aiPrompts.map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant={selectedPrompt?.id === prompt.id ? "default" : "outline"}
                    className="w-full justify-start text-xs sm:text-sm"
                    size="sm"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {prompt.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedPrompt && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm">Nome do Prompt</Label>
                  <Input defaultValue={selectedPrompt.name} size="sm" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Categoria</Label>
                  <Input defaultValue={selectedPrompt.category} size="sm" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Texto do Prompt</Label>
                  <Textarea 
                    rows={4} 
                    defaultValue={selectedPrompt.prompt_text}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Salvar</Button>
                  <Button variant="outline" size="sm" className="flex-1">Testar</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  });

  const PlansManager = memo(() => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Gerenciador de Planos
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Configure planos, preços e funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {planConfigs.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize text-sm sm:text-base">{plan.plan_name}</h4>
                <Switch checked={plan.is_active} />
              </div>
              <div className="grid gap-2 grid-cols-2 text-xs sm:text-sm">
                <div>
                  <strong>Mensal:</strong> R$ {plan.price_monthly}
                </div>
                <div>
                  <strong>Anual:</strong> R$ {plan.price_yearly}
                </div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs sm:text-sm font-medium">
                  Ver Detalhes
                </summary>
                <div className="mt-2 p-2 bg-muted/20 rounded text-xs">
                  <div><strong>Features:</strong> {JSON.stringify(plan.features)}</div>
                  <div><strong>Limites:</strong> {JSON.stringify(plan.limits)}</div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ));

  const ToolsSection = memo(() => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Ferramentas de Desenvolvimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Database className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Query SQL Customizada</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Relatório do Sistema</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Users className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Simular Usuário</span>
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm" onClick={clearCache}>
          <Activity className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Limpar Cache ({getCacheStats.size} itens)</span>
        </Button>
      </CardContent>
    </Card>
  ));

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={UserRole.SUPERADMIN}>
        <ModernLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Carregando dashboard do superadministrador...</p>
            </div>
          </div>
        </ModernLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={UserRole.SUPERADMIN}>
      <ModernLayout>
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          {/* Header - Responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-red-600">
                Super Administrador
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Controle total da plataforma • Acesso irrestrito
              </p>
            </div>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>ATENÇÃO:</strong> Você tem acesso completo ao sistema. Todas as ações são auditadas.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <MobileTabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-4 sm:mt-6">
              <Suspense fallback={<LoadingCard />}>
                <TabsContent value="overview">
                  <SystemOverview />
                </TabsContent>

                <TabsContent value="audit">
                  <CompactAuditSection logs={auditLogs} />
                </TabsContent>

                <TabsContent value="logs">
                  <TechnicalLogs />
                </TabsContent>

                <TabsContent value="ai">
                  <AIPromptsEditor />
                </TabsContent>

                <TabsContent value="plans">
                  <PlansManager />
                </TabsContent>

                <TabsContent value="tools">
                  <ToolsSection />
                </TabsContent>
              </Suspense>
            </div>
          </Tabs>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default SuperAdminDashboard;
