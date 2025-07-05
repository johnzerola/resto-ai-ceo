import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PriceImpact {
  insumo_id: string;
  insumo_nome: string;
  preco_antigo: number;
  preco_novo: number;
  pratos_afetados: Array<{
    prato_id: string;
    nome_prato: string;
    custo_antigo: number;
    custo_novo: number;
    diferenca: number;
    percentual_impacto: number;
  }>;
  impacto_total: number;
}

export function CascadePriceUpdater() {
  const { currentRestaurant } = useAuth();
  const [selectedInsumo, setSelectedInsumo] = useState<string>("");
  const [novoPreco, setNovoPreco] = useState<string>("");
  const [insumos, setInsumos] = useState<Array<{id: string, nome: string, preco_unitario: number}>>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<PriceImpact | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadInsumos();
    }
  }, [currentRestaurant]);

  const loadInsumos = async () => {
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('id, nome, preco_unitario')
        .eq('restaurant_id', currentRestaurant?.id)
        .order('nome');

      if (error) throw error;
      setInsumos(data || []);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar lista de insumos');
    }
  };

  const calculatePriceImpact = async () => {
    if (!selectedInsumo || !novoPreco) {
      toast.error('Selecione um insumo e informe o novo preço');
      return;
    }

    setIsCalculating(true);
    try {
      const insumo = insumos.find(i => i.id === selectedInsumo);
      if (!insumo) return;

      const precoNumerico = parseFloat(novoPreco);
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        toast.error('Informe um preço válido');
        return;
      }

      // Buscar todos os pratos que usam este insumo
      const { data: pratosAfetados, error } = await supabase
        .from('ingredientes_por_prato')
        .select(`
          prato_id,
          quantidade_liquida,
          pratos!inner (
            id,
            nome_prato,
            custo_por_porcao
          )
        `)
        .eq('insumo_id', selectedInsumo);

      if (error) throw error;

      const pratosComImpacto = pratosAfetados?.map(item => {
        const custoAntigo = item.pratos.custo_por_porcao || 0;
        const diferencaInsumo = (precoNumerico - insumo.preco_unitario) * item.quantidade_liquida;
        const custoNovo = custoAntigo + diferencaInsumo;
        const percentualImpacto = custoAntigo > 0 ? (diferencaInsumo / custoAntigo) * 100 : 0;

        return {
          prato_id: item.prato_id,
          nome_prato: item.pratos.nome_prato,
          custo_antigo: custoAntigo,
          custo_novo: custoNovo,
          diferenca: diferencaInsumo,
          percentual_impacto: percentualImpacto
        };
      }) || [];

      const impactoTotal = pratosComImpacto.reduce((acc, prato) => acc + Math.abs(prato.diferenca), 0);

      setImpactAnalysis({
        insumo_id: selectedInsumo,
        insumo_nome: insumo.nome,
        preco_antigo: insumo.preco_unitario,
        preco_novo: precoNumerico,
        pratos_afetados: pratosComImpacto,
        impacto_total: impactoTotal
      });

    } catch (error) {
      console.error('Erro ao calcular impacto:', error);
      toast.error('Erro ao calcular impacto nos preços');
    } finally {
      setIsCalculating(false);
    }
  };

  const applyPriceUpdate = async () => {
    if (!impactAnalysis) return;

    setIsApplying(true);
    try {
      // Atualizar preço do insumo
      const { error: insumoError } = await supabase
        .from('insumos')
        .update({ preco_unitario: impactAnalysis.preco_novo })
        .eq('id', impactAnalysis.insumo_id);

      if (insumoError) throw insumoError;

      // Atualizar custos dos pratos afetados
      for (const prato of impactAnalysis.pratos_afetados) {
        const { error: pratoError } = await supabase
          .from('pratos')
          .update({ custo_por_porcao: prato.custo_novo })
          .eq('id', prato.prato_id);

        if (pratoError) throw pratoError;
      }

      toast.success(`Preço atualizado! ${impactAnalysis.pratos_afetados.length} receita(s) foram recalculadas.`);
      
      // Reset form
      setSelectedInsumo("");
      setNovoPreco("");
      setImpactAnalysis(null);
      loadInsumos();

    } catch (error) {
      console.error('Erro ao aplicar atualizações:', error);
      toast.error('Erro ao aplicar atualizações de preço');
    } finally {
      setIsApplying(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          Atualização de Preços em Cascata
        </CardTitle>
        <CardDescription>
          Simule o impacto da mudança de preço de um insumo em todas as receitas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Formulário de Simulação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Insumo:</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={selectedInsumo}
              onChange={(e) => setSelectedInsumo(e.target.value)}
            >
              <option value="">Selecione um insumo...</option>
              {insumos.map(insumo => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nome} - {formatCurrency(insumo.preco_unitario)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Preço:</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={calculatePriceImpact}
              disabled={isCalculating || !selectedInsumo || !novoPreco}
              className="w-full gap-2"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Simular Impacto
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Resultado da Análise */}
        {impactAnalysis && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Impacto da mudança de preço: {impactAnalysis.insumo_nome}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Preço Atual:</span>
                      <p className="font-bold">{formatCurrency(impactAnalysis.preco_antigo)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Novo Preço:</span>
                      <p className="font-bold text-blue-600">{formatCurrency(impactAnalysis.preco_novo)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impacto Total:</span>
                      <p className="font-bold text-orange-600">{formatCurrency(impactAnalysis.impacto_total)}</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Receitas Afetadas */}
            <div>
              <h4 className="font-medium mb-3">
                Receitas Afetadas ({impactAnalysis.pratos_afetados.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {impactAnalysis.pratos_afetados.map((prato) => (
                  <div key={prato.prato_id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{prato.nome_prato}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Custo atual: {formatCurrency(prato.custo_antigo)}</span>
                        <span>Novo custo: {formatCurrency(prato.custo_novo)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        prato.diferenca > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {prato.diferenca > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-bold">
                          {prato.diferenca > 0 ? '+' : ''}{formatCurrency(prato.diferenca)}
                        </span>
                      </div>
                      <Badge variant={Math.abs(prato.percentual_impacto) > 10 ? 'destructive' : 'secondary'}>
                        {prato.percentual_impacto > 0 ? '+' : ''}{prato.percentual_impacto.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                onClick={applyPriceUpdate}
                disabled={isApplying}
                className="gap-2"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Aplicar Atualização
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setImpactAnalysis(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {insumos.length === 0 && (
          <div className="text-center py-10">
            <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Nenhum insumo cadastrado
            </p>
            <p className="text-sm text-muted-foreground">
              Cadastre insumos para usar a atualização em cascata
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}