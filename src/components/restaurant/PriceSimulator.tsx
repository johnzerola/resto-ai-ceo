
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Utensils } from "lucide-react";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { CompetitiveBenchmark } from "./CompetitiveBenchmark";
import { SmartAlerts } from "./SmartAlerts";

export function PriceSimulator() {
  const [formData, setFormData] = useState({
    businessModel: '', // 'buffet' or 'rodizio'
    ingredientCost: '',
    wastePercentage: '',
    operationalExpenses: '',
    desiredMargin: '',
    monthlySalesProjection: '',
    currentPrice: '',
    averageConsumption: '', // kg por pessoa para buffet
    fixedCosts: '',
    variableCosts: '',
    marketPrice: '',
    seasonalityFactor: '1'
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
    const wastePercentage = parseFloat(formData.wastePercentage) || 0;
    const operationalExpenses = parseFloat(formData.operationalExpenses) || 0;
    const desiredMargin = parseFloat(formData.desiredMargin) || 0;
    const monthlySales = parseFloat(formData.monthlySalesProjection) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || 0;
    const averageConsumption = parseFloat(formData.averageConsumption) || 0;
    const fixedCosts = parseFloat(formData.fixedCosts) || 0;
    const variableCosts = parseFloat(formData.variableCosts) || 0;
    const seasonalityFactor = parseFloat(formData.seasonalityFactor) || 1;

    let calculations: any = {};

    if (formData.businessModel === 'buffet') {
      // Cálculos específicos para buffet por peso
      const effectiveIngredientCost = ingredientCost * (1 + wastePercentage / 100);
      const fixedCostPerKg = monthlySales > 0 ? fixedCosts / monthlySales : 0;
      const totalCostPerKg = effectiveIngredientCost + fixedCostPerKg + variableCosts;
      const suggestedPricePerKg = totalCostPerKg / (1 - desiredMargin / 100);
      
      calculations = {
        suggestedPrice: suggestedPricePerKg,
        totalCostPerUnit: totalCostPerKg,
        fixedCostPerUnit: fixedCostPerKg,
        effectiveIngredientCost,
        monthlyRevenue: suggestedPricePerKg * monthlySales,
        monthlyCosts: totalCostPerKg * monthlySales + operationalExpenses,
        breakEvenUnits: fixedCosts / (suggestedPricePerKg - effectiveIngredientCost - variableCosts),
        wasteImpact: ingredientCost * (wastePercentage / 100)
      };
    } else if (formData.businessModel === 'rodizio') {
      // Cálculos específicos para rodízio por pessoa
      const costPerPerson = ingredientCost * averageConsumption * (1 + wastePercentage / 100);
      const fixedCostPerPerson = monthlySales > 0 ? fixedCosts / monthlySales : 0;
      const totalCostPerPerson = costPerPerson + fixedCostPerPerson + variableCosts;
      const suggestedPricePerPerson = totalCostPerPerson / (1 - desiredMargin / 100);
      
      calculations = {
        suggestedPrice: suggestedPricePerPerson,
        totalCostPerUnit: totalCostPerPerson,
        fixedCostPerUnit: fixedCostPerPerson,
        costPerPerson,
        monthlyRevenue: suggestedPricePerPerson * monthlySales,
        monthlyCosts: totalCostPerPerson * monthlySales + operationalExpenses,
        breakEvenUnits: fixedCosts / (suggestedPricePerPerson - costPerPerson - variableCosts),
        averageConsumptionCost: costPerPerson
      };
    }

    // Cálculos comuns
    calculations.monthlyProfit = calculations.monthlyRevenue - calculations.monthlyCosts;
    calculations.actualMargin = calculations.monthlyRevenue > 0 ? 
      ((calculations.monthlyRevenue - calculations.monthlyCosts) / calculations.monthlyRevenue) * 100 : 0;
    calculations.priceVariation = currentPrice > 0 ? 
      ((calculations.suggestedPrice - currentPrice) / currentPrice) * 100 : 0;
    calculations.breakEvenRevenue = calculations.breakEvenUnits * calculations.suggestedPrice;
    calculations.seasonalAdjustment = calculations.suggestedPrice * seasonalityFactor;
    
    // Análise de viabilidade
    calculations.viabilityAnalysis = getViabilityAnalysis(
      calculations.actualMargin, 
      calculations.priceVariation, 
      calculations.monthlyProfit,
      formData.businessModel
    );

    setResults(calculations);
  };

  const getViabilityAnalysis = (margin: number, priceVariation: number, profit: number, businessModel: string) => {
    const analyses = [];
    
    // Análise de margem específica por modelo
    const minMargin = businessModel === 'buffet' ? 20 : 15; // Buffet precisa de margem maior
    
    if (margin >= minMargin) {
      analyses.push({
        type: 'success',
        message: `Margem de lucro saudável (≥${minMargin}%) para ${businessModel}`,
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
        message: 'Margem muito baixa - risco alto para sustentabilidade',
        icon: AlertTriangle
      });
    }

    // Análise de variação de preço
    if (Math.abs(priceVariation) <= 10) {
      analyses.push({
        type: 'success',
        message: 'Variação de preço competitiva (±10%)',
        icon: CheckCircle
      });
    } else if (priceVariation > 15) {
      analyses.push({
        type: 'warning',
        message: `Aumento significativo de ${priceVariation.toFixed(1)}% - teste gradualmente`,
        icon: AlertTriangle
      });
    }

    // Análise de lucro
    if (profit > 0) {
      analyses.push({
        type: 'success',
        message: 'Projeção de lucro positiva',
        icon: CheckCircle
      });
    } else {
      analyses.push({
        type: 'error',
        message: 'Projeção de prejuízo - revisar estratégia urgentemente',
        icon: AlertTriangle
      });
    }

    return analyses;
  };

  const isFormValid = () => {
    const basicFields = formData.businessModel && 
                       formData.ingredientCost && 
                       formData.operationalExpenses && 
                       formData.desiredMargin && 
                       formData.monthlySalesProjection;
    
    if (formData.businessModel === 'rodizio') {
      return basicFields && formData.averageConsumption;
    }
    
    return basicFields;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Simulador de Preços - Rodízio e Buffet
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calcule preços otimizados para diferentes modelos de negócio considerando desperdício, consumo médio e sazonalidade
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessModel">Modelo de Negócio</Label>
                <Select value={formData.businessModel} onValueChange={(value) => handleInputChange('businessModel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buffet">Buffet por Peso (Kg)</SelectItem>
                    <SelectItem value="rodizio">Rodízio por Pessoa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ingredientCost">
                  Custo dos Ingredientes {formData.businessModel === 'buffet' ? 'por Kg' : 'por Kg de Insumo'}
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

              {formData.businessModel === 'rodizio' && (
                <div>
                  <Label htmlFor="averageConsumption">Consumo Médio por Pessoa (Kg)</Label>
                  <Input
                    id="averageConsumption"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.5"
                    value={formData.averageConsumption}
                    onChange={(e) => handleInputChange('averageConsumption', e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="wastePercentage">Percentual de Desperdício (%)</Label>
                <Input
                  id="wastePercentage"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 10"
                  value={formData.wastePercentage}
                  onChange={(e) => handleInputChange('wastePercentage', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fixedCosts">Custos Fixos Mensais</Label>
                <Input
                  id="fixedCosts"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 10000.00"
                  value={formData.fixedCosts}
                  onChange={(e) => handleInputChange('fixedCosts', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="variableCosts">
                  Custos Variáveis {formData.businessModel === 'buffet' ? 'por Kg' : 'por Pessoa'}
                </Label>
                <Input
                  id="variableCosts"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 3.00"
                  value={formData.variableCosts}
                  onChange={(e) => handleInputChange('variableCosts', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="desiredMargin">Margem de Lucro Desejada (%)</Label>
                <Input
                  id="desiredMargin"
                  type="number"
                  step="0.1"
                  placeholder={formData.businessModel === 'buffet' ? "Ex: 25" : "Ex: 20"}
                  value={formData.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="monthlySalesProjection">
                  Projeção de Vendas Mensais {formData.businessModel === 'buffet' ? '(Kg)' : '(Pessoas)'}
                </Label>
                <Input
                  id="monthlySalesProjection"
                  type="number"
                  step="1"
                  placeholder={formData.businessModel === 'buffet' ? "Ex: 2000" : "Ex: 800"}
                  value={formData.monthlySalesProjection}
                  onChange={(e) => handleInputChange('monthlySalesProjection', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="seasonalityFactor">Fator de Sazonalidade</Label>
                <Select value={formData.seasonalityFactor} onValueChange={(value) => handleInputChange('seasonalityFactor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">Baixa temporada (-20%)</SelectItem>
                    <SelectItem value="1">Temporada normal</SelectItem>
                    <SelectItem value="1.2">Alta temporada (+20%)</SelectItem>
                    <SelectItem value="1.5">Período especial (+50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currentPrice">
                  Preço Atual {formData.businessModel === 'buffet' ? 'por Kg' : 'por Pessoa'} (Opcional)
                </Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder={formData.businessModel === 'buffet' ? "Ex: 45.00" : "Ex: 35.00"}
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                />
              </div>

              <Button 
                onClick={calculateSuggestedPrice} 
                disabled={!isFormValid()}
                className="w-full"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calcular Preço Otimizado
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
                      <TableCell>Modelo de negócio</TableCell>
                      <TableCell>{formData.businessModel === 'buffet' ? 'Buffet por Peso' : 'Rodízio por Pessoa'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Custo base {formData.businessModel === 'buffet' ? 'por kg' : 'por pessoa'}</TableCell>
                      <TableCell>
                        {formatCurrency(formData.businessModel === 'buffet' ? 
                          results.effectiveIngredientCost : results.costPerPerson)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Impacto do desperdício</TableCell>
                      <TableCell>
                        {formatCurrency(results.wasteImpact || (results.costPerPerson - parseFloat(formData.ingredientCost) * parseFloat(formData.averageConsumption || '0')))}
                      </TableCell>
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
                      <TableCell>Margem desejada</TableCell>
                      <TableCell>{formData.desiredMargin}%</TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50">
                      <TableCell className="font-semibold">Preço sugerido</TableCell>
                      <TableCell className="font-semibold text-green-700">
                        {formatCurrency(results.suggestedPrice)}
                      </TableCell>
                    </TableRow>
                    {parseFloat(formData.seasonalityFactor) !== 1 && (
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-semibold">Preço com sazonalidade</TableCell>
                        <TableCell className="font-semibold text-blue-700">
                          {formatCurrency(results.seasonalAdjustment)}
                        </TableCell>
                      </TableRow>
                    )}
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
                          {Math.ceil(results.breakEvenUnits)} {formData.businessModel === 'buffet' ? 'kg' : 'pessoas'}
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

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">
                      Dicas para {formData.businessModel === 'buffet' ? 'Buffet' : 'Rodízio'}:
                    </h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {formData.businessModel === 'buffet' ? (
                        <>
                          <li>• Monitore o desperdício diariamente</li>
                          <li>• Controle a temperatura dos alimentos</li>
                          <li>• Considere horários de maior/menor fluxo</li>
                          <li>• Ofereça variedade sem comprometer custos</li>
                        </>
                      ) : (
                        <>
                          <li>• Monitore o consumo médio por cliente</li>
                          <li>• Controle qualidade e apresentação</li>
                          <li>• Considere limite de tempo se necessário</li>
                          <li>• Foque na experiência do cliente</li>
                        </>
                      )}
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
              priceType={formData.businessModel}
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
