
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { performSystemAudit, AuditResult } from "@/utils/system-audit";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function SystemAuditReport() {
  const audit = performSystemAudit();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Auditoria Completa do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(audit.score)}`}>
                {audit.score}/100
              </div>
              <p className="text-sm text-muted-foreground">Score Geral</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">
                {audit.criticalIssues}
              </div>
              <p className="text-sm text-muted-foreground">Problemas Críticos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {audit.totalIssues}
              </div>
              <p className="text-sm text-muted-foreground">Total de Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {audit.criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {audit.criticalIssues} problema(s) crítico(s) identificado(s) 
            que comprometem a confiabilidade dos dados financeiros.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resultados Detalhados</h3>
        
        {['critical', 'high', 'medium', 'low'].map(severity => {
          const issues = audit.results.filter(r => r.severity === severity);
          if (issues.length === 0) return null;

          return (
            <Card key={severity}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {getSeverityIcon(severity)}
                  Problemas {severity === 'critical' ? 'Críticos' : 
                            severity === 'high' ? 'Altos' :
                            severity === 'medium' ? 'Médios' : 'Baixos'}
                  <Badge className={`${getSeverityColor(severity)} text-white`}>
                    {issues.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-gray-200 pl-4">
                      <div className="font-medium text-sm mb-1">
                        {issue.category}: {issue.issue}
                      </div>
                      <div className="text-xs text-green-700 mb-2">
                        <strong>Recomendação:</strong> {issue.recommendation}
                      </div>
                      <div className="text-xs text-red-600">
                        <strong>Impacto:</strong> {issue.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Ação Prioritário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                URGENTE
              </div>
              <div className="text-sm">
                <div className="font-medium">1. Migrar dados para Supabase</div>
                <div className="text-muted-foreground">
                  Implementar persistência real e backup automático
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                ALTA
              </div>
              <div className="text-sm">
                <div className="font-medium">2. Implementar DRE completo</div>
                <div className="text-muted-foreground">
                  Estrutura contábil padrão com todas as contas
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                MÉDIA
              </div>
              <div className="text-sm">
                <div className="font-medium">3. Controle de estoque real-time</div>
                <div className="text-muted-foreground">
                  Baixa automática e cálculo preciso de CMV
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
