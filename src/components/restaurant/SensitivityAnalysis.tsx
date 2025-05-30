
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

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
    { name: "Custo +10%", costChange: 0.1, priceChange: 0 },
    { name: "Custo +20%", costChange: 0.2, priceChange: 0 },
    { name: "Preço +5%", costChange: 0, priceChange: 0.05 },
    { name: "Preço +10%", costChange: 0, priceChange: 0.1 },
    { name: "Vendas -20%", costChange: 0, priceChange: 0, salesChange: -0.2 },
    { name: "Vendas +20%", costChange: 0, priceChange: 0, salesChange: 0.2 },
  ];

  const calculateScenario = (scenario: any) => {
    const newCost = baseCost * (1 + scenario.costChange);
    const newPrice = basePrice * (1 + scenario.priceChange);
    const newSales = monthlySales * (1 + (scenario.salesChange || 0));
    const newRevenue = newPrice * newSales;
    const newTotalCost = newCost * newSales;
    const newProfit = newRevenue - newTotalCost;
    const newMargin = newRevenue > 0 ? (newProfit / newRevenue) * 100 : 0;
    
    return {
      price: newPrice,
      revenue: newRevenue,
      profit: newProfit,
      margin: newMargin,
      profitChange: newProfit - baseProfit,
      marginChange: newMargin - baseMargin
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise de Sensibilidade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Impacto de diferentes cenários no resultado financeiro
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cenário</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Variação Lucro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-blue-50">
              <TableCell className="font-medium">Base (Atual)</TableCell>
              <TableCell>{formatCurrency(basePrice)}</TableCell>
              <TableCell>{formatCurrency(baseRevenue)}</TableCell>
              <TableCell>{formatCurrency(baseProfit)}</TableCell>
              <TableCell>{baseMargin.toFixed(1)}%</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            {scenarios.map((scenario, index) => {
              const result = calculateScenario(scenario);
              return (
                <TableRow key={index}>
                  <TableCell>{scenario.name}</TableCell>
                  <TableCell>{formatCurrency(result.price)}</TableCell>
                  <TableCell>{formatCurrency(result.revenue)}</TableCell>
                  <TableCell className={result.profit >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(result.profit)}
                  </TableCell>
                  <TableCell>{result.margin.toFixed(1)}%</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {result.profitChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={result.profitChange >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(Math.abs(result.profitChange))}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
