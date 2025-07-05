
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Package, TrendingDown, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface StockData {
  produto: string;
  estoqueInicial: number;
  entradas: number;
  saidas: number;
  estoqueFinal: number;
  cmvReal: number;
  desperdicioPercentual: number;
  categoria: string;
}

interface StockSummary {
  totalEstoqueInicial: number;
  totalEntradas: number;
  totalSaidas: number;
  totalEstoqueFinal: number;
  totalCMV: number;
  mediaDesperdicioPercentual: number;
}

export function CMVStockOverview() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalEstoqueInicial: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    totalEstoqueFinal: 0,
    totalCMV: 0,
    mediaDesperdicioPercentual: 0
  });
  const [alertProducts, setAlertProducts] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = () => {
    setIsLoading(true);
    try {
      // Simular dados de estoque baseados no inventário existente
      const inventoryData = localStorage.getItem('inventoryItems');
      const cashFlowData = localStorage.getItem('cashFlowEntries');
      
      let mockData: StockData[] = [];
      let summary: StockSummary = {
        totalEstoqueInicial: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        totalEstoqueFinal: 0,
        totalCMV: 0,
        mediaDesperdicioPercentual: 0
      };

      if (inventoryData) {
        const inventory = JSON.parse(inventoryData);
        mockData = inventory.map((item: any) => {
          const estoqueInicial = Math.floor(Math.random() * 100) + 50;
          const entradas = Math.floor(Math.random() * 30) + 10;
          const saidas = Math.floor(Math.random() * 40) + 15;
          const estoqueFinal = item.quantity || 0;
          const cmvReal = saidas * (item.costPerUnit || item.cost || 0);
          const desperdicioPercentual = Math.random() * 15; // 0-15%
          
          return {
            produto: item.name,
            estoqueInicial,
            entradas,
            saidas,
            estoqueFinal,
            cmvReal,
            desperdicioPercentual,
            categoria: item.category || 'Geral'
          };
        });
      } else {
        // Dados mock se não houver inventário
        mockData = [
          {
            produto: 'Filé de Frango',
            estoqueInicial: 80,
            entradas: 25,
            saidas: 45,
            estoqueFinal: 60,
            cmvReal: 675.00,
            desperdicioPercentual: 12.5,
            categoria: 'Carnes'
          },
          {
            produto: 'Arroz Branco',
            estoqueInicial: 120,
            entradas: 40,
            saidas: 65,
            estoqueFinal: 95,
            cmvReal: 195.00,
            desperdicioPercentual: 3.2,
            categoria: 'Grãos'
          },
          {
            produto: 'Óleo de Soja',
            estoqueInicial: 30,
            entradas: 15,
            saidas: 20,
            estoqueFinal: 25,
            cmvReal: 140.00,
            desperdicioPercentual: 8.7,
            categoria: 'Óleos'
          },
          {
            produto: 'Tomate',
            estoqueInicial: 50,
            entradas: 20,
            saidas: 35,
            estoqueFinal: 35,
            cmvReal: 245.00,
            desperdicioPercentual: 15.3,
            categoria: 'Hortaliças'
          },
          {
            produto: 'Cebola',
            estoqueInicial: 40,
            entradas: 18,
            saidas: 28,
            estoqueFinal: 30,
            cmvReal: 84.00,
            desperdicioPercentual: 6.8,
            categoria: 'Hortaliças'
          }
        ];
      }

      // Calcular totais
      summary = mockData.reduce((acc, item) => ({
        totalEstoqueInicial: acc.totalEstoqueInicial + item.estoqueInicial,
        totalEntradas: acc.totalEntradas + item.entradas,
        totalSaidas: acc.totalSaidas + item.saidas,
        totalEstoqueFinal: acc.totalEstoqueFinal + item.estoqueFinal,
        totalCMV: acc.totalCMV + item.cmvReal,
        mediaDesperdicioPercentual: acc.mediaDesperdicioPercentual + item.desperdicioPercentual
      }), summary);

      summary.mediaDesperdicioPercentual = summary.mediaDesperdicioPercentual / mockData.length;

      // Identificar produtos com desperdício acima de 10%
      const alerts = mockData.filter(item => item.desperdicioPercentual > 10);
      
      setStockData(mockData);
      setStockSummary(summary);
      setAlertProducts(alerts);

      // Mostrar alertas se necessário
      if (alerts.length > 0) {
        toast.warning(`${alerts.length} produto(s) com desperdício crítico detectado(s)!`);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de estoque:', error);
      toast.error('Erro ao carregar dados de estoque');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Função para determinar a cor baseada no desperdício
  const getWasteColor = (desperdicioPercentual: number) => {
    return desperdicioPercentual > 10 ? "#ef4444" : "#10b981";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Desperdício */}
      {alertProducts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-red-800">
                ⚠️ {alertProducts.length} produto(s) com desperdício crítico (acima de 10%):
              </span>
              <div className="flex flex-wrap gap-2">
                {alertProducts.map((product) => (
                  <Badge key={product.produto} variant="destructive" className="text-xs">
                    {product.produto}: {formatPercentage(product.desperdicioPercentual)}
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Inicial</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockSummary.totalEstoqueInicial}</div>
            <p className="text-xs text-muted-foreground">unidades no início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stockSummary.totalEntradas}</div>
            <p className="text-xs text-muted-foreground">unidades adquiridas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stockSummary.totalSaidas}</div>
            <p className="text-xs text-muted-foreground">unidades consumidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV Real</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stockSummary.totalCMV)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desperdício: {formatPercentage(stockSummary.mediaDesperdicioPercentual)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de CMV por Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            CMV e Desperdício por Produto
          </CardTitle>
          <CardDescription>
            Análise detalhada de custos e desperdícios por produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="produto" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'CMV Real') return [formatCurrency(Number(value)), name];
                      if (name === 'Desperdício %') return [formatPercentage(Number(value)), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="cmvReal" 
                    name="CMV Real"
                    fill="#8884d8"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="desperdicioPercentual" 
                    name="Desperdício %"
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getWasteColor(entry.desperdicioPercentual)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Produto</CardTitle>
          <CardDescription>
            Movimentação completa de estoque e custos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produto</th>
                  <th className="text-right p-2">Est. Inicial</th>
                  <th className="text-right p-2">Entradas</th>
                  <th className="text-right p-2">Saídas</th>
                  <th className="text-right p-2">Est. Final</th>
                  <th className="text-right p-2">CMV Real</th>
                  <th className="text-right p-2">Desperdício</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.produto}</td>
                    <td className="text-right p-2">{item.estoqueInicial}</td>
                    <td className="text-right p-2 text-green-600">+{item.entradas}</td>
                    <td className="text-right p-2 text-red-600">-{item.saidas}</td>
                    <td className="text-right p-2">{item.estoqueFinal}</td>
                    <td className="text-right p-2 font-medium">
                      {formatCurrency(item.cmvReal)}
                    </td>
                    <td className="text-right p-2">
                      <Badge 
                        variant={item.desperdicioPercentual > 10 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {formatPercentage(item.desperdicioPercentual)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
