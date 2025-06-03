
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { PrivacyDashboard } from "@/components/security/PrivacyDashboard";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Shield, FileText, Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jsPDF from "jspdf";

const Privacidade = () => {
  const { currentRestaurant } = useAuth();

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const restaurantName = currentRestaurant?.name || "Meu Restaurante";
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.text("Relatório de Dados Pessoais", 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Empresa: ${restaurantName}`, 20, 50);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
      
      // Seção de dados do usuário
      doc.setFontSize(16);
      doc.text("Dados do Usuário", 20, 80);
      doc.setFontSize(10);
      doc.text("- Email do usuário", 25, 95);
      doc.text("- Nome completo", 25, 105);
      doc.text("- Data de cadastro", 25, 115);
      doc.text("- Último acesso", 25, 125);
      
      // Seção de dados do restaurante
      doc.setFontSize(16);
      doc.text("Dados do Restaurante", 20, 145);
      doc.setFontSize(10);
      doc.text("- Nome do estabelecimento", 25, 160);
      doc.text("- Configurações financeiras", 25, 170);
      doc.text("- Dados de estoque", 25, 180);
      doc.text("- Histórico de transações", 25, 190);
      
      // Seção de cookies e tracking
      doc.setFontSize(16);
      doc.text("Cookies e Rastreamento", 20, 210);
      doc.setFontSize(10);
      doc.text("- Cookies de sessão", 25, 225);
      doc.text("- Preferências de tema", 25, 235);
      doc.text("- Dados de navegação", 25, 245);
      
      // Rodapé
      doc.setFontSize(8);
      doc.text(`${restaurantName} - RestaurIA Platform`, 20, 280);
      doc.text("Este relatório contém informações sobre os dados pessoais armazenados em nossa plataforma.", 20, 290);
      
      doc.save(`dados-pessoais-${restaurantName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o relatório PDF");
    }
  };

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Dados Pessoais
              </CardTitle>
              <CardDescription>
                Baixe um relatório completo com todos os seus dados armazenados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generatePDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Gerar Relatório PDF
              </Button>
            </CardContent>
          </Card>

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
