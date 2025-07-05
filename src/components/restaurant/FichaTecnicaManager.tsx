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
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign,
  Plus,
  Trash2,
  Save,
  RotateCcw
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
  insumo_id?: string;
}

interface ResultadosCalculados {
  custoTotalIngredientes: number;
  custoEmbalagem: number;
  custoPerdas: number;
  custoFinal: number;
  custoPorPorcao: number;
  precoSugerido: number;
  margemBruta: number;
  margemLiquida: number;
  lucroEstimado: number;
  rentabilidade: number;
  statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo';
}

interface FichaTecnicaManagerProps {
  insumos?: any[];
  onFichaUpdate?: (fichas: any[]) => void;
}

export function FichaTecnicaManager({ insumos = [], onFichaUpdate }: FichaTecnicaManagerProps) {
  const { currentRestaurant } = useAuth();
  const [nomePrato, setNomePrato] = useState('');
  const [categoria, setCategoria] = useState('entrada');
  const [rendimento, setRendimento] = useState(1);
  const [precoDesejado, setPrecoDesejado] = useState(0);
  const [metaLucroPercentual, setMetaLucroPercentual] = useState(30);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [configuracoes, setConfiguracoes] = useState<any>(null);
  const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
  const [alertas, setAlertas] = useState<string[]>([]);
  const [fichasSalvas, setFichasSalvas] = useState<any[]>([]);

  const categorias = [
    { value: 'entrada', label: 'Entradas' },
    { value: 'prato-principal', label: 'Pratos Principais' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'lanche', label: 'Lanches' }
  ];

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarConfiguracoes();
      carregarFichasSalvas();
    }
  }, [currentRestaurant]);

  useEffect(() => {
    if (ingredientes.length > 0 && configuracoes) {
      calcularResultados();
    }
  }, [ingredientes, precoDesejado, metaLucroPercentual, configuracoes, rendimento]);

  const carregarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setConfiguracoes(data || {
        markup_padrao: 250,
        margem_lucro_esperada: 30,
        taxa_impostos: 12,
        perda_media_percentual: 5
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const carregarFichasSalvas = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('pratos')
        .select(`
          *,
          ingredientes_por_prato (
            *,
            insumos (nome, unidade_medida, preco_unitario)
          )
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFichasSalvas(data || []);
      onFichaUpdate?.(data || []);
    } catch (error) {
      console.error('Erro ao carregar fichas salvas:', error);
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
        // Se selecionou um insumo, buscar dados
        if (campo === 'insumo_id' && valor) {
          const insumoSelecionado = insumos.find(ins => ins.id === valor);
          if (insumoSelecionado) {
            updated.nome = insumoSelecionado.nome;
            updated.unidade = insumoSelecionado.unidade_medida;
            updated.custoUnitario = insumoSelecionado.preco_unitario;
            updated.custoTotal = updated.quantidade * updated.custoUnitario;
          }
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
    
    // Custo de embalagem (5% do custo dos ingredientes)
    const custoEmbalagem = custoTotalIngredientes * 0.05;
    
    // Custo de perdas
    const custoPerdas = custoTotalIngredientes * (configuracoes.perda_media_percentual / 100);
    
    // Custo final
    const custoFinal = custoTotalIngredientes + custoEmbalagem + custoPerdas;
    
    // Custo por porção
    const custoPorPorcao = custoFinal / Math.max(rendimento, 1);
    
    // Preço sugerido baseado no markup
    const precoSugerido = custoPorPorcao * (configuracoes.markup_padrao / 100);
    
    // Cálculos de margem
    const precoFinal = precoDesejado > 0 ? precoDesejado : precoSugerido;
    const lucroEstimado = precoFinal - custoPorPorcao;
    const margemBruta = precoFinal > 0 ? (lucroEstimado / precoFinal) * 100 : 0;
    
    // Considerando impostos e taxas
    const impostos = precoFinal * (configuracoes.taxa_impostos / 100);
    const lucroLiquido = lucroEstimado - impostos;
    const margemLiquida = precoFinal > 0 ? (lucroLiquido / precoFinal) * 100 : 0;
    
    // Rentabilidade
    const rentabilidade = custoPorPorcao > 0 ? (lucroLiquido / custoPorPorcao) * 100 : 0;
    
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
      custoPorPorcao,
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
          categoria,
          rendimento_porcoes: rendimento,
          restaurant_id: currentRestaurant.id,
          custo_total: resultados.custoFinal,
          custo_por_porcao: resultados.custoPorPorcao,
          preco_sugerido: resultados.precoSugerido,
          preco_praticado: precoDesejado > 0 ? precoDesejado : resultados.precoSugerido,
          margem_percentual: resultados.margemLiquida,
          lucro_estimado: resultados.lucroEstimado,
          status_viabilidade: resultados.statusViabilidade,
          custo_embalagem: resultados.custoEmbalagem,
          custo_perdas: resultados.custoPerdas
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar ingredientes
      if (data && ingredientes.length > 0) {
        const ingredientesData = ingredientes.map(ing => ({
          prato_id: data.id,
          insumo_id: ing.insumo_id,
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
      resetForm();
      carregarFichasSalvas();

    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
    }
  };

  const resetForm = () => {
    setNomePrato('');
    setCategoria('entrada');
    setRendimento(1);
    setPrecoDesejado(0);
    setIngredientes([]);
    setResultados(null);
    setAlertas([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fichas Técnicas Inteligentes
          </h3>
          <p className="text-sm text-muted-foreground">
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

      <Tabs defaultValue="criar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="criar">Nova Ficha</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="salvas">Fichas Salvas</TabsTrigger>
        </TabsList>

        <TabsContent value="criar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomePrato">Nome do Prato *</Label>
                  <Input
                    id="nomePrato"
                    value={nomePrato}
                    onChange={(e) => setNomePrato(e.target.value)}
                    placeholder="Ex: Hambúrguer Artesanal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rendimento">Rendimento (porções)</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    min="1"
                    value={rendimento}
                    onChange={(e) => setRendimento(Number(e.target.value))}
                    placeholder="1"
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
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientes.map((ingrediente) => (
                  <div key={ingrediente.id} className="grid gap-4 md:grid-cols-6 items-end p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Insumo</Label>
                      <Select
                        value={ingrediente.insumo_id || ''}
                        onValueChange={(value) => atualizarIngrediente(ingrediente.id, 'insumo_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumos.map(insumo => (
                            <SelectItem key={insumo.id} value={insumo.id}>
                              {insumo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nome Manual</Label>
                      <Input
                        value={ingrediente.nome}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'nome', e.target.value)}
                        placeholder="Ou digite manualmente"
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
                        <Trash2 className="h-4 w-4" />
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
                        <p className="text-sm font-medium text-muted-foreground">Custo/Porção</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(resultados.custoPorPorcao)}
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

              {/* Detalhamento de Custos */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Ingredientes:</span>
                        <span>{formatCurrency(resultados.custoTotalIngredientes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Embalagem (5%):</span>
                        <span>{formatCurrency(resultados.custoEmbalagem)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perdas ({configuracoes?.perda_media_percentual || 5}%):</span>
                        <span>{formatCurrency(resultados.custoPerdas)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Custo Total:</span>
                        <span>{formatCurrency(resultados.custoFinal)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Rendimento:</span>
                        <span>{rendimento} porção(ões)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo por Porção:</span>
                        <span>{formatCurrency(resultados.custoPorPorcao)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lucro por Porção:</span>
                        <span>{formatCurrency(resultados.lucroEstimado)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Rentabilidade:</span>
                        <span>{resultados.rentabilidade.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Limpar Formulário
            </Button>
            <Button onClick={salvarFichaTecnica} disabled={!nomePrato || ingredientes.length === 0}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Ficha Técnica
            </Button>
          </div>

          {/* Precificação Avançada */}
          {resultados && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precificação Avançada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Markup Personalizado (%)</Label>
                    <Input
                      type="number"
                      value={configuracoes?.markup_padrao || 250}
                      onChange={(e) => {
                        const novoMarkup = Number(e.target.value);
                        if (configuracoes) {
                          setConfiguracoes(prev => ({ ...prev, markup_padrao: novoMarkup }));
                        }
                      }}
                      placeholder="250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Concorrente (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Canal de Venda</Label>
                    <Select defaultValue="balcao">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balcao">Balcão</SelectItem>
                        <SelectItem value="ifood">iFood</SelectItem>
                        <SelectItem value="uber">Uber Eats</SelectItem>
                        <SelectItem value="delivery">Delivery Próprio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço Mínimo</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(resultados.custoPorPorcao * 1.5)}
                      </p>
                      <p className="text-xs text-muted-foreground">50% margem</p>
                    </div>
                  </Card>

                  <Card className="p-4 border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço Ideal</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(resultados.precoSugerido)}
                      </p>
                      <p className="text-xs text-muted-foreground">Recomendado</p>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço Premium</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(resultados.precoSugerido * 1.2)}
                      </p>
                      <p className="text-xs text-muted-foreground">20% acima</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </TabsContent>

        <TabsContent value="salvas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fichas Técnicas Salvas</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={carregarFichasSalvas}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {fichasSalvas.map((ficha) => (
                  <div key={ficha.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{ficha.nome_prato}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{ficha.categoria}</Badge>
                        {ficha.status_viabilidade && (
                          <Badge 
                            variant={
                              ficha.status_viabilidade === 'saudavel' ? 'default' :
                              ficha.status_viabilidade === 'atencao' ? 'secondary' : 'destructive'
                            }
                          >
                            {ficha.status_viabilidade === 'saudavel' ? 'Saudável' :
                             ficha.status_viabilidade === 'atencao' ? 'Atenção' : 'Prejuízo'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-5">
                      <div>
                        <span className="font-medium">Custo:</span><br />
                        {formatCurrency(ficha.custo_por_porcao)}
                      </div>
                      <div>
                        <span className="font-medium">Preço:</span><br />
                        <span className="text-green-600 font-bold">
                          {formatCurrency(ficha.preco_praticado)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Margem:</span><br />
                        {ficha.margem_percentual?.toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Lucro:</span><br />
                        {formatCurrency(ficha.lucro_estimado || 0)}
                      </div>
                      <div>
                        <span className="font-medium">Rendimento:</span><br />
                        {ficha.rendimento_porcoes} porção(ões)
                      </div>
                    </div>
                    
                    {/* Ações rápidas */}
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Aplicar markup rápido
                          const novoPreco = ficha.custo_por_porcao * 2.5;
                          // Lógica para atualizar preço
                        }}
                      >
                        Markup 250%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const novoPreco = ficha.custo_por_porcao * 3;
                          // Lógica para atualizar preço
                        }}
                      >
                        Markup 300%
                      </Button>
                    </div>
                  </div>
                ))}
                
                {fichasSalvas.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma ficha técnica salva ainda</p>
                    <p className="text-sm">Crie sua primeira ficha técnica na aba "Nova Ficha"</p>
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