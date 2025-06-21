
import React from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { SystemHealthDashboard } from '@/components/audit/SystemHealthDashboard';
import { EnhancedSystemStatusWidget } from '@/components/restaurant/EnhancedSystemStatusWidget';
import { DataSyncIndicator } from '@/components/restaurant/DataSyncIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Smartphone, 
  Calculator, 
  Database,
  Users,
  CheckSquare
} from 'lucide-react';

export default function SystemAudit() {
  return (
    <ModernLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Auditoria do Sistema
            </h1>
            <p className="text-muted-foreground">
              Monitoramento completo da saúde e performance do sistema
            </p>
          </div>
          <DataSyncIndicator />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="calculations" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Cálculos
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Banco
            </TabsTrigger>
            <TabsTrigger value="ux" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              UX
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Mobile Otimizado</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Componentes MobileButton e MobileOptimizedLayout implementados</li>
                  <li>• Touch targets otimizados (min 44px)</li>
                  <li>• Scroll suave e responsivo</li>
                  <li>• Fix para iOS Safari webkit</li>
                  <li>• Prevenção de zoom indesejado</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculations" className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🧮 Cálculos Validados</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Função calcular_cmv_inteligente ativa no Supabase</li>
                  <li>• Sincronização entre configurações e módulos</li>
                  <li>• Recálculo automático de CMV e margens</li>
                  <li>• Validação de consistência de dados</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Pendências do Banco</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Tabela unidades_medida precisa de RLS ativado</li>
                  <li>• Considerar criar tabelas contas_a_pagar e contas_a_receber</li>
                  <li>• Otimizar índices para consultas frequentes</li>
                  <li>• Implementar backup automático</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ux" className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">👤 Experiência do Usuário</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Dashboard de validação implementado</li>
                  <li>• Alertas visuais para configurações incompletas</li>
                  <li>• Indicadores de progresso em tempo real</li>
                  <li>• Interface intuitiva para usuários iniciantes</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <EnhancedSystemStatusWidget />
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
