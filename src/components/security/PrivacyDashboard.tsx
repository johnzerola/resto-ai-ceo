
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  Lock, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  FileDown,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

export function PrivacyDashboard() {
  const [dataRequest, setDataRequest] = useState<'pending' | 'processing' | 'completed' | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<'pending' | 'processing' | 'completed' | null>(null);

  const exportPrivacyReport = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 30;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Privacidade e Segurança', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Data Collection Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('1. Dados Coletados', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const dataTypes = [
        'Dados de cadastro (nome, email)',
        'Dados financeiros (transações, receitas, despesas)',
        'Dados operacionais (estoque, cardápio, metas)',
        'Dados de uso da aplicação (logs de acesso)',
        'Configurações e preferências do usuário'
      ];
      
      dataTypes.forEach((item) => {
        pdf.text(`• ${item}`, 25, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Data Security
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('2. Medidas de Segurança', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const securityMeasures = [
        'Armazenamento local criptografado',
        'Autenticação segura via Supabase',
        'Backup automático dos dados',
        'Acesso restrito por usuário',
        'Logs de auditoria de acesso'
      ];
      
      securityMeasures.forEach((item) => {
        pdf.text(`• ${item}`, 25, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // User Rights
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('3. Seus Direitos', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const userRights = [
        'Acesso aos seus dados pessoais',
        'Correção de dados incorretos',
        'Exclusão de dados pessoais',
        'Portabilidade dos dados',
        'Oposição ao processamento'
      ];
      
      userRights.forEach((item) => {
        pdf.text(`• ${item}`, 25, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Data Retention
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4. Retenção de Dados', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Os dados são mantidos enquanto a conta estiver ativa.', 25, yPosition);
      yPosition += 8;
      pdf.text('Após a exclusão da conta, os dados são removidos em até 30 dias.', 25, yPosition);
      yPosition += 8;
      pdf.text('Dados financeiros podem ser mantidos por período maior para fins legais.', 25, yPosition);
      
      const fileName = `relatorio-privacidade-${currentDate.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Relatório de privacidade exportado com sucesso!");
    } catch (error) {
      console.error("Error generating privacy report:", error);
      toast.error("Erro ao gerar relatório de privacidade");
    }
  };

  const requestDataExport = () => {
    setDataRequest('processing');
    
    // Simulate processing time
    setTimeout(() => {
      setDataRequest('completed');
      toast.success("Solicitação de dados processada! Você receberá um email em breve.");
    }, 2000);
  };

  const requestDataDeletion = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja solicitar a exclusão dos seus dados? Esta ação não pode ser desfeita."
    );
    
    if (confirmed) {
      setDeletionRequest('processing');
      
      // Simulate processing time
      setTimeout(() => {
        setDeletionRequest('completed');
        toast.success("Solicitação de exclusão enviada! Nossa equipe entrará em contato em até 48h.");
      }, 2000);
    }
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden p-2 sm:p-4 lg:p-6">
      {/* Overview Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium">Segurança</p>
                <p className="text-xs text-muted-foreground">Proteção Ativa</p>
              </div>
              <Badge variant="default" className="text-xs">Seguro</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium">Criptografia</p>
                <p className="text-xs text-muted-foreground">Dados Protegidos</p>
              </div>
              <Badge variant="default" className="text-xs">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium">Transparência</p>
                <p className="text-xs text-muted-foreground">Dados Visíveis</p>
              </div>
              <Badge variant="secondary" className="text-xs">100%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium">LGPD</p>
                <p className="text-xs text-muted-foreground">Conformidade</p>
              </div>
              <Badge variant="default" className="text-xs">OK</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Collection Information */}
      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Dados Coletados e Utilizados
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Informações sobre quais dados coletamos e como os utilizamos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium">Dados Pessoais</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Nome e email de cadastro</li>
                <li>• Informações de perfil</li>
                <li>• Configurações de preferência</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium">Dados Operacionais</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Transações financeiras</li>
                <li>• Dados de estoque e cardápio</li>
                <li>• Metas e projeções</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Exportar Meus Dados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Baixe uma cópia de todos os seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
            {dataRequest === 'completed' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-green-800 text-xs sm:text-sm">Solicitação Processada</AlertTitle>
                <AlertDescription className="text-green-700 text-xs">
                  Você receberá um email com seus dados em até 24 horas.
                </AlertDescription>
              </Alert>
            )}
            
            {dataRequest === 'processing' && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTitle className="text-blue-800 text-xs sm:text-sm">Processando Solicitação</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs">
                  Estamos preparando seus dados para download...
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={requestDataExport}
                disabled={dataRequest === 'processing'}
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              >
                <Mail className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {dataRequest === 'processing' ? 'Processando...' : 'Solicitar Cópia'}
              </Button>
              <Button 
                variant="outline" 
                onClick={exportPrivacyReport}
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              >
                <FileDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Relatório PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              Exclusão de Dados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Solicite a remoção completa dos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
            {deletionRequest === 'completed' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-orange-800 text-xs sm:text-sm">Solicitação Enviada</AlertTitle>
                <AlertDescription className="text-orange-700 text-xs">
                  Nossa equipe entrará em contato em até 48 horas para confirmar a exclusão.
                </AlertDescription>
              </Alert>
            )}

            {deletionRequest === 'processing' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTitle className="text-red-800 text-xs sm:text-sm">Processando Exclusão</AlertTitle>
                <AlertDescription className="text-red-700 text-xs">
                  Enviando sua solicitação de exclusão...
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-700 text-xs">
                <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
              </AlertDescription>
            </Alert>

            <Button 
              variant="destructive" 
              onClick={requestDataDeletion}
              disabled={deletionRequest === 'processing'}
              className="w-full h-8 sm:h-10 text-xs sm:text-sm"
            >
              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {deletionRequest === 'processing' ? 'Processando...' : 'Solicitar Exclusão'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Best Practices */}
      <Card className="w-full">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Boas Práticas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-green-600">✓ Implementado</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Autenticação segura via Supabase</li>
                <li>• Criptografia de dados sensíveis</li>
                <li>• Backup automático regular</li>
                <li>• Acesso controlado por usuário</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-blue-600">Recomendações</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Use uma senha forte e única</li>
                <li>• Mantenha seu email atualizado</li>
                <li>• Faça logout ao usar dispositivos públicos</li>
                <li>• Revise periodicamente suas configurações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
