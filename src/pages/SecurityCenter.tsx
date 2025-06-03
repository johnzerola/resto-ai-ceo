
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { MonitoringDashboard } from "@/components/security/MonitoringDashboard";
import { BackupDashboard } from "@/components/security/BackupDashboard";
import { SecurityTestingDashboard } from "@/components/security/SecurityTestingDashboard";
import { LGPDComplianceDashboard } from "@/components/security/LGPDComplianceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, HardDrive, Bug, FileText } from "lucide-react";

const SecurityCenter = () => {
  return (
    <ProtectedRoute requiredRole={UserRole.MANAGER}>
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Centro de Segurança</h1>
              <p className="text-muted-foreground">
                Monitore e gerencie todos os aspectos de segurança do seu restaurante
              </p>
            </div>
          </div>

          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Monitoramento
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Testes
              </TabsTrigger>
              <TabsTrigger value="lgpd" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                LGPD
              </TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="mt-6">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="monitoring" className="mt-6">
              <MonitoringDashboard />
            </TabsContent>

            <TabsContent value="backup" className="mt-6">
              <BackupDashboard />
            </TabsContent>

            <TabsContent value="testing" className="mt-6">
              <SecurityTestingDashboard />
            </TabsContent>

            <TabsContent value="lgpd" className="mt-6">
              <LGPDComplianceDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default SecurityCenter;
