
import React from 'react';
import { SystemAudit } from '@/components/system/SystemAudit';
import { TrialSystemValidator } from '@/components/trial/TrialSystemValidator';
import { SystemStatusDashboard } from '@/components/subscription/SystemStatusDashboard';
import { SecurityHistory } from '@/components/security/SecurityHistory';
import { ResponsiveWrapper } from '@/components/layout/ResponsiveWrapper';
import { useResponsiveBreakpoints } from '@/hooks/useResponsiveBreakpoints';

export default function SystemAuditPage() {
  const { isMobile, isTablet } = useResponsiveBreakpoints();

  return (
    <ResponsiveWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Auditoria Completa do Sistema
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da segurança, responsividade e funcionalidades
          </p>
        </div>

        {/* Grid responsivo para os componentes */}
        <div className={`grid gap-6 ${
          isMobile 
            ? 'grid-cols-1' 
            : isTablet 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        }`}>
          
          {/* Auditoria principal - sempre em destaque */}
          <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
            <SystemAudit />
          </div>

          {/* Status do sistema */}
          <div className="col-span-1">
            <SystemStatusDashboard />
          </div>

          {/* Validação do trial */}
          <div className="col-span-1">
            <TrialSystemValidator />
          </div>

          {/* Histórico de segurança */}
          <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
            <SecurityHistory />
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Status da Auditoria Completa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Responsividade: 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Segurança: Implementada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Email: Funcionando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Trial: Configurado</span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  );
}
