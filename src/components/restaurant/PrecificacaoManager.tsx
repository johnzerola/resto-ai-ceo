import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  DollarSign,
  Target,
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PrecificacaoManagerProps {
  fichasTecnicas?: any[];
  onPriceUpdate?: (updates: any[]) => void;
}

export function PrecificacaoManager({ fichasTecnicas = [], onPriceUpdate }: PrecificacaoManagerProps) {
  const { currentRestaurant } = useAuth();
  const [configuracoes, setConfiguracoes] = useState<any>({
    markup_padrao: 250,
    margem_lucro_esperada: 30,
    taxa_impostos: 12,
    perda_media_percentual: 5,
    despesas_fixas_mensais: 5000,
    despesas_variaveis_mensais: 15
  });
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [simulacoes, setSimulacoes] = useState<any[]>([]);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarConfiguracoes();
    }
  }, [currentRestaurant]);

  const carregarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguracoes({
          markup_padrao: data.markup_padrao || 250,
          margem_lucro_esperada: data.margem_lucro_esperada || 30,
          taxa_impostos: data.taxa_impostos || 12,
          perda_media_percentual: data.perda_media_percentual || 5,
          despesas_fixas_mensais: data.despesas_fixas_mensais || 5000,
          despesas_variaveis_mensais: data.despesas_variaveis_mensais || 15
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { error } = await supabase
        .from('configuracoes_restaurante')
        .upsert({
          restaurant_id: currentRestaurant.id,
          ...configuracoes
        });

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
      setIsEditingConfig(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const simularPreco = (ficha: any, novoMarkup: number) => {
    const custoBase = ficha.custo_por_porcao || ficha.custo_total;
    const precoSugerido = custoBase * (novoMarkup / 100);
    const lucroEstimado = precoSugerido - custoBase;
    const margemBruta = precoSugerido > 0 ? (lucroEstimado / precoSugerido) * 100 : 0;
    
    // Considerando impostos
    const impostos = precoSugerido * (configuracoes.taxa_impostos / 100);
    const lucroLiquido = lucroEstimado - impostos;
    const margemLiquida = precoSugerido > 0 ? (lucroLiquido / precoSugerido) * 100 : 0;
    
    return {
      precoSugerido,
      lucroEstimado: lucroLiquido,
      margemLiquida,
      statusViabilidade: margemLiquida < 0 ? 'prejuizo' : margemLiquida < configuracoes.margem_lucro_esperada ? 'atencao' : 'saudavel'
    };
  };

  const aplicarMarkupGeral = async (novoMarkup: number) => {
    if (!currentRestaurant?.id) return;

    try {
      const updates = fichasTecnicas.map(ficha => {
        const simulacao = simularPreco(ficha, novoMarkup);
        return {
          id: ficha.id,
          preco_sugerido: simulacao.precoSugerido,
          preco_praticado: simulacao.precoSugerido,
          margem_percentual: simulacao.margemLiquida,
          lucro_estimado: simulacao.lucroEstimado,
          status_viabilidade: simulacao.statusViabilidade
        };
      });

      // Atualizar no banco
      for (const update of updates) {
        await supabase
          .from('pratos')
          .update({
            preco_sugerido: update.preco_sugerido,
            preco_praticado: update.preco_praticado,
            margem_percentual: update.margem_percentual,
            lucro_estimado: update.lucro_estimado,
            status_viabilidade: update.status_viabilidade
          })
          .eq('id', update.id);
      }

      // Atualizar configuração padrão
      await supabase
        .from('configuracoes_restaurante')
        .upsert({
          restaurant_id: currentRestaurant.id,
          ...configuracoes,
          markup_padrao: novoMarkup
        });

      toast.success(`Markup de ${novoMarkup}% aplicado a todos os produtos!`);
      onPriceUpdate?.(updates);
    } catch (error) {
      console.error('Erro ao aplicar markup:', error);
      toast.error('Erro ao aplicar markup');
    }
  };

  const calcularPontoEquilibrio = () => {
    const custoFixoMensal = configuracoes.despesas_fixas_mensais;
    const margemMediaContribuicao = fichasTecnicas.reduce((acc, ficha) => {
      const precoVenda = ficha.preco_praticado || ficha.preco_sugerido;
      const custoVariavel = ficha.custo_por_porcao * (1 + configuracoes.despesas_variaveis_mensais / 100);
      return acc + (precoVenda - custoVariavel);
    }, 0) / Math.max(fichasTecnicas.length, 1);

    const pontoEquilibrio = custoFixoMensal / margemMediaContribuicao;
    return Math.ceil(pontoEquilibrio);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Precificação Inteligente
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure margens e calcule preços automaticamente
          </p>
        </div>
      </div>

      <Tabs defaultValue="configuracoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="aplicar">Aplicar Markup</TabsTrigger>
          <TabsTrigger value="simulador">Simulador</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Precificação
                </span>
                <Button
                  variant={isEditingConfig ? "default" : "outline"}
                  onClick={() => isEditingConfig ? salvarConfiguracoes() : setIsEditingConfig(true)}
                >
                  {isEditingConfig ? 'Salvar' : 'Editar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Markup Padrão (%)</Label>
                  <Input
                    type="number"
                    value={configuracoes.markup_padrao}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, markup_padrao: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                  <p className="text-xs text-muted-foreground">
                    Multiplicador aplicado sobre o custo (ex: 250% = preço 2.5x maior que o custo)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Margem de Lucro Esperada (%)</Label>
                  <Input
                    type="number"
                    value={configuracoes.margem_lucro_esperada}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, margem_lucro_esperada: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta de margem líquida para considerar produto saudável
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Taxa de Impostos (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configuracoes.taxa_impostos}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, taxa_impostos: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Perdas Médias (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configuracoes.perda_media_percentual}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, perda_media_percentual: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Despesas Fixas Mensais (R$)</Label>
                  <Input
                    type="number"
                    value={configuracoes.despesas_fixas_mensais}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, despesas_fixas_mensais: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Despesas Variáveis (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configuracoes.despesas_variaveis_mensais}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, despesas_variaveis_mensais: Number(e.target.value) }))}
                    disabled={!isEditingConfig}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aplicar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Aplicar Markup em Massa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                  Esta ação irá recalcular os preços de TODOS os produtos baseado no novo markup.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={() => aplicarMarkupGeral(200)}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">200%</span>
                  <span className="text-sm">Markup Conservador</span>
                </Button>
                
                <Button
                  onClick={() => aplicarMarkupGeral(250)}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">250%</span>
                  <span className="text-sm">Markup Padrão</span>
                </Button>
                
                <Button
                  onClick={() => aplicarMarkupGeral(300)}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">300%</span>
                  <span className="text-sm">Markup Agressivo</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Markup personalizado (%)"
                  onChange={(e) => {
                    if (e.target.value && Number(e.target.value) > 0) {
                      setSimulacoes([{ markup: Number(e.target.value) }]);
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const markup = simulacoes[0]?.markup;
                    if (markup) aplicarMarkupGeral(markup);
                  }}
                  disabled={!simulacoes[0]?.markup}
                >
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulador" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Simulador de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fichasTecnicas.slice(0, 5).map((ficha) => {
                  const simulacao = simularPreco(ficha, configuracoes.markup_padrao);
                  return (
                    <div key={ficha.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{ficha.nome_prato}</h4>
                        <Badge
                          variant={
                            simulacao.statusViabilidade === 'saudavel' ? 'default' :
                            simulacao.statusViabilidade === 'atencao' ? 'secondary' : 'destructive'
                          }
                        >
                          {simulacao.statusViabilidade === 'saudavel' ? 'Saudável' :
                           simulacao.statusViabilidade === 'atencao' ? 'Atenção' : 'Prejuízo'}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">Custo: </span>
                          {formatCurrency(ficha.custo_por_porcao || ficha.custo_total)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preço Sugerido: </span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(simulacao.precoSugerido)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lucro: </span>
                          {formatCurrency(simulacao.lucroEstimado)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Margem: </span>
                          {simulacao.margemLiquida.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {fichasTecnicas.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma ficha técnica disponível para simulação</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ponto de Equilíbrio</p>
                    <p className="text-2xl font-bold">
                      {calcularPontoEquilibrio()} vendas/mês
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Produtos Saudáveis</p>
                    <p className="text-2xl font-bold text-green-600">
                      {fichasTecnicas.filter(f => 
                        simularPreco(f, configuracoes.markup_padrao).statusViabilidade === 'saudavel'
                      ).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
                    <p className="text-2xl font-bold">
                      {fichasTecnicas.length > 0 ? (
                        fichasTecnicas.reduce((acc, f) => 
                          acc + simularPreco(f, configuracoes.markup_padrao).margemLiquida, 0
                        ) / fichasTecnicas.length
                      ).toFixed(1) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receita Potencial</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        fichasTecnicas.reduce((acc, f) => 
                          acc + simularPreco(f, configuracoes.markup_padrao).precoSugerido, 0
                        ) * calcularPontoEquilibrio()
                      )}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos que Precisam de Atenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fichasTecnicas
                  .filter(f => simularPreco(f, configuracoes.markup_padrao).statusViabilidade !== 'saudavel')
                  .map(ficha => {
                    const simulacao = simularPreco(ficha, configuracoes.markup_padrao);
                    return (
                      <div key={ficha.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{ficha.nome_prato}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Margem: {simulacao.margemLiquida.toFixed(1)}%
                          </span>
                          <Badge variant="destructive">
                            {simulacao.statusViabilidade === 'prejuizo' ? 'Prejuízo' : 'Baixa Margem'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                
                {fichasTecnicas.filter(f => 
                  simularPreco(f, configuracoes.markup_padrao).statusViabilidade !== 'saudavel'
                ).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p>Todos os produtos estão com margens saudáveis!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}