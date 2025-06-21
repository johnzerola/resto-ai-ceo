
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileFriendlyInput } from '@/components/ui/mobile-friendly-input';
import { MobileScrollContainer } from '@/components/layout/MobileScrollContainer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useFichaTecnicaCore } from '@/hooks/useFichaTecnicaCore';
import { useFichaTecnicaActions } from '@/hooks/useFichaTecnicaActions';

interface SimpleIngredient {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  custo: number;
}

export function SimplifiedFichaTecnicaForm() {
  const [prato, setPrato] = useState({
    nome: '',
    categoria: '',
    rendimento: 1,
    precoDesejado: 0
  });
  
  const [ingredientesSimples, setIngredientesSimples] = useState<SimpleIngredient[]>([]);
  const { calcularResultados, resultados, isCalculating } = useFichaTecnicaCore();

  // Adicionar ingrediente simplificado
  const adicionarIngrediente = () => {
    const novoIngrediente: SimpleIngredient = {
      id: Date.now().toString(),
      nome: '',
      quantidade: 0,
      preco: 0,
      custo: 0
    };
    setIngredientesSimples(prev => [...prev, novoIngrediente]);
  };

  // Atualizar ingrediente
  const atualizarIngrediente = (id: string, campo: keyof SimpleIngredient, valor: any) => {
    setIngredientesSimples(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [campo]: valor };
        // Recalcular custo automaticamente
        if (campo === 'quantidade' || campo === 'preco') {
          updated.custo = Number(updated.quantidade) * Number(updated.preco);
        }
        return updated;
      }
      return ing;
    }));
  };

  // Remover ingrediente
  const removerIngrediente = (id: string) => {
    setIngredientesSimples(prev => prev.filter(ing => ing.id !== id));
  };

  // Calcular totais
  const custoTotal = ingredientesSimples.reduce((total, ing) => total + ing.custo, 0);
  const custoPorPorcao = custoTotal / (prato.rendimento || 1);
  const precoSugerido = custoPorPorcao * 2.5; // Markup 250%
  const lucroEstimado = (prato.precoDesejado || precoSugerido) - custoPorPorcao;
  const margemLucro = prato.precoDesejado > 0 ? 
    ((lucroEstimado / prato.precoDesejado) * 100) : 
    ((lucroEstimado / precoSugerido) * 100);

  // Status do prato
  const getStatus = () => {
    if (margemLucro < 0) return { status: 'prejuizo', cor: 'text-red-600', bg: 'bg-red-100' };
    if (margemLucro < 20) return { status: 'atencao', cor: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'saudavel', cor: 'text-green-600', bg: 'bg-green-100' };
  };

  const statusInfo = getStatus();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          🧠 Ficha Técnica Simples
        </h1>
        <p className="text-gray-600">
          Calcule rapidamente o custo e preço ideal do seu prato
        </p>
      </div>

      <MobileScrollContainer maxHeight="80vh">
        <div className="space-y-6">
          {/* Informações do Prato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dados do Prato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFriendlyInput
                  label="Nome do Prato"
                  value={prato.nome}
                  onChange={(value) => setPrato(prev => ({ ...prev, nome: value }))}
                  placeholder="Ex: Hambúrguer Artesanal"
                  required
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoria</label>
                  <Select value={prato.categoria} onValueChange={(value) => setPrato(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Escolha a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lanche">🍔 Lanche</SelectItem>
                      <SelectItem value="prato_principal">🍽️ Prato Principal</SelectItem>
                      <SelectItem value="entrada">🥗 Entrada</SelectItem>
                      <SelectItem value="sobremesa">🍰 Sobremesa</SelectItem>
                      <SelectItem value="bebida">🥤 Bebida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileFriendlyInput
                  label="Quantas porções rende?"
                  value={prato.rendimento}
                  onChange={(value) => setPrato(prev => ({ ...prev, rendimento: Math.max(1, Number(value)) }))}
                  type="number"
                  helpText="Número de porções que a receita produz"
                />

                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <MobileFriendlyInput
                    label="💰 Preço que você quer cobrar (opcional)"
                    value={prato.precoDesejado || ''}
                    onChange={(value) => setPrato(prev => ({ ...prev, precoDesejado: Number(value) }))}
                    type="number"
                    placeholder="Ex: 25.90"
                    helpText="Se informar, calculamos se vale a pena"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Ingredientes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Ingredientes ({ingredientesSimples.length})
                </CardTitle>
                <Button onClick={adicionarIngrediente} size="sm" className="bg-green-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ingredientesSimples.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ingrediente adicionado</p>
                  <p className="text-sm">Clique em "Adicionar" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredientesSimples.map((ingrediente) => (
                    <div key={ingrediente.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50">
                      <MobileFriendlyInput
                        label="Ingrediente"
                        value={ingrediente.nome}
                        onChange={(value) => atualizarIngrediente(ingrediente.id, 'nome', value)}
                        placeholder="Ex: Carne moída"
                      />
                      
                      <MobileFriendlyInput
                        label="Quantidade (g/ml)"
                        value={ingrediente.quantidade || ''}
                        onChange={(value) => atualizarIngrediente(ingrediente.id, 'quantidade', Number(value))}
                        type="number"
                        placeholder="200"
                      />
                      
                      <MobileFriendlyInput
                        label="Preço por kg/litro (R$)"
                        value={ingrediente.preco || ''}
                        onChange={(value) => atualizarIngrediente(ingrediente.id, 'preco', Number(value))}
                        type="number"
                        placeholder="15.00"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Custo Total</label>
                        <div className="h-12 bg-green-50 border rounded-md flex items-center px-3">
                          <span className="text-sm font-medium text-green-700">
                            R$ {ingrediente.custo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerIngrediente(ingrediente.id)}
                          className="h-12 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados */}
          {ingredientesSimples.length > 0 && custoTotal > 0 && (
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Análise Financeira
                  <Badge className={`${statusInfo.bg} ${statusInfo.cor} border-0`}>
                    {statusInfo.status === 'saudavel' ? '✅ Lucrativo' :
                     statusInfo.status === 'atencao' ? '⚠️ Atenção' : '🚨 Prejuízo'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Custo Total</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900">
                      R$ {custoTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-red-700">
                      Por porção: R$ {custoPorPorcao.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Preço Sugerido</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      R$ {precoSugerido.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">
                      Margem: 60% (padrão)
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${statusInfo.bg} border-current`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className={`h-5 w-5 ${statusInfo.cor}`} />
                      <span className={`text-sm font-medium ${statusInfo.cor}`}>Lucro Estimado</span>
                    </div>
                    <div className={`text-2xl font-bold ${statusInfo.cor}`}>
                      R$ {lucroEstimado.toFixed(2)}
                    </div>
                    <div className={`text-sm ${statusInfo.cor}`}>
                      {margemLucro.toFixed(1)}% de margem
                    </div>
                  </div>
                </div>

                {/* Alertas */}
                {margemLucro < 20 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {margemLucro < 0 ? 
                        "⚠️ ATENÇÃO: Você está no prejuízo! Considere aumentar o preço ou reduzir custos." :
                        "⚠️ Margem de lucro baixa. Recomendamos pelo menos 20% para cobrir imprevistos."
                      }
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recomendações */}
                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Recomendações:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Preço mínimo recomendado: R$ {(custoPorPorcao * 1.25).toFixed(2)} (25% de lucro)</li>
                    <li>• Preço ideal: R$ {(custoPorPorcao * 1.5).toFixed(2)} (50% de lucro)</li>
                    {prato.precoDesejado > 0 && prato.precoDesejado < precoSugerido && (
                      <li>• Seu preço está R$ {(precoSugerido - prato.precoDesejado).toFixed(2)} abaixo do recomendado</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileScrollContainer>
    </div>
  );
}
