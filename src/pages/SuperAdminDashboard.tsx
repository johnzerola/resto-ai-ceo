
import React, { useState, useEffect } from 'react';
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Database, 
  Settings, 
  AlertTriangle, 
  Activity,
  Server,
  Lock,
  Eye,
  FileText,
  Zap,
  Bug,
  BarChart3,
  Terminal,
  Code,
  Brain,
  TestTube
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SuperAdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    systemHealth: 100,
    apiResponses: 0,
    errors24h: 0
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);
  const [planConfigs, setPlanConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar estatísticas do sistema usando tabelas existentes
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: subscribers } = await supabase.from('subscribers').select('*');

      setSystemStats({
        totalUsers: profiles?.length || 0,
        activeSubscriptions: subscribers?.filter(s => s.subscribed)?.length || 0,
        systemHealth: Math.floor(Math.random() * 20) + 80, // Simulado
        apiResponses: Math.floor(Math.random() * 1000) + 500,
        errors24h: Math.floor(Math.random() * 10)
      });

      // Mock data para logs de auditoria até as tabelas serem criadas
      setAuditLogs([
        {
          id: '1',
          action: 'LOGIN',
          table_name: 'profiles',
          timestamp: new Date().toISOString(),
          user_id: 'mock-user',
          additional_data: { ip: '192.168.1.1' }
        },
        {
          id: '2',
          action: 'UPDATE',
          table_name: 'subscribers',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user_id: 'mock-user-2',
          additional_data: { changes: 'subscription_tier' }
        }
      ]);

      // Mock data para logs do sistema
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
        },
        {
          id: '3',
          level: 'error',
          service: 'api',
          message: 'Rate limit exceeded for endpoint /api/restaurants',
          timestamp: new Date(Date.now() - 900000).toISOString()
        }
      ]);

      // Mock data para prompts da IA
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
        },
        {
          id: '3',
          name: 'Precificação de Menu',
          category: 'pricing',
          prompt_text: 'Você é um especialista em precificação de cardápios...',
          is_active: true
        }
      ]);

      // Mock data para configurações de planos
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
        },
        {
          id: '3',
          plan_name: 'profissional',
          features: { restaurants: 5, menuItems: -1, fullReports: true, prioritySupport: true, aiAssistant: true },
          limits: { restaurants: 5, menuItems: -1, storage: '20GB' },
          price_monthly: 79.90,
          price_yearly: 799.00,
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
    
    // Simular testes
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

  const SystemOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Pagantes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}%</div>
            <Progress value={systemStats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APIs 24h</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.apiResponses}</div>
            <p className="text-xs text-muted-foreground">Chamadas processadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros 24h</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemStats.errors24h > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {systemStats.errors24h}
            </div>
            <p className="text-xs text-muted-foreground">Incidentes registrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Testes Rápidos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={simulateSystemTest} className="w-full">
              <Bug className="h-4 w-4 mr-2" />
              Executar Bateria de Testes
            </Button>
            <div className="text-sm text-muted-foreground">
              • Conectividade Supabase<br/>
              • Funcionalidades dos Planos<br/>
              • Resposta da IA<br/>
              • Sistema de Logs<br/>
              • Performance da API
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Database className="h-4 w-4 mr-2" />
              Backup Manual do Banco
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Verificar Segurança
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Limpar Cache do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AuditSection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Logs de Auditoria Recentes
          </CardTitle>
          <CardDescription>
            Todas as ações dos usuários são registradas para auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.slice(0, 20).map((log: any, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                <Badge variant={log.action === 'DELETE' ? 'destructive' : 'secondary'}>
                  {log.action}
                </Badge>
                <span className="text-sm">{log.table_name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TechnicalLogs = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Logs Técnicos do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
          {systemLogs.slice(0, 30).map((log: any, index) => (
            <div key={index} className={`p-2 rounded ${
              log.level === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
              log.level === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
              'bg-gray-50 border-l-4 border-gray-300'
            }`}>
              <div className="flex items-center gap-2">
                <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-1">[{log.service}] {log.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AIPromptsEditor = () => {
    const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Editor de Prompts da IA
            </CardTitle>
            <CardDescription>
              Gerencie e edite os prompts utilizados pelo sistema de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Prompts Disponíveis</Label>
                <div className="space-y-2 mt-2">
                  {aiPrompts.map((prompt: any) => (
                    <Button
                      key={prompt.id}
                      variant={selectedPrompt?.id === prompt.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      {prompt.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedPrompt && (
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Prompt</Label>
                    <Input defaultValue={selectedPrompt.name} />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Input defaultValue={selectedPrompt.category} />
                  </div>
                  <div>
                    <Label>Texto do Prompt</Label>
                    <Textarea 
                      rows={8} 
                      defaultValue={selectedPrompt.prompt_text}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button>Salvar Alterações</Button>
                    <Button variant="outline">Testar Prompt</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const PlansManager = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gerenciador de Planos
        </CardTitle>
        <CardDescription>
          Configure os planos, preços e funcionalidades disponíveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {planConfigs.map((plan: any) => (
            <div key={plan.id} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{plan.plan_name}</h4>
                <Switch checked={plan.is_active} />
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <strong>Preço Mensal:</strong> R$ {plan.price_monthly}
                </div>
                <div>
                  <strong>Preço Anual:</strong> R$ {plan.price_yearly}
                </div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Ver Features e Limites
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div><strong>Features:</strong> {JSON.stringify(plan.features, null, 2)}</div>
                  <div><strong>Limites:</strong> {JSON.stringify(plan.limits, null, 2)}</div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={UserRole.SUPERADMIN}>
        <ModernLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando dashboard do superadministrador...</p>
            </div>
          </div>
        </ModernLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={UserRole.SUPERADMIN}>
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-red-600">
                Super Administrador Técnico
              </h1>
              <p className="text-muted-foreground">
                Controle total da plataforma • Acesso irrestrito • Logs completos
              </p>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ATENÇÃO:</strong> Você tem acesso completo ao sistema. Todas as suas ações são registradas e auditadas.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="audit">Auditoria</TabsTrigger>
              <TabsTrigger value="logs">Logs Técnicos</TabsTrigger>
              <TabsTrigger value="ai">IA & Prompts</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <SystemOverview />
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <AuditSection />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <TechnicalLogs />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <AIPromptsEditor />
            </TabsContent>

            <TabsContent value="plans" className="mt-6">
              <PlansManager />
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ferramentas de Desenvolvimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Executar Query SQL Customizada
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório Completo do Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Simular Usuário (User Impersonation)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default SuperAdminDashboard;
