import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, PieChart } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getFinancialData } from "@/services/FinancialDataService";

// Interface para dados de CMV
interface CMVCategory {
  name: string;
  sales: number;
  cost: number;
  cmvPercentage: number;
  color: string;
}

interface CMVData {
  period: string;
  overallCMV: number;
  categories: CMVCategory[];
  benchmarks: {
    industry: number;
    target: number;
    previous: number;
  };
}

export function CMVAnalysis() {
  const [cmvData, setCmvData] = useState<CMVData | null>(null);
  const [selectedView, setSelectedView] = useState("overview");
  
  const viewOptions = [
    { id: "overview", label: "Visão Geral" },
    { id: "categories", label: "Por Categorias" },
    { id: "trends", label: "Tendência Mensal" }
  ];

  useEffect(() => {
    // Carregar dados do CMV
    const loadCMVData = () => {
      // Obter dados financeiros atualizados
      const financialData = getFinancialData();
      
      // Gerar dados de CMV com base nos dados financeiros
      const data = generateCMVData(financialData);
      setCmvData(data);
    };

    // Carregar dados iniciais
    loadCMVData();
    
    // Adicionar listener para atualizações nos dados financeiros
    const handleFinancialDataUpdate = () => {
      loadCMVData();
    };
    
    window.addEventListener("financialDataUpdated", handleFinancialDataUpdate);
    
    return () => {
      window.removeEventListener("financialDataUpdated", handleFinancialDataUpdate);
    };
  }, []);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para determinar cor baseada no valor do CMV
  const getCMVStatusColor = (cmvPercentage: number) => {
    if (cmvPercentage <= 28) return "text-green-600";
    if (cmvPercentage <= 32) return "text-yellow-600";
    return "text-red-600";
  };

  if (!cmvData) {
    return <div className="flex justify-center items-center h-64">Carregando dados...</div>;
  }

  // Dados para o gráfico de tendência mensal
  const trendData = [
    { month: "Jan", cmv: 33.2 },
    { month: "Fev", cmv: 32.8 },
    { month: "Mar", cmv: 31.5 },
    { month: "Abr", cmv: 30.9 },
    { month: "Mai", cmv: 30.3 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione uma visualização" />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {selectedView === "overview" && (
        <div className="space-y-6">
          {/* CMV Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">CMV Atual</CardTitle>
                <CardDescription>Maio 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getCMVStatusColor(cmvData.overallCMV)}`}>
                    {cmvData.overallCMV.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cmvData.overallCMV <= cmvData.benchmarks.target
                      ? "Abaixo da meta estabelecida"
                      : "Acima da meta estabelecida"}
                  </p>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Meta</p>
                    <p className="font-medium">{cmvData.benchmarks.target}%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Média do Setor</p>
                    <p className="font-medium">{cmvData.benchmarks.industry}%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Mês Anterior</p>
                    <p className="font-medium">{cmvData.benchmarks.previous}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Análise por Categoria</CardTitle>
                <CardDescription>CMV por tipo de produto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cmvData.categories.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className={`font-medium ${getCMVStatusColor(category.cmvPercentage)}`}>
                          {category.cmvPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, category.cmvPercentage * 2)}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações para Redução de CMV</CardTitle>
              <CardDescription>Sugestões automáticas baseadas em seus dados</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>A categoria <strong>Bebidas</strong> está com CMV acima da meta. Revise os preços de venda ou negocie melhores condições com fornecedores.</li>
                <li>Existem <strong>3 itens</strong> no cardápio com CMV acima de 40%. Considere ajustar porções ou revisar receitas.</li>
                <li>O desperdício estimado está impactando em aproximadamente <strong>2.5%</strong> no CMV total. Implemente controles mais rígidos na cozinha.</li>
                <li>Registros incorretos de estoque podem estar causando distorções no cálculo do CMV. Reforce os procedimentos de entrada e saída de mercadorias.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === "categories" && (
        <div className="space-y-6">
          {/* Tabela detalhada por categoria */}
          <Card>
            <CardHeader>
              <CardTitle>CMV Detalhado por Categoria</CardTitle>
              <CardDescription>Análise de Custo vs. Venda</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Categoria</th>
                      <th className="text-right py-3 px-4">Vendas (R$)</th>
                      <th className="text-right py-3 px-4">Custo (R$)</th>
                      <th className="text-right py-3 px-4">CMV (%)</th>
                      <th className="text-right py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmvData.categories.map((category) => (
                      <tr key={category.name} className="border-b">
                        <td className="py-3 px-4">{category.name}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(category.sales)}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(category.cost)}</td>
                        <td className={`text-right py-3 px-4 font-medium ${getCMVStatusColor(category.cmvPercentage)}`}>
                          {category.cmvPercentage.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs 
                            ${category.cmvPercentage <= 28 ? 'bg-green-100 text-green-800' : 
                              category.cmvPercentage <= 32 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {category.cmvPercentage <= 28 ? 'Ótimo' : 
                             category.cmvPercentage <= 32 ? 'Aceitável' : 
                             'Alto'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-muted/50">
                      <td className="py-3 px-4">TOTAL / MÉDIA</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(cmvData.categories.reduce((sum, cat) => sum + cat.sales, 0))}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(cmvData.categories.reduce((sum, cat) => sum + cat.cost, 0))}
                      </td>
                      <td className={`text-right py-3 px-4 ${getCMVStatusColor(cmvData.overallCMV)}`}>
                        {cmvData.overallCMV.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === "trends" && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do CMV</CardTitle>
            <CardDescription>Tendência dos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[25, 35]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar 
                    dataKey="cmv" 
                    name="CMV %" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                  />
                  {/* Reference Line for Target */}
                  <svg>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                              markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="green"/>
                      </marker>
                    </defs>
                    <line x1="0%" y1="62%" x2="100%" y2="62%" stroke="green" 
                          strokeWidth="2" strokeDasharray="5,5" />
                    <text x="95%" y="60%" fill="green" fontSize="12">Meta: 30%</text>
                  </svg>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>A tendência mostra uma redução gradual no CMV ao longo dos últimos meses, indicando uma melhoria na gestão de custos.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Função para gerar dados de CMV com base nos dados financeiros
function generateCMVData(financialData: any): CMVData {
  // Usar categorias de CMV dos dados financeiros se disponíveis
  const cmvCategories = financialData?.cmvCategories?.length 
    ? financialData.cmvCategories
    : [
        {
          name: "Pratos Principais",
          sales: 85000,
          cost: 25500,
          cmvPercentage: 30.0,
          color: "#4f46e5"
        },
        {
          name: "Entradas",
          sales: 28000,
          cost: 7280,
          cmvPercentage: 26.0,
          color: "#16a34a"
        },
        {
          name: "Sobremesas",
          sales: 18000,
          cost: 4680,
          cmvPercentage: 26.0,
          color: "#ea580c"
        },
        {
          name: "Bebidas Alcoólicas",
          sales: 35000,
          cost: 12600,
          cmvPercentage: 36.0,
          color: "#dc2626"
        },
        {
          name: "Bebidas Não Alcoólicas",
          sales: 14000,
          cost: 3360,
          cmvPercentage: 24.0,
          color: "#0ea5e9"
        }
      ];

  // Calcular CMV geral
  let totalSales = 0;
  let totalCosts = 0;
  
  cmvCategories.forEach(category => {
    totalSales += category.sales;
    totalCosts += category.cost;
  });
  
  const overallCMV = totalSales > 0 ? (totalCosts / totalSales * 100) : 0;
  
  return {
    period: "Maio 2025",
    overallCMV,
    categories: cmvCategories,
    benchmarks: {
      industry: 32.0,
      target: 30.0,
      previous: 30.9
    }
  };
}
