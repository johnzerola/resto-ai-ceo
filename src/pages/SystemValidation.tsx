
import React from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { AdvancedSystemValidator } from '@/components/validation/AdvancedSystemValidator';
import { ProfitabilityAlerts } from '@/components/alerts/ProfitabilityAlerts';
import { FirstUseTutorial } from '@/components/tutorial/FirstUseTutorial';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  GraduationCap,
  CheckSquare
} from 'lucide-react';

export default function SystemValidation() {
  return (
    <ModernLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Validação do Sistema
            </h1>
            <p className="text-muted-foreground">
              Verificações completas para garantir operação segura e lucrativa
            </p>
          </div>
        </div>

        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Validação Avançada
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Lucro
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Tutorial Inicial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="space-y-6">
            <AdvancedSystemValidator />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Alertas de Lucratividade</h2>
                <p className="text-muted-foreground">
                  Monitoramento automático de margens, CMV e possíveis prejuízos ocultos
                </p>
              </div>
              <ProfitabilityAlerts />
            </div>
          </TabsContent>

          <TabsContent value="tutorial" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Tutorial para Iniciantes</h2>
                <p className="text-muted-foreground">
                  Guia passo a passo para configurar e usar o sistema pela primeira vez
                </p>
              </div>
              <FirstUseTutorial />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
