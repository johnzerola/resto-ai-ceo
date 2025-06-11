
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const restaurantName = currentRestaurant?.name || "Meu Restaurante";
      let yPosition = 30;
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("Relatório de Dados Pessoais", pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Empresa: ${restaurantName}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      // Linha separadora
      yPosition += 15;
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 20;
      
      // Resumo executivo
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("Resumo Executivo", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text("Este relatório contém informações detalhadas sobre os dados pessoais", 20, yPosition);
      yPosition += 8;
      doc.text("armazenados e processados pela plataforma RestaurIA CEO.", 20, yPosition);
      yPosition += 20;
      
      // Seção de dados do usuário
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("1. Dados do Usuário", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const userData = [
        "• Email do usuário registrado na plataforma",
        "• Nome completo do responsável pela conta",
        "• Data de cadastro e criação da conta",
        "• Último acesso registrado no sistema",
        "• Preferências de configuração de perfil",
        "• Histórico de atividades na plataforma"
      ];
      
      userData.forEach(item => {
        doc.text(item, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
      
      // Seção de dados do restaurante
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("2. Dados do Estabelecimento", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const restaurantData = [
        "• Nome e identificação do estabelecimento",
        "• Configurações financeiras e parâmetros de gestão",
        "• Dados de estoque e inventário cadastrado",
        "• Histórico de transações financeiras",
        "• Metas e objetivos de negócio definidos",
        "• Fichas técnicas e receitas cadastradas"
      ];
      
      restaurantData.forEach(item => {
        doc.text(item, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
      
      // Seção de cookies e rastreamento
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("3. Cookies e Dados de Navegação", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const cookieData = [
        "• Cookies de sessão para autenticação",
        "• Preferências de tema e interface",
        "• Dados de navegação e uso da plataforma",
        "• Configurações de dashboard personalizadas",
        "• Histórico de páginas visitadas",
        "• Tempo de permanência em cada seção"
      ];
      
      cookieData.forEach(item => {
        doc.text(item, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 15;
      
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Seção de finalidades
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("4. Finalidades do Processamento", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const purposes = [
        "• Prestação dos serviços de gestão restaurante",
        "• Autenticação e controle de acesso",
        "• Análise de performance e relatórios",
        "• Melhoria da experiência do usuário",
        "• Suporte técnico e atendimento",
        "• Cumprimento de obrigações legais"
      ];
      
      purposes.forEach(item => {
        doc.text(item, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 15;
      
      // Seção de direitos do titular
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("5. Seus Direitos (LGPD)", 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const rights = [
        "• Confirmação da existência de tratamento",
        "• Acesso aos dados pessoais",
        "• Correção de dados incompletos ou inexatos",
        "• Anonimização ou eliminação de dados",
        "• Portabilidade dos dados",
        "• Revogação do consentimento"
      ];
      
      rights.forEach(item => {
        doc.text(item, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 20;
      
      // Informações de contato
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Informações de Contato:", 20, yPosition);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Para exercer seus direitos ou esclarecer dúvidas:", 20, yPosition);
      yPosition += 8;
      doc.text("• Acesse a seção 'Privacidade e Segurança' na plataforma", 20, yPosition);
      yPosition += 8;
      doc.text("• Utilize os formulários de solicitação disponíveis", 20, yPosition);
      yPosition += 8;
      doc.text("• Respostas em até 15 dias úteis conforme LGPD", 20, yPosition);
      
      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${totalPages} - ${restaurantName} - RestaurIA Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        doc.text(
          `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
      
      // Reset color
      doc.setTextColor(0, 0, 0);
      
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
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Privacidade & Segurança</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Gerencie seus dados pessoais e monitore a segurança da sua conta
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                Exportar Dados Pessoais
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Baixe um relatório completo com todos os seus dados armazenados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generatePDF} className="flex items-center gap-2 text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                Gerar Relatório PDF
              </Button>
            </CardContent>
          </Card>

          <div className="w-full overflow-hidden">
            <Tabs defaultValue="privacy" className="w-full">
              <div className="w-full overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto sm:mx-0">
                  <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Privacidade &</span> LGPD
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                    Segurança
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="privacy" className="mt-4 sm:mt-6">
                <div className="w-full overflow-hidden">
                  <PrivacyDashboard />
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-4 sm:mt-6">
                <div className="w-full overflow-hidden">
                  <SecurityDashboard />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
};

export default Privacidade;
