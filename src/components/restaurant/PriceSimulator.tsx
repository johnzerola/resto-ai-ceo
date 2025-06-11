
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export function PriceSimulator() {
  const [formData, setFormData] = useState({
    productName: '',
    directCost: 0,
    laborCost: 0,
    overheadCost: 0,
    desiredMargin: 30,
    competitors: [0, 0, 0]
  });

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (formData.directCost > 0) {
      calculatePrice();
    }
  }, [formData]);

  const calculatePrice = () => {
    const totalCost = formData.directCost + formData.laborCost + formData.overheadCost;
    const markupMultiplier = 1 + (formData.desiredMargin / 100);
    const suggestedPrice = totalCost * markupMultiplier;
    
    const competitorPrices = formData.competitors.filter(price => price > 0);
    const avgCompetitorPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length 
      : 0;

    const priceComparison = avgCompetitorPrice > 0 
      ? ((suggestedPrice - avgCompetitorPrice) / avgCompetitorPrice * 100)
      : 0;

    let recommendation = '';
    let status = 'neutral';
    
    if (priceComparison > 10) {
      recommendation = 'Preço acima do mercado. Considere reduzir custos ou margem.';
      status = 'warning';
    } else if (priceComparison < -10) {
      recommendation = 'Preço competitivo. Boa oportunidade de mercado.';
      status = 'success';
    } else {
      recommendation = 'Preço alinhado com o mercado.';
      status = 'neutral';
    }

    setResults({
      totalCost,
      suggestedPrice,
      actualMargin: formData.desiredMargin,
      competitorAvg: avgCompetitorPrice,
      priceComparison,
      recommendation,
      status
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompetitorChange = (index: number, value: number) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = value;
    setFormData(prev => ({
      ...prev,
      competitors: newCompetitors
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4 overflow-hidden">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Formulário */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Calculator className="h-4 w-4 text-green-600" />
              Dados do Produto
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha os custos para calcular o preço ideal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-xs sm:text-sm">Nome do Produto</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Ex: Hambúrguer Artesanal"
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="directCost" className="text-xs sm:text-sm">Custo Direto (R$)</Label>
                <Input
                  id="directCost"
                  type="number"
                  step="0.01"
                  value={formData.directCost}
                  onChange={(e) => handleInputChange('directCost', Number(e.target.value))}
                  placeholder="0,00"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laborCost" className="text-xs sm:text-sm">Custo Mão de Obra (R$)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  value={formData.laborCost}
                  onChange={(e) => handleInputChange('laborCost', Number(e.target.value))}
                  placeholder="0,00"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overheadCost" className="text-xs sm:text-sm">Custos Fixos (R$)</Label>
                <Input
                  id="overheadCost"
                  type="number"
                  step="0.01"
                  value={formData.overheadCost}
                  onChange={(e) => handleInputChange('overheadCost', Number(e.target.value))}
                  placeholder="0,00"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredMargin" className="text-xs sm:text-sm">Margem Desejada (%)</Label>
                <Input
                  id="desiredMargin"
                  type="number"
                  value={formData.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', Number(e.target.value))}
                  placeholder="30"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Preços da Concorrência (R$)</Label>
              <div className="grid gap-2 grid-cols-3">
                {formData.competitors.map((price, index) => (
                  <Input
                    key={index}
                    type="number"
                    step="0.01"
                    value={price || ''}
                    onChange={(e) => handleCompetitorChange(index, Number(e.target.value))}
                    placeholder={`Concorrente ${index + 1}`}
                    className="h-8 sm:h-10 text-xs"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {results && (
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Análise de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 grid-cols-2">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    {formatCurrency(results.totalCost)}
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Preço Sugerido</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {formatCurrency(results.suggestedPrice)}
                  </p>
                </div>
              </div>

              {results.competitorAvg > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Média Concorrentes:</span>
                    <span className="text-xs sm:text-sm font-medium">
                      {formatCurrency(results.competitorAvg)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Diferença:</span>
                    <Badge variant={results.priceComparison > 0 ? "destructive" : "default"} className="text-xs">
                      {results.priceComparison > 0 ? '+' : ''}{results.priceComparison.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}

              <Alert className={`${
                results.status === 'success' ? 'border-green-200 bg-green-50' : 
                results.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                'border-blue-200 bg-blue-50'
              }`}>
                {results.status === 'success' && <CheckCircle className="h-4 w-4" />}
                {results.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {results.status === 'neutral' && <TrendingUp className="h-4 w-4" />}
                <AlertDescription className="text-xs sm:text-sm">
                  {results.recommendation}
                </AlertDescription>
              </Alert>

              <div className="pt-2 border-t">
                <h4 className="text-xs sm:text-sm font-medium mb-2">Detalhamento:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Custo Direto:</span>
                    <span>{formatCurrency(formData.directCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra:</span>
                    <span>{formatCurrency(formData.laborCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custos Fixos:</span>
                    <span>{formatCurrency(formData.overheadCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Margem de Lucro:</span>
                    <span>{formatCurrency(results.suggestedPrice - results.totalCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
