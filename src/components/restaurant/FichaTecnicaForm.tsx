
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Save, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Insumo {
  id: string;
  nome: string;
  preco_unitario: number;
  unidade_medida: string;
  preco_pago: number;
  volume_embalagem: number;
}

interface Ingrediente {
  insumo_id: string;
  nome_insumo: string;
  quantidade_bruta: number;
  quantidade_liquida: number;
  fator_correcao: number;
  preco_unitario: number;
  custo_total: number;
  unidade_medida: string;
}

interface PratoForm {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes: string;
  margem_seguranca: number;
}

interface CalculosPrato {
  custo_ingredientes: number;
  custo_total: number;
  custo_por_porcao: number;
  preco_sugerido: number;
  lucro_estimado: number;
  margem_percentual: number;
  status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel';
}

export function FichaTecnicaForm() {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [prato, setPrato] = useState<PratoForm>({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: '',
    margem_seguranca: 10
  });
  const [calculos, setCalculos] = useState<CalculosPrato>({
    custo_ingredientes: 0,
    custo_total: 0,
    custo_por_porcao: 0,
    preco_sugerido: 0,
    lucro_estimado: 0,
    margem_percentual: 0,
    status_viabilidade: 'saudavel'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    markup_padrao: 250,
    despesa_fixa_mensal: 0,
    despesa_variavel_percentual: 10,
    imposto_percentual: 15,
    total_pratos_vendidos_mensal: 1000
  });

  useEffect(() => {
    carregarInsumos();
    carregarConfiguracoes();
  }, [currentRestaurant]);

  useEffect(() => {
    calcularCustos();
  }, [ingredientes, prato.rendimento_porcoes, prato.margem_seguranca, configuracoes]);

  const carregarInsumos = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (error) throw error;
      setInsumos(data || []);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar insumos');
    }
  };

  const carregarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracoes_precificacao')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguracoes({
          markup_padrao: data.markup_padrao || 250,
          despesa_fixa_mensal: data.despesa_fixa_mensal || 0,
          despesa_variavel_percentual: data.despesa_variavel_percentual || 10,
          imposto_percentual: data.imposto_percentual || 15,
          total_pratos_vendidos_mensal: data.total_pratos_vendidos_mensal || 1000
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const adicionarIngrediente = () => {
    const novoIngrediente: Ingrediente = {
      insumo_id: '',
      nome_insumo: '',
      quantidade_bruta: 0,
      quantidade_liquida: 0,
      fator_correcao: 1,
      preco_unitario: 0,
      custo_total: 0,
      unidade_medida: ''
    };
    setIngredientes([...ingredientes, novoIngrediente]);
  };

  const removerIngrediente = (index: number) => {
    const novosIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(novosIngredientes);
  };

  const atualizarIngrediente = (index: number, campo: keyof Ingrediente, valor: any) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes[index] = { ...novosIngredientes[index], [campo]: valor };

    // Se selecionou um insumo, preencher dados automaticamente
    if (campo === 'insumo_id' && valor) {
      const insumo = insumos.find(i => i.id === valor);
      if (insumo) {
        novosIngredientes[index].nome_insumo = insumo.nome;
        novosIngredientes[index].preco_unitario = insumo.preco_unitario;
        novosIngredientes[index].unidade_medida = insumo.unidade_medida;
      }
    }

    // Calcular quantidade líquida e custo total
    if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
      const ingrediente = novosIngredientes[index];
      ingrediente.quantidade_liquida = ingrediente.quantidade_bruta * ingrediente.fator_correcao;
      ingrediente.custo_total = ingrediente.quantidade_liquida * ingrediente.preco_unitario;
    }

    if (campo === 'quantidade_liquida') {
      novosIngredientes[index].custo_total = valor * novosIngredientes[index].preco_unitario;
    }

    setIngredientes(novosIngredientes);
  };

  const calcularCustos = () => {
    // Custo dos ingredientes
    const custo_ingredientes = ingredientes.reduce((total, ing) => total + ing.custo_total, 0);
    
    // Aplicar margem de segurança
    const custo_com_margem = custo_ingredientes * (1 + prato.margem_seguranca / 100);
    
    // Despesas fixas rateadas
    const despesa_fixa_por_prato = configuracoes.despesa_fixa_mensal / configuracoes.total_pratos_vendidos_mensal;
    
    // Custo total antes do markup
    const custo_total = custo_com_margem + despesa_fixa_por_prato;
    
    // Custo por porção
    const custo_por_porcao = custo_total / prato.rendimento_porcoes;
    
    // Preço sugerido com markup
    const preco_sugerido = custo_por_porcao * (configuracoes.markup_padrao / 100);
    
    // Lucro estimado
    const lucro_estimado = preco_sugerido - custo_por_porcao;
    
    // Margem percentual
    const margem_percentual = preco_sugerido > 0 ? (lucro_estimado / preco_sugerido) * 100 : 0;
    
    // Status de viabilidade
    let status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel' = 'saudavel';
    if (lucro_estimado < 0) {
      status_viabilidade = 'prejuizo';
    } else if (margem_percentual < 20) {
      status_viabilidade = 'margem_baixa';
    }

    setCalculos({
      custo_ingredientes,
      custo_total,
      custo_por_porcao,
      preco_sugerido,
      lucro_estimado,
      margem_percentual,
      status_viabilidade
    });
  };

  const salvarFichaTecnica = async () => {
    if (!currentRestaurant?.id || !prato.nome_prato.trim()) {
      toast.error('Preencha o nome do prato');
      return;
    }

    if (ingredientes.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return;
    }

    setIsLoading(true);
    
    try {
      // Salvar prato
      const { data: pratoData, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          nome_prato: prato.nome_prato,
          categoria: prato.categoria,
          rendimento_porcoes: prato.rendimento_porcoes,
          observacoes: prato.observacoes,
          margem_seguranca: prato.margem_seguranca,
          custo_total: calculos.custo_total,
          custo_por_porcao: calculos.custo_por_porcao,
          preco_sugerido: calculos.preco_sugerido,
          lucro_estimado: calculos.lucro_estimado,
          margem_percentual: calculos.margem_percentual,
          status_viabilidade: calculos.status_viabilidade,
          restaurant_id: currentRestaurant.id
        })
        .select()
        .single();

      if (pratoError) throw pratoError;

      // Salvar ingredientes
      const ingredientesData = ingredientes.map(ing => ({
        prato_id: pratoData.id,
        insumo_id: ing.insumo_id,
        quantidade_bruta: ing.quantidade_bruta,
        quantidade_liquida: ing.quantidade_liquida,
        fator_correcao: ing.fator_correcao,
        custo_total: ing.custo_total
      }));

      const { error: ingredientesError } = await supabase
        .from('ingredientes_por_prato')
        .insert(ingredientesData);

      if (ingredientesError) throw ingredientesError;

      // Salvar no histórico
      const { error: historicoError } = await supabase
        .from('historico_fichas')
        .insert({
          prato_id: pratoData.id,
          dados_json: {
            prato,
            ingredientes,
            calculos,
            configuracoes
          }
        });

      if (historicoError) throw historicoError;

      toast.success('Ficha técnica salva com sucesso!');
      
      // Limpar formulário
      setPrato({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: '',
        margem_seguranca: 10
      });
      setIngredientes([]);
      
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast.error('Erro ao salvar ficha técnica');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (calculos.status_viabilidade) {
      case 'prejuizo':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'margem_baixa':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'saudavel':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (calculos.status_viabilidade) {
      case 'prejuizo':
        return 'Prejuízo';
      case 'margem_baixa':
        return 'Margem Baixa';
      case 'saudavel':
        return 'Saudável';
    }
  };

  const getStatusColor = () => {
    switch (calculos.status_viabilidade) {
      case 'prejuizo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'margem_baixa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'saudavel':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Prato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados do Prato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_prato">Nome do Prato *</Label>
                  <Input
                    id="nome_prato"
                    placeholder="Ex: Pizza Frango com Cream Cheese"
                    value={prato.nome_prato}
                    onChange={(e) => setPrato({ ...prato, nome_prato: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={prato.categoria} onValueChange={(value) => setPrato({ ...prato, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pizza">Pizza</SelectItem>
                      <SelectItem value="hamburguer">Hambúrguer</SelectItem>
                      <SelectItem value="prato-principal">Prato Principal</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="sobremesa">Sobremesa</SelectItem>
                      <SelectItem value="bebida">Bebida</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rendimento">Rendimento (porções)</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={prato.rendimento_porcoes}
                    onChange={(e) => setPrato({ ...prato, rendimento_porcoes: parseFloat(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="margem_seguranca">Margem de Segurança (%)</Label>
                  <Input
                    id="margem_seguranca"
                    type="number"
                    min="0"
                    step="0.1"
                    value={prato.margem_seguranca}
                    onChange={(e) => setPrato({ ...prato, margem_seguranca: parseFloat(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Instruções especiais, modo de preparo, etc..."
                  value={prato.observacoes}
                  onChange={(e) => setPrato({ ...prato, observacoes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Ingredientes e Quantidades
                </CardTitle>
                <Button onClick={adicionarIngrediente} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ingrediente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ingredientes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ingrediente adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Ingrediente" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredientes.map((ingrediente, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ingrediente {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerIngrediente(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label>Insumo</Label>
                          <Select
                            value={ingrediente.insumo_id}
                            onValueChange={(value) => atualizarIngrediente(index, 'insumo_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o insumo" />
                            </SelectTrigger>
                            <SelectContent>
                              {insumos.map((insumo) => (
                                <SelectItem key={insumo.id} value={insumo.id}>
                                  {insumo.nome} (R$ {insumo.preco_unitario.toFixed(3)}/{insumo.unidade_medida})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Qtd. Bruta ({ingrediente.unidade_medida})</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={ingrediente.quantidade_bruta}
                            onChange={(e) => atualizarIngrediente(index, 'quantidade_bruta', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div>
                          <Label>Fator Correção</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ingrediente.fator_correcao}
                            onChange={(e) => atualizarIngrediente(index, 'fator_correcao', parseFloat(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                        <div>
                          <Label className="text-sm text-muted-foreground">Qtd. Líquida</Label>
                          <p className="font-medium">{ingrediente.quantidade_liquida.toFixed(3)} {ingrediente.unidade_medida}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Preço Unitário</Label>
                          <p className="font-medium">R$ {ingrediente.preco_unitario.toFixed(3)}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Custo Total</Label>
                          <p className="font-bold text-blue-600">R$ {ingrediente.custo_total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="space-y-6">
          {/* Status de Viabilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Status da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={`${getStatusColor()} mb-4`}>
                {getStatusText()}
              </Badge>
              
              {calculos.status_viabilidade === 'prejuizo' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    <strong>Atenção!</strong> Este prato está operando com prejuízo. 
                    Considere revisar os ingredientes ou ajustar o preço.
                  </AlertDescription>
                </Alert>
              )}
              
              {calculos.status_viabilidade === 'margem_baixa' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-700">
                    <strong>Cuidado!</strong> A margem de lucro está baixa. 
                    Recomendamos otimizar os custos ou revisar a precificação.
                  </AlertDescription>
                </Alert>
              )}
              
              {calculos.status_viabilidade === 'saudavel' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-700">
                    <strong>Excelente!</strong> Este prato possui margem de lucro saudável 
                    e é viável comercialmente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Cálculos Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Custo Ingredientes:</span>
                  <span className="font-medium">R$ {calculos.custo_ingredientes.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Custo Total + Margem:</span>
                  <span className="font-medium">R$ {calculos.custo_total.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Custo por Porção:</span>
                  <span className="font-semibold">R$ {calculos.custo_por_porcao.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preço Sugerido:</span>
                  <span className="font-bold text-green-600 text-lg">R$ {calculos.preco_sugerido.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lucro Estimado:</span>
                  <span className={`font-semibold ${calculos.lucro_estimado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {calculos.lucro_estimado.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Margem de Lucro:</span>
                  <span className={`font-semibold ${calculos.margem_percentual >= 20 ? 'text-green-600' : calculos.margem_percentual >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {calculos.margem_percentual.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Atuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Configurações Aplicadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markup:</span>
                <span>{configuracoes.markup_padrao}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desp. Fixa/Prato:</span>
                <span>R$ {(configuracoes.despesa_fixa_mensal / configuracoes.total_pratos_vendidos_mensal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impostos:</span>
                <span>{configuracoes.imposto_percentual}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-3">
            <Button 
              onClick={salvarFichaTecnica} 
              disabled={isLoading || !prato.nome_prato.trim()}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Ficha Técnica'}
            </Button>
            
            <Button variant="outline" className="w-full" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF (Em breve)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
