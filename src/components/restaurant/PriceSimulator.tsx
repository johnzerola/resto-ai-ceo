import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Save, History, Percent } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SimulationData {
  productName: string;
  directCost: number;
  laborCost: number;
  overheadCost: number;
  desiredMargin: number;
  taxPercentage: number;
  deliveryFee: number;
  platformFee: number;
  competitors: number[];
  notes?: string;
}

interface SimulationResults {
  totalCost: number;
  suggestedPrice: number;
  finalPrice: number;
  grossProfit: number;
  netProfit: number;
  markup: number;
  competitorAvg: number;
  priceComparison: number;
  recommendation: string;
  status: 'success' | 'warning' | 'error' | 'neutral';
  coversCosts: boolean;
}

interface SavedSimulation {
  id: string;
  nome_produto: string;
  custo_direto: number;
  custo_mao_obra: number;
  custos_fixos: number;
  margem_desejada: number;
  impostos_percentual: number;
  taxa_entrega: number;
  taxa_plataforma: number;
  precos_concorrentes: any; // JSONB type from Supabase
  preco_sugerido: number;
  lucro_bruto: number;
  markup_calculado: number;
  status_viabilidade: string;
  observacoes?: string;
  created_at: string;
}

export function PriceSimulator() {
  const { currentRestaurant } = useAuth();
  const [formData, setFormData] = useState<SimulationData>({
    productName: '',
    directCost: 0,
    laborCost: 0,
    overheadCost: 0,
    desiredMargin: 30,
    taxPercentage: 12,
    deliveryFee: 0,
    platformFee: 0,
    competitors: [0, 0, 0],
    notes: ''
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);

  const calculatePrice = () => {
    if (formData.directCost <= 0) {
      toast.error('Insira um custo direto válido');
      return;
    }

    setIsCalculating(true);

    // Calcular custos base
    const totalCost = formData.directCost + formData.laborCost + formData.overheadCost;
    
    // Calcular preço base com margem
    const basePrice = totalCost / (1 - formData.desiredMargin / 100);
    
    // Aplicar impostos
    const priceWithTaxes = basePrice / (1 - formData.taxPercentage / 100);
    
    // Aplicar taxas de entrega e plataforma
    const finalPrice = priceWithTaxes + formData.deliveryFee + formData.platformFee;
    
    // Calcular markup
    const markup = totalCost > 0 ? ((finalPrice - totalCost) / totalCost) * 100 : 0;
    
    // Calcular lucros
    const grossProfit = finalPrice - totalCost;
    const netProfit = grossProfit - (finalPrice * formData.taxPercentage / 100);
    
    // Análise da concorrência
    const competitorPrices = formData.competitors.filter(price => price > 0);
    const avgCompetitorPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length 
      : 0;

    const priceComparison = avgCompetitorPrice > 0 
      ? ((finalPrice - avgCompetitorPrice) / avgCompetitorPrice * 100)
      : 0;

    // Determinar status e recomendação
    let recommendation = '';
    let status: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
    
    const marginPercentage = (netProfit / finalPrice) * 100;
    const coversCosts = finalPrice > (totalCost * 1.2); // 20% acima dos custos
    
    if (!coversCosts || marginPercentage < 10) {
      status = 'error';
      recommendation = 'Preço não cobre custos adequadamente. Revise valores ou aumente margem.';
    } else if (priceComparison > 20) {
      status = 'warning';
      recommendation = 'Preço significativamente acima da concorrência. Pode impactar competitividade.';
    } else if (marginPercentage >= 25 && Math.abs(priceComparison) <= 15) {
      status = 'success';
      recommendation = 'Precificação ideal! Boa margem e competitivo no mercado.';
    } else if (priceComparison < -10) {
      status = 'success';
      recommendation = 'Preço competitivo! Boa oportunidade de market share.';
    } else {
      status = 'neutral';
      recommendation = 'Preço equilibrado com o mercado.';
    }

    const calculatedResults: SimulationResults = {
      totalCost,
      suggestedPrice: basePrice,
      finalPrice,
      grossProfit,
      netProfit,
      markup,
      competitorAvg: avgCompetitorPrice,
      priceComparison,
      recommendation,
      status,
      coversCosts
    };

    setTimeout(() => {
      setResults(calculatedResults);
      setIsCalculating(false);
      toast.success('Preço calculado com sucesso!');
    }, 500);
  };

  const saveSimulation = async () => {
    if (!results || !currentRestaurant?.id) {
      toast.error('Calcule o preço antes de salvar ou selecione um restaurante');
      return;
    }

    if (!formData.productName.trim()) {
      toast.error('Digite o nome do produto');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('simulacoes_precos')
        .insert({
          restaurant_id: currentRestaurant.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          nome_produto: formData.productName,
          custo_direto: formData.directCost,
          custo_mao_obra: formData.laborCost,
          custos_fixos: formData.overheadCost,
          margem_desejada: formData.desiredMargin,
          impostos_percentual: formData.taxPercentage,
          taxa_entrega: formData.deliveryFee,
          taxa_plataforma: formData.platformFee,
          precos_concorrentes: formData.competitors,
          preco_sugerido: results.finalPrice,
          lucro_bruto: results.grossProfit,
          markup_calculado: results.markup,
          status_viabilidade: results.status,
          observacoes: formData.notes
        });

      if (error) throw error;

      toast.success('Simulação salva com sucesso!');
      loadSavedSimulations();
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      toast.error('Erro ao salvar simulação');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedSimulations = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('simulacoes_precos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedSimulations(data || []);
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
    }
  };

  const loadSimulation = (simulation: SavedSimulation) => {
    setFormData({
      productName: simulation.nome_produto,
      directCost: simulation.custo_direto,
      laborCost: simulation.custo_mao_obra,
      overheadCost: simulation.custos_fixos,
      desiredMargin: simulation.margem_desejada,
      taxPercentage: simulation.impostos_percentual,
      deliveryFee: simulation.taxa_entrega,
      platformFee: simulation.taxa_plataforma,
      competitors: Array.isArray(simulation.precos_concorrentes) ? simulation.precos_concorrentes : [0, 0, 0],
      notes: simulation.observacoes || ''
    });
    setShowHistory(false);
    toast.success('Simulação carregada');
  };

  const deleteSimulation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simulacoes_precos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Simulação excluída');
      loadSavedSimulations();
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      toast.error('Erro ao excluir simulação');
    }
  };

  const handleInputChange = (field: keyof SimulationData, value: any) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      await loadSavedSimulations();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={calculatePrice}
          disabled={isCalculating}
          className="flex items-center gap-2"
        >
          {isCalculating ? (
            'Calculando...'
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calcular Preço Ideal
            </>
          )}
        </Button>
        
        {results && (
          <Button
            onClick={saveSimulation}
            disabled={isSaving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Simulação'}
          </Button>
        )}
        
        <Button
          onClick={toggleHistory}
          variant="outline"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Ocultar' : 'Histórico'}
        </Button>
      </div>

      {/* Histórico de simulações */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Simulações Salvas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedSimulations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma simulação salva ainda</p>
            ) : (
              savedSimulations.map((sim) => (
                <div key={sim.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{sim.nome_produto}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(sim.preco_sugerido)} • Markup {sim.markup_calculado.toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadSimulation(sim)}>
                      Carregar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteSimulation(sim.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              Dados do Produto
            </CardTitle>
            <CardDescription>
              Preencha os custos e configurações para calcular o preço ideal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Ex: Hambúrguer Artesanal"
              />
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="directCost">Custo Direto (R$) *</Label>
                <Input
                  id="directCost"
                  type="number"
                  step="0.01"
                  value={formData.directCost || ''}
                  onChange={(e) => handleInputChange('directCost', Number(e.target.value))}
                  placeholder="15,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laborCost">Custo Mão de Obra (R$)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  value={formData.laborCost || ''}
                  onChange={(e) => handleInputChange('laborCost', Number(e.target.value))}
                  placeholder="5,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overheadCost">Custos Fixos (R$)</Label>
                <Input
                  id="overheadCost"
                  type="number"
                  step="0.01"
                  value={formData.overheadCost || ''}
                  onChange={(e) => handleInputChange('overheadCost', Number(e.target.value))}
                  placeholder="3,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredMargin">Margem Desejada (%)</Label>
                <Input
                  id="desiredMargin"
                  type="number"
                  value={formData.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', Number(e.target.value))}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Impostos (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  step="0.1"
                  value={formData.taxPercentage}
                  onChange={(e) => handleInputChange('taxPercentage', Number(e.target.value))}
                  placeholder="12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  value={formData.deliveryFee || ''}
                  onChange={(e) => handleInputChange('deliveryFee', Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformFee">Taxa de Plataforma (R$)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  step="0.01"
                  value={formData.platformFee || ''}
                  onChange={(e) => handleInputChange('platformFee', Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preços da Concorrência (R$)</Label>
              <div className="grid gap-2 grid-cols-3">
                {formData.competitors.map((price, index) => (
                  <Input
                    key={index}
                    type="number"
                    step="0.01"
                    value={price || ''}
                    onChange={(e) => handleCompetitorChange(index, Number(e.target.value))}
                    placeholder={`Concorrente ${index + 1}`}
                    className="text-xs"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Anotações sobre esta simulação..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Análise de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cards de status */}
              <div className={`p-4 rounded-lg border ${getStatusColor(results.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.status === 'success' && <CheckCircle className="h-5 w-5" />}
                  {results.status === 'warning' && <AlertTriangle className="h-5 w-5" />}
                  {results.status === 'error' && <AlertTriangle className="h-5 w-5" />}
                  {results.status === 'neutral' && <TrendingUp className="h-5 w-5" />}
                  <span className="font-medium">
                    {results.coversCosts ? '✅ Cobre custos adequadamente' : '⚠️ Não cobre custos adequadamente'}
                  </span>
                </div>
                <p className="text-sm">{results.recommendation}</p>
              </div>

              {/* Métricas principais */}
              <div className="grid gap-3 grid-cols-2">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(results.totalCost)}
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Preço Final</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(results.finalPrice)}
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Markup</p>
                  <p className="text-lg font-bold text-blue-600">
                    {results.markup.toFixed(0)}%
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Lucro Líquido</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(results.netProfit)}
                  </p>
                </div>
              </div>

              {/* Comparação com concorrentes */}
              {results.competitorAvg > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Média Concorrentes:</span>
                    <span className="font-medium">{formatCurrency(results.competitorAvg)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sua diferença:</span>
                    <Badge variant={results.priceComparison > 0 ? "destructive" : "default"}>
                      {results.priceComparison > 0 ? '+' : ''}{results.priceComparison.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}

              {/* Detalhamento */}
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-2">Detalhamento de Custos:</h4>
                <div className="space-y-1 text-sm">
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
                  <div className="flex justify-between">
                    <span>Impostos ({formData.taxPercentage}%):</span>
                    <span>{formatCurrency(results.finalPrice * formData.taxPercentage / 100)}</span>
                  </div>
                  {formData.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span>{formatCurrency(formData.deliveryFee)}</span>
                    </div>
                  )}
                  {formData.platformFee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de Plataforma:</span>
                      <span>{formatCurrency(formData.platformFee)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}