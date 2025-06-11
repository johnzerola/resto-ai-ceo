
import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { FichaTecnicaForm } from "@/components/restaurant/FichaTecnicaForm";
import { FichaTecnicaList } from "@/components/restaurant/FichaTecnicaList";
import { InsumosManager } from "@/components/restaurant/InsumosManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Plus, 
  FileText, 
  Package, 
  Calculator,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign
} from "lucide-react";

const Cardapio = () => {
  const [activeTab, setActiveTab] = useState("fichas-cadastradas");

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Ficha Técnica</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Sistema de precificação baseado na sua realidade
            </p>
          </div>
        </div>

        {/* Alerta Informativo Principal */}
        <Alert className="border-blue-200 bg-blue-50 p-3">
          <Calculator className="h-4 w-4" />
          <AlertTitle className="text-blue-800 text-xs sm:text-sm">Precificação Profissional</AlertTitle>
          <AlertDescription className="text-blue-700 text-xs">
            Nossa IA calcula o <strong>CMV</strong>, aplica margem personalizada e determina a <strong>viabilidade</strong> do prato.
          </AlertDescription>
        </Alert>

        {/* Tabs de Navegação */}
        <div className="w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
                <TabsTrigger value="fichas-cadastradas" className="flex items-center gap-1 text-xs sm:text-sm">
                  <FileText className="h-3 w-3" />
                  <span className="hidden sm:inline">Fichas</span> Cadastradas
                </TabsTrigger>
                <TabsTrigger value="nova-ficha" className="flex items-center gap-1 text-xs sm:text-sm">
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">Nova</span> Ficha
                </TabsTrigger>
                <TabsTrigger value="insumos" className="flex items-center gap-1 text-xs sm:text-sm">
                  <Package className="h-3 w-3" />
                  Insumos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="fichas-cadastradas" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <h2 className="text-base font-semibold">Fichas Técnicas</h2>
                  <p className="text-xs text-muted-foreground">
                    Visualize e gerencie fichas técnicas
                  </p>
                </div>
                <Button onClick={() => setActiveTab("nova-ficha")} size="sm" className="text-xs py-1 h-8 sm:text-sm w-full sm:w-auto">
                  <Plus className="mr-1 h-3 w-3" />
                  <span>Nova Ficha</span>
                </Button>
              </div>
              <div className="w-full overflow-x-auto">
                <div className="min-w-full w-fit">
                  <FichaTecnicaList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nova-ficha" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <h2 className="text-base font-semibold">Nova Ficha Técnica</h2>
                  <p className="text-xs text-muted-foreground">
                    Preencha os dados do prato
                  </p>
                </div>
              </div>

              {/* Guia Rápido - Versão compacta para mobile */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <Alert className="border-green-200 bg-green-50 p-2">
                  <Target className="h-3 w-3" />
                  <AlertDescription className="text-green-700 text-xs">
                    <strong>1:</strong> Preencha dados básicos do prato
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-orange-200 bg-orange-50 p-2">
                  <Package className="h-3 w-3" />
                  <AlertDescription className="text-orange-700 text-xs">
                    <strong>2:</strong> Adicione ingredientes e quantidades
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-purple-200 bg-purple-50 p-2">
                  <DollarSign className="h-3 w-3" />
                  <AlertDescription className="text-purple-700 text-xs">
                    <strong>3:</strong> Analise cálculos e viabilidade
                  </AlertDescription>
                </Alert>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-full w-fit">
                  <FichaTecnicaForm />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insumos" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <h2 className="text-base font-semibold">Gestão de Insumos</h2>
                  <p className="text-xs text-muted-foreground">
                    Cadastre insumos com preços reais
                  </p>
                </div>
              </div>

              {/* Dica simplificada para mobile */}
              <Alert className="border-yellow-200 bg-yellow-50 p-2">
                <Lightbulb className="h-3 w-3" />
                <AlertDescription className="text-yellow-700 text-xs">
                  Mantenha preços atualizados para cálculos precisos de custos e margens.
                </AlertDescription>
              </Alert>

              <div className="w-full overflow-x-auto">
                <div className="min-w-full w-fit">
                  <InsumosManager />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cards de Orientação com versão simplificada para mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <h3 className="font-medium text-green-800 text-xs sm:text-sm">Status Saudável</h3>
            </div>
            <p className="text-xs text-green-700">
              Margem ≥ 20%. Boa rentabilidade.
            </p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
              <h3 className="font-medium text-yellow-800 text-xs sm:text-sm">Margem Baixa</h3>
            </div>
            <p className="text-xs text-yellow-700">
              0-20%. Otimize custos ou preço.
            </p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg bg-red-50 border-red-200">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              <h3 className="font-medium text-red-800 text-xs sm:text-sm">Prejuízo</h3>
            </div>
            <p className="text-xs text-red-700">
              Margem negativa. Revisar urgente.
            </p>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default Cardapio;
