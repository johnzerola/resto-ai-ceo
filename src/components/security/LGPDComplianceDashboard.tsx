
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lgpdComplianceService, LGPDComplianceCheck, DPOReport, IncidentResponse } from "@/services/LGPDComplianceService";
import { CheckCircle, XCircle, AlertCircle, FileText, Shield, Clock, Download } from "lucide-react";
import { toast } from "sonner";

export function LGPDComplianceDashboard() {
  const [complianceChecks, setComplianceChecks] = useState<LGPDComplianceCheck[]>([]);
  const [dpoReports, setDpoReports] = useState<DPOReport[]>([]);
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = () => {
    setComplianceChecks(lgpdComplianceService.getComplianceChecks());
    setDpoReports(lgpdComplianceService.getDPOReports());
    setIncidents(lgpdComplianceService.getPrivacyIncidents());
  };

  const generateDPOReport = async (type: 'monthly' | 'audit' | 'incident') => {
    try {
      await lgpdComplianceService.generateDPOReport(type);
      loadComplianceData();
    } catch (error) {
      toast.error("Erro ao gerar relatório DPO");
    }
  };

  const exportComplianceReport = () => {
    const report = lgpdComplianceService.generateComplianceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_conformidade_lgpd_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório de conformidade exportado!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <AlertCircle className="h-4 w-4" />;
      case 'non_compliant': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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

  // Estatísticas
  const stats = {
    compliant: complianceChecks.filter(c => c.status === 'compliant').length,
    partial: complianceChecks.filter(c => c.status === 'partial').length,
    nonCompliant: complianceChecks.filter(c => c.status === 'non_compliant').length,
    complianceRate: Math.round((complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100),
    openIncidents: incidents.filter(i => i.status === 'open').length,
    totalIncidents: incidents.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conformidade LGPD</h2>
          <p className="text-muted-foreground">
            Monitore a conformidade com a Lei Geral de Proteção de Dados
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportComplianceReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Estatísticas de Conformidade */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                <p className="text-2xl font-bold">{stats.complianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-2xl font-bold">{stats.compliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Parciais</p>
                <p className="text-2xl font-bold">{stats.partial}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Não Conformes</p>
                <p className="text-2xl font-bold">{stats.nonCompliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Abertos</p>
                <p className="text-2xl font-bold">{stats.openIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações DPO */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do DPO (Data Protection Officer)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => generateDPOReport('monthly')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <FileText className="h-6 w-6 mb-2" />
              Relatório Mensal
            </Button>

            <Button 
              onClick={() => generateDPOReport('audit')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Shield className="h-6 w-6 mb-2" />
              Auditoria LGPD
            </Button>

            <Button 
              onClick={() => generateDPOReport('incident')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <AlertCircle className="h-6 w-6 mb-2" />
              Relatório de Incidentes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Requisitos de Conformidade</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes de Privacidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios DPO</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Status de Conformidade LGPD</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceChecks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requisito</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ação Requerida</TableHead>
                      <TableHead>Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">{check.requirement}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(check.status)}
                            <Badge className={getStatusColor(check.status)}>
                              {check.status === 'compliant' ? 'Conforme' : 
                               check.status === 'partial' ? 'Parcial' : 'Não Conforme'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{check.description}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {check.action_required || 'Nenhuma ação necessária'}
                        </TableCell>
                        <TableCell>{check.deadline || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma verificação de conformidade realizada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incidentes de Privacidade</CardTitle>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data do Relato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium">{incident.incident_type}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{incident.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(incident.reported_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum incidente de privacidade registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios do DPO</CardTitle>
            </CardHeader>
            <CardContent>
              {dpoReports.length > 0 ? (
                <div className="space-y-4">
                  {dpoReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{report.report_type.replace('_', ' ').toUpperCase()}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{report.summary}</p>
                      
                      {report.recommendations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Recomendações:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {report.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {report.next_actions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Próximas Ações:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {report.next_actions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum relatório DPO gerado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
