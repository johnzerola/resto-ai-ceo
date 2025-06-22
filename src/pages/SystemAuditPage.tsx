
import React from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { ComprehensiveSystemAudit } from '@/components/audit/ComprehensiveSystemAudit';
import { TechnicalQuestionsAudit } from '@/components/audit/TechnicalQuestionsAudit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Brain, CheckSquare } from 'lucide-react';

export default function SystemAuditPage() {
  return (
    <ModernLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Auditoria Técnica Completa
            </h1>
            <p className="text-muted-foreground">
              Validação 100% do sistema por especialista Harvard + Engenharia de Software
            </p>
          </div>
        </div>

        <Tabs defaultValue="comprehensive" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Auditoria Completa
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Análise Técnica Especializada
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprehensive" className="space-y-6">
            <ComprehensiveSystemAudit />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <TechnicalQuestionsAudit />
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
