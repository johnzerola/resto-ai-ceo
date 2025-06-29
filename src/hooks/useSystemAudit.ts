
import { useState, useEffect } from 'react';
import { SystemAuditService, SystemHealthCheck } from '@/services/SystemAuditService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSystemAudit() {
  const [auditResults, setAuditResults] = useState<SystemHealthCheck[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const { currentRestaurant } = useAuth();

  const performAudit = async () => {
    if (!currentRestaurant?.id) {
      toast.error('Restaurante não identificado');
      return;
    }

    setIsAuditing(true);
    
    try {
      const results = await SystemAuditService.performSystemAudit(currentRestaurant.id);
      setAuditResults(results);
      setLastAuditTime(new Date().toISOString());
      
      // Verificar se há erros críticos
      const criticalErrors = results.filter(r => r.status === 'error');
      const warnings = results.filter(r => r.status === 'warning');
      
      if (criticalErrors.length > 0) {
        toast.error(`${criticalErrors.length} erro(s) crítico(s) detectado(s)`);
      } else if (warnings.length > 0) {
        toast.warning(`${warnings.length} aviso(s) detectado(s)`);
      } else {
        toast.success('Sistema auditado com sucesso - tudo funcionando');
      }
    } catch (error) {
      console.error('Erro na auditoria:', error);
      toast.error('Erro ao executar auditoria do sistema');
    } finally {
      setIsAuditing(false);
    }
  };

  // Auditoria automática na inicialização
  useEffect(() => {
    if (currentRestaurant?.id && !lastAuditTime) {
      performAudit();
    }
  }, [currentRestaurant?.id]);

  const getSystemStatus = () => {
    if (auditResults.length === 0) return 'unknown';
    
    const hasErrors = auditResults.some(r => r.status === 'error');
    const hasWarnings = auditResults.some(r => r.status === 'warning');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'healthy';
  };

  const getCriticalIssues = () => {
    return auditResults
      .filter(r => r.status === 'error')
      .map(r => r.message);
  };

  const getWarnings = () => {
    return auditResults
      .filter(r => r.status === 'warning')
      .map(r => r.message);
  };

  return {
    auditResults,
    isAuditing,
    lastAuditTime,
    performAudit,
    getSystemStatus,
    getCriticalIssues,
    getWarnings
  };
}
