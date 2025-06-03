
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Shield,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { duplicateAuditor } from '@/utils/duplicateAuditor';

interface ComplianceMetrics {
  duplicateCount: number;
  designScore: number;
  performanceScore: number;
  securityScore: number;
  overallHealth: number;
}

export const SystemCompliancePanel = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    duplicateCount: 0,
    designScore: 0,
    performanceScore: 0,
    securityScore: 0,
    overallHealth: 0
  });
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);
  const [auditReport, setAuditReport] = useState<any>(null);

  const runComprehensiveAudit = async () => {
    setIsAuditing(true);
    console.log('🚀 INICIANDO AUDITORIA SISTÊMICA COMPLETA');

    try {
      // Executar auditoria completa
      const report = duplicateAuditor.executeFullAudit();
      const designCompliance = duplicateAuditor.validateDesignSystemCompliance();
      
      // Calcular métricas
      const duplicateCount = report.totalDuplicates;
      const designScore = designCompliance.complianceScore;
      const performanceScore = calculatePerformanceScore();
      const securityScore = calculateSecurityScore();
      const overallHealth = (designScore + performanceScore + securityScore) / 3;

      setMetrics({
        duplicateCount,
        designScore,
        performanceScore,
        securityScore,
        overallHealth
      });

      setAuditReport(report);
      setLastAudit(new Date());

      // Auto-limpeza se autorizada
      if (duplicateCount > 0) {
        console.log('🧹 Executando limpeza automatizada...');
        duplicateAuditor.autoCleanDuplicates();
      }

    } catch (error) {
      console.error('❌ Erro na auditoria:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const calculatePerformanceScore = (): number => {
    const loadTime = performance.now();
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Score baseado em performance
    let score = 100;
    if (loadTime > 2000) score -= 30;
    if (loadTime > 5000) score -= 50;
    if (memoryUsage > 50000000) score -= 20; // 50MB
    
    return Math.max(0, score);
  };

  const calculateSecurityScore = (): number => {
    // Verificações básicas de segurança
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasHttps = window.location.protocol === 'https:';
    const hasSecureHeaders = document.querySelector('meta[name="referrer"]');
    
    let score = 0;
    if (hasCSP) score += 30;
    if (hasHttps) score += 40;
    if (hasSecureHeaders) score += 30;
    
    return score;
  };

  const getSeverityColor = (count: number) => {
    if (count === 0) return 'text-green-600 bg-green-50 border-green-200';
    if (count < 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    // Auditoria automática na inicialização
    const timer = setTimeout(() => {
      runComprehensiveAudit();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header de Controle */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-bold text-blue-900">
                  Sistema de Compliance Total
                </CardTitle>
                <p className="text-sm text-blue-700">
                  Auditoria Radical - Zero Tolerância para Duplicações
                </p>
              </div>
            </div>
            <Button
              onClick={runComprehensiveAudit}
              disabled={isAuditing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAuditing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isAuditing ? 'Auditando...' : 'Auditoria Completa'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Duplicações */}
        <Card className={`border-2 ${getSeverityColor(metrics.duplicateCount)}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white">
                {metrics.duplicateCount === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Duplicações</p>
                <p className="text-2xl font-bold">
                  {metrics.duplicateCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design System */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Design System</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.designScore)}`}>
                  {metrics.designScore.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Performance</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.performanceScore)}`}>
                  {metrics.performanceScore.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saúde Geral */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Saúde Geral</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.overallHealth)}`}>
                  {metrics.overallHealth.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress de Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status de Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Design System Compliance</span>
              <span>{metrics.designScore.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.designScore} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Performance Score</span>
              <span>{metrics.performanceScore.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.performanceScore} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Saúde Geral do Sistema</span>
              <span>{metrics.overallHealth.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.overallHealth} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      {metrics.duplicateCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>AÇÃO IMEDIATA NECESSÁRIA:</strong> {metrics.duplicateCount} duplicações críticas detectadas. 
            Sistema automaticamente executou limpeza. Reexecute a auditoria para confirmar correção.
          </AlertDescription>
        </Alert>
      )}

      {metrics.overallHealth >= 95 && metrics.duplicateCount === 0 && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>SISTEMA 100% LIMPO:</strong> Zero duplicações detectadas. Design system totalmente conforme. 
            Performance otimizada. Parabéns pela excelência técnica!
          </AlertDescription>
        </Alert>
      )}

      {/* Relatório Detalhado */}
      {auditReport && lastAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatório de Auditoria</CardTitle>
            <p className="text-sm text-gray-600">
              Última auditoria: {lastAudit.toLocaleString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Componentes Duplicados</span>
                <Badge variant={auditReport.componentDuplicates.length === 0 ? "outline" : "destructive"}>
                  {auditReport.componentDuplicates.length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>CSS Duplicado</span>
                <Badge variant={auditReport.cssDuplicates.length === 0 ? "outline" : "destructive"}>
                  {auditReport.cssDuplicates.length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Rotas Duplicadas</span>
                <Badge variant={auditReport.routeDuplicates.length === 0 ? "outline" : "destructive"}>
                  {auditReport.routeDuplicates.length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Severidade Geral</span>
                <Badge variant={auditReport.severity === 'LOW' ? "outline" : "destructive"}>
                  {auditReport.severity}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
