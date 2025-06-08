
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
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign
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
              Sistema completo de precificação automática e gestão de custos baseado na sua realidade
            </p>
          </div>
        </div>

        {/* Alerta Informativo Principal */}
        <Alert className="border-blue-200 bg-blue-50">
          <Calculator className="h-4 w-4" />
          <AlertTitle className="text-blue-800">Sistema de Precificação Profissional</AlertTitle>
          <AlertDescription className="text-blue-700">
            Nossa IA calcula automaticamente o <strong>CMV</strong>, aplica margem de segurança personalizada, 
            calcula o <strong>preço sugerido</strong> e determina a <strong>viabilidade</strong> do prato baseado 
            nas configurações do SEU restaurante. Cada negócio tem sua realidade!
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

          <TabsContent value="nova-ficha" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Criar Nova Ficha Técnica</h2>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados do prato conforme a realidade do seu restaurante
                </p>
              </div>
            </div>

            {/* Guia Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Alert className="border-green-200 bg-green-50">
                <Target className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  <strong>Passo 1:</strong> Preencha os dados básicos do prato (nome, categoria, rendimento)
                </AlertDescription>
              </Alert>
              
              <Alert className="border-orange-200 bg-orange-50">
                <Package className="h-4 w-4" />
                <AlertDescription className="text-orange-700">
                  <strong>Passo 2:</strong> Adicione ingredientes e suas quantidades exatas
                </AlertDescription>
              </Alert>
              
              <Alert className="border-purple-200 bg-purple-50">
                <DollarSign className="h-4 w-4" />
                <AlertDescription className="text-purple-700">
                  <strong>Passo 3:</strong> Analise os cálculos automáticos e viabilidade
                </AlertDescription>
              </Alert>
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
                  Cadastre os insumos com os preços que você realmente paga - base para cálculos precisos
                </p>
              </div>
            </div>

            {/* Dica sobre Insumos */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className="text-yellow-800">Dica Importante</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Mantenha os preços dos insumos sempre atualizados conforme suas compras reais. 
                Isso garante cálculos precisos de custos e margens. Cada fornecedor tem preços diferentes!
              </AlertDescription>
            </Alert>

            <InsumosManager />
          </TabsContent>
        </Tabs>

        {/* Cards de Orientação sobre Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Status Saudável</h3>
            </div>
            <p className="text-sm text-green-700">
              Margem de lucro ≥ 20%. Prato com boa rentabilidade e viabilidade comercial.
              Continue assim!
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Margem Baixa</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Margem entre 0% e 20%. Considere otimizar ingredientes, revisar fornecedores 
              ou ajustar preço de venda.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Prejuízo</h3>
            </div>
            <p className="text-sm text-red-700">
              Margem negativa. Revisar receita urgentemente, trocar ingredientes por mais 
              baratos ou descartar do cardápio.
            </p>
          </div>
        </div>

        {/* Dicas Finais */}
        <Alert className="border-indigo-200 bg-indigo-50">
          <Calculator className="h-4 w-4" />
          <AlertTitle className="text-indigo-800">Sistema Personalizado</AlertTitle>
          <AlertDescription className="text-indigo-700">
            Todos os cálculos são baseados nas <strong>configurações do seu restaurante</strong> na aba /configurações. 
            Markup, despesas fixas, impostos - tudo conforme sua realidade específica. 
            Não trabalhamos com valores fixos!
          </AlertDescription>
        </Alert>
      </div>
    </ModernLayout>
  );
};

export default Cardapio;
