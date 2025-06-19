
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  Target, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ConfiguracaoEmpresarial {
  id?: string;
  restaurant_id?: string;
  despesas_fixas_mensais: number;
  despesas_variaveis_mensais: number;
  receita_mensal_esperada: number;
  markup_padrao: number;
  margem_lucro_esperada: number;
  taxa_ifood: number;
  taxa_entrega: number;
  taxa_impostos: number;
  meta_vendas_diaria: number;
  custo_medio_por_prato: number;
  rendimento_porcao_padrao: number;
  perda_media_percentual: number;
  ticket_medio_esperado: number;
  pratos_vendidos_dia_meta: number;
}

export function ConfiguracaoEmpresarial() {
  const { currentRestaurant } = useAuth();
  const [config, setConfig] = useState<ConfiguracaoEmpresarial>({
    despesas_fixas_mensais: 0,
    despesas_variaveis_mensais: 0,
    receita_mensal_esperada: 0,
    markup_padrao: 250,
    margem_lucro_esperada: 30,
    taxa_ifood: 15,
    taxa_entrega: 5,
    taxa_impostos: 12,
    meta_vendas_diaria: 0,
    custo_medio_por_prato: 0,
    rendimento_porcao_padrao: 1,
    perda_media_percentual: 5,
    ticket_medio_esperado: 0,
    pratos_vendidos_dia_meta: 50
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alertas, setAlertas] = useState<string[]>([]);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarConfiguracoes();
    }
  }, [currentRestaurant]);

  useEffect(() => {
    calcularMetasAutomaticas();
  }, [config.receita_mensal_esperada, config.custo_medio_por_prato, config.markup_padrao]);

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
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const calcularMetasAutomaticas = () => {
    const ticketMedio = config.custo_medio_por_prato * (config.markup_padrao / 100);
    const metaDiaria = config.receita_mensal_esperada / 30;
    const pratosNecessarios = ticketMedio > 0 ? Math.ceil(metaDiaria / ticketMedio) : 50;

    setConfig(prev => ({
      ...prev,
      ticket_medio_esperado: ticketMedio,
      meta_vendas_diaria: metaDiaria,
      pratos_vendidos_dia_meta: pratosNecessarios
    }));

    // Gerar alertas baseados nos dados
    const novosAlertas: string[] = [];
    
    if (config.despesas_fixas_mensais > config.receita_mensal_esperada * 0.6) {
      novosAlertas.push("⚠️ Despesas fixas muito altas (>60% da receita)");
    }
    
    if (config.markup_padrao < 200) {
      novosAlertas.push("⚠️ Markup baixo - pode não cobrir todos os custos");
    }
    
    if (config.taxa_ifood + config.taxa_entrega + config.taxa_impostos > 35) {
      novosAlertas.push("⚠️ Taxas totais muito altas (>35%)");
    }

    setAlertas(novosAlertas);
  };

  const salvarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('configuracoes_restaurante')
        .upsert({
          restaurant_id: currentRestaurant.id,
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularPontoEquilibrio = () => {
    const custosFixos = config.despesas_fixas_mensais;
    const ticketMedio = config.ticket_medio_esperado;
    const margemContribuicao = ticketMedio * (config.margem_lucro_esperada / 100);
    
    return margemContribuicao > 0 ? Math.ceil(custosFixos / margemContribuicao) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Configuração Empresarial
          </h1>
          <p className="text-muted-foreground">
            Configure todos os parâmetros para gestão inteligente do seu restaurante
          </p>
        </div>
        <Button onClick={salvarConfiguracoes} disabled={isLoading}>
          Salvar Configurações
        </Button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {alertas.map((alerta, index) => (
                <div key={index}>{alerta}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Despesas e Receitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="despesas_fixas">Despesas Fixas Mensais (R$)</Label>
                  <Input
                    id="despesas_fixas"
                    type="number"
                    step="0.01"
                    value={config.despesas_fixas_mensais}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      despesas_fixas_mensais: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Aluguel, salários, energia..."
                  />
                </div>

                <div>
                  <Label htmlFor="despesas_variaveis">Despesas Variáveis Mensais (R$)</Label>
                  <Input
                    id="despesas_variaveis"
                    type="number"
                    step="0.01"
                    value={config.despesas_variaveis_mensais}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      despesas_variaveis_mensais: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Ingredientes extras, marketing..."
                  />
                </div>

                <div>
                  <Label htmlFor="receita_esperada">Receita Mensal Esperada (R$)</Label>
                  <Input
                    id="receita_esperada"
                    type="number"
                    step="0.01"
                    value={config.receita_mensal_esperada}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      receita_mensal_esperada: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Meta de faturamento mensal"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parâmetros de Precificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="markup">Markup Padrão (%)</Label>
                  <Input
                    id="markup"
                    type="number"
                    step="1"
                    value={config.markup_padrao}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      markup_padrao: parseFloat(e.target.value) || 250
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: 250-400%
                  </p>
                </div>

                <div>
                  <Label htmlFor="margem_lucro">Margem de Lucro Esperada (%)</Label>
                  <Input
                    id="margem_lucro"
                    type="number"
                    step="0.1"
                    value={config.margem_lucro_esperada}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      margem_lucro_esperada: parseFloat(e.target.value) || 30
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="custo_medio">Custo Médio por Prato (R$)</Label>
                  <Input
                    id="custo_medio"
                    type="number"
                    step="0.01"
                    value={config.custo_medio_por_prato}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      custo_medio_por_prato: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxas e Impostos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taxa_ifood">Taxa iFood (%)</Label>
                  <Input
                    id="taxa_ifood"
                    type="number"
                    step="0.1"
                    value={config.taxa_ifood}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      taxa_ifood: parseFloat(e.target.value) || 15
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="taxa_entrega">Taxa de Entrega (%)</Label>
                  <Input
                    id="taxa_entrega"
                    type="number"
                    step="0.1"
                    value={config.taxa_entrega}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      taxa_entrega: parseFloat(e.target.value) || 5
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="taxa_impostos">Taxa de Impostos (%)</Label>
                  <Input
                    id="taxa_impostos"
                    type="number"
                    step="0.1"
                    value={config.taxa_impostos}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      taxa_impostos: parseFloat(e.target.value) || 12
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parâmetros Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rendimento">Rendimento por Porção Padrão</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    step="0.1"
                    value={config.rendimento_porcao_padrao}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      rendimento_porcao_padrao: parseFloat(e.target.value) || 1
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="perda_media">Perda Média (%)</Label>
                  <Input
                    id="perda_media"
                    type="number"
                    step="0.1"
                    value={config.perda_media_percentual}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      perda_media_percentual: parseFloat(e.target.value) || 5
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Perdas por deterioração, preparo, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Meta Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {config.meta_vendas_diaria.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Receita por dia</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {config.ticket_medio_esperado.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Por cliente</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  Pratos/Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {config.pratos_vendidos_dia_meta}
                  </p>
                  <p className="text-sm text-muted-foreground">Meta de vendas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analise" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Ponto de Equilíbrio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {calcularPontoEquilibrio()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pratos/mês para cobrir custos
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Custos fixos/mês:</span>
                      <span>R$ {config.despesas_fixas_mensais.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem por prato:</span>
                      <span>R$ {(config.ticket_medio_esperado * (config.margem_lucro_esperada / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Configuração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Configurações básicas:</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Metas calculadas:</span>
                    <Badge variant={config.meta_vendas_diaria > 0 ? "default" : "secondary"}>
                      {config.meta_vendas_diaria > 0 ? "Ativo" : "Pendente"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ponto de equilíbrio:</span>
                    <Badge variant={calcularPontoEquilibrio() > 0 ? "default" : "secondary"}>
                      {calcularPontoEquilibrio() > 0 ? "Calculado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
