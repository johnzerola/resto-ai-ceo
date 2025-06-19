
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CalculoCMV {
  custo_ingredientes: number;
  custo_embalagem: number;
  custo_perdas: number;
  custo_total: number;
  custo_por_porcao: number;
  margem_bruta_percentual: number;
  margem_liquida_percentual: number;
  preco_sugerido_balcao: number;
  preco_sugerido_ifood: number;
  status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel';
}

interface PratoCompleto {
  id: string;
  nome_prato: string;
  categoria: string;
  peso_bruto_kg?: number;
  peso_liquido_kg?: number;
  formato_venda: string;
  taxa_ifood_percentual?: number;
  preco_concorrente?: number;
  promocao_ativa: boolean;
  preco_promocional?: number;
  embalagem_id?: string;
  calculo?: CalculoCMV;
}

export function PrecificacaoAvancada() {
  const { currentRestaurant } = useAuth();
  const [pratos, setPratos] = useState<PratoCompleto[]>([]);
  const [pratoSelecionado, setPratoSelecionado] = useState<string>('');
  const [calculoAtual, setCalculoAtual] = useState<CalculoCMV | null>(null);
  const [embalagens, setEmbalagens] = useState<any[]>([]);
  const [canaisVenda, setCanaisVenda] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDados();
    }
  }, [currentRestaurant]);

  const carregarDados = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);

      // Carregar pratos
      const { data: pratosData, error: pratosError } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome_prato');

      if (pratosError) throw pratosError;
      setPratos(pratosData || []);

      // Carregar embalagens
      const { data: embalagemData, error: embalagemError } = await supabase
        .from('embalagens')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (embalagemError) throw embalagemError;
      setEmbalagens(embalagemData || []);

      // Carregar canais
      const { data: canaisData, error: canaisError } = await supabase
        .from('canais_venda')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (canaisError) throw canaisError;
      setCanaisVenda(canaisData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularCMVCompleto = async (pratoId: string) => {
    if (!pratoId) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .rpc('calcular_cmv_completo', { prato_uuid: pratoId });

      if (error) throw error;

      if (data && data.length > 0) {
        const calculo = data[0] as CalculoCMV;
        setCalculoAtual(calculo);

        // Atualizar o prato com os novos cálculos
        setPratos(prev => prev.map(prato => 
          prato.id === pratoId 
            ? { ...prato, calculo }
            : prato
        ));
      }
    } catch (error) {
      console.error('Erro ao calcular CMV:', error);
      toast.error('Erro ao calcular CMV');
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarPrecoPrato = async (pratoId: string, campo: string, valor: any) => {
    try {
      const { error } = await supabase
        .from('pratos')
        .update({ [campo]: valor })
        .eq('id', pratoId);

      if (error) throw error;

      // Recalcular após atualização
      await calcularCMVCompleto(pratoId);
      toast.success(`${campo} atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar prato');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'prejuizo':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'margem_baixa':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'saudavel':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Calculator className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'prejuizo': return 'Preju{Izo';
      case 'margem_baixa': return 'Margem Baixa';
      case 'saudavel': return 'Saudável';
      default: return 'Não calculado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prejuizo': return 'bg-red-100 text-red-800';
      case 'margem_baixa': return 'bg-yellow-100 text-yellow-800';
      case 'saudavel': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pratoAtual = pratos.find(p => p.id === pratoSelecionado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Precificação Avançada</h1>
          <p className="text-muted-foreground">
            Cálculo detalhado de CMV, margens e preços sugeridos por canal
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seletor de Prato */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Selecionar Prato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={pratoSelecionado} onValueChange={setPratoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um prato" />
                </SelectTrigger>
                <SelectContent>
                  {pratos.map((prato) => (
                    <SelectItem key={prato.id} value={prato.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{prato.nome_prato}</span>
                        {prato.calculo && (
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(prato.calculo.status_viabilidade)}`}>
                            {getStatusText(prato.calculo.status_viabilidade)}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {pratoSelecionado && (
                <Button 
                  onClick={() => calcularCMVCompleto(pratoSelecionado)}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {isLoading ? 'Calculando...' : 'Calcular CMV Completo'}
                </Button>
              )}

              {/* Lista resumida de pratos */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pratos.map((prato) => (
                  <div 
                    key={prato.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      pratoSelecionado === prato.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setPratoSelecionado(prato.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{prato.nome_prato}</h4>
                        <p className="text-xs text-muted-foreground">{prato.categoria}</p>
                      </div>
                      {prato.calculo && getStatusIcon(prato.calculo.status_viabilidade)}
                    </div>
                    {prato.calculo && (
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>CMV:</span>
                          <span className="font-medium">R$ {prato.calculo.custo_por_porcao.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preço sugerido:</span>
                          <span className="font-medium text-green-600">R$ {prato.calculo.preco_sugerido_balcao.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise Detalhada */}
        <div className="lg:col-span-2 space-y-6">
          {pratoAtual && calculoAtual ? (
            <>
              {/* Status do Prato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(calculoAtual.status_viabilidade)}
                    Análise: {pratoAtual.nome_prato}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Detalhamento de Custos */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Detalhamento de Custos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Ingredientes:</span>
                          <span>R$ {calculoAtual.custo_ingredientes.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Embalagem:</span>
                          <span>R$ {calculoAtual.custo_embalagem.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Perdas/Margem:</span>
                          <span>R$ {calculoAtual.custo_perdas.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Custo Total:</span>
                          <span>R$ {calculoAtual.custo_total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Custo por Porção:</span>
                          <span className="text-blue-600">R$ {calculoAtual.custo_por_porcao.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Preços e Margens */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Preços e Margens</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Preço Balcão:</span>
                          <span className="font-semibold text-green-600">R$ {calculoAtual.preco_sugerido_balcao.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preço iFood:</span>
                          <span className="font-semibold text-green-600">R$ {calculoAtual.preco_sugerido_ifood.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span>Margem Bruta:</span>
                          <span className={`font-semibold ${calculoAtual.margem_bruta_percentual >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {calculoAtual.margem_bruta_percentual.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margem Líquida:</span>
                          <span className={`font-semibold ${calculoAtual.margem_liquida_percentual >= 15 ? 'text-green-600' : calculoAtual.margem_liquida_percentual >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {calculoAtual.margem_liquida_percentual.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alertas */}
                  <div className="mt-6">
                    {calculoAtual.status_viabilidade === 'prejuizo' && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">
                          <strong>Atenção:</strong> Este prato está operando com prejuízo. 
                          Considere revisar os ingredientes, reduzir perdas ou ajustar o markup.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {calculoAtual.status_viabilidade === 'margem_baixa' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-yellow-700">
                          <strong>Cuidado:</strong> Margem de lucro baixa ({calculoAtual.margem_liquida_percentual.toFixed(1)}%). 
                          Recomendamos otimizar custos ou aumentar preços.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {calculoAtual.status_viabilidade === 'saudavel' && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-green-700">
                          <strong>Excelente!</strong> Este prato possui margem saudável 
                          ({calculoAtual.margem_liquida_percentual.toFixed(1)}%) e é altamente viável.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações por Canal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Preços por Canal de Venda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Balcão/Local</span>
                          <Badge variant="default">0% taxa</Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {calculoAtual.preco_sugerido_balcao.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Margem: {calculoAtual.margem_liquida_percentual.toFixed(1)}%
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">iFood/Delivery</span>
                          <Badge variant="secondary">{pratoAtual.taxa_ifood_percentual || 15}% taxa</Badge>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                          R$ {calculoAtual.preco_sugerido_ifood.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Taxa compensada no preço
                        </p>
                      </div>
                    </div>

                    {/* Configurações Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="taxa_ifood">Taxa iFood (%)</Label>
                        <Input
                          id="taxa_ifood"
                          type="number"
                          step="0.1"
                          value={pratoAtual.taxa_ifood_percentual || 15}
                          onChange={(e) => atualizarPrecoPrato(
                            pratoAtual.id, 
                            'taxa_ifood_percentual', 
                            parseFloat(e.target.value) || 0
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="preco_concorrente">Preço Concorrente (R$)</Label>
                        <Input
                          id="preco_concorrente"
                          type="number"
                          step="0.01"
                          value={pratoAtual.preco_concorrente || ''}
                          onChange={(e) => atualizarPrecoPrato(
                            pratoAtual.id, 
                            'preco_concorrente', 
                            parseFloat(e.target.value) || null
                          )}
                          placeholder="Ex: 25.90"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          checked={pratoAtual.promocao_ativa || false}
                          onCheckedChange={(checked) => atualizarPrecoPrato(
                            pratoAtual.id, 
                            'promocao_ativa', 
                            checked
                          )}
                        />
                        <Label>Promoção Ativa</Label>
                      </div>
                    </div>

                    {/* Comparação com Concorrência */}
                    {pratoAtual.preco_concorrente && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Análise Competitiva</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Seu preço:</span>
                            <p className="font-semibold">R$ {calculoAtual.preco_sugerido_balcao.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Concorrente:</span>
                            <p className="font-semibold">R$ {pratoAtual.preco_concorrente.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          {calculoAtual.preco_sugerido_balcao < pratoAtual.preco_concorrente ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Preço competitivo ({((pratoAtual.preco_concorrente - calculoAtual.preco_sugerido_balcao) / pratoAtual.preco_concorrente * 100).toFixed(1)}% menor)
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Preço acima da concorrência ({((calculoAtual.preco_sugerido_balcao - pratoAtual.preco_concorrente) / pratoAtual.preco_concorrente * 100).toFixed(1)}% maior)
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : pratoSelecionado ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Clique em "Calcular CMV Completo" para ver a análise detalhada</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Selecione um prato para começar a análise de precificação</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
