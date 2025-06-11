
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
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6 bg-background min-h-screen max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight truncate">Ficha Técnica</h1>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">
              Sistema de precificação baseado na sua realidade
            </p>
          </div>
        </div>

        {/* Alerta Informativo Principal */}
        <Alert className="border-blue-200 bg-blue-50 p-2 sm:p-3">
          <Calculator className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <AlertTitle className="text-blue-800 text-xs sm:text-sm">Precificação Profissional</AlertTitle>
          <AlertDescription className="text-blue-700 text-xs">
            Nossa IA calcula o <strong>CMV</strong>, aplica margem personalizada e determina a <strong>viabilidade</strong> do prato.
          </AlertDescription>
        </Alert>

        {/* Tabs de Navegação */}
        <div className="w-full min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 min-w-[280px] h-8 sm:h-10">
                <TabsTrigger value="fichas-cadastradas" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Fichas</span>
                </TabsTrigger>
                <TabsTrigger value="nova-ficha" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                  <Plus className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Nova</span>
                </TabsTrigger>
                <TabsTrigger value="insumos" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                  <Package className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Insumos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="fichas-cadastradas" className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold truncate">Fichas Técnicas</h2>
                  <p className="text-xs text-muted-foreground truncate">
                    Visualize e gerencie fichas técnicas
                  </p>
                </div>
                <Button onClick={() => setActiveTab("nova-ficha")} size="sm" className="text-xs h-7 sm:h-8 whitespace-nowrap">
                  <Plus className="mr-1 h-3 w-3" />
                  <span>Nova Ficha</span>
                </Button>
              </div>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[280px] w-full">
                  <FichaTecnicaList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nova-ficha" className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold truncate">Nova Ficha Técnica</h2>
                  <p className="text-xs text-muted-foreground truncate">
                    Preencha os dados do prato
                  </p>
                </div>
              </div>

              {/* Guia Rápido - Versão compacta para mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <Alert className="border-green-200 bg-green-50 p-2">
                  <Target className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-green-700 text-xs">
                    <strong>1:</strong> Preencha dados básicos
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-orange-200 bg-orange-50 p-2">
                  <Package className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-orange-700 text-xs">
                    <strong>2:</strong> Adicione ingredientes
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-purple-200 bg-purple-50 p-2">
                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-purple-700 text-xs">
                    <strong>3:</strong> Analise cálculos
                  </AlertDescription>
                </Alert>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[280px] w-full">
                  <FichaTecnicaForm />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insumos" className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold truncate">Gestão de Insumos</h2>
                  <p className="text-xs text-muted-foreground truncate">
                    Cadastre insumos com preços reais
                  </p>
                </div>
              </div>

              {/* Dica simplificada para mobile */}
              <Alert className="border-yellow-200 bg-yellow-50 p-2">
                <Lightbulb className="h-3 w-3 flex-shrink-0" />
                <AlertDescription className="text-yellow-700 text-xs">
                  Mantenha preços atualizados para cálculos precisos.
                </AlertDescription>
              </Alert>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[280px] w-full">
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
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <h3 className="font-medium text-green-800 text-xs sm:text-sm truncate">Status Saudável</h3>
            </div>
            <p className="text-xs text-green-700">
              Margem ≥ 20%. Boa rentabilidade.
            </p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
              <h3 className="font-medium text-yellow-800 text-xs sm:text-sm truncate">Margem Baixa</h3>
            </div>
            <p className="text-xs text-yellow-700">
              0-20%. Otimize custos ou preço.
            </p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg bg-red-50 border-red-200">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
              <h3 className="font-medium text-red-800 text-xs sm:text-sm truncate">Prejuízo</h3>
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
