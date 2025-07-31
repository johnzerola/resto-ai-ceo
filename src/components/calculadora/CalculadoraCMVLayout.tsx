import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  PieChart,
  Download,
  ArrowRight
} from "lucide-react";
import { SEOOptimizations } from "@/components/seo/SEOOptimizations";

export function CalculadoraCMVLayout() {
  const [ingredientes, setIngredientes] = useState([
    { nome: '', quantidade: '', unidade: 'kg', precoPorUnidade: '', total: 0 }
  ]);
  const [precoVenda, setPrecoVenda] = useState('');
  const [resultados, setResultados] = useState({
    cmvTotal: 0,
    cmvPercentual: 0,
    margemBruta: 0,
    lucroUnitario: 0,
    status: '',
    classificacao: ''
  });

  const adicionarIngrediente = () => {
    setIngredientes([...ingredientes, { nome: '', quantidade: '', unidade: 'kg', precoPorUnidade: '', total: 0 }]);
  };

  const removerIngrediente = (index: number) => {
    const novosIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(novosIngredientes);
  };

  const atualizarIngrediente = (index: number, campo: string, valor: string) => {
    const novosIngredientes = [...ingredientes];
    novosIngredientes[index] = { ...novosIngredientes[index], [campo]: valor };
    
    // Calcular total do ingrediente
    if (campo === 'quantidade' || campo === 'precoPorUnidade') {
      const quantidade = parseFloat(novosIngredientes[index].quantidade) || 0;
      const preco = parseFloat(novosIngredientes[index].precoPorUnidade) || 0;
      novosIngredientes[index].total = quantidade * preco;
    }
    
    setIngredientes(novosIngredientes);
    calcularCMV();
  };

  const calcularCMV = () => {
    const cmvTotal = ingredientes.reduce((total, ing) => total + ing.total, 0);
    const venda = parseFloat(precoVenda) || 0;
    
    if (venda > 0) {
      const cmvPercentual = (cmvTotal / venda) * 100;
      const margemBruta = ((venda - cmvTotal) / venda) * 100;
      const lucroUnitario = venda - cmvTotal;
      
      let status = '';
      let classificacao = '';
      
      if (cmvPercentual <= 30) {
        status = 'Excelente';
        classificacao = 'success';
      } else if (cmvPercentual <= 35) {
        status = 'Bom';
        classificacao = 'success';
      } else if (cmvPercentual <= 40) {
        status = 'Atenção';
        classificacao = 'warning';
      } else {
        status = 'Crítico';
        classificacao = 'danger';
      }
      
      setResultados({
        cmvTotal,
        cmvPercentual,
        margemBruta,
        lucroUnitario,
        status,
        classificacao
      });
    }
  };

  const exportarPlanilha = () => {
    // Aqui você implementaria a exportação para Excel/CSV
    alert('Funcionalidade de exportação em desenvolvimento!');
  };

  return (
    <>
      <SEOOptimizations
        title="Calculadora de CMV Para Restaurante - Grátis | Lucraí"
        description="Calculadora gratuita de CMV para restaurantes. Calcule o custo de mercadoria vendida dos seus pratos e otimize sua precificação para aumentar o lucro."
        keywords="calculadora cmv, cmv restaurante, como calcular cmv, custo mercadoria vendida, precificação restaurante, calcular preço prato"
        canonical="https://lucrai.com/calculadora-cmv"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Calculadora de CMV Gratuita
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Calcule o <strong>CMV (Custo de Mercadoria Vendida)</strong> dos seus pratos e 
                descubra como <strong>precificar corretamente</strong> para <strong>aumentar o lucro</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge className="bg-white/20 text-white">
                  <Calculator className="mr-2 h-4 w-4" />
                  100% Gratuita
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resultados Instantâneos
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Planilha
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calculadora */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Calculator className="mr-3 h-6 w-6 text-primary" />
                    Calculadora de CMV
                  </h2>

                  {/* Ingredientes */}
                  <div className="space-y-4 mb-6">
                    <Label className="text-lg font-semibold">Ingredientes do Prato</Label>
                    
                    {ingredientes.map((ingrediente, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-4">
                          <Label htmlFor={`nome-${index}`}>Nome do Ingrediente</Label>
                          <Input
                            id={`nome-${index}`}
                            placeholder="Ex: Filé de frango"
                            value={ingrediente.nome}
                            onChange={(e) => atualizarIngrediente(index, 'nome', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`quantidade-${index}`}>Quantidade</Label>
                          <Input
                            id={`quantidade-${index}`}
                            type="number"
                            step="0.01"
                            placeholder="0.5"
                            value={ingrediente.quantidade}
                            onChange={(e) => atualizarIngrediente(index, 'quantidade', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`unidade-${index}`}>Unidade</Label>
                          <select
                            id={`unidade-${index}`}
                            className="w-full p-2 border rounded-lg"
                            value={ingrediente.unidade}
                            onChange={(e) => atualizarIngrediente(index, 'unidade', e.target.value)}
                          >
                            <option value="kg">Kg</option>
                            <option value="g">Gramas</option>
                            <option value="l">Litros</option>
                            <option value="ml">ML</option>
                            <option value="un">Unidade</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`preco-${index}`}>Preço/Unidade</Label>
                          <Input
                            id={`preco-${index}`}
                            type="number"
                            step="0.01"
                            placeholder="15.00"
                            value={ingrediente.precoPorUnidade}
                            onChange={(e) => atualizarIngrediente(index, 'precoPorUnidade', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Total</Label>
                          <div className="p-2 bg-muted rounded-lg text-center font-semibold">
                            R$ {ingrediente.total.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {ingredientes.length > 1 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removerIngrediente(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" onClick={adicionarIngrediente} className="w-full">
                      + Adicionar Ingrediente
                    </Button>
                  </div>

                  {/* Preço de Venda */}
                  <div className="mb-6">
                    <Label htmlFor="preco-venda" className="text-lg font-semibold">Preço de Venda do Prato</Label>
                    <Input
                      id="preco-venda"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 45.00"
                      value={precoVenda}
                      onChange={(e) => {
                        setPrecoVenda(e.target.value);
                        calcularCMV();
                      }}
                      className="text-lg"
                    />
                  </div>

                  <Button onClick={calcularCMV} className="w-full" size="lg">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular CMV
                  </Button>
                </CardContent>
              </Card>

              {/* Resultados */}
              {resultados.cmvTotal > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                      <PieChart className="mr-3 h-6 w-6 text-primary" />
                      Resultados da Análise
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary">
                          R$ {resultados.cmvTotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">CMV Total</div>
                      </div>

                      <div className="text-center p-4 bg-accent/5 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                        <div className="text-2xl font-bold text-accent">
                          {resultados.cmvPercentual.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">CMV Percentual</div>
                      </div>

                      <div className="text-center p-4 bg-green-500/5 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">
                          {resultados.margemBruta.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Margem Bruta</div>
                      </div>

                      <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                        <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {resultados.lucroUnitario.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Lucro Unitário</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`p-4 rounded-lg text-center mb-6 ${
                      resultados.classificacao === 'success' ? 'bg-green-500/10 text-green-700' :
                      resultados.classificacao === 'warning' ? 'bg-yellow-500/10 text-yellow-700' :
                      'bg-red-500/10 text-red-700'
                    }`}>
                      <div className="text-xl font-bold mb-2">
                        Status: {resultados.status}
                      </div>
                      <div className="text-sm">
                        {resultados.classificacao === 'success' && 'Seu CMV está dentro da faixa ideal para restaurantes!'}
                        {resultados.classificacao === 'warning' && 'CMV um pouco alto. Considere revisar ingredientes ou preço.'}
                        {resultados.classificacao === 'danger' && 'CMV crítico! Você pode estar vendendo no prejuízo.'}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={exportarPlanilha} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Planilha
                      </Button>
                      <Button className="flex-1">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Otimizar Precificação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Dicas */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">📊 Faixas Ideais de CMV</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                      <span>Excelente:</span>
                      <Badge className="bg-green-500">≤ 30%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded">
                      <span>Bom:</span>
                      <Badge className="bg-blue-500">30% - 35%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                      <span>Atenção:</span>
                      <Badge className="bg-yellow-500">35% - 40%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <span>Crítico:</span>
                      <Badge className="bg-red-500">&gt; 40%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Artigos Relacionados */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">📚 Artigos Relacionados</h3>
                  <div className="space-y-3">
                    <a href="/blog/como-calcular-cmv-restaurante" className="block p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <h4 className="font-semibold text-sm">Como Calcular CMV de Restaurante</h4>
                      <p className="text-xs text-muted-foreground">Guia completo com fórmulas e exemplos</p>
                    </a>
                    <a href="/blog/como-precificar-pratos-restaurante" className="block p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <h4 className="font-semibold text-sm">Como Precificar Pratos Corretamente</h4>
                      <p className="text-xs text-muted-foreground">Método científico de precificação</p>
                    </a>
                    <a href="/blog/como-aumentar-lucro-restaurante" className="block p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <h4 className="font-semibold text-sm">15 Formas de Aumentar o Lucro</h4>
                      <p className="text-xs text-muted-foreground">Estratégias comprovadas</p>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Quer Automatizar Tudo?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    O Lucraí calcula CMV automaticamente e sugere preços ideais para maximizar seu lucro.
                  </p>
                  <Button className="w-full">
                    Teste Grátis 7 Dias
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}