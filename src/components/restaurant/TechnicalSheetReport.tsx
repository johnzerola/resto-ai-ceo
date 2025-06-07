
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Download 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTechnicalSheets } from "@/hooks/useTechnicalSheets";

export function TechnicalSheetReport() {
  const { getAllSheets, getStats } = useTechnicalSheets();
  const [reportData, setReportData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSheets: 0,
    averageFoodCost: 0,
    highFoodCostItems: 0,
    completionRate: 0
  });

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = () => {
    const sheets = getAllSheets();
    const currentStats = getStats();
    setStats(currentStats);

    // Processar dados para gráficos
    const processedData = sheets.map(sheet => {
      const ingredientCost = sheet.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
      const wasteAmount = ingredientCost * (sheet.wastePercentage / 100);
      const totalDirectCost = ingredientCost + wasteAmount + sheet.directOperationalCost + sheet.packagingCost;
      const totalCost = totalDirectCost + sheet.fixedCostAllocation + sheet.indirectCosts;
      const contributionMargin = sheet.currentMenuPrice - totalDirectCost;
      const foodCostPercentage = sheet.currentMenuPrice > 0 ? (ingredientCost / sheet.currentMenuPrice) * 100 : 0;

      return {
        name: sheet.dishName,
        category: sheet.category,
        ingredientCost,
        totalCost,
        menuPrice: sheet.currentMenuPrice,
        contributionMargin,
        foodCostPercentage,
        profitMargin: sheet.currentMenuPrice > 0 ? ((sheet.currentMenuPrice - totalCost) / sheet.currentMenuPrice) * 100 : 0
      };
    });

    setReportData(processedData);
  };

  const getCategoryData = () => {
    const categoryStats = reportData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { 
          count: 0, 
          avgFoodCost: 0, 
          totalRevenue: 0,
          items: []
        };
      }
      acc[item.category].count++;
      acc[item.category].items.push(item);
      acc[item.category].totalRevenue += item.menuPrice;
      return acc;
    }, {} as any);

    return Object.entries(categoryStats).map(([category, data]: [string, any]) => ({
      category,
      count: data.count,
      avgFoodCost: data.items.reduce((sum: number, item: any) => sum + item.foodCostPercentage, 0) / data.count,
      totalRevenue: data.totalRevenue
    }));
  };

  const getTopPerformers = () => {
    return reportData
      .filter(item => item.menuPrice > 0)
      .sort((a, b) => b.contributionMargin - a.contributionMargin)
      .slice(0, 5);
  };

  const getWorstPerformers = () => {
    return reportData
      .filter(item => item.foodCostPercentage > 30)
      .sort((a, b) => b.foodCostPercentage - a.foodCostPercentage)
      .slice(0, 5);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatório de Fichas Técnicas</h2>
          <p className="text-muted-foreground">Análise completa de custos e rentabilidade</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fichas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSheets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Cost Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageFoodCost.toFixed(1)}%</div>
            <Badge variant={stats.averageFoodCost > 30 ? "destructive" : "default"}>
              {stats.averageFoodCost > 30 ? "Acima da meta" : "Dentro da meta"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highFoodCostItems}</div>
            <p className="text-xs text-muted-foreground">Food Cost &gt; 30%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Food Cost por Item */}
        <Card>
          <CardHeader>
            <CardTitle>Food Cost por Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Food Cost']}
                />
                <Bar 
                  dataKey="foodCostPercentage" 
                  fill="#8884d8"
                  name="Food Cost %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Melhores e Piores Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Melhores Margens de Contribuição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopPerformers().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(item.contributionMargin)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.foodCostPercentage.toFixed(1)}% Food Cost
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Itens com Food Cost Elevado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getWorstPerformers().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {item.foodCostPercentage.toFixed(1)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(item.menuPrice)} preço
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
