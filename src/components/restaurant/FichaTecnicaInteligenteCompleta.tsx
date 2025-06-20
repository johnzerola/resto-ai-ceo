
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Percent,
  Package
} from "lucide-react";
import { useFichaTecnicaCore } from "@/hooks/useFichaTecnicaCore";
import { useFichaTecnicaActions } from "@/hooks/useFichaTecnicaActions";

export function FichaTecnicaInteligenteCompleta() {
  const { 
    ingredientes, 
    setIngredientes, 
    resultados, 
    isCalculating, 
    calcularResultados 
  } = useFichaTecnicaCore();
  
  const {
    metasLucro,
    setMetasLucro,
    precoDesejado,
    setPrecoDesejado,
    insumosDisponiveis,
    adicionarIngrediente,
    atualizarIngrediente,
    salvarFichaTecnica
  } = useFichaTecnicaActions();

  const [prato, setPrato] = useState({
    nome_prato: '',
    categoria: '',
    rendimento_porcoes: 1,
    observacoes: ''
  });

  // Adicionar novo ingrediente
  const handleAdicionarIngrediente = () => {
    const novoIngrediente = adicionarIngrediente();
    setIngredientes(prev => [...prev, novoIngrediente]);
  };

  // Atualizar ingrediente
  const handleAtualizarIngrediente = (id: string, campo: string, valor: any) => {
    const novosIngredientes = atualizarIngrediente(ingredientes, id, campo as any, valor);
    setIngredientes(novosIngredientes);
  };

  // Remover ingrediente
  const handleRemoverIngrediente = (id: string) => {
    setIngredientes(prev => prev.filter(ing => ing.id !== id));
  };

  // Calcular quando ingredientes mudarem
  useEffect(() => {
    if (ingredientes.length > 0) {
      const timer = setTimeout(() => {
        calcularResultados(undefined, precoDesejado || undefined);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ingredientes, precoDesejado, calcularResultados]);

  // Salvar ficha
  const handleSalvar = async () => {
    const sucesso = await salvarFichaTecnica(ingredientes, resultados, prato);
    if (sucesso) {
      setPrato({
        nome_prato: '',
        categoria: '',
        rendimento_porcoes: 1,
        observacoes: ''
      });
      setIngredientes([]);
      setPrecoDesejado(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'bg-green-100 text-green-800 border-green-200';
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prejuizo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saudavel': return <CheckCircle className="h-4 w-4" />;
      case 'atencao': return <AlertTriangle className="h-4 w-4" />;
      case 'prejuizo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          🧠 Ficha Técnica Inteligente
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Cálculo automático de CMV, lucro e precificação estratégica
        </p>
      </div>

      {/* Informações do Prato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Prato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_prato">Nome do Prato *</Label>
              <Input
                id="nome_prato"
                value={prato.nome_prato}
                onChange={(e) => setPrato(prev => ({...prev, nome_prato: e.target.value}))}
                placeholder="Ex: Risoto de Camarão"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={prato.categoria} onValueChange={(value) => setPrato(prev => ({...prev, categoria: value}))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="prato_principal">Prato Principal</SelectItem>
                  <SelectItem value="sobremesa">Sobremesa</SelectItem>
                  <SelectItem value="bebida">Bebida</SelectItem>
                  <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rendimento">Rendimento (porções)</Label>
              <Input
                id="rendimento"
                type="number"
                value={prato.rendimento_porcoes}
                onChange={(e) => setPrato(prev => ({...prev, rendimento_porcoes: Number(e.target.value)}))}
                min="1"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="preco_desejado">Preço Desejado (R$)</Label>
              <Input
                id="preco_desejado"
                type="number"
                step="0.01"
                value={precoDesejado || ''}
                onChange={(e) => setPrecoDesejado(Number(e.target.value))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={prato.observacoes}
              onChange={(e) => setPrato(prev => ({...prev, observacoes: e.target.value}))}
              placeholder="Observações sobre o preparo, alergênicos, etc."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ingredientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Ingredientes
            </CardTitle>
            <Button onClick={handleAdicionarIngrediente} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ingredientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum ingrediente adicionado</p>
                <p className="text-sm">Clique em "Adicionar" para começar</p>
              </div>
            ) : (
              ingredientes.map((ingrediente) => (
                <div key={ingrediente.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Nome do Ingrediente</Label>
                    <Select 
                      value={ingrediente.insumo_id} 
                      onValueChange={(value) => {
                        const insumo = insumosDisponiveis.find(i => i.id === value);
                        if (insumo) {
                          handleAtualizarIngrediente(ingrediente.id, 'insumo_id', value);
                          handleAtualizarIngrediente(ingrediente.id, 'nome_insumo', insumo.nome);
                          handleAtualizarIngrediente(ingrediente.id, 'preco_unitario', insumo.preco_unitario);
                          handleAtualizarIngrediente(ingrediente.id, 'unidade_medida', insumo.unidade_medida);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Selecionar insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {insumosDisponiveis.map((insumo) => (
                          <SelectItem key={insumo.id} value={insumo.id}>
                            {insumo.nome} - R$ {insumo.preco_unitario?.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Qtd Bruta</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={ingrediente.quantidade_bruta || ''}
                      onChange={(e) => handleAtualizarIngrediente(ingrediente.id, 'quantidade_bruta', Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Fator Correção</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ingrediente.fator_correcao || ''}
                      onChange={(e) => handleAtualizarIngrediente(ingrediente.id, 'fator_correcao', Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Qtd Líquida</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={ingrediente.quantidade_liquida?.toFixed(3) || '0'}
                      readOnly
                      className="h-8 bg-gray-50"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoverIngrediente(ingrediente.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise Financeira
              {resultados.status_viabilidade && (
                <Badge className={`ml-2 ${getStatusColor(resultados.status_viabilidade)}`}>
                  {getStatusIcon(resultados.status_viabilidade)}
                  <span className="ml-1 capitalize">{resultados.status_viabilidade}</span>
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">CMV Estimado</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  R$ {resultados.cmv_estimado_valor?.toFixed(2)}
                </div>
                <div className="text-sm text-blue-700">
                  {resultados.cmv_estimado_percentual?.toFixed(1)}% do preço
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Lucro Estimado</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  R$ {resultados.lucro_estimado_valor?.toFixed(2)}
                </div>
                <div className="text-sm text-green-700">
                  {resultados.lucro_estimado_percentual?.toFixed(1)}% margem
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Preço Sugerido</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  R$ {resultados.preco_sugerido?.toFixed(2)}
                </div>
                <div className="text-sm text-purple-700">
                  Margem líquida: {resultados.margem_liquida?.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Alertas */}
            {resultados.alertas && resultados.alertas.length > 0 && (
              <div className="space-y-2">
                {resultados.alertas.map((alerta, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {alerta}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={() => {
            setPrato({
              nome_prato: '',
              categoria: '',
              rendimento_porcoes: 1,
              observacoes: ''
            });
            setIngredientes([]);
            setPrecoDesejado(0);
          }}
        >
          Limpar Tudo
        </Button>
        
        <Button 
          onClick={handleSalvar}
          disabled={!prato.nome_prato || ingredientes.length === 0 || isCalculating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isCalculating ? 'Calculando...' : 'Salvar Ficha Técnica'}
        </Button>
      </div>
    </div>
  );
}
