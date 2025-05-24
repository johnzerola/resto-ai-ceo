
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Target, Plus, Trash2 } from "lucide-react";

interface CompetitiveBenchmarkProps {
  suggestedPrice: number;
  priceType: string;
}

interface Competitor {
  id: string;
  name: string;
  price: number;
}

export function CompetitiveBenchmark({ suggestedPrice, priceType }: CompetitiveBenchmarkProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', price: '' });

  const addCompetitor = () => {
    if (newCompetitor.name && newCompetitor.price) {
      const competitor: Competitor = {
        id: Date.now().toString(),
        name: newCompetitor.name,
        price: parseFloat(newCompetitor.price)
      };
      setCompetitors([...competitors, competitor]);
      setNewCompetitor({ name: '', price: '' });
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const getMarketPosition = () => {
    if (competitors.length === 0) return null;
    
    const prices = competitors.map(c => c.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    let position = 'EQUILIBRADO';
    let positionColor = 'secondary';
    
    if (suggestedPrice < avgPrice * 0.9) {
      position = 'COMPETITIVO';
      positionColor = 'default';
    } else if (suggestedPrice > avgPrice * 1.1) {
      position = 'PREMIUM';
      positionColor = 'destructive';
    }
    
    const percentilePosition = ((suggestedPrice - minPrice) / (maxPrice - minPrice)) * 100;
    
    return {
      position,
      positionColor,
      avgPrice,
      minPrice,
      maxPrice,
      percentilePosition: isNaN(percentilePosition) ? 50 : percentilePosition
    };
  };

  const marketAnalysis = getMarketPosition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Benchmarking Competitivo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare seu preço com a concorrência local
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar Concorrente */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="competitorName">Nome do Concorrente</Label>
            <Input
              id="competitorName"
              placeholder="Ex: Restaurante ABC"
              value={newCompetitor.name}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="competitorPrice">
              Preço {priceType === 'kg' ? 'por Kg' : 'por Pessoa'}
            </Label>
            <Input
              id="competitorPrice"
              type="number"
              step="0.01"
              placeholder="Ex: 45.00"
              value={newCompetitor.price}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addCompetitor} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Concorrentes */}
        {competitors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Concorrentes Cadastrados</h4>
            {competitors.map((competitor) => (
              <div key={competitor.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <span className="font-medium">{competitor.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {formatCurrency(competitor.price)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompetitor(competitor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Análise de Posicionamento */}
        {marketAnalysis && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">Análise de Posicionamento</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Seu Preço</p>
                <p className="text-lg font-semibold">{formatCurrency(suggestedPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posição no Mercado</p>
                <Badge variant={marketAnalysis.positionColor as any}>
                  {marketAnalysis.position}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Menor</p>
                <p className="font-medium">{formatCurrency(marketAnalysis.minPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Média</p>
                <p className="font-medium">{formatCurrency(marketAnalysis.avgPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Maior</p>
                <p className="font-medium">{formatCurrency(marketAnalysis.maxPrice)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Percentil no Mercado</span>
                <span>{marketAnalysis.percentilePosition.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${marketAnalysis.percentilePosition}%` }}
                ></div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>COMPETITIVO:</strong> Preço até 10% abaixo da média</p>
              <p><strong>EQUILIBRADO:</strong> Preço próximo à média (±10%)</p>
              <p><strong>PREMIUM:</strong> Preço mais de 10% acima da média</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
