import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Package, Plus, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Setor {
  id: string;
  nome: string;
  responsavel?: string;
  cor: string;
  produtos_count: number;
}

interface InsumoSetor {
  id: string;
  nome: string;
  categoria: string;
  estoque_atual: number;
  unidade_medida: string;
  setor?: string;
}

export function StockSectorManager() {
  const { currentRestaurant } = useAuth();
  const [setores, setSetores] = useState<Setor[]>([]);
  const [insumos, setInsumos] = useState<InsumoSetor[]>([]);
  const [selectedSetor, setSelectedSetor] = useState<string>("");
  const [novoSetor, setNovoSetor] = useState({ nome: "", responsavel: "", cor: "#3b82f6" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      // Carregar insumos
      const { data: insumosData, error: insumosError } = await supabase
        .from('insumos')
        .select('id, nome, categoria, estoque_atual, unidade_medida')
        .eq('restaurant_id', currentRestaurant?.id);

      if (insumosError) throw insumosError;

      setInsumos(insumosData || []);

      // Extrair setores únicos baseado em categoria (temporário)
      const setoresUnicos = [...new Set(insumosData?.map(i => i.categoria).filter(Boolean) || [])];
      const setoresData: Setor[] = setoresUnicos.map((nomeSetor, index) => {
        const produtosCount = insumosData?.filter(i => i.categoria === nomeSetor).length || 0;
        return {
          id: `setor-${index}`,
          nome: nomeSetor,
          responsavel: '',
          cor: `hsl(${(index * 360) / setoresUnicos.length}, 70%, 50%)`,
          produtos_count: produtosCount
        };
      });

      // Adicionar setor "Sem Setor" para produtos não categorizados
      const produtosSemSetor = insumosData?.filter(i => !i.categoria).length || 0;
      if (produtosSemSetor > 0) {
        setoresData.push({
          id: 'sem-setor',
          nome: 'Sem Setor',
          responsavel: '',
          cor: '#6b7280',
          produtos_count: produtosSemSetor
        });
      }

      setSetores(setoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados dos setores');
    } finally {
      setIsLoading(false);
    }
  };

  const createSetor = async () => {
    if (!novoSetor.nome.trim()) {
      toast.error('Nome do setor é obrigatório');
      return;
    }

    try {
      // Como não temos tabela específica para setores, vamos apenas adicionar à lista local
      const novoId = `setor-${Date.now()}`;
      const novoSetorObj: Setor = {
        id: novoId,
        nome: novoSetor.nome,
        responsavel: novoSetor.responsavel,
        cor: novoSetor.cor,
        produtos_count: 0
      };

      setSetores(prev => [...prev, novoSetorObj]);
      setNovoSetor({ nome: "", responsavel: "", cor: "#3b82f6" });
      setIsDialogOpen(false);
      toast.success('Setor criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      toast.error('Erro ao criar setor');
    }
  };

  const assignProductToSetor = async (insumoId: string, setorNome: string) => {
    try {
      // Temporariamente usar categoria como setor
      const { error } = await supabase
        .from('insumos')
        .update({ categoria: setorNome === 'Sem Setor' ? 'Geral' : setorNome })
        .eq('id', insumoId);

      if (error) throw error;

      toast.success('Produto movido para o setor com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao mover produto:', error);
      toast.error('Erro ao mover produto para o setor');
    }
  };

  const getInsumosDoSetor = (setorNome: string) => {
    if (setorNome === 'Sem Setor') {
      return insumos.filter(i => !i.categoria);
    }
    return insumos.filter(i => i.categoria === setorNome);
  };

  const getTotalEstoqueSetor = (setorNome: string) => {
    const insumosSetor = getInsumosDoSetor(setorNome);
    return insumosSetor.reduce((total, insumo) => total + insumo.estoque_atual, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Gestão por Setores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
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
          <Building className="h-5 w-5 text-blue-600" />
          Gestão de Estoque por Setores
        </CardTitle>
        <CardDescription>
          Organize produtos por setores e responsáveis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Header com Botão de Criar Setor */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {setores.length} setor(es) • {insumos.length} produto(s)
            </span>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Setor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Setor</DialogTitle>
                <DialogDescription>
                  Organize seus produtos por setores para melhor controle
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Setor:</label>
                  <Input
                    placeholder="Ex: Cozinha, Bar, Estoque Geral..."
                    value={novoSetor.nome}
                    onChange={(e) => setNovoSetor(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável (opcional):</label>
                  <Input
                    placeholder="Nome do responsável pelo setor"
                    value={novoSetor.responsavel}
                    onChange={(e) => setNovoSetor(prev => ({ ...prev, responsavel: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor:</label>
                  <input
                    type="color"
                    className="w-16 h-8 rounded border cursor-pointer"
                    value={novoSetor.cor}
                    onChange={(e) => setNovoSetor(prev => ({ ...prev, cor: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createSetor} disabled={!novoSetor.nome.trim()}>
                    Criar Setor
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="management">Gerenciar Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Cards dos Setores */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {setores.map((setor) => (
                <Card key={setor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: setor.cor }}
                        />
                        <CardTitle className="text-lg">{setor.nome}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {setor.produtos_count} produto(s)
                      </Badge>
                    </div>
                    {setor.responsavel && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {setor.responsavel}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total em Estoque:</span>
                        <span className="font-bold">{getTotalEstoqueSetor(setor.nome)} unidades</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedSetor(setor.nome)}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Ver Produtos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lista de Produtos do Setor Selecionado */}
            {selectedSetor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Produtos do Setor: {selectedSetor}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getInsumosDoSetor(selectedSetor).map((insumo) => (
                      <div key={insumo.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{insumo.nome}</p>
                          <p className="text-sm text-muted-foreground">{insumo.categoria}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{insumo.estoque_atual} {insumo.unidade_medida}</p>
                        </div>
                      </div>
                    ))}
                    {getInsumosDoSetor(selectedSetor).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum produto neste setor
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setSelectedSetor("")}
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            {/* Lista de Produtos para Remanejamento */}
            <div className="space-y-3">
              <h4 className="font-medium">Mover Produtos entre Setores</h4>
              {insumos.map((insumo) => (
                <div key={insumo.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{insumo.nome}</p>
                     <p className="text-sm text-muted-foreground">
                       Setor atual: {insumo.categoria || 'Sem setor'}
                     </p>
                   </div>
                   <div className="flex items-center gap-2">
                     <select
                       className="text-sm border rounded px-2 py-1"
                       value={insumo.categoria || 'Sem Setor'}
                      onChange={(e) => assignProductToSetor(insumo.id, e.target.value)}
                    >
                      <option value="Sem Setor">Sem Setor</option>
                      {setores.filter(s => s.nome !== 'Sem Setor').map(setor => (
                        <option key={setor.id} value={setor.nome}>
                          {setor.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {insumos.length === 0 && (
                <div className="text-center py-10">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum produto cadastrado
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}