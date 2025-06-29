
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, AlertCircle, Settings } from "lucide-react";
import { useDeliveryRates } from "@/hooks/useDeliveryRates";
import { DeliveryRatesService } from "@/services/DeliveryRatesService";
import { useAuth } from "@/contexts/AuthContext";

export function EnhancedPricingSimulator() {
  const { currentRestaurant } = useAuth();
  const { rates, createRate, updateRate, deleteRate } = useDeliveryRates();
  
  const [simulationData, setSimulationData] = useState({
    cmvCost: 0,
    markup: 250,
    selectedPlatform: ""
  });

  const [newRate, setNewRate] = useState({
    plataforma: "",
    tipo_taxa: 'percentual' as 'percentual' | 'valor_fixo',
    valor_taxa: 0
  });

  const [showRateForm, setShowRateForm] = useState(false);

  const calculatePricing = () => {
    if (simulationData.cmvCost <= 0) return null;

    const selectedRate = rates.find(r => r.plataforma === simulationData.selectedPlatform);
    
    return DeliveryRatesService.calculatePriceWithDelivery(
      simulationData.cmvCost,
      simulationData.markup,
      selectedRate
    );
  };

  const handleCreateRate = async () => {
    if (!currentRestaurant?.id || !newRate.plataforma || newRate.valor_taxa <= 0) return;

    const success = await createRate({
      restaurant_id: currentRestaurant.id,
      plataforma: newRate.plataforma,
      tipo_taxa: newRate.tipo_taxa,
      valor_taxa: newRate.valor_taxa,
      ativa: true
    });

    if (success) {
      setNewRate({ plataforma: "", tipo_taxa: 'percentual', valor_taxa: 0 });
      setShowRateForm(false);
    }
  };

  const pricingResult = calculatePricing();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getViabilityStatus = (pricing: any) => {
    if (!pricing) return null;
    
    const margin = ((pricing.finalPrice - simulationData.cmvCost) / pricing.finalPrice) * 100;
    
    if (margin < 20) return { status: 'critical', color: 'destructive', text: 'Margem Crítica' };
    if (margin < 35) return { status: 'warning', color: 'secondary', text: 'Atenção' };
    return { status: 'healthy', color: 'default', text: 'Saudável' };
  };

  const viability = getViabilityStatus(pricingResult);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Simulador de Precificação Avançado</h2>
      </div>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="delivery-rates">Taxas de Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-4">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dados para Simulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cmvCost">Custo CMV (R$)</Label>
                  <Input
                    id="cmvCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={simulationData.cmvCost || ""}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      cmvCost: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="15.00"
                  />
                </div>

                <div>
                  <Label htmlFor="markup">Markup (%)</Label>
                  <Input
                    id="markup"
                    type="number"
                    min="100"
                    value={simulationData.markup || ""}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      markup: parseInt(e.target.value) || 250 
                    }))}
                    placeholder="250"
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select 
                    value={simulationData.selectedPlatform} 
                    onValueChange={(value) => setSimulationData(prev => ({ 
                      ...prev, 
                      selectedPlatform: value 
                    }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Balcão (sem taxa)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Balcão (sem taxa)</SelectItem>
                      {rates.map(rate => (
                        <SelectItem key={rate.id} value={rate.plataforma}>
                          {rate.plataforma} ({rate.tipo_taxa === 'percentual' ? `${rate.valor_taxa}%` : formatCurrency(rate.valor_taxa)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {pricingResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Preço Base</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(pricingResult.basePrice)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CMV + Markup ({simulationData.markup}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(pricingResult.deliveryFee)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {simulationData.selectedPlatform || 'Nenhuma taxa'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    Preço Final
                    {viability && (
                      <Badge variant={viability.color as any}>
                        {viability.text}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(pricingResult.finalPrice)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preço sugerido para venda
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis */}
          {pricingResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Análise de Viabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Custo</p>
                    <p className="font-semibold">{formatCurrency(simulationData.cmvCost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lucro</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(pricingResult.finalPrice - simulationData.cmvCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margem</p>
                    <p className="font-semibold">
                      {(((pricingResult.finalPrice - simulationData.cmvCost) / pricingResult.finalPrice) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    {viability && (
                      <Badge variant={viability.color as any}>
                        {viability.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivery-rates" className="space-y-4">
          {/* Current Rates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Taxas de Delivery Configuradas
              </CardTitle>
              <Button onClick={() => setShowRateForm(!showRateForm)}>
                {showRateForm ? 'Cancelar' : 'Nova Taxa'}
              </Button>
            </CardHeader>
            <CardContent>
              {showRateForm && (
                <div className="mb-4 p-4 border rounded-lg space-y-4 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="plataforma">Plataforma</Label>
                      <Input
                        id="plataforma"
                        value={newRate.plataforma}
                        onChange={(e) => setNewRate(prev => ({ ...prev, plataforma: e.target.value }))}
                        placeholder="Ex: iFood, Uber Eats"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo_taxa">Tipo de Taxa</Label>
                      <Select 
                        value={newRate.tipo_taxa} 
                        onValueChange={(value: 'percentual' | 'valor_fixo') => 
                          setNewRate(prev => ({ ...prev, tipo_taxa: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentual">Percentual (%)</SelectItem>
                          <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="valor_taxa">
                        {newRate.tipo_taxa === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                      </Label>
                      <Input
                        id="valor_taxa"
                        type="number"
                        step={newRate.tipo_taxa === 'percentual' ? "0.1" : "0.01"}
                        min="0"
                        value={newRate.valor_taxa || ""}
                        onChange={(e) => setNewRate(prev => ({ 
                          ...prev, 
                          valor_taxa: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder={newRate.tipo_taxa === 'percentual' ? "15.0" : "5.00"}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateRate} className="w-full">
                    Adicionar Taxa
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {rates.length > 0 ? (
                  rates.map(rate => (
                    <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{rate.plataforma}</span>
                        <span className="ml-2 text-muted-foreground">
                          {rate.tipo_taxa === 'percentual' 
                            ? `${rate.valor_taxa}%` 
                            : formatCurrency(rate.valor_taxa)
                          }
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteRate(rate.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma taxa de delivery configurada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
