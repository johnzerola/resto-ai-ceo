
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, FileText, Share2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Lista de relatórios disponíveis
const availableReports = [
  {
    id: "daily-sales",
    title: "Vendas do Dia",
    description: "Resumo detalhado de vendas, produtos e categorias do dia atual",
    icon: FileBarChart,
    category: "vendas",
    isNew: true,
  },
  {
    id: "weekly-performance",
    title: "Desempenho Semanal",
    description: "Análise comparativa da semana atual vs. anterior",
    icon: FileBarChart,
    category: "vendas",
    isNew: false,
  },
  {
    id: "cmv-analysis",
    title: "Análise de CMV",
    description: "Detalhamento do custo de mercadoria vendida por categoria",
    icon: FileText,
    category: "custos",
    isNew: false,
  },
  {
    id: "top-selling",
    title: "Produtos Mais Vendidos",
    description: "Ranking de produtos por quantidade vendida e receita",
    icon: FileBarChart,
    category: "produtos",
    isNew: false,
  },
  {
    id: "inventory-status",
    title: "Status do Estoque",
    description: "Inventário atual com alertas de itens com estoque baixo",
    icon: FileText,
    category: "estoque",
    isNew: false,
  },
  {
    id: "profit-margin",
    title: "Margem de Lucro",
    description: "Análise da margem de lucro por produto e categoria",
    icon: FileText,
    category: "custos",
    isNew: true,
  },
  {
    id: "customer-metrics",
    title: "Métricas de Clientes",
    description: "Ticket médio, frequência e análise de pedidos",
    icon: FileBarChart,
    category: "clientes",
    isNew: false,
  },
  {
    id: "cash-flow",
    title: "Fluxo de Caixa",
    description: "Receitas e despesas com projeção para o mês",
    icon: FileText,
    category: "financeiro",
    isNew: false,
  },
];

export const QuickReports = () => {
  const [category, setCategory] = useState<string>("todos");
  
  const filteredReports = category === "todos" 
    ? availableReports 
    : availableReports.filter(report => report.category === category);
  
  // Simular geração/download de relatório
  const handleDownloadReport = (reportId: string, reportTitle: string) => {
    toast.info(`Gerando relatório: ${reportTitle}...`, {
      duration: 1500,
    });
    
    // Simular tempo de geração
    setTimeout(() => {
      toast.success(`Relatório "${reportTitle}" gerado com sucesso!`, {
        description: "O download começará automaticamente",
        action: {
          label: "Visualizar",
          onClick: () => toast.info(`Abrindo visualização do relatório ${reportTitle}`),
        },
      });
    }, 1500);
  };
  
  // Simular compartilhamento de relatório
  const handleShareReport = (reportId: string, reportTitle: string) => {
    toast.info(`Compartilhando relatório: ${reportTitle}...`, {
      description: "Selecione as opções de compartilhamento",
      action: {
        label: "Opções",
        onClick: () => toast.info("Abrindo opções de compartilhamento"),
      },
    });
  };
  
  return (
    <Card className="mb-6 border-purple-100">
      <CardHeader className="pb-3 bg-purple-50/50">
        <CardTitle className="text-lg text-purple-700">
          Relatórios Rápidos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="todos" value={category} onValueChange={setCategory}>
          <TabsList className="bg-purple-100 mb-4 flex flex-wrap">
            <TabsTrigger 
              value="todos"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="vendas"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="custos"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Custos
            </TabsTrigger>
            <TabsTrigger 
              value="produtos"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="estoque"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Estoque
            </TabsTrigger>
            <TabsTrigger 
              value="clientes"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="financeiro"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Financeiro
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                className="border border-purple-100 rounded-lg p-4 hover:border-purple-200 transition-all flex"
              >
                <div className="bg-purple-100 rounded-lg p-2 h-10 w-10 flex items-center justify-center mr-3">
                  <report.icon className="h-5 w-5 text-purple-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    {report.isNew && (
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Novo
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      Categoria: <span className="font-medium capitalize">{report.category}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShareReport(report.id, report.title)}
                        title="Compartilhar relatório"
                      >
                        <Share2 className="h-4 w-4 text-purple-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadReport(report.id, report.title)}
                        title="Baixar relatório"
                      >
                        <Download className="h-4 w-4 text-purple-600" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => handleDownloadReport(report.id, report.title)}
                      >
                        Gerar
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredReports.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              Nenhum relatório disponível para esta categoria.
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
