import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, DollarSign, Percent, Target } from "lucide-react";
import { toast } from "sonner";

interface SimulationResults {
  custoTotal: number;
  precoVendaIdeal: number;
  lucroProjetado: number;
  margemLucro: number;
  cmvPercentual: number;
  breakEven: number;
}

export function FinancialSimulator() {
  const [inputs, setInputs] = useState({
    custoInsumos: '',
    cmvDesejado: '30',
    markup: '250',
    custosFixosMes: '8000',
    precoVendaAtual: ''
  });
  
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    const custoInsumos = parseFloat(inputs.custoInsumos);
    const cmvDesejado = parseFloat(inputs.cmvDesejado);
    const markup = parseFloat(inputs.markup);
    const custosFixosMes = parseFloat(inputs.custosFixosMes);

    if (!custoInsumos || custoInsumos <= 0) {
      toast.error('Insira um custo válido para os insumos');
      return;
    }

    if (!cmvDesejado || cmvDesejado <= 0 || cmvDesejado >= 100) {
      toast.error('CMV deve estar entre 1% e 99%');
      return;
    }

    if (!markup || markup <= 0) {
      toast.error('Markup deve ser um valor positivo');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      // Cálculos baseados nas fórmulas padrão de precificação
      const custoTotal = custoInsumos * 1.1; // Adiciona 10% de margem de segurança
      const precoVendaIdeal = custoTotal * (markup / 100);
      const lucroProjetado = precoVendaIdeal - custoTotal;
      const margemLucro = (lucroProjetado / precoVendaIdeal) * 100;
      const cmvPercentual = (custoTotal / precoVendaIdeal) * 100;
      
      // Estimativa de break-even baseada nos custos fixos
      const contribuicaoUnitaria = lucroProjetado;
      const breakEven = custosFixosMes / contribuicaoUnitaria;

      const simulationResults: SimulationResults = {
        custoTotal,
        precoVendaIdeal,
        lucroProjetado,
        margemLucro,
        cmvPercentual,
        breakEven: Math.ceil(breakEven)
      };

      setResults(simulationResults);
      setIsCalculating(false);
      toast.success('Simulação calculada com sucesso!');
    }, 1000);
  };

  const handleSimulateChange = (field: 'preco' | 'custo', value: string) => {
    if (!results) return;

    const newValue = parseFloat(value);
    if (isNaN(newValue) || newValue <= 0) return;

    let newResults = { ...results };
    
    if (field === 'preco') {
      // Simular mudança de preço
      const novoLucro = newValue - results.custoTotal;
      const novaMargem = (novoLucro / newValue) * 100;
      const novoCmv = (results.custoTotal / newValue) * 100;
      
      newResults = {
        ...results,
        precoVendaIdeal: newValue,
        lucroProjetado: novoLucro,
        margemLucro: novaMargem,
        cmvPercentual: novoCmv
      };
    } else {
      // Simular mudança de custo
      const novoLucro = results.precoVendaIdeal - newValue;
      const novaMargem = (novoLucro / results.precoVendaIdeal) * 100;
      const novoCmv = (newValue / results.precoVendaIdeal) * 100;
      
      newResults = {
        ...results,
        custoTotal: newValue,
        lucroProjetado: novoLucro,
        margemLucro: novaMargem,
        cmvPercentual: novoCmv
      };
    }
    
    setResults(newResults);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getHealthColor = (value: number, type: 'cmv' | 'margin') => {
    if (type === 'cmv') {
      if (value <= 30) return 'text-green-600';
      if (value <= 35) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= 25) return 'text-green-600';
      if (value >= 15) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Simulador Financeiro
        </CardTitle>
        <CardDescription>
          Calcule preços ideais e simule diferentes cenários para seu negócio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="custoInsumos">Custo dos Insumos *</Label>
            <Input
              id="custoInsumos"
              type="number"
              step="0.01"
              placeholder="15.50"
              value={inputs.custoInsumos}
              onChange={(e) => setInputs(prev => ({ ...prev, custoInsumos: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cmvDesejado">CMV Desejado (%)</Label>
            <Input
              id="cmvDesejado"
              type="number"
              step="1"
              placeholder="30"
              value={inputs.cmvDesejado}
              onChange={(e) => setInputs(prev => ({ ...prev, cmvDesejado: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="markup">Markup (%)</Label>
            <Input
              id="markup"
              type="number"
              step="10"
              placeholder="250"
              value={inputs.markup}
              onChange={(e) => setInputs(prev => ({ ...prev, markup: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custosFixosMes">Custos Fixos/Mês</Label>
            <Input
              id="custosFixosMes"
              type="number"
              step="100"
              placeholder="8000"
              value={inputs.custosFixosMes}
              onChange={(e) => setInputs(prev => ({ ...prev, custosFixosMes: e.target.value }))}
            />
          </div>
        </div>

        <Button 
          onClick={handleCalculate} 
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <>Calculando...</>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Preço Ideal
            </>
          )}
        </Button>

        {/* Results */}
        {results && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados da Simulação</h3>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Preço Ideal</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.precoVendaIdeal)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Lucro Projetado</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.lucroProjetado)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Margem Lucro</p>
                        <p className={`text-2xl font-bold ${getHealthColor(results.margemLucro, 'margin')}`}>
                          {results.margemLucro.toFixed(1)}%
                        </p>
                      </div>
                      <Percent className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CMV Real</p>
                        <p className={`text-2xl font-bold ${getHealthColor(results.cmvPercentual, 'cmv')}`}>
                          {results.cmvPercentual.toFixed(1)}%
                        </p>
                      </div>
                      <Target className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Break-Even</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {results.breakEven} unid/mês
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scenario Simulation */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Simular Cenários</h4>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="novoPreco">Testar Novo Preço</Label>
                    <Input
                      id="novoPreco"
                      type="number"
                      step="0.01"
                      placeholder={results.precoVendaIdeal.toFixed(2)}
                      onChange={(e) => handleSimulateChange('preco', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Veja como um preço diferente afeta sua margem
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="novoCusto">Testar Novo Custo</Label>
                    <Input
                      id="novoCusto"
                      type="number"
                      step="0.01"
                      placeholder={results.custoTotal.toFixed(2)}
                      onChange={(e) => handleSimulateChange('custo', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Simule redução de custos ou novos fornecedores
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Recomendações</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {results.cmvPercentual > 35 && (
                    <p>• CMV alto - considere renegociar fornecedores ou ajustar receitas</p>
                  )}
                  {results.margemLucro < 20 && (
                    <p>• Margem baixa - considere aumentar preços ou reduzir custos</p>
                  )}
                  {results.margemLucro >= 25 && results.cmvPercentual <= 30 && (
                    <p>• ✅ Precificação saudável - Continue assim!</p>
                  )}
                  <p>• Para cobrir custos fixos: venda pelo menos {results.breakEven} unidades/mês</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}