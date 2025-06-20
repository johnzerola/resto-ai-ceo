
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Ingrediente {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  custoUnitario: number;
  custoTotal: number;
}

interface ResultadosCalculados {
  custoTotalIngredientes: number;
  custoEmbalagem: number;
  custoPerdas: number;
  custoFinal: number;
  precoSugerido: number;
  margemBruta: number;
  margemLiquida: number;
  lucroEstimado: number;
  rentabilidade: number;
  statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo';
}

export function FichaTecnicaInteligente() {
  const { currentRestaurant } = useAuth();
  const [nomePrato, setNomePrato] = useState('');
  const [precoDesejado, setPrecoDesejado] = useState(0);
  const [metaLucroPercentual, setMetaLucroPercentual] = useState(30);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [configuracoes, setConfiguracoes] = useState<any>(null);
  const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
  const [alertas, setAlertas] = useState<string[]>([]);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarConfiguracoes();
    }
  }, [currentRestaurant]);

  useEffect(() => {
    if (ingredientes.length > 0 && configuracoes) {
      calcularResultados();
    }
  }, [ingredientes, precoDesejado, metaLucroPercentual, configuracoes]);

  const carregarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error) throw error;
      setConfiguracoes(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const adicionarIngrediente = () => {
    const novoIngrediente: Ingrediente = {
      id: Date.now().toString(),
      nome: '',
      quantidade: 0,
      unidade: 'g',
      custoUnitario: 0,
      custoTotal: 0
    };
    setIngredientes([...ingredientes, novoIngrediente]);
  };

  const atualizarIngrediente = (id: string, campo: keyof Ingrediente, valor: any) => {
    setIngredientes(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        if (campo === 'quantidade' || campo === 'custoUnitario') {
          updated.custoTotal = updated.quantidade * updated.custoUnitario;
        }
        return updated;
      }
      return ing;
    }));
  };

  const removerIngrediente = (id: string) => {
    setIngredientes(prev => prev.filter(ing => ing.id !== id));
  };

  const calcularResultados = () => {
    if (!configuracoes) return;

    // Custo total dos ingredientes
    const custoTotalIngredientes = ingredientes.reduce((total, ing) => total + ing.custoTotal, 0);
    
    // Custo de embalagem (estimativa baseada em configurações)
    const custoEmbalagem = custoTotalIngredientes * 0.05; // 5% do custo dos ingredientes
    
    // Custo de perdas
    const custoPerdas = custoTotalIngredientes * (configuracoes.perda_media_percentual / 100);
    
    // Custo final
    const custoFinal = custoTotalIngredientes + custoEmbalagem + custoPerdas;
    
    // Preço sugerido baseado no markup
    const precoSugerido = custoFinal * (configuracoes.markup_padrao / 100);
    
    // Cálculos de margem
    const precoFinal = precoDesejado > 0 ? precoDesejado : precoSugerido;
    const lucroEstimado = precoFinal - custoFinal;
    const margemBruta = precoFinal > 0 ? (lucroEstimado / precoFinal) * 100 : 0;
    
    // Considerando impostos e taxas
    const impostos = precoFinal * (configuracoes.taxa_impostos / 100);
    const lucroLiquido = lucroEstimado - impostos;
    const margemLiquida = precoFinal > 0 ? (lucroLiquido / precoFinal) * 100 : 0;
    
    // Rentabilidade
    const rentabilidade = custoFinal > 0 ? (lucroLiquido / custoFinal) * 100 : 0;
    
    // Status de viabilidade
    let statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
    if (margemLiquida < 0) {
      statusViabilidade = 'prejuizo';
    } else if (margemLiquida < metaLucroPercentual) {
      statusViabilidade = 'atencao';
    }

    const novosResultados: ResultadosCalculados = {
      custoTotalIngredientes,
      custoEmbalagem,
      custoPerdas,
      custoFinal,
      precoSugerido,
      margemBruta,
      margemLiquida,
      lucroEstimado: lucroLiquido,
      rentabilidade,
      statusViabilidade
    };

    setResultados(novosResultados);
    gerarAlertas(novosResultados);
  };

  const gerarAlertas = (resultados: ResultadosCalculados) => {
    const novosAlertas: string[] = [];

    if (resultados.statusViabilidade === 'prejuizo') {
      novosAlertas.push('🚨 ATENÇÃO: Este prato está gerando prejuízo!');
    }
    
    if (resultados.margemLiquida < metaLucroPercentual) {
      novosAlertas.push(`⚠️ Margem abaixo da meta de ${metaLucroPercentual}%`);
    }
    
    if (precoDesejado > 0 && precoDesejado > resultados.precoSugerido * 1.2) {
      novosAlertas.push('💰 Preço pode estar alto demais para o mercado');
    }
    
    if (resultados.custoTotalIngredientes > resultados.custoFinal * 0.8) {
      novosAlertas.push('📊 Custo de ingredientes muito alto - revisar fornecedores');
    }

    setAlertas(novosAlertas);
  };

  const salvarFichaTecnica = async () => {
    if (!currentRestaurant?.id || !nomePrato || !resultados) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pratos')
        .insert({
          nome_prato: nomePrato,
          restaurant_id: currentRestaurant.id,
          custo_total: resultados.custoFinal,
          preco_sugerido: resultados.precoSugerido,
          preco_praticado: precoDesejado > 0 ? precoDesejado : resultados.precoSugerido,
          margem_percentual: resultados.margemLiquida,
          lucro_estimado: resultados.lucroEstimado,
          status_viabilidade: resultados.statusViabilidade
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar ingredientes
      if (data) {
        const ingredientesData = ingredientes.map(ing => ({
          prato_id: data.id,
          insumo_id: null, // Será conectado posteriormente com cadastro de insumos
          quantidade_bruta: ing.quantidade,
          quantidade_liquida: ing.quantidade,
          custo_total: ing.custoTotal
        }));

        await supabase
          .from('ingredientes_por_prato')
          .insert(ingredientesData);
      }

      toast.success('Ficha técnica salva com sucesso!');
      
      // Reset form
      setNomePrato('');
      setPrecoDesejado(0);
      setIngredientes([]);
      setResultados(null);
      setAlertas([]);

    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
    }
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
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Ficha Técnica Inteligente
          </h2>
          <p className="text-muted-foreground">
            Define seu preço ou meta de lucro - o sistema calcula automaticamente
          </p>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Alert className={resultados?.statusViabilidade === 'prejuizo' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              {alertas.map((alerta, index) => (
                <div key={index}>{alerta}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados do Prato</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomePrato">Nome do Prato</Label>
                  <Input
                    id="nomePrato"
                    value={nomePrato}
                    onChange={(e) => setNomePrato(e.target.value)}
                    placeholder="Ex: Hambúrguer Artesanal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="precoDesejado">Preço Desejado (R$)</Label>
                  <Input
                    id="precoDesejado"
                    type="number"
                    step="0.01"
                    value={precoDesejado || ''}
                    onChange={(e) => setPrecoDesejado(Number(e.target.value))}
                    placeholder="Deixe vazio para calcular automaticamente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaLucro">Meta de Lucro (%)</Label>
                  <Input
                    id="metaLucro"
                    type="number"
                    value={metaLucroPercentual}
                    onChange={(e) => setMetaLucroPercentual(Number(e.target.value))}
                    placeholder="30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Lista de Ingredientes
                <Button onClick={adicionarIngrediente} size="sm">
                  + Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientes.map((ingrediente) => (
                  <div key={ingrediente.id} className="grid gap-4 md:grid-cols-5 items-end p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={ingrediente.nome}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'nome', e.target.value)}
                        placeholder="Ingrediente"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={ingrediente.quantidade || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'quantidade', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input
                        value={ingrediente.unidade}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'unidade', e.target.value)}
                        placeholder="g, ml, un"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Custo/Unidade (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingrediente.custoUnitario || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'custoUnitario', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <Badge variant="outline">
                        {formatCurrency(ingrediente.custoTotal)}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removerIngrediente(ingrediente.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                
                {ingredientes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum ingrediente adicionado ainda</p>
                    <Button onClick={adicionarIngrediente} className="mt-2">
                      Adicionar Primeiro Ingrediente
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          {resultados && (
            <>
              {/* KPIs Principais */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Custo Final</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(resultados.custoFinal)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preço Sugerido</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(resultados.precoSugerido)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Margem Líquida</p>
                        <p className="text-2xl font-bold">
                          {resultados.margemLiquida.toFixed(1)}%
                        </p>
                      </div>
                      {resultados.margemLiquida >= metaLucroPercentual ? (
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge 
                          variant={
                            resultados.statusViabilidade === 'saudavel' ? 'default' :
                            resultados.statusViabilidade === 'atencao' ? 'secondary' : 'destructive'
                          }
                          className="text-sm"
                        >
                          {resultados.statusViabilidade === 'saudavel' ? 'Saudável' :
                           resultados.statusViabilidade === 'atencao' ? 'Atenção' : 'Prejuízo'}
                        </Badge>
                      </div>
                      {resultados.statusViabilidade === 'saudavel' ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento dos Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Ingredientes:</span>
                          <span className="font-medium">{formatCurrency(resultados.custoTotalIngredientes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Embalagem:</span>
                          <span className="font-medium">{formatCurrency(resultados.custoEmbalagem)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Perdas:</span>
                          <span className="font-medium">{formatCurrency(resultados.custoPerdas)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(resultados.custoFinal)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Preço Final:</span>
                          <span className="font-medium">
                            {formatCurrency(precoDesejado > 0 ? precoDesejado : resultados.precoSugerido)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lucro Estimado:</span>
                          <span className="font-medium text-green-600">{formatCurrency(resultados.lucroEstimado)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rentabilidade:</span>
                          <span className="font-medium">{resultados.rentabilidade.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={salvarFichaTecnica} size="lg">
                  Salvar Ficha Técnica
                </Button>
              </div>
            </>
          )}
          
          {!resultados && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione ingredientes para ver os resultados</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
