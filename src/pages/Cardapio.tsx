
import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImportDialog } from '@/components/cardapio/CSVImportDialog';
import { EnhancedBreakEvenDashboard } from '@/components/restaurant/EnhancedBreakEvenDashboard';
import { CascadePriceUpdater } from '@/components/restaurant/CascadePriceUpdater';
import { AIBusinessAssistant } from '@/components/restaurant/AIBusinessAssistant';
import { InsumoManager } from '@/components/restaurant/InsumoManager';
import { FichaTecnicaManager } from '@/components/restaurant/FichaTecnicaManager';
import { PrecificacaoManager } from '@/components/restaurant/PrecificacaoManager';
import { FichaTecnicaImportCSV } from '@/components/restaurant/FichaTecnicaImportCSV';
import { 
  Search, 
  Calculator,
  DollarSign,
  Utensils,
  Upload,
  Download,
  Package2,
  TrendingUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  ingredients: Ingredient[];
  image?: string;
  isActive: boolean;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export default function Cardapio() {
  const { currentRestaurant } = useAuth();
  
  // Estados principais
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [insumos, setInsumos] = useState<any[]>([]);
  const [fichasTecnicas, setFichasTecnicas] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'entrada', label: 'Entradas' },
    { value: 'prato-principal', label: 'Pratos Principais' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'lanche', label: 'Lanches' }
  ];

  // Handlers para componentes
  const handleInsumoUpdate = (novosInsumos: any[]) => {
    setInsumos(novosInsumos);
    // Efeito cascata: atualizar preços das fichas técnicas
    if (fichasTecnicas.length > 0) {
      updateCascadePrices(novosInsumos);
    }
  };

  const handleFichaUpdate = (novasFichas: any[]) => {
    setFichasTecnicas(novasFichas);
    // Atualizar lista do cardápio
    const newMenuItems = novasFichas.map(ficha => ({
      id: ficha.id,
      name: ficha.nome_prato,
      description: ficha.observacoes || '',
      category: ficha.categoria,
      price: ficha.preco_praticado || ficha.preco_sugerido,
      cost: ficha.custo_por_porcao,
      margin: ficha.margem_percentual || 0,
      ingredients: [],
      isActive: ficha.ativo !== false
    }));
    setMenuItems(newMenuItems);
  };

  const updateCascadePrices = async (insumosAtualizados: any[]) => {
    if (!currentRestaurant?.id || fichasTecnicas.length === 0) return;

    try {
      console.log('🔄 Aplicando efeito cascata...', { 
        restaurantId: currentRestaurant.id, 
        fichasCount: fichasTecnicas.length 
      });

      let fichasAtualizadas = 0;

      // Para cada ficha técnica, recalcular os custos
      for (const ficha of fichasTecnicas) {
        const { data: ingredientes, error } = await supabase
          .from('ingredientes_por_prato')
          .select(`
            *,
            insumos (id, preco_unitario)
          `)
          .eq('prato_id', ficha.id);

        if (error) {
          console.error(`Erro ao buscar ingredientes da ficha ${ficha.id}:`, error);
          continue;
        }

        // Calcular novo custo total da ficha
        let novoCustoIngredientes = 0;
        let ingredientesComCusto = 0;

        for (const ing of ingredientes || []) {
          const insumo = ing.insumos;
          if (insumo && insumo.preco_unitario > 0) {
            const custoIngrediente = ing.quantidade_liquida * insumo.preco_unitario;
            novoCustoIngredientes += custoIngrediente;
            ingredientesComCusto++;
          }
        }

        // Só atualizar se encontrou ingredientes com custo
        if (ingredientesComCusto > 0) {
          // Aplicar fatores de correção (perdas, embalagem, margem de segurança)
          const custoEmbalagem = novoCustoIngredientes * 0.05; // 5% embalagem
          const custoPerdas = novoCustoIngredientes * ((ficha.margem_seguranca || 10) / 100);
          const custoFinalTotal = novoCustoIngredientes + custoEmbalagem + custoPerdas;
          const custoPorPorcao = custoFinalTotal / Math.max(ficha.rendimento_porcoes || 1, 1);

          // Recalcular preços com markup inteligente
          const markupPadrao = 250; // 250% padrão para restaurantes
          const precoSugerido = custoPorPorcao * (markupPadrao / 100);
          const precoFinal = ficha.preco_praticado || precoSugerido;
          
          // Calcular margens
          const lucroEstimado = precoFinal - custoPorPorcao;
          const margemPercentual = precoFinal > 0 ? (lucroEstimado / precoFinal) * 100 : 0;
          
          // Determinar status de viabilidade
          let statusViabilidade = 'saudavel';
          if (margemPercentual < 0) statusViabilidade = 'prejuizo';
          else if (margemPercentual < 20) statusViabilidade = 'atencao';

          // Atualizar no banco
          const { error: updateError } = await supabase
            .from('pratos')
            .update({
              custo_total: custoFinalTotal,
              custo_por_porcao: custoPorPorcao,
              preco_sugerido: precoSugerido,
              margem_percentual: margemPercentual,
              lucro_estimado: lucroEstimado,
              status_viabilidade: statusViabilidade,
              custo_embalagem: custoEmbalagem,
              custo_perdas: custoPerdas,
              updated_at: new Date().toISOString()
            })
            .eq('id', ficha.id);

          if (!updateError) {
            fichasAtualizadas++;
          } else {
            console.error(`Erro ao atualizar ficha ${ficha.id}:`, updateError);
          }
        }
      }

      // Recarregar fichas atualizadas
      const { data: fichasAtualizadasData } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('updated_at', { ascending: false });

      if (fichasAtualizadasData) {
        handleFichaUpdate(fichasAtualizadasData);
      }

      toast.success(`✅ Efeito cascata concluído!`, {
        description: `${fichasAtualizadas} ficha(s) técnica(s) recalculada(s) automaticamente.`
      });

    } catch (error) {
      console.error('Erro no efeito cascata:', error);
      toast.error('❌ Erro ao atualizar preços automaticamente', {
        description: 'Alguns preços podem não ter sido atualizados'
      });
    }
  };

  const handlePriceUpdate = (updates: any[]) => {
    handleFichaUpdate(updates);
    toast.success('Preços atualizados com sucesso!');
  };

  const handleCSVImport = (importedItems: any[]) => {
    const newItems: MenuItem[] = importedItems.map(item => ({
      ...item,
      margin: item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0
    }));
    
    setMenuItems(prev => [...prev, ...newItems]);
  };

  const exportToCSV = () => {
    const csvContent = [
      'nome,descricao,categoria,preco,custo',
      ...menuItems.map(item => 
        `"${item.name}","${item.description}","${item.category}",${item.price},${item.cost}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cardapio_export.csv';
    link.click();
    
    toast.success('Cardápio exportado com sucesso!');
  };

  return (
    <ModernLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cardápio & Precificação</h1>
            <p className="text-muted-foreground">
              Gerencie seu cardápio e calcule preços automaticamente
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <FichaTecnicaImportCSV onImportComplete={() => {
              // Recarregar dados após importação
              if (currentRestaurant?.id) {
                const reloadData = async () => {
                  const { data } = await supabase
                    .from('pratos')
                    .select('*')
                    .eq('restaurant_id', currentRestaurant.id);
                  if (data) handleFichaUpdate(data);
                };
                reloadData();
              }
            }} />
            <Button variant="outline" onClick={() => setShowCSVImport(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Menu CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="cardapio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cardapio" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger value="insumos" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Insumos
            </TabsTrigger>
            <TabsTrigger value="fichas" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Fichas & Preços
            </TabsTrigger>
            <TabsTrigger value="analises" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="cascata" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Cascata
            </TabsTrigger>
          </TabsList>

          {/* Aba Cardápio */}
          <TabsContent value="cardapio" className="space-y-6">
            {/* Filtros e Busca */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar itens do cardápio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                      <Button
                        key={cat.value}
                        variant={selectedCategory === cat.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.value)}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista do Cardápio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Produtos do Cardápio</span>
                  <Badge variant="secondary">{menuItems.length} itens</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.length > 0 ? (
                  <div className="space-y-4">
                    {menuItems
                      .filter(item => 
                        (selectedCategory === 'todos' || item.category === selectedCategory) &&
                        (searchTerm === '' || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      )
                      .map(item => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.category}</Badge>
                              {!item.isActive && <Badge variant="destructive">Inativo</Badge>}
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Preço de Venda:</span>
                              <div className="font-bold text-green-600 text-lg">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(item.price)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Custo:</span>
                              <div className="font-medium text-red-600">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(item.cost)}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Margem:</span>
                              <div className="font-bold">
                                {item.margin.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lucro:</span>
                              <div className="font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(item.price - item.cost)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum produto no cardápio</h3>
                    <p>Crie fichas técnicas na aba "Fichas & Preços" para adicionar produtos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Insumos */}
          <TabsContent value="insumos" className="space-y-6">
            <InsumoManager 
              onInsumoUpdate={handleInsumoUpdate}
              onCascadeEffect={async (insumoId, novoPreco) => {
                await updateCascadePrices([{ id: insumoId, preco_unitario: novoPreco }]);
              }}
            />
          </TabsContent>

          {/* Aba Fichas Técnicas & Precificação Integrada */}
          <TabsContent value="fichas" className="space-y-6">
            <FichaTecnicaManager 
              insumos={insumos} 
              onFichaUpdate={handleFichaUpdate}
            />
          </TabsContent>

          {/* Aba Análises */}
          <TabsContent value="analises" className="space-y-6">
            <EnhancedBreakEvenDashboard />
            <AIBusinessAssistant />
          </TabsContent>

          {/* Aba Cascata */}
          <TabsContent value="cascata" className="space-y-6">
            <CascadePriceUpdater />
          </TabsContent>
        </Tabs>

        <CSVImportDialog 
          open={showCSVImport}
          onOpenChange={setShowCSVImport}
          onImportComplete={handleCSVImport}
        />
      </div>
    </ModernLayout>
  );
}
