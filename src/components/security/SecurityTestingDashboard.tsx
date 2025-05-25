
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { securityTestingService, SecurityTest, VulnerabilityReport, PenetrationTestResult } from "@/services/SecurityTestingService";
import { lgpdComplianceService } from "@/services/LGPDComplianceService";
import { backupService } from "@/services/BackupService";
import { Shield, Bug, FileCheck, Download, Play, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function SecurityTestingDashboard() {
  const [securityTests, setSecurityTests] = useState<SecurityTest[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [penetrationResults, setPenetrationResults] = useState<PenetrationTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = () => {
    setSecurityTests(securityTestingService.getSecurityTests());
    setVulnerabilities(securityTestingService.getVulnerabilityReports());
    setPenetrationResults(securityTestingService.getPenetrationResults());
  };

  const runPenetrationTest = async () => {
    setIsRunningTests(true);
    try {
      await securityTestingService.runBasicPenetrationTest();
      loadTestData();
    } catch (error) {
      toast.error("Erro ao executar teste de penetração");
    } finally {
      setIsRunningTests(false);
    }
  };

  const runVulnerabilityAudit = async () => {
    setIsRunningTests(true);
    try {
      await securityTestingService.runVulnerabilityAudit();
      loadTestData();
    } catch (error) {
      toast.error("Erro ao executar auditoria de vulnerabilidades");
    } finally {
      setIsRunningTests(false);
    }
  };

  const validateLogs = async () => {
    setIsRunningTests(true);
    try {
      await securityTestingService.validateLoggingSystem();
      loadTestData();
    } catch (error) {
      toast.error("Erro ao validar sistema de logs");
    } finally {
      setIsRunningTests(false);
    }
  };

  const runComplianceAudit = async () => {
    try {
      await lgpdComplianceService.runComplianceAudit();
      toast.success("Auditoria de conformidade LGPD concluída");
    } catch (error) {
      toast.error("Erro na auditoria de conformidade");
    }
  };

  const createBackup = async () => {
    try {
      await backupService.createManualBackup();
    } catch (error) {
      toast.error("Erro ao criar backup");
    }
  };

  const exportSecurityReport = () => {
    const report = securityTestingService.generateSecurityReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_seguranca_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório de segurança exportado!");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Estatísticas
  const stats = {
    totalTests: securityTests.length,
    passedTests: securityTests.filter(t => t.status === 'passed').length,
    failedTests: securityTests.filter(t => t.status === 'failed').length,
    totalVulnerabilities: vulnerabilities.length,
    criticalVulnerabilities: vulnerabilities.filter(v => v.severity === 'critical').length,
    highVulnerabilities: vulnerabilities.filter(v => v.severity === 'high').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testes de Segurança</h2>
          <p className="text-muted-foreground">
            Execute testes de penetração, auditoria de vulnerabilidades e validação de logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSecurityReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileCheck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Testes</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Testes Aprovados</p>
                <p className="text-2xl font-bold">{stats.passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Testes Falharam</p>
                <p className="text-2xl font-bold">{stats.failedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bug className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                <p className="text-2xl font-bold">{stats.totalVulnerabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold">{stats.criticalVulnerabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Altas</p>
                <p className="text-2xl font-bold">{stats.highVulnerabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={runPenetrationTest} 
              disabled={isRunningTests}
              className="h-20 flex flex-col items-center justify-center"
            >
              {isRunningTests ? <Clock className="h-6 w-6 mb-2" /> : <Shield className="h-6 w-6 mb-2" />}
              Teste de Penetração
            </Button>

            <Button 
              onClick={runVulnerabilityAudit} 
              disabled={isRunningTests}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Bug className="h-6 w-6 mb-2" />
              Auditoria de Vulnerabilidades
            </Button>

            <Button 
              onClick={validateLogs} 
              disabled={isRunningTests}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <FileCheck className="h-6 w-6 mb-2" />
              Validar Sistema de Logs
            </Button>

            <Button 
              onClick={runComplianceAudit}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Shield className="h-6 w-6 mb-2" />
              Auditoria LGPD
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Testes de Segurança</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="penetration">Testes de Penetração</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Testes</CardTitle>
            </CardHeader>
            <CardContent>
              {securityTests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Teste</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.name}</TableCell>
                        <TableCell>{test.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(test.severity)}>
                            {test.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(test.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{test.duration ? `${test.duration}ms` : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum teste de segurança executado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilidades Identificadas</CardTitle>
            </CardHeader>
            <CardContent>
              {vulnerabilities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vulnerabilidade</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Recomendação</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vulnerabilities.map((vuln) => (
                      <TableRow key={vuln.id}>
                        <TableCell className="font-medium">{vuln.vulnerability}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{vuln.description}</TableCell>
                        <TableCell className="max-w-xs truncate">{vuln.recommendation}</TableCell>
                        <TableCell>{new Date(vuln.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma vulnerabilidade identificada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penetration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Testes de Penetração</CardTitle>
            </CardHeader>
            <CardContent>
              {penetrationResults.length > 0 ? (
                <div className="space-y-4">
                  {penetrationResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.test_type}</h4>
                        <Badge className={result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {result.success ? 'Seguro' : 'Vulnerabilidades Encontradas'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Alvo: {result.target} | Data: {new Date(result.timestamp).toLocaleString()}
                      </p>
                      {result.vulnerabilities_found.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Vulnerabilidades encontradas:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {result.vulnerabilities_found.map((vuln, index) => (
                              <li key={index}>{vuln.vulnerability} ({vuln.severity})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum teste de penetração executado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
