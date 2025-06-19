
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Package, 
  Truck, 
  Calculator, 
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Embalagem {
  id: string;
  nome: string;
  tipo: 'descartavel' | 'retornavel' | 'personalizada';
  custo_unitario: number;
  quantidade_minima: number;
  fornecedor?: string;
}

interface CanalVenda {
  id: string;
  nome: string;
  taxa_percentual: number;
  taxa_fixa: number;
  tempo_entrega_min: number;
  ativo: boolean;
}

interface ConfiguracoesPrecificacao {
  markup_padrao: number;
  despesa_fixa_mensal: number;
  despesa_variavel_percentual: number;
  imposto_percentual: number;
  total_pratos_vendidos_mensal: number;
  margem_seguranca_padrao: number;
}

export function ConfiguracoesAvancadas() {
  const { currentRestaurant } = useAuth();
  const [activeTab, setActiveTab] = useState("geral");
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [canaisVenda, setCanaisVenda] = useState<CanalVenda[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesPrecificacao>({
    markup_padrao: 300,
    despesa_fixa_mensal: 5000,
    despesa_variavel_percentual: 10,
    imposto_percentual: 15,
    total_pratos_vendidos_mensal: 1000,
    margem_seguranca_padrao: 10
  });
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

      // Carregar configurações
      const { data: configData, error: configError } = await supabase
        .from('configuracoes_precificacao')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;
      
      if (configData) {
        setConfiguracoes(configData);
      }

      // Carregar embalagens
      const { data: embalagemData, error: embalagemError } = await supabase
        .from('embalagens')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (embalagemError) throw embalagemError;
      setEmbalagens(embalagemData || []);

      // Carregar canais de venda
      const { data: canaisData, error: canaisError } = await supabase
        .from('canais_venda')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (canaisError) throw canaisError;
      setCanaisVenda(canaisData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('configuracoes_precificacao')
        .upsert({
          restaurant_id: currentRestaurant.id,
          ...configuracoes,
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

  const adicionarEmbalagem = async (embalagem: Omit<Embalagem, 'id'>) => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('embalagens')
        .insert({
          ...embalagem,
          restaurant_id: currentRestaurant.id
        })
        .select()
        .single();

      if (error) throw error;

      setEmbalagens(prev => [...prev, data]);
      toast.success('Embalagem adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar embalagem:', error);
      toast.error('Erro ao adicionar embalagem');
    }
  };

  const adicionarCanalVenda = async (canal: Omit<CanalVenda, 'id'>) => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('canais_venda')
        .insert({
          ...canal,
          restaurant_id: currentRestaurant.id
        })
        .select()
        .single();

      if (error) throw error;

      setCanaisVenda(prev => [...prev, data]);
      toast.success('Canal de venda adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar canal:', error);
      toast.error('Erro ao adicionar canal de venda');
    }
  };

  const calcularMargemRecomendada = () => {
    const custoFixoPorPrato = configuracoes.despesa_fixa_mensal / configuracoes.total_pratos_vendidos_mensal;
    const margemMinima = (custoFixoPorPrato * 100) + 20; // 20% de lucro mínimo
    return Math.round(margemMinima);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações Avançadas</h1>
          <p className="text-muted-foreground">
            Configure todos os parâmetros para precificação e controle de custos
          </p>
        </div>
        <Button onClick={salvarConfiguracoes} disabled={isLoading}>
          <Settings className="h-4 w-4 mr-2" />
          Salvar Todas as Configurações
        </Button>
      </div>

      {/* Tabs de Configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="embalagens">Embalagens</TabsTrigger>
          <TabsTrigger value="canais">Canais de Venda</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Configurações de Precificação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parâmetros de Precificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="markup_padrao">Markup Padrão (%)</Label>
                  <Input
                    id="markup_padrao"
                    type="number"
                    value={configuracoes.markup_padrao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      markup_padrao: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: {calcularMargemRecomendada()}% com base nos seus custos fixos
                  </p>
                </div>

                <div>
                  <Label htmlFor="margem_seguranca">Margem de Segurança (%)</Label>
                  <Input
                    id="margem_seguranca"
                    type="number"
                    step="0.1"
                    value={configuracoes.margem_seguranca_padrao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      margem_seguranca_padrao: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Para cobrir perdas e variações de preço
                  </p>
                </div>

                <div>
                  <Label htmlFor="imposto_percentual">Impostos (%)</Label>
                  <Input
                    id="imposto_percentual"
                    type="number"
                    step="0.1"
                    value={configuracoes.imposto_percentual}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      imposto_percentual: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custos Operacionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Custos Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="despesa_fixa">Despesa Fixa Mensal (R$)</Label>
                  <Input
                    id="despesa_fixa"
                    type="number"
                    step="0.01"
                    value={configuracoes.despesa_fixa_mensal}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      despesa_fixa_mensal: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Aluguel, salários, energia, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="despesa_variavel">Despesa Variável (%)</Label>
                  <Input
                    id="despesa_variavel"
                    type="number"
                    step="0.1"
                    value={configuracoes.despesa_variavel_percentual}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      despesa_variavel_percentual: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comissões, taxas de cartão, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="total_pratos">Estimativa de Pratos/Mês</Label>
                  <Input
                    id="total_pratos"
                    type="number"
                    value={configuracoes.total_pratos_vendidos_mensal}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      total_pratos_vendidos_mensal: parseInt(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Para rateio de custos fixos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Calculado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo dos Cálculos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {(configuracoes.despesa_fixa_mensal / configuracoes.total_pratos_vendidos_mensal).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Custo fixo por prato</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {calcularMargemRecomendada()}%
                  </p>
                  <p className="text-sm text-muted-foreground">Markup recomendado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {configuracoes.despesa_fixa_mensal.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Faturamento mínimo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(configuracoes.despesa_fixa_mensal / 30)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pratos/dia mínimo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Embalagens */}
        <TabsContent value="embalagens" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestão de Embalagens
                </CardTitle>
                <Button onClick={() => {
                  const nome = prompt('Nome da embalagem:');
                  const custo = prompt('Custo unitário (R$):');
                  if (nome && custo) {
                    adicionarEmbalagem({
                      nome,
                      tipo: 'descartavel',
                      custo_unitario: parseFloat(custo),
                      quantidade_minima: 1
                    });
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Embalagem
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {embalagens.map((embalagem) => (
                  <div key={embalagem.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{embalagem.nome}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Tipo: {embalagem.tipo}</span>
                        <span>Custo: R$ {embalagem.custo_unitario.toFixed(2)}</span>
                        {embalagem.fornecedor && <span>Fornecedor: {embalagem.fornecedor}</span>}
                      </div>
                    </div>
                    <Badge variant={embalagem.tipo === 'descartavel' ? 'destructive' : 'default'}>
                      {embalagem.tipo}
                    </Badge>
                  </div>
                ))}
                
                {embalagens.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma embalagem cadastrada</p>
                    <p className="text-sm">Adicione embalagens para calcular custos precisos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Canais de Venda */}
        <TabsContent value="canais" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Canais de Venda
                </CardTitle>
                <Button onClick={() => {
                  const nome = prompt('Nome do canal (ex: iFood, Uber Eats):');
                  const taxa = prompt('Taxa percentual (%):');
                  if (nome && taxa) {
                    adicionarCanalVenda({
                      nome,
                      taxa_percentual: parseFloat(taxa),
                      taxa_fixa: 0,
                      tempo_entrega_min: 30,
                      ativo: true
                    });
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Canal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {canaisVenda.map((canal) => (
                  <div key={canal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{canal.nome}</h4>
                        <Switch checked={canal.ativo} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Taxa: {canal.taxa_percentual}%</span>
                        {canal.taxa_fixa > 0 && <span>Taxa fixa: R$ {canal.taxa_fixa.toFixed(2)}</span>}
                        <span>Entrega: {canal.tempo_entrega_min}min</span>
                      </div>
                    </div>
                    <Badge variant={canal.ativo ? 'default' : 'secondary'}>
                      {canal.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
                
                {canaisVenda.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum canal de venda cadastrado</p>
                    <p className="text-sm">Configure canais como iFood, Uber Eats, etc.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Análise */}
        <TabsContent value="analise" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Status da Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parâmetros básicos:</span>
                  <Badge variant="default">Configurado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Embalagens:</span>
                  <Badge variant={embalagens.length > 0 ? "default" : "secondary"}>
                    {embalagens.length > 0 ? `${embalagens.length} cadastradas` : 'Não configurado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Canais de venda:</span>
                  <Badge variant={canaisVenda.length > 0 ? "default" : "secondary"}>
                    {canaisVenda.length > 0 ? `${canaisVenda.length} canais` : 'Não configurado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {configuracoes.markup_padrao < calcularMargemRecomendada() && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Considere aumentar o markup para pelo menos {calcularMargemRecomendada()}% 
                      para cobrir todos os custos fixos
                    </p>
                  </div>
                )}
                
                {embalagens.length === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Cadastre embalagens para ter cálculos mais precisos de custo por prato
                    </p>
                  </div>
                )}
                
                {canaisVenda.length === 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      Configure canais de venda para preços automáticos por plataforma
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
