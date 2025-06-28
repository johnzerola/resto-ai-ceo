
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DREService, DREMensal } from '@/services/DREService';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export function DRECompleto() {
  const { currentRestaurant } = useAuth();
  const [dreAtual, setDreAtual] = useState<DREMensal | null>(null);
  const [dresComparativos, setDresComparativos] = useState<DREMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDados();
    }
  }, [currentRestaurant]);

  const carregarDados = async () => {
    if (!currentRestaurant?.id) return;

    setLoading(true);
    try {
      // Carregar DRE atual
      const dre = await DREService.getDREMensal(currentRestaurant.id, mesAtual, anoAtual);
      setDreAtual(dre);

      // Carregar comparativo
      const comparativo = await DREService.getDREComparativo(currentRestaurant.id, 6);
      setDresComparativos(comparativo);
    } catch (error) {
      console.error('Erro ao carregar DRE:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDREAutomatico = async () => {
    if (!currentRestaurant?.id) return;

    setCalculando(true);
    try {
      const sucesso = await DREService.calcularDREAutomatico(currentRestaurant.id, mesAtual, anoAtual);
      if (sucesso) {
        await carregarDados();
        toast.success('DRE calculado com base nos dados do fluxo de caixa');
      }
    } catch (error) {
      console.error('Erro ao calcular DRE:', error);
    } finally {
      setCalculando(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (percentual: number) => {
    if (percentual > 20) return 'text-green-600';
    if (percentual > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const analiseTendencias = dresComparativos.length > 1 
    ? DREService.analisarTendencias(dresComparativos)
    : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">DRE - Demonstrativo de Resultados</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button 
          onClick={calcularDREAutomatico} 
          disabled={calculando}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {calculando ? 'Calculando...' : 'Calcular DRE'}
        </Button>
      </div>

      {!dreAtual && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <p className="text-orange-800">
                DRE não encontrado para este mês. Clique em "Calcular DRE" para gerar automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dre" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dre">DRE Detalhado</TabsTrigger>
          <TabsTrigger value="analise">Análise Harvard</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          {dreAtual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Demonstrativo de Resultados - Padrão Contábil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* RECEITAS */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">RECEITAS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Bruta</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dreAtual.receita_bruta)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">(-) Deduções</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatarMoeda(dreAtual.deducoes_vendas)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-muted-foreground">= Receita Líquida</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatarMoeda(dreAtual.receita_liquida)}
                    </p>
                  </div>
                </div>

                {/* CUSTOS */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">CUSTOS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">CMV Total</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatarMoeda(dreAtual.cmv_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">% da Receita</p>
                      <p className="text-lg font-semibold">
                        {((dreAtual.cmv_total / dreAtual.receita_liquida) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-muted-foreground">= Lucro Bruto</p>
                    <p className={`text-xl font-bold ${getStatusColor(dreAtual.margem_bruta_percentual)}`}>
                      {formatarMoeda(dreAtual.lucro_bruto)}
                    </p>
                  </div>
                </div>

                {/* DESPESAS OPERACIONAIS */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">DESPESAS OPERACIONAIS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pessoal</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dreAtual.despesas_pessoal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aluguel</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dreAtual.despesas_aluguel)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Marketing</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dreAtual.despesas_marketing)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery</p>
                      <p className="text-lg font-semibold">{formatarMoeda(dreAtual.despesas_delivery)}</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-muted-foreground">= EBITDA</p>
                    <p className={`text-xl font-bold ${getStatusColor(dreAtual.ebitda / dreAtual.receita_liquida * 100)}`}>
                      {formatarMoeda(dreAtual.ebitda)}
                    </p>
                  </div>
                </div>

                {/* RESULTADO FINAL */}
                <div className="bg-gray-900 text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-300">RESULTADO LÍQUIDO</p>
                      <p className="text-2xl font-bold">
                        {formatarMoeda(dreAtual.resultado_liquido)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Margem Líquida</p>
                      <p className="text-2xl font-bold">
                        {dreAtual.margem_liquida_percentual.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          {dreAtual && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status do Negócio</p>
                      <Badge variant={dreAtual.margem_liquida_percentual > 15 ? 'default' : 
                                     dreAtual.margem_liquida_percentual > 5 ? 'secondary' : 'destructive'}>
                        {dreAtual.margem_liquida_percentual > 15 ? 'Excelente' :
                         dreAtual.margem_liquida_percentual > 5 ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Eficiência de Custos</p>
                      <p className="text-lg font-semibold">
                        {dreAtual.cmv_total / dreAtual.receita_liquida < 0.30 ? '✅ Ótima' :
                         dreAtual.cmv_total / dreAtual.receita_liquida < 0.40 ? '⚠️ Aceitável' : '🚨 Ruim'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Benchmark da Indústria</p>
                      <p className="text-sm">
                        Margem líquida ideal: 15-25%<br/>
                        CMV ideal: 25-35%<br/>
                        Sua margem: <strong>{dreAtual.margem_liquida_percentual.toFixed(1)}%</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações Harvard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dreAtual.margem_liquida_percentual < 5 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          🚨 <strong>CRÍTICO:</strong> Margem muito baixa. Revise preços urgentemente.
                        </p>
                      </div>
                    )}
                    
                    {(dreAtual.cmv_total / dreAtual.receita_liquida) > 0.35 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-800">
                          ⚠️ CMV alto. Renegocie com fornecedores e reduza desperdícios.
                        </p>
                      </div>
                    )}

                    {dreAtual.margem_liquida_percentual > 15 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          ✅ Excelente performance! Considere expansão do negócio.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          {analiseTendencias && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {analiseTendencias.tendencia_receita === 'crescimento' ? 
                      <TrendingUp className="w-5 h-5 text-green-600" /> :
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    }
                    Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita</p>
                      <Badge variant={analiseTendencias.tendencia_receita === 'crescimento' ? 'default' : 'destructive'}>
                        {analiseTendencias.tendencia_receita === 'crescimento' ? '📈 Crescimento' :
                         analiseTendencias.tendencia_receita === 'declinio' ? '📉 Declínio' : '➡️ Estável'}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <Badge variant={analiseTendencias.tendencia_margem === 'melhorando' ? 'default' : 'destructive'}>
                        {analiseTendencias.tendencia_margem === 'melhorando' ? '📈 Melhorando' :
                         analiseTendencias.tendencia_margem === 'piorando' ? '📉 Piorando' : '➡️ Estável'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas & Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analiseTendencias.alertas.map((alerta, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {alerta}
                      </div>
                    ))}

                    {analiseTendencias.recomendacoes.map((recomendacao, index) => (
                      <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                        💡 {recomendacao}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
