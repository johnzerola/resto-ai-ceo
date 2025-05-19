
import { useEffect, useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileDown, BookOpen, FileText, HelpCircle, Database, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TypographyH2, TypographyH3, TypographyH4, TypographyP, TypographyList } from "@/components/ui/typography";
import { toast } from "sonner";

// Componentes para as seções da documentação
import { GuiaInicioRapido } from "@/components/documentation/GuiaInicioRapido";
import { ManualUsuario } from "@/components/documentation/ManualUsuario";
import { BackupRecuperacao } from "@/components/documentation/BackupRecuperacao";
import { IntegracaoModulos } from "@/components/documentation/IntegracaoModulos";

const Documentacao = () => {
  const [activeTab, setActiveTab] = useState("inicio-rapido");
  
  // Função para baixar documentação em PDF (simulado)
  const handleDownloadPDF = () => {
    toast.success("Iniciando download da documentação em PDF", {
      description: "O arquivo será salvo na sua pasta de downloads",
    });
    // Aqui implementaria a lógica real de download
  };

  return (
    <Layout title="Documentação do Sistema">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground mt-1">
              Guias e manuais para uso do sistema Resto AI CEO
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Baixar Documentação
          </Button>
        </div>

        <Alert className="bg-blue-50">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Documentação Completa</AlertTitle>
          <AlertDescription>
            Esta seção contém toda a documentação necessária para utilizar o sistema, desde guias rápidos até procedimentos detalhados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="inicio-rapido" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="inicio-rapido" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Guia Rápido
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Manual do Usuário
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Backup e Recuperação
            </TabsTrigger>
            <TabsTrigger value="integracao" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Integração e Segurança
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 bg-white rounded-lg border p-6">
            <TabsContent value="inicio-rapido" className="mt-0">
              <GuiaInicioRapido />
            </TabsContent>

            <TabsContent value="manual" className="mt-0">
              <ManualUsuario />
            </TabsContent>

            <TabsContent value="backup" className="mt-0">
              <BackupRecuperacao />
            </TabsContent>

            <TabsContent value="integracao" className="mt-0">
              <IntegracaoModulos />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Documentacao;
