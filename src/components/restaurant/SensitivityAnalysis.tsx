
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface SensitivityAnalysisProps {
  basePrice: number;
  baseCost: number;
  baseRevenue: number;
  baseProfit: number;
  baseMargin: number;
  monthlySales: number;
}

export function SensitivityAnalysis({
  basePrice,
  baseCost,
  baseRevenue,
  baseProfit,
  baseMargin,
  monthlySales
}: SensitivityAnalysisProps) {
  
  const scenarios = [
    {
      name: "Pessimista",
      costVariation: 20,
      demandVariation: -15,
      color: "destructive"
    },
    {
      name: "Realista",
      costVariation: 0,
      demandVariation: 0,
      color: "secondary"
    },
    {
      name: "Otimista",
      costVariation: -10,
      demandVariation: 10,
      color: "default"
    }
  ];

  const calculateScenario = (costVar: number, demandVar: number) => {
    const adjustedCost = baseCost * (1 + costVar / 100);
    const adjustedSales = monthlySales * (1 + demandVar / 100);
    const adjustedRevenue = basePrice * adjustedSales;
    const totalCosts = adjustedCost * adjustedSales;
    const profit = adjustedRevenue - totalCosts;
    const margin = adjustedRevenue > 0 ? (profit / adjustedRevenue) * 100 : 0;
    
    return {
      revenue: adjustedRevenue,
      costs: totalCosts,
      profit,
      margin,
      sales: adjustedSales
    };
  };

  const getVariationIcon = (value: number, baseValue: number) => {
    if (value > baseValue) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < baseValue) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Análise de Sensibilidade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Veja como diferentes cenários afetam sua rentabilidade
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cenário</TableHead>
              <TableHead>Vendas Mensais</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Custos</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map((scenario) => {
              const result = calculateScenario(scenario.costVariation, scenario.demandVariation);
              return (
                <TableRow key={scenario.name}>
                  <TableCell>
                    <Badge variant={scenario.color as any}>
                      {scenario.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    {Math.round(result.sales)}
                    {getVariationIcon(result.sales, monthlySales)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    {formatCurrency(result.revenue)}
                    {getVariationIcon(result.revenue, baseRevenue)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    {formatCurrency(result.costs)}
                    {getVariationIcon(result.costs, baseCost * monthlySales)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <span className={result.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(result.profit)}
                    </span>
                    {getVariationIcon(result.profit, baseProfit)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <span className={result.margin >= 15 ? 'text-green-600' : result.margin >= 10 ? 'text-yellow-600' : 'text-red-600'}>
                      {result.margin.toFixed(1)}%
                    </span>
                    {getVariationIcon(result.margin, baseMargin)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p><strong>Pessimista:</strong> +20% custos, -15% demanda</p>
          <p><strong>Realista:</strong> Cenário base atual</p>
          <p><strong>Otimista:</strong> -10% custos, +10% demanda</p>
        </div>
      </CardContent>
    </Card>
  );
}
