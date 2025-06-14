
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { securityTestingService, SecurityTest, VulnerabilityReport } from '@/services/SecurityTestingService';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Download,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function PenetrationTestingDashboard() {
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<SecurityTest | null>(null);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = () => {
    setTests(securityTestingService.getSecurityTests());
    setVulnerabilities(securityTestingService.getVulnerabilityReports());
  };

  const runPenetrationTest = async () => {
    setIsRunning(true);
    try {
      await securityTestingService.runBasicPenetrationTest();
      loadTestData();
      toast.success("Teste de penetração concluído!");
    } catch (error) {
      toast.error("Erro ao executar teste de penetração");
    } finally {
      setIsRunning(false);
    }
  };

  const runVulnerabilityAudit = async () => {
    setIsRunning(true);
    try {
      await securityTestingService.runVulnerabilityAudit();
      loadTestData();
      toast.success("Auditoria de vulnerabilidades concluída!");
    } catch (error) {
      toast.error("Erro ao executar auditoria");
    } finally {
      setIsRunning(false);
    }
  };

  const validateLogs = async () => {
    setIsRunning(true);
    try {
      const result = await securityTestingService.validateLoggingSystem();
      setTests(prev => [...prev, result]);
      toast.success("Validação de logs concluída!");
    } catch (error) {
      toast.error("Erro ao validar sistema de logs");
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const report = securityTestingService.generateSecurityReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header e estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Testes Executados</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Testes Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vulns. Críticas</p>
                <p className="text-2xl font-bold text-red-600">{criticalVulns}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vulns. Altas</p>
                <p className="text-2xl font-bold text-orange-600">{highVulns}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Testes de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runPenetrationTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Teste de Penetração
            </Button>
            
            <Button 
              onClick={runVulnerabilityAudit} 
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Auditoria de Vulnerabilidades
            </Button>
            
            <Button 
              onClick={validateLogs} 
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Validar Logs
            </Button>
            
            <Button 
              onClick={downloadReport} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Relatório
            </Button>
          </div>
          
          {isRunning && (
            <Alert>
              <Zap className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                Executando testes de segurança... Isso pode levar alguns minutos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de testes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tests.map((test) => (
                <div 
                  key={test.id} 
                  className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(test.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(test.severity)}>
                    {test.severity}
                  </Badge>
                </div>
              ))}
              
              {tests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum teste executado ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilidades Encontradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="p-3 border rounded">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{vuln.vulnerability}</h4>
                    <Badge className={getSeverityColor(vuln.severity)}>
                      {vuln.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {vuln.description}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    Recomendação: {vuln.recommendation}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {vuln.affected_components.map((component, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {vulnerabilities.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma vulnerabilidade encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do teste selecionado */}
      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(selectedTest.status)}
              Detalhes do Teste: {selectedTest.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{selectedTest.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{selectedTest.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Severidade</p>
                <Badge className={getSeverityColor(selectedTest.severity)}>
                  {selectedTest.severity}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">
                  {selectedTest.duration ? `${selectedTest.duration}ms` : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Descrição</p>
              <p className="text-sm">{selectedTest.description}</p>
            </div>
            
            {selectedTest.result && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Resultado</p>
                <p className="text-sm">{selectedTest.result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
