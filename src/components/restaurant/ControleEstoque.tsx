
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EstoqueWidget } from "./widgets/EstoqueWidget";

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_unitario: number;
  estoque_atual: number;
  estoque_minimo: number;
  perda_media_percentual: number;
  fornecedor?: string;
  validade_dias: number;
  preco_pago: number;
  volume_embalagem: number;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
  codigo?: number;
}

export function ControleEstoque() {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [novoInsumo, setNovoInsumo] = useState<Partial<Insumo>>({
    categoria: 'geral',
    unidade_medida: 'kg',
    perda_media_percentual: 5,
    validade_dias: 30,
    estoque_minimo: 1,
    preco_pago: 0,
    volume_embalagem: 1,
    nome: '',
    estoque_atual: 0
  });

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarInsumos();
    }
  }, [currentRestaurant]);

  const carregarInsumos = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (error) throw error;
      setInsumos((data || []) as Insumo[]);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar estoque');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarInsumo = async () => {
    if (!currentRestaurant?.id || !novoInsumo.nome?.trim()) {
      toast.error('Preencha o nome do insumo');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('insumos')
        .insert({
          nome: novoInsumo.nome,
          categoria: novoInsumo.categoria || 'geral',
          unidade_medida: novoInsumo.unidade_medida || 'kg',
          preco_pago: novoInsumo.preco_pago || 0,
          volume_embalagem: novoInsumo.volume_embalagem || 1,
          perda_media_percentual: novoInsumo.perda_media_percentual || 5,
          validade_dias: novoInsumo.validade_dias || 30,
          estoque_minimo: novoInsumo.estoque_minimo || 1,
          estoque_atual: novoInsumo.estoque_atual || 0,
          fornecedor: novoInsumo.fornecedor,
          restaurant_id: currentRestaurant.id,
          preco_unitario: (novoInsumo.preco_pago || 0) / (novoInsumo.volume_embalagem || 1)
        })
        .select()
        .single();

      if (error) throw error;

      setInsumos(prev => [...prev, data as Insumo]);
      setNovoInsumo({
        categoria: 'geral',
        unidade_medida: 'kg',
        perda_media_percentual: 5,
        validade_dias: 30,
        estoque_minimo: 1,
        preco_pago: 0,
        volume_embalagem: 1,
        nome: '',
        estoque_atual: 0
      });
      toast.success('Insumo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar insumo:', error);
      toast.error('Erro ao adicionar insumo');
    }
  };

  const atualizarEstoque = async (insumoId: string, quantidade: number) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .update({ estoque_atual: quantidade })
        .eq('id', insumoId);

      if (error) throw error;

      setInsumos(prev => prev.map(insumo =>
        insumo.id === insumoId ? { ...insumo, estoque_atual: quantidade } : insumo
      ));

      toast.success('Estoque atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  const getStatusEstoque = (insumo: Insumo) => {
    if (insumo.estoque_atual <= 0) return 'zerado';
    if (insumo.estoque_atual <= insumo.estoque_minimo) return 'baixo';
    if (insumo.estoque_atual <= insumo.estoque_minimo * 2) return 'atencao';
    return 'ok';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'zerado': return 'bg-red-100 text-red-800 border-red-200';
      case 'baixo': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ok': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'zerado': return 'Zerado';
      case 'baixo': return 'Estoque Baixo';
      case 'atencao': return 'Atenção';
      case 'ok': return 'OK';
      default: return 'N/A';
    }
  };

  const insumosFiltrados = insumos.filter(insumo => 
    filtroCategoria === 'todos' || insumo.categoria === filtroCategoria
  );

  const categorias = [...new Set(insumos.map(i => i.categoria))];
  
  const alertasEstoque = insumos.filter(i => getStatusEstoque(i) === 'baixo' || getStatusEstoque(i) === 'zerado');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Gestão completa de insumos, estoque e perdas
          </p>
        </div>
      </div>

      {/* Widget de Estoque */}
      <EstoqueWidget insumos={insumos} />

      {/* Alertas */}
      {alertasEstoque.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {alertasEstoque.length} itens com estoque baixo ou zerado.
            <div className="mt-2 text-sm">
              {alertasEstoque.slice(0, 3).map(item => (
                <div key={item.id}>• {item.nome}: {item.estoque_atual} {item.unidade_medida}</div>
              ))}
              {alertasEstoque.length > 3 && <div>... e mais {alertasEstoque.length - 3} itens</div>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário de Novo Item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Insumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Insumo *</Label>
              <Input
                id="nome"
                value={novoInsumo.nome || ''}
                onChange={(e) => setNovoInsumo(prev => ({...prev, nome: e.target.value}))}
                placeholder="Ex: Farinha de Trigo"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={novoInsumo.categoria} 
                onValueChange={(value) => setNovoInsumo(prev => ({...prev, categoria: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carnes">Carnes</SelectItem>
                  <SelectItem value="vegetais">Vegetais</SelectItem>
                  <SelectItem value="laticinios">Laticínios</SelectItem>
                  <SelectItem value="cereais">Cereais</SelectItem>
                  <SelectItem value="temperos">Temperos</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="descartaveis">Descartáveis</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="unidade">Unidade</Label>
                <Select 
                  value={novoInsumo.unidade_medida} 
                  onValueChange={(value) => setNovoInsumo(prev => ({...prev, unidade_medida: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="unidade">unidade</SelectItem>
                    <SelectItem value="pacote">pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estoque_minimo">Estoque Mín.</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  step="0.001"
                  value={novoInsumo.estoque_minimo || ''}
                  onChange={(e) => setNovoInsumo(prev => ({...prev, estoque_minimo: parseFloat(e.target.value) || 0}))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="preco_pago">Preço Pago (R$)</Label>
                <Input
                  id="preco_pago"
                  type="number"
                  step="0.01"
                  value={novoInsumo.preco_pago || ''}
                  onChange={(e) => setNovoInsumo(prev => ({...prev, preco_pago: parseFloat(e.target.value) || 0}))}
                  placeholder="Ex: 25.90"
                />
              </div>

              <div>
                <Label htmlFor="volume_embalagem">Volume Embalagem</Label>
                <Input
                  id="volume_embalagem"
                  type="number"
                  step="0.001"
                  value={novoInsumo.volume_embalagem || ''}
                  onChange={(e) => setNovoInsumo(prev => ({...prev, volume_embalagem: parseFloat(e.target.value) || 1}))}
                  placeholder="Ex: 5 (kg)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="perda_media">Perda Média (%)</Label>
              <Input
                id="perda_media"
                type="number"
                step="0.1"
                value={novoInsumo.perda_media_percentual || ''}
                onChange={(e) => setNovoInsumo(prev => ({...prev, perda_media_percentual: parseFloat(e.target.value) || 0}))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Perdas por deterioração, preparo, etc.
              </p>
            </div>

            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={novoInsumo.fornecedor || ''}
                onChange={(e) => setNovoInsumo(prev => ({...prev, fornecedor: e.target.value}))}
                placeholder="Nome do fornecedor"
              />
            </div>

            <Button onClick={adicionarInsumo} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Insumo
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Insumos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as categorias</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Zerado ({insumos.filter(i => getStatusEstoque(i) === 'zerado').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Baixo ({insumos.filter(i => getStatusEstoque(i) === 'baixo').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>OK ({insumos.filter(i => getStatusEstoque(i) === 'ok').length})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Insumos */}
          <div className="grid gap-4">
            {insumosFiltrados.map((insumo) => {
              const status = getStatusEstoque(insumo);
              return (
                <Card key={insumo.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{insumo.nome}</h4>
                          <Badge variant="outline" className={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Badge>
                          <Badge variant="secondary">{insumo.categoria}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Estoque Atual</p>
                            <p className="font-medium">{insumo.estoque_atual} {insumo.unidade_medida}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Estoque Mínimo</p>
                            <p className="font-medium">{insumo.estoque_minimo} {insumo.unidade_medida}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Preço Unitário</p>
                            <p className="font-medium">R$ {insumo.preco_unitario.toFixed(3)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Perda Média</p>
                            <p className="font-medium">{insumo.perda_media_percentual}%</p>
                          </div>
                        </div>

                        {insumo.fornecedor && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Fornecedor: {insumo.fornecedor}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <Label htmlFor={`estoque_${insumo.id}`} className="text-xs">Ajustar Estoque</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id={`estoque_${insumo.id}`}
                              type="number"
                              step="0.001"
                              className="w-20 h-8"
                              defaultValue={insumo.estoque_atual}
                              onBlur={(e) => {
                                const valor = parseFloat(e.target.value) || 0;
                                if (valor !== insumo.estoque_atual) {
                                  atualizarEstoque(insumo.id, valor);
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground">{insumo.unidade_medida}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {insumosFiltrados.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {filtroCategoria === 'todos' 
                    ? 'Nenhum insumo cadastrado'
                    : `Nenhum insumo na categoria "${filtroCategoria}"`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
