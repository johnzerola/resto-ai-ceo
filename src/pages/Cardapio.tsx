
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
  List,
  Calculator,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const Cardapio = () => {
  const [activeTab, setActiveTab] = useState("nova-ficha");

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ficha Técnica Inteligente</h1>
            <p className="text-muted-foreground">
              Sistema completo de precificação automática e gestão de custos
            </p>
          </div>
        </div>

        {/* Alerta Informativo */}
        <Alert className="border-blue-200 bg-blue-50">
          <Calculator className="h-4 w-4" />
          <AlertTitle className="text-blue-800">Ficha Técnica Automatizada</AlertTitle>
          <AlertDescription className="text-blue-700">
            O sistema calcula automaticamente o <strong>CMV</strong>, aplica margem de segurança, 
            calcula o <strong>preço sugerido</strong> e determina a <strong>viabilidade</strong> do prato. 
            Configure seus insumos e comece a criar fichas técnicas profissionais agora mesmo!
          </AlertDescription>
        </Alert>

        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nova-ficha" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Ficha Técnica
            </TabsTrigger>
            <TabsTrigger value="fichas-cadastradas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fichas Cadastradas
            </TabsTrigger>
            <TabsTrigger value="insumos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gestão de Insumos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nova-ficha" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Criar Nova Ficha Técnica</h2>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados do prato e adicione os ingredientes para calcular automaticamente o custo e preço sugerido
                </p>
              </div>
            </div>
            <FichaTecnicaForm />
          </TabsContent>

          <TabsContent value="fichas-cadastradas" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Fichas Técnicas Cadastradas</h2>
                <p className="text-sm text-muted-foreground">
                  Visualize, edite e gerencie todas as fichas técnicas do seu restaurante
                </p>
              </div>
            </div>
            <FichaTecnicaList />
          </TabsContent>

          <TabsContent value="insumos" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gestão de Insumos</h2>
                <p className="text-sm text-muted-foreground">
                  Cadastre e gerencie todos os ingredientes e insumos utilizados nas suas receitas
                </p>
              </div>
            </div>
            <InsumosManager />
          </TabsContent>
        </Tabs>

        {/* Cards de Ajuda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Status Saudável</h3>
            </div>
            <p className="text-sm text-green-700">
              Margem de lucro ≥ 20%. Prato com boa rentabilidade e viabilidade comercial.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Margem Baixa</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Margem entre 0% e 20%. Considere otimizar ingredientes ou ajustar preço.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Prejuízo</h3>
            </div>
            <p className="text-sm text-red-700">
              Margem negativa. Revisar receita urgentemente ou descartar do cardápio.
            </p>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default Cardapio;
