
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { PrivacyDashboard } from "@/components/security/PrivacyDashboard";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Shield, Lock, FileText, Activity } from "lucide-react";

const Privacidade = () => {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacidade & Segurança</h1>
              <p className="text-muted-foreground">
                Gerencie seus dados pessoais e monitore a segurança da sua conta
              </p>
            </div>
          </div>

          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Privacidade & LGPD
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy" className="mt-6">
              <PrivacyDashboard />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecurityDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default Privacidade;
