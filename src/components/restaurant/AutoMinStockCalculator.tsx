import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Clock, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StockCalculation {
  insumo_id: string;
  nome: string;
  consumo_medio_diario: number;
  ciclo_compra_dias: number;
  tempo_entrega_dias: number;
  estoque_atual: number;
  estoque_minimo_atual: number;
  estoque_minimo_sugerido: number;
  margem_seguranca: number;
}

export function AutoMinStockCalculator() {
  const { currentRestaurant } = useAuth();
  const [calculations, setCalculations] = useState<StockCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadStockCalculations();
    }
  }, [currentRestaurant]);

  const loadStockCalculations = async () => {
    try {
      const { data: insumos, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant?.id);

      if (error) throw error;

      const calculationPromises = insumos?.map(async (insumo) => {
        const { data: estoqueMinimo } = await supabase.rpc('calcular_estoque_minimo_automatico', {
          insumo_uuid: insumo.id
        });

        return {
          insumo_id: insumo.id,
          nome: insumo.nome,
          consumo_medio_diario: insumo.consumo_medio_diario || 0,
          ciclo_compra_dias: insumo.ciclo_compra_dias || 7,
          tempo_entrega_dias: insumo.tempo_entrega_dias || 3,
          estoque_atual: insumo.estoque_atual || 0,
          estoque_minimo_atual: insumo.estoque_minimo || 0,
          estoque_minimo_sugerido: estoqueMinimo || 0,
          margem_seguranca: 20
        };
      }) || [];

      const results = await Promise.all(calculationPromises);
      setCalculations(results);
    } catch (error) {
      console.error('Erro ao carregar cálculos:', error);
      toast.error('Erro ao carregar cálculos de estoque mínimo');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCalculation = async (insumoId: string, novoEstoqueMinimo: number) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .update({ estoque_minimo: novoEstoqueMinimo })
        .eq('id', insumoId);

      if (error) throw error;

      toast.success('Estoque mínimo atualizado com sucesso!');
      loadStockCalculations();
    } catch (error) {
      console.error('Erro ao atualizar estoque mínimo:', error);
      toast.error('Erro ao atualizar estoque mínimo');
    }
  };

  const applyAllCalculations = async () => {
    setIsCalculating(true);
    try {
      const updates = calculations.map(calc => ({
        id: calc.insumo_id,
        estoque_minimo: calc.estoque_minimo_sugerido
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('insumos')
          .update({ estoque_minimo: update.estoque_minimo })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Todos os estoques mínimos foram atualizados!');
      loadStockCalculations();
    } catch (error) {
      console.error('Erro ao aplicar todos os cálculos:', error);
      toast.error('Erro ao aplicar cálculos');
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusColor = (atual: number, sugerido: number) => {
    const diferenca = Math.abs(atual - sugerido);
    const percentual = atual > 0 ? (diferenca / atual) * 100 : 100;
    
    if (percentual > 50) return 'destructive';
    if (percentual > 20) return 'secondary';
    return 'default';
  };

  const getStatusText = (atual: number, sugerido: number) => {
    if (atual === sugerido) return '✅ Ideal';
    if (atual < sugerido) return '⚠️ Muito baixo';
    return '📈 Muito alto';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Cálculo de Estoque Mínimo Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Cálculo de Estoque Mínimo Automático
        </CardTitle>
        <CardDescription>
          Baseado no consumo médio, ciclo de compra e tempo de entrega
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fórmula Explicativa */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Como calculamos:</h4>
          <p className="text-sm text-blue-800">
            <strong>Estoque Mínimo</strong> = (Consumo Diário × Ciclo de Compra + Tempo de Entrega) × 1,2 (margem de segurança)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span>Consumo Diário</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span>Ciclo Compra</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3 text-blue-600" />
              <span>Tempo Entrega</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>Margem Segurança</span>
            </div>
          </div>
        </div>

        {/* Botão para aplicar todos */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={applyAllCalculations}
            disabled={isCalculating}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {isCalculating ? 'Aplicando...' : 'Aplicar Todos os Cálculos'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {calculations.length} produto(s) analisados
          </span>
        </div>

        {/* Lista de Cálculos */}
        <div className="space-y-3">
          {calculations.map((calc) => (
            <div key={calc.insumo_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{calc.nome}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Consumo: {calc.consumo_medio_diario}/dia</span>
                    <span>Ciclo: {calc.ciclo_compra_dias}d</span>
                    <span>Entrega: {calc.tempo_entrega_dias}d</span>
                  </div>
                </div>
                <Badge variant={getStatusColor(calc.estoque_minimo_atual, calc.estoque_minimo_sugerido)}>
                  {getStatusText(calc.estoque_minimo_atual, calc.estoque_minimo_sugerido)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Estoque Atual</p>
                  <p className="font-bold text-lg">{calc.estoque_atual}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mínimo Atual</p>
                  <p className="font-bold text-lg text-gray-600">{calc.estoque_minimo_atual}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mínimo Sugerido</p>
                  <p className="font-bold text-lg text-blue-600">{calc.estoque_minimo_sugerido.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Diferença</p>
                  <p className={`font-bold text-lg ${
                    calc.estoque_minimo_sugerido > calc.estoque_minimo_atual ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {calc.estoque_minimo_sugerido > calc.estoque_minimo_atual ? '+' : ''}
                    {(calc.estoque_minimo_sugerido - calc.estoque_minimo_atual).toFixed(1)}
                  </p>
                </div>
              </div>

              {calc.estoque_minimo_atual !== calc.estoque_minimo_sugerido && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyCalculation(calc.insumo_id, calc.estoque_minimo_sugerido)}
                  className="w-full"
                >
                  Aplicar Estoque Mínimo Sugerido
                </Button>
              )}
            </div>
          ))}
        </div>

        {calculations.length === 0 && (
          <div className="text-center py-10">
            <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Nenhum produto encontrado para análise
            </p>
            <p className="text-sm text-muted-foreground">
              Cadastre produtos com consumo médio diário para ver os cálculos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}