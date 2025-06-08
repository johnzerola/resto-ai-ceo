
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Trash2, 
  Calculator, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Ingrediente {
  id: string;
  insumo_id: string;
  nome: string;
  quantidade_bruta: number;
  quantidade_liquida: number;
  fator_correcao: number;
  preco_unitario: number;
  custo_total: number;
  unidade_medida: string;
}

interface Insumo {
  id: string;
  codigo: number;
  nome: string;
  preco_pago: number;
  volume_embalagem: number;
  unidade_medida: string;
  preco_unitario: number;
}

interface FichaTecnicaData {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes: string;
  margem_seguranca: number;
  ingredientes: Ingrediente[];
  custo_total: number;
  custo_por_porcao: number;
  preco_sugerido: number;
  preco_praticado: number;
  lucro_estimado: number;
  margem_percentual: number;
  status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel';
}

export function FichaTecnicaForm() {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [ficha, setFicha] = useState<FichaTecnicaData>({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: '',
    margem_seguranca: 10,
    ingredientes: [],
    custo_total: 0,
    custo_por_porcao: 0,
    preco_sugerido: 0,
    preco_praticado: 0,
    lucro_estimado: 0,
    margem_percentual: 0,
    status_viabilidade: 'saudavel'
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    carregarInsumos();
  }, [currentRestaurant]);

  useEffect(() => {
    calcularCustos();
  }, [ficha.ingredientes, ficha.rendimento_porcoes, ficha.margem_seguranca]);

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
      toast.error('Erro ao carregar lista de ingredientes');
    }
  };

  const adicionarIngrediente = () => {
    const novoIngrediente: Ingrediente = {
      id: crypto.randomUUID(),
      insumo_id: '',
      nome: '',
      quantidade_bruta: 0,
      quantidade_liquida: 0,
      fator_correcao: 1,
      preco_unitario: 0,
      custo_total: 0,
      unidade_medida: ''
    };

    setFicha(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, novoIngrediente]
    }));
  };

  const removerIngrediente = (id: string) => {
    setFicha(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter(ing => ing.id !== id)
    }));
  };

  const atualizarIngrediente = (id: string, campo: keyof Ingrediente, valor: any) => {
    setFicha(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.map(ing => {
        if (ing.id === id) {
          const ingredienteAtualizado = { ...ing, [campo]: valor };
          
          // Se mudou o insumo, buscar os dados
          if (campo === 'insumo_id') {
            const insumoSelecionado = insumos.find(i => i.id === valor);
            if (insumoSelecionado) {
              ingredienteAtualizado.nome = insumoSelecionado.nome;
              ingredienteAtualizado.preco_unitario = insumoSelecionado.preco_unitario;
              ingredienteAtualizado.unidade_medida = insumoSelecionado.unidade_medida;
            }
          }

          // Calcular quantidade líquida e custo total
          if (campo === 'quantidade_bruta' || campo === 'fator_correcao') {
            ingredienteAtualizado.quantidade_liquida = 
              ingredienteAtualizado.quantidade_bruta * ingredienteAtualizado.fator_correcao;
          }

          ingredienteAtualizado.custo_total = 
            ingredienteAtualizado.quantidade_liquida * ingredienteAtualizado.preco_unitario;

          return ingredienteAtualizado;
        }
        return ing;
      })
    }));
  };

  const calcularCustos = () => {
    setIsCalculating(true);

    // Custo total dos ingredientes
    const custoIngredientes = ficha.ingredientes.reduce(
      (total, ing) => total + ing.custo_total, 0
    );

    // Aplicar margem de segurança
    const custoComMargem = custoIngredientes * (1 + ficha.margem_seguranca / 100);

    // Custo por porção
    const custoPorPorcao = custoComMargem / ficha.rendimento_porcoes;

    // Preço sugerido (markup de 250%)
    const precoSugerido = custoPorPorcao * 2.5;

    // Lucro estimado
    const lucroEstimado = precoSugerido - custoPorPorcao;

    // Margem percentual
    const margemPercentual = precoSugerido > 0 ? (lucroEstimado / precoSugerido) * 100 : 0;

    // Status de viabilidade
    let status: 'prejuizo' | 'margem_baixa' | 'saudavel' = 'saudavel';
    if (lucroEstimado < 0) {
      status = 'prejuizo';
    } else if (margemPercentual < 20) {
      status = 'margem_baixa';
    }

    setFicha(prev => ({
      ...prev,
      custo_total: custoComMargem,
      custo_por_porcao: custoPorPorcao,
      preco_sugerido: precoSugerido,
      lucro_estimado: lucroEstimado,
      margem_percentual: margemPercentual,
      status_viabilidade: status
    }));

    setIsCalculating(false);
  };

  const salvarFicha = async () => {
    if (!currentRestaurant?.id) {
      toast.error('Nenhum restaurante selecionado');
      return;
    }

    if (!ficha.nome_prato.trim()) {
      toast.error('Nome do prato é obrigatório');
      return;
    }

    if (ficha.ingredientes.length === 0) {
      toast.error('Adicione pelo menos um ingrediente');
      return;
    }

    setIsSaving(true);

    try {
      // Inserir o prato
      const { data: pratoData, error: pratoError } = await supabase
        .from('pratos')
        .insert({
          nome_prato: ficha.nome_prato,
          categoria: ficha.categoria,
          rendimento_porcoes: ficha.rendimento_porcoes,
          observacoes: ficha.observacoes,
          custo_total: ficha.custo_total,
          margem_seguranca: ficha.margem_seguranca,
          custo_por_porcao: ficha.custo_por_porcao,
          preco_sugerido: ficha.preco_sugerido,
          preco_praticado: ficha.preco_praticado,
          lucro_estimado: ficha.lucro_estimado,
          margem_percentual: ficha.margem_percentual,
          status_viabilidade: ficha.status_viabilidade,
          restaurant_id: currentRestaurant.id
        })
        .select()
        .single();

      if (pratoError) throw pratoError;

      // Inserir os ingredientes
      const ingredientesData = ficha.ingredientes.map(ing => ({
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

      toast.success('Ficha técnica salva com sucesso!');
      
      // Reset form
      setFicha({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: '',
        margem_seguranca: 10,
        ingredientes: [],
        custo_total: 0,
        custo_por_porcao: 0,
        preco_sugerido: 0,
        preco_praticado: 0,
        lucro_estimado: 0,
        margem_percentual: 0,
        status_viabilidade: 'saudavel'
      });

    } catch (error) {
      console.error('Erro ao salvar ficha:', error);
      toast.error('Erro ao salvar ficha técnica');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (ficha.status_viabilidade) {
      case 'prejuizo':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'margem_baixa':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'saudavel':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (ficha.status_viabilidade) {
      case 'prejuizo':
        return 'bg-red-50 border-red-200';
      case 'margem_baixa':
        return 'bg-yellow-50 border-yellow-200';
      case 'saudavel':
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusText = () => {
    switch (ficha.status_viabilidade) {
      case 'prejuizo':
        return 'Prejuízo';
      case 'margem_baixa':
        return 'Margem Baixa';
      case 'saudavel':
        return 'Saudável';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados do Prato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome_prato">Nome do Prato *</Label>
              <Input
                id="nome_prato"
                value={ficha.nome_prato}
                onChange={(e) => setFicha(prev => ({ ...prev, nome_prato: e.target.value }))}
                placeholder="Ex: Pizza Frango com Cream Cheese"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={ficha.categoria} 
                  onValueChange={(value) => setFicha(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">Pizza</SelectItem>
                    <SelectItem value="lanche">Lanche</SelectItem>
                    <SelectItem value="prato_principal">Prato Principal</SelectItem>
                    <SelectItem value="sobremesa">Sobremesa</SelectItem>
                    <SelectItem value="bebida">Bebida</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rendimento">Rendimento (porções)</Label>
                <Input
                  id="rendimento"
                  type="number"
                  min="1"
                  step="0.1"
                  value={ficha.rendimento_porcoes}
                  onChange={(e) => setFicha(prev => ({ ...prev, rendimento_porcoes: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="margem_seguranca">Margem de Segurança (%)</Label>
              <Input
                id="margem_seguranca"
                type="number"
                min="0"
                step="0.1"
                value={ficha.margem_seguranca}
                onChange={(e) => setFicha(prev => ({ ...prev, margem_seguranca: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={ficha.observacoes}
                onChange={(e) => setFicha(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Instruções especiais, modo de preparo, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Análise */}
        <Card className={getStatusColor()}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Análise de Viabilidade - {getStatusText()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Custo Total</Label>
                <p className="text-2xl font-bold">R$ {ficha.custo_total.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Custo por Porção</Label>
                <p className="text-2xl font-bold">R$ {ficha.custo_por_porcao.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Preço Sugerido</Label>
                <p className="text-2xl font-bold text-blue-600">R$ {ficha.preco_sugerido.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Lucro Estimado</Label>
                <p className={`text-2xl font-bold ${ficha.lucro_estimado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {ficha.lucro_estimado.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Margem de Contribuição</Label>
              <div className="flex items-center gap-2">
                <p className={`text-xl font-bold ${ficha.margem_percentual >= 20 ? 'text-green-600' : ficha.margem_percentual >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {ficha.margem_percentual.toFixed(1)}%
                </p>
                {ficha.margem_percentual >= 20 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
            </div>

            {ficha.status_viabilidade === 'prejuizo' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>Atenção!</strong> Este prato está gerando prejuízo. Considere ajustar ingredientes, porções ou preço de venda.
                </AlertDescription>
              </Alert>
            )}

            {ficha.status_viabilidade === 'margem_baixa' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-800">
                  <strong>Cuidado!</strong> Margem de lucro baixa. Considere otimizar a receita ou aumentar o preço.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ingredientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Ingredientes da Receita
            </CardTitle>
            <Button onClick={adicionarIngrediente} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ficha.ingredientes.map((ingrediente, index) => (
              <div key={ingrediente.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-3">
                  <Label className="text-xs">Ingrediente</Label>
                  <Select
                    value={ingrediente.insumo_id}
                    onValueChange={(value) => atualizarIngrediente(ingrediente.id, 'insumo_id', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {insumos.map((insumo) => (
                        <SelectItem key={insumo.id} value={insumo.id}>
                          {insumo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Qtd. Bruta</Label>
                  <Input
                    type="number"
                    className="h-8"
                    step="0.001"
                    value={ingrediente.quantidade_bruta}
                    onChange={(e) => atualizarIngrediente(ingrediente.id, 'quantidade_bruta', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-1">
                  <Label className="text-xs">F.C.</Label>
                  <Input
                    type="number"
                    className="h-8"
                    step="0.001"
                    value={ingrediente.fator_correcao}
                    onChange={(e) => atualizarIngrediente(ingrediente.id, 'fator_correcao', parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Qtd. Líquida</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={ingrediente.quantidade_liquida.toFixed(3)}
                    readOnly
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Preço Unit.</Label>
                  <Input
                    className="h-8"
                    value={`R$ ${ingrediente.preco_unitario.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className="col-span-1">
                  <Label className="text-xs">Custo Total</Label>
                  <Input
                    className="h-8"
                    value={`R$ ${ingrediente.custo_total.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => removerIngrediente(ingrediente.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {ficha.ingredientes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum ingrediente adicionado</p>
                <p className="text-sm">Clique em "Adicionar" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={calcularCustos}
          disabled={isCalculating}
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isCalculating ? 'Calculando...' : 'Recalcular'}
        </Button>
        
        <Button 
          onClick={salvarFicha}
          disabled={isSaving || !ficha.nome_prato.trim() || ficha.ingredientes.length === 0}
        >
          {isSaving ? 'Salvando...' : 'Salvar Ficha'}
        </Button>
      </div>
    </div>
  );
}
