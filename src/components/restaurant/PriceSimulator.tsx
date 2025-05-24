import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { CompetitiveBenchmark } from "./CompetitiveBenchmark";
import { SmartAlerts } from "./SmartAlerts";

export function PriceSimulator() {
  const [formData, setFormData] = useState({
    priceType: '',
    ingredientCost: '',
    operationalExpenses: '',
    desiredMargin: '',
    monthlySalesProjection: '',
    currentPrice: ''
  });

  const [results, setResults] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSuggestedPrice = () => {
    const ingredientCost = parseFloat(formData.ingredientCost) || 0;
    const operationalExpenses = parseFloat(formData.operationalExpenses) || 0;
    const desiredMargin = parseFloat(formData.desiredMargin) || 0;
    const monthlySales = parseFloat(formData.monthlySalesProjection) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || 0;

    // Cálculos básicos
    const fixedCostPerUnit = monthlySales > 0 ? operationalExpenses / monthlySales : 0;
    const totalCostPerUnit = ingredientCost + fixedCostPerUnit;
    const suggestedPrice = totalCostPerUnit / (1 - desiredMargin / 100);
    
    // Projeções financeiras
    const monthlyRevenue = suggestedPrice * monthlySales;
    const monthlyCosts = (ingredientCost * monthlySales) + operationalExpenses;
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    const actualMargin = monthlyCosts > 0 ? ((monthlyRevenue - monthlyCosts) / monthlyRevenue) * 100 : 0;
    
    // Análise competitiva
    const priceVariation = currentPrice > 0 ? ((suggestedPrice - currentPrice) / currentPrice) * 100 : 0;
    
    // Pontos de equilíbrio
    const breakEvenUnits = operationalExpenses / (suggestedPrice - ingredientCost);
    const breakEvenRevenue = breakEvenUnits * suggestedPrice;

    const results = {
      suggestedPrice,
      totalCostPerUnit,
      fixedCostPerUnit,
      monthlyRevenue,
      monthlyCosts,
      monthlyProfit,
      actualMargin,
      priceVariation,
      breakEvenUnits,
      breakEvenRevenue,
      viabilityAnalysis: getViabilityAnalysis(actualMargin, priceVariation, monthlyProfit)
    };

    setResults(results);
  };

  const getViabilityAnalysis = (margin: number, priceVariation: number, profit: number) => {
    const analyses = [];
    
    if (margin >= 15) {
      analyses.push({
        type: 'success',
        message: 'Margem de lucro saudável (≥15%)',
        icon: CheckCircle
      });
    } else if (margin >= 10) {
      analyses.push({
        type: 'warning',
        message: 'Margem aceitável, mas pode ser otimizada',
        icon: AlertTriangle
      });
    } else {
      analyses.push({
        type: 'error',
        message: 'Margem muito baixa (<10%) - risco alto',
        icon: AlertTriangle
      });
    }

    if (Math.abs(priceVariation) <= 10) {
      analyses.push({
        type: 'success',
        message: 'Variação de preço competitiva (±10%)',
        icon: CheckCircle
      });
    } else if (priceVariation > 10) {
      analyses.push({
        type: 'warning',
        message: `Preço ${priceVariation.toFixed(1)}% acima do atual - avaliar aceitação`,
        icon: AlertTriangle
      });
    } else {
      analyses.push({
        type: 'warning',
        message: `Preço ${Math.abs(priceVariation).toFixed(1)}% abaixo do atual - verificar sustentabilidade`,
        icon: AlertTriangle
      });
    }

    if (profit > 0) {
      analyses.push({
        type: 'success',
        message: 'Projeção de lucro positiva',
        icon: CheckCircle
      });
    } else {
      analyses.push({
        type: 'error',
        message: 'Projeção de prejuízo - revisar estratégia',
        icon: AlertTriangle
      });
    }

    return analyses;
  };

  const isFormValid = () => {
    return formData.priceType && 
           formData.ingredientCost && 
           formData.operationalExpenses && 
           formData.desiredMargin && 
           formData.monthlySalesProjection;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Preços Avançado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ferramenta completa com análise de sensibilidade, benchmarking e alertas inteligentes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulário - manter código existente */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="priceType">Tipo de Preço</Label>
                <Select value={formData.priceType} onValueChange={(value) => handleInputChange('priceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Por Kg</SelectItem>
                    <SelectItem value="rodizio">Rodízio por Pessoa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ingredientCost">
                  Custo dos Ingredientes {formData.priceType === 'kg' ? 'por Kg' : 'por Pessoa'}
                </Label>
                <Input
                  id="ingredientCost"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 25.00"
                  value={formData.ingredientCost}
                  onChange={(e) => handleInputChange('ingredientCost', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="operationalExpenses">Despesas Operacionais Mensais</Label>
                <Input
                  id="operationalExpenses"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 15000.00"
                  value={formData.operationalExpenses}
                  onChange={(e) => handleInputChange('operationalExpenses', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="desiredMargin">Margem de Lucro Desejada (%)</Label>
                <Input
                  id="desiredMargin"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 20"
                  value={formData.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="monthlySalesProjection">
                  Projeção de Vendas Mensais {formData.priceType === 'kg' ? '(Kg)' : '(Pessoas)'}
                </Label>
                <Input
                  id="monthlySalesProjection"
                  type="number"
                  step="1"
                  placeholder={formData.priceType === 'kg' ? "Ex: 1500" : "Ex: 800"}
                  value={formData.monthlySalesProjection}
                  onChange={(e) => handleInputChange('monthlySalesProjection', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="currentPrice">
                  Preço Atual {formData.priceType === 'kg' ? 'por Kg' : 'por Pessoa'} (Opcional)
                </Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 45.00"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                />
              </div>

              <Button 
                onClick={calculateSuggestedPrice} 
                disabled={!isFormValid()}
                className="w-full"
              >
                Calcular Preço Sugerido
              </Button>
            </div>

            {/* Resultados Básicos */}
            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resultados da Simulação</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Tipo de preço</TableCell>
                      <TableCell>{formData.priceType === 'kg' ? 'Por Kg' : 'Rodízio por Pessoa'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Custo dos ingredientes</TableCell>
                      <TableCell>{formatCurrency(parseFloat(formData.ingredientCost))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Custo fixo por unidade</TableCell>
                      <TableCell>{formatCurrency(results.fixedCostPerUnit)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Custo total por unidade</TableCell>
                      <TableCell>{formatCurrency(results.totalCostPerUnit)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Despesas operacionais</TableCell>
                      <TableCell>{formatCurrency(parseFloat(formData.operationalExpenses))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Margem de lucro desejada</TableCell>
                      <TableCell>{formData.desiredMargin}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Projeção de vendas</TableCell>
                      <TableCell>
                        {formData.monthlySalesProjection} {formData.priceType === 'kg' ? 'kg' : 'pessoas'}/mês
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50">
                      <TableCell className="font-semibold">Preço sugerido</TableCell>
                      <TableCell className="font-semibold text-green-700">
                        {formatCurrency(results.suggestedPrice)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análises Avançadas */}
      {results && (
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px] mx-auto">
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
            <TabsTrigger value="competitive">Competitivo</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Projeção Financeira Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... keep existing code (financial projection content) */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Receita Projetada:</span>
                      <span className="font-semibold">{formatCurrency(results.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custos Totais:</span>
                      <span className="font-semibold">{formatCurrency(results.monthlyCosts)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Lucro Projetado:</span>
                      <span className={`font-semibold ${results.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(results.monthlyProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem Efetiva:</span>
                      <span className="font-semibold">{results.actualMargin.toFixed(1)}%</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span>Ponto de Equilíbrio:</span>
                        <span className="font-semibold">
                          {Math.ceil(results.breakEvenUnits)} {formData.priceType === 'kg' ? 'kg' : 'pessoas'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Receita de Equilíbrio:</span>
                        <span>{formatCurrency(results.breakEvenRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análise de Viabilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... keep existing code (viability analysis content) */}
                  <div className="space-y-3">
                    {results.viabilityAnalysis.map((analysis: any, index: number) => {
                      const IconComponent = analysis.icon;
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <IconComponent className={`h-4 w-4 mt-0.5 ${
                            analysis.type === 'success' ? 'text-green-600' : 
                            analysis.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                          <span className={`text-sm ${
                            analysis.type === 'success' ? 'text-green-700' : 
                            analysis.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {analysis.message}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {formData.currentPrice && results.priceVariation !== 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800">Comparação com Preço Atual</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        O preço sugerido é {results.priceVariation > 0 ? 'maior' : 'menor'} que o atual em{' '}
                        <span className="font-semibold">{Math.abs(results.priceVariation).toFixed(1)}%</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">Considerações Importantes</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Monitore a flutuação de preços dos ingredientes</li>
                      <li>• Considere a sazonalidade do seu negócio</li>
                      <li>• Analise preços da concorrência local</li>
                      <li>• Teste o preço gradualmente se necessário</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sensitivity">
            <SensitivityAnalysis
              basePrice={results.suggestedPrice}
              baseCost={parseFloat(formData.ingredientCost)}
              baseRevenue={results.monthlyRevenue}
              baseProfit={results.monthlyProfit}
              baseMargin={results.actualMargin}
              monthlySales={parseFloat(formData.monthlySalesProjection)}
            />
          </TabsContent>

          <TabsContent value="competitive">
            <CompetitiveBenchmark
              suggestedPrice={results.suggestedPrice}
              priceType={formData.priceType}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <SmartAlerts
              margin={results.actualMargin}
              suggestedPrice={results.suggestedPrice}
              currentPrice={formData.currentPrice ? parseFloat(formData.currentPrice) : undefined}
              breakEvenUnits={results.breakEvenUnits}
              monthlySales={parseFloat(formData.monthlySalesProjection)}
              totalCostPerUnit={results.totalCostPerUnit}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
