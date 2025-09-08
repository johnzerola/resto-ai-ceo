import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, TrendingDown, Clock, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseRecommendation {
  insumo_id: string;
  nome: string;
  categoria: string;
  estoque_atual: number;
  consumo_medio_diario: number;
  estoque_minimo: number;
  dias_para_ruptura: number;
  quantidade_sugerida: number;
  prioridade: 'alta' | 'media' | 'baixa';
  motivo: string;
  fornecedor?: string;
  preco_ultima_compra: number;
  valor_total_sugerido: number;
}

export function ProactivePurchaseRecommendations() {
  const { currentRestaurant } = useAuth();
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentRestaurant?.id) {
      generateRecommendations();
    }
  }, [currentRestaurant]);

  const generateRecommendations = async () => {
    try {
      // Executar análise de tendências primeiro
      await supabase.rpc('detectar_tendencias_estoque', {
        restaurant_uuid: currentRestaurant?.id
      });

      // Buscar insumos com dados de tendência
      const { data: insumos, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant?.id)
        .order('estoque_atual', { ascending: true });

      if (error) throw error;

      const recomendacoes: PurchaseRecommendation[] = [];

      for (const insumo of insumos || []) {
        const estoque = insumo.estoque_atual || 0;
        const minimo = insumo.estoque_minimo || 0;
        const consumo = insumo.consumo_medio_diario || 0;
        const cicloCompra = insumo.ciclo_compra_dias || 7;
        const tempoEntrega = insumo.tempo_entrega_dias || 3;

        let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
        let motivo = '';
        let quantidadeSugerida = 0;
        let diasParaRuptura = 0;

        // Calcular dias para ruptura
        if (consumo > 0) {
          diasParaRuptura = Math.floor(estoque / consumo);
        }

        // Critérios para recomendação de compra
        if (estoque <= 0) {
          prioridade = 'alta';
          motivo = '🚨 Produto zerado - Compra urgente!';
          quantidadeSugerida = consumo * cicloCompra * 1.5; // 1.5x o ciclo normal
        } else if (estoque <= minimo) {
          prioridade = 'alta';
          motivo = '⚠️ Abaixo do estoque mínimo';
          quantidadeSugerida = (consumo * cicloCompra) - estoque;
        } else if (diasParaRuptura <= tempoEntrega) {
          prioridade = 'alta';
          motivo = `⏰ Ruptura em ${diasParaRuptura} dia(s) - Tempo de entrega: ${tempoEntrega} dia(s)`;
          quantidadeSugerida = consumo * (cicloCompra + tempoEntrega);
        } else if (diasParaRuptura <= cicloCompra) {
          prioridade = 'media';
          motivo = `📅 Ruptura em ${diasParaRuptura} dia(s) - Próximo ao ciclo de compra`;
          quantidadeSugerida = consumo * cicloCompra;
        } else if (estoque < (minimo * 1.5)) {
          prioridade = 'media';
          motivo = '📊 Estoque baixo - Recomendado reabastecer';
          quantidadeSugerida = (minimo * 2) - estoque;
        }

        // Só adicionar se há recomendação
        if (quantidadeSugerida > 0) {
          const valorTotal = quantidadeSugerida * (insumo.preco_ultima_compra || 0);
          
          recomendacoes.push({
            insumo_id: insumo.id,
            nome: insumo.nome,
            categoria: insumo.categoria,
            estoque_atual: estoque,
            consumo_medio_diario: consumo,
            estoque_minimo: minimo,
            dias_para_ruptura: diasParaRuptura,
            quantidade_sugerida: Math.ceil(quantidadeSugerida),
            prioridade,
            motivo,
            fornecedor: insumo.fornecedor,
            preco_ultima_compra: insumo.preco_ultima_compra || 0,
            valor_total_sugerido: valorTotal
          });
        }
      }

      // Ordenar por prioridade
      const prioridadeOrdem = { 'alta': 3, 'media': 2, 'baixa': 1 };
      recomendacoes.sort((a, b) => prioridadeOrdem[b.prioridade] - prioridadeOrdem[a.prioridade]);

      setRecommendations(recomendacoes);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      toast.error('Erro ao gerar recomendações de compra');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const generateShoppingList = () => {
    const selectedRecommendations = recommendations.filter(r => selectedItems.has(r.insumo_id));
    
    if (selectedRecommendations.length === 0) {
      toast.error('Selecione pelo menos um item para gerar a lista');
      return;
    }

    // Aqui você pode integrar com o componente de lista de compras
    const listItems = selectedRecommendations.map(r => ({
      produto: r.nome,
      quantidade: r.quantidade_sugerida,
      fornecedor: r.fornecedor || 'Não informado',
      preco_estimado: r.preco_ultima_compra,
      valor_total: r.valor_total_sugerido,
      prioridade: r.prioridade
    }));

    // Salvar no localStorage para que outros componentes possam acessar
    localStorage.setItem('generated_shopping_list', JSON.stringify(listItems));
    
    toast.success(`Lista de compras gerada com ${selectedRecommendations.length} item(ns)!`);
    setSelectedItems(new Set()); // Limpar seleção
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baixa': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <AlertTriangle className="h-4 w-4" />;
      case 'media': return <Clock className="h-4 w-4" />;
      case 'baixa': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalSelectedValue = recommendations
    .filter(r => selectedItems.has(r.insumo_id))
    .reduce((acc, r) => acc + r.valor_total_sugerido, 0);

  const criticalItems = recommendations.filter(r => r.prioridade === 'alta').length;
  const mediumItems = recommendations.filter(r => r.prioridade === 'media').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Recomendações de Compra
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
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Recomendações Proativas de Compra
        </CardTitle>
        <CardDescription>
          Baseado no consumo médio, estoque atual e tempo de entrega
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Alertas de Resumo */}
        {criticalItems > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-red-800">
                  🚨 {criticalItems} produto(s) precisam de compra urgente!
                </span>
                <span className="text-sm text-red-700">
                  {mediumItems > 0 && `+ ${mediumItems} produto(s) com prioridade média`}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <div className="text-sm text-red-800">Urgentes</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{mediumItems}</div>
            <div className="text-sm text-yellow-800">Prioridade Média</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedItems.size}</div>
            <div className="text-sm text-blue-800">Selecionados</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSelectedValue)}</div>
            <div className="text-sm text-green-800">Valor Total</div>
          </div>
        </div>

        {/* Ações */}
        {selectedItems.size > 0 && (
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm">
              {selectedItems.size} item(ns) selecionado(s) • {formatCurrency(totalSelectedValue)}
            </span>
            <Button onClick={generateShoppingList} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Gerar Lista de Compras
            </Button>
          </div>
        )}

        {/* Lista de Recomendações */}
        <div className="space-y-3">
          {recommendations.map((recommendation) => (
            <div 
              key={recommendation.insumo_id} 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedItems.has(recommendation.insumo_id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleItemSelection(recommendation.insumo_id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{recommendation.nome}</h4>
                    <Badge variant={getPriorityColor(recommendation.prioridade)} className="text-xs">
                      {getPriorityIcon(recommendation.prioridade)}
                      {recommendation.prioridade.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {recommendation.motivo}
                  </p>
                  {recommendation.fornecedor && (
                    <p className="text-xs text-muted-foreground">
                      Fornecedor: {recommendation.fornecedor}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {recommendation.quantidade_sugerida} unidades
                  </div>
                  {recommendation.preco_ultima_compra > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(recommendation.valor_total_sugerido)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Estoque Atual:</span>
                  <p className="font-medium">{recommendation.estoque_atual}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumo/dia:</span>
                  <p className="font-medium">{recommendation.consumo_medio_diario.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dias p/ ruptura:</span>
                  <p className={`font-medium ${
                    recommendation.dias_para_ruptura <= 3 ? 'text-red-600' : 
                    recommendation.dias_para_ruptura <= 7 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {recommendation.dias_para_ruptura || 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço unit.:</span>
                  <p className="font-medium">
                    {recommendation.preco_ultima_compra > 0 
                      ? formatCurrency(recommendation.preco_ultima_compra)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {selectedItems.has(recommendation.insumo_id) && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Selecionado para lista de compras</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {recommendations.length === 0 && (
            <div className="text-center py-10">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">
                🎉 Parabéns! Seu estoque está bem gerenciado
              </p>
              <p className="text-sm text-muted-foreground">
                Nenhuma recomendação de compra urgente no momento
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}