
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  Plus,
  Trash2,
  Brain,
  PieChart
} from "lucide-react";
import { useFichaTecnicaInteligente } from "@/hooks/useFichaTecnicaInteligente";

export function FichaTecnicaInteligenteCompleta() {
  const {
    ingredientes,
    metasLucro,
    setMetasLucro,
    precoDesejado,
    setPrecoDesejado,
    resultados,
    isCalculating,
    insumosDisponiveis,
    adicionarIngrediente,
    atualizarIngrediente,
    removerIngrediente,
    salvarFichaTecnica
  } = useFichaTecnicaInteligente();

  const [dadosPrato, setDadosPrato] = useState({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: ''
  });

  const handleSalvar = async () => {
    const sucesso = await salvarFichaTecnica(dadosPrato);
    if (sucesso) {
      setDadosPrato({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: ''
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'bg-green-100 text-green-800 border-green-300';
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'prejuizo': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Ficha Técnica Inteligente
          </h2>
          <p className="text-muted-foreground">
            Sistema inteligente de precificação e análise de rentabilidade
          </p>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {resultados && resultados.alertas.length > 0 && (
        <Alert className={`border-2 ${resultados.status_viabilidade === 'prejuizo' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>🧠 Análise Inteligente</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              {resultados.alertas.map((alerta, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{alerta}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuracao" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="metas">Metas & Preços</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Prato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomePrato">Nome do Prato</Label>
                  <Input
                    id="nomePrato"
                    value={dadosPrato.nome_prato}
                    onChange={(e) => setDadosPrato(prev => ({ ...prev, nome_prato: e.target.value }))}
                    placeholder="Ex: Hambúrguer Artesanal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={dadosPrato.categoria}
                    onValueChange={(value) => setDadosPrato(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hamburguer">Hambúrguer</SelectItem>
                      <SelectItem value="pizza">Pizza</SelectItem>
                      <SelectItem value="prato-principal">Prato Principal</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="sobremesa">Sobremesa</SelectItem>
                      <SelectItem value="bebida">Bebida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rendimento">Rendimento (porções)</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    value={dadosPrato.rendimento_porcoes}
                    onChange={(e) => setDadosPrato(prev => ({ ...prev, rendimento_porcoes: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dadosPrato.observacoes}
                  onChange={(e) => setDadosPrato(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Instruções especiais, notas sobre preparo..."
                  rows={3}
                />
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
                  <div key={ingrediente.id} className="grid gap-4 md:grid-cols-7 items-end p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Insumo</Label>
                      <Select
                        value={ingrediente.insumo_id}
                        onValueChange={(value) => {
                          const insumo = insumosDisponiveis.find(i => i.id === value);
                          atualizarIngrediente(ingrediente.id, 'insumo_id', value);
                          if (insumo) {
                            atualizarIngrediente(ingrediente.id, 'nome_insumo', insumo.nome);
                            atualizarIngrediente(ingrediente.id, 'preco_unitario', insumo.preco_unitario);
                            atualizarIngrediente(ingrediente.id, 'unidade_medida', insumo.unidade_medida);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar insumo" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumosDisponiveis.map((insumo) => (
                            <SelectItem key={insumo.id} value={insumo.id}>
                              {insumo.nome} - {formatCurrency(insumo.preco_unitario)}/{insumo.unidade_medida}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Qtd. Bruta</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={ingrediente.quantidade_bruta || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'quantidade_bruta', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fator</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingrediente.fator_correcao || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'fator_correcao', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Qtd. Líquida</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={ingrediente.quantidade_liquida || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'quantidade_liquida', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preço/Un</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingrediente.preco_unitario || ''}
                        onChange={(e) => atualizarIngrediente(ingrediente.id, 'preco_unitario', Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Custo Total</Label>
                      <Badge variant="outline" className="justify-center">
                        {formatCurrency(ingrediente.custo_total)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-center">
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
                    <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum ingrediente adicionado</p>
                    <Button onClick={adicionarIngrediente} className="mt-2">
                      Adicionar Primeiro Ingrediente
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Definir Preço ou Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    Se não definir, o sistema calculará baseado no markup padrão
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas de Lucro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Meta</Label>
                  <Select
                    value={metasLucro.tipo_meta}
                    onValueChange={(value: 'percentual' | 'valor' | 'cmv') => 
                      setMetasLucro(prev => ({ ...prev, tipo_meta: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">Margem Percentual</SelectItem>
                      <SelectItem value="valor">Lucro em Valor</SelectItem>
                      <SelectItem value="cmv">CMV Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {metasLucro.tipo_meta === 'percentual' && (
                  <div className="space-y-2">
                    <Label>Meta de Lucro (%)</Label>
                    <Input
                      type="number"
                      value={metasLucro.meta_lucro_percentual}
                      onChange={(e) => setMetasLucro(prev => ({ ...prev, meta_lucro_percentual: Number(e.target.value) }))}
                    />
                  </div>
                )}

                {metasLucro.tipo_meta === 'valor' && (
                  <div className="space-y-2">
                    <Label>Meta de Lucro (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={metasLucro.meta_lucro_valor}
                      onChange={(e) => setMetasLucro(prev => ({ ...prev, meta_lucro_valor: Number(e.target.value) }))}
                    />
                  </div>
                )}

                {metasLucro.tipo_meta === 'cmv' && (
                  <div className="space-y-2">
                    <Label>CMV Máximo (%)</Label>
                    <Input
                      type="number"
                      value={metasLucro.meta_cmv_percentual}
                      onChange={(e) => setMetasLucro(prev => ({ ...prev, meta_cmv_percentual: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          {isCalculating && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Calculando resultados...</p>
            </div>
          )}

          {resultados && !isCalculating && (
            <>
              {/* Status Geral */}
              <Card className={`border-2 ${getStatusColor(resultados.status_viabilidade)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Status da Receita</h3>
                      <p className="text-2xl font-bold capitalize">
                        {resultados.status_viabilidade}
                      </p>
                    </div>
                    {resultados.status_viabilidade === 'saudavel' ? (
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* KPIs Principais */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CMV</p>
                        <p className="text-2xl font-bold">
                          {resultados.cmv_estimado_percentual.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(resultados.cmv_estimado_valor)}
                        </p>
                      </div>
                      <PieChart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(resultados.lucro_estimado_valor)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resultados.lucro_estimado_percentual.toFixed(1)}%
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Margem Líquida</p>
                        <p className="text-2xl font-bold">
                          {resultados.margem_liquida.toFixed(1)}%
                        </p>
                      </div>
                      {resultados.margem_liquida >= metasLucro.meta_lucro_percentual ? (
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
                        <p className="text-sm font-medium text-muted-foreground">Preço Sugerido</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(resultados.preco_sugerido)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparativo */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise Comparativa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Custos</h4>
                      <div className="flex justify-between">
                        <span>CMV Estimado:</span>
                        <span className="font-medium">{formatCurrency(resultados.cmv_estimado_valor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CMV %:</span>
                        <span className="font-medium">{resultados.cmv_estimado_percentual.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Rentabilidade</h4>
                      <div className="flex justify-between">
                        <span>Margem Bruta:</span>
                        <span className="font-medium">{resultados.margem_bruta.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margem Líquida:</span>
                        <span className="font-medium">{resultados.margem_liquida.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Lucro por Unidade:</span>
                        <span className="text-green-600">{formatCurrency(resultados.lucro_estimado_valor)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSalvar} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Salvar Ficha Técnica Inteligente
                </Button>
              </div>
            </>
          )}
          
          {!resultados && !isCalculating && ingredientes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Adicione ingredientes para ver a análise inteligente</p>
              <p className="text-sm">O sistema calculará automaticamente CMV, lucro e rentabilidade</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
