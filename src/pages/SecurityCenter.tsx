
import { Layout } from "@/components/restaurant/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { SecurityTestingDashboard } from "@/components/security/SecurityTestingDashboard";
import { LGPDComplianceDashboard } from "@/components/security/LGPDComplianceDashboard";
import { BackupDashboard } from "@/components/security/BackupDashboard";
import { Shield, FileCheck, HardDrive, Scale } from "lucide-react";

const SecurityCenter = () => {
  return (
    <ProtectedRoute requiredRole={UserRole.MANAGER}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Centro de Segurança</h1>
              <p className="text-muted-foreground">
                Testes de segurança, conformidade LGPD e backup automatizado
              </p>
            </div>
          </div>

          <Tabs defaultValue="security-tests" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security-tests" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Testes de Segurança
              </TabsTrigger>
              <TabsTrigger value="lgpd-compliance" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Conformidade LGPD
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="documentation" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Documentação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="security-tests" className="mt-6">
              <SecurityTestingDashboard />
            </TabsContent>

            <TabsContent value="lgpd-compliance" className="mt-6">
              <LGPDComplianceDashboard />
            </TabsContent>

            <TabsContent value="backup" className="mt-6">
              <BackupDashboard />
            </TabsContent>

            <TabsContent value="documentation" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Política de Privacidade</h3>
                    <p className="text-muted-foreground mb-4">
                      Documento detalhando como os dados pessoais são coletados, processados e protegidos.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Status:</strong> Implementada ✓</p>
                      <p><strong>Última atualização:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>Localização:</strong> /privacidade</p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Termos de Uso</h3>
                    <p className="text-muted-foreground mb-4">
                      Condições de uso do sistema e responsabilidades dos usuários.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Status:</strong> Em desenvolvimento</p>
                      <p><strong>Previsão:</strong> 15 dias</p>
                      <p><strong>Responsável:</strong> Equipe Jurídica</p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Manual do DPO</h3>
                    <p className="text-muted-foreground mb-4">
                      Procedimentos e responsabilidades do Data Protection Officer.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Status:</strong> Implementado ✓</p>
                      <p><strong>Funcionalidades:</strong> Relatórios automáticos</p>
                      <p><strong>Frequência:</strong> Mensal</p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Procedimentos de Resposta</h3>
                    <p className="text-muted-foreground mb-4">
                      Protocolos para resposta a incidentes de segurança e privacidade.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Status:</strong> Implementado ✓</p>
                      <p><strong>Tempo de resposta:</strong> 72h para ANPD</p>
                      <p><strong>Notificação:</strong> Automática</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-2 text-blue-800">Próximos Passos</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Finalizar Termos de Uso</li>
                    <li>• Registrar como Controlador de Dados na ANPD</li>
                    <li>• Implementar certificado SSL em produção</li>
                    <li>• Configurar monitoramento de uptime 24/7</li>
                    <li>• Estabelecer contratos com processadores de dados</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SecurityCenter;
