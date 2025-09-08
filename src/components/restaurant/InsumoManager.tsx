import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Package2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  preco_pago: number;
  volume_embalagem: number;
  preco_unitario: number;
  unidade_medida: string;
  fornecedor: string;
  estoque_atual: number;
  estoque_minimo: number;
  data_atualizacao: string;
}

interface InsumoManagerProps {
  onInsumoUpdate?: (insumos: Insumo[]) => void;
  onCascadeEffect?: (insumoId: string, novoPreco: number) => void;
}

export function InsumoManager({ onInsumoUpdate, onCascadeEffect }: InsumoManagerProps) {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    preco_pago: 0,
    volume_embalagem: 0,
    unidade_medida: '',
    fornecedor: '',
    estoque_atual: 0,
    estoque_minimo: 0
  });

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadInsumos();
    }
  }, [currentRestaurant]);

  const loadInsumos = async () => {
    if (!currentRestaurant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (error) throw error;
      
      const formattedInsumos = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria || 'Geral',
        preco_pago: item.preco_pago,
        volume_embalagem: item.volume_embalagem,
        preco_unitario: item.preco_unitario || (item.preco_pago / item.volume_embalagem),
        unidade_medida: item.unidade_medida,
        fornecedor: item.fornecedor || 'Não informado',
        estoque_atual: item.estoque_atual || 0,
        estoque_minimo: item.estoque_minimo || 0,
        data_atualizacao: item.updated_at || new Date().toISOString()
      })) || [];

      setInsumos(formattedInsumos);
      onInsumoUpdate?.(formattedInsumos);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar insumos');
    }
  };

  const saveInsumo = async () => {
    // Validações básicas
    if (!formData.nome?.trim()) {
      toast.error('Nome do insumo é obrigatório');
      return;
    }

    if (!formData.preco_pago || formData.preco_pago <= 0) {
      toast.error('Preço pago deve ser maior que zero');
      return;
    }

    if (!formData.volume_embalagem || formData.volume_embalagem <= 0) {
      toast.error('Volume da embalagem deve ser maior que zero');
      return;
    }

    if (!formData.unidade_medida?.trim()) {
      toast.error('Unidade de medida é obrigatória');
      return;
    }

    if (!currentRestaurant?.id) {
      toast.error('Nenhum restaurante selecionado');
      return;
    }

    // Validação robusta dos valores principais
    const precoNumerico = Number(formData.preco_pago);
    const volumeNumerico = Number(formData.volume_embalagem);
    
    if (!precoNumerico || precoNumerico <= 0) {
      toast.error('Preço pago deve ser maior que zero');
      return;
    }
    
    if (!volumeNumerico || volumeNumerico <= 0) {
      toast.error('Volume da embalagem deve ser maior que zero');
      return;
    }
    
    // O preço unitário será calculado automaticamente pelo trigger do banco
    const precoAnterior = editingInsumo?.preco_unitario || 0;
    
    try {
      if (editingInsumo) {
        // Atualizar no banco - deixar o trigger calcular preco_unitario
        console.log('🔄 Atualizando insumo:', editingInsumo.id);
        
        const updateData = {
          nome: formData.nome.trim(),
          categoria: formData.categoria?.trim() || 'geral',
          preco_pago: precoNumerico,
          volume_embalagem: volumeNumerico,
          unidade_medida: formData.unidade_medida.trim(),
          fornecedor: formData.fornecedor?.trim() || 'Não informado',
          estoque_atual: Number(formData.estoque_atual) || 0,
          estoque_minimo: Number(formData.estoque_minimo) || 0,
          updated_at: new Date().toISOString()
        };

        console.log('🔄 Dados para atualização:', updateData);
        
        const { error } = await supabase
          .from('insumos')
          .update(updateData)
          .eq('id', editingInsumo.id);

        if (error) throw error;
        
        // Recarregar dados para pegar o preço unitário calculado
        await loadInsumos();
        
        // Buscar o preço unitário recalculado para efeito cascata
        const { data: insumoAtualizado } = await supabase
          .from('insumos')
          .select('preco_unitario')
          .eq('id', editingInsumo.id)
          .single();
        
        const novoPrecoUnitario = insumoAtualizado?.preco_unitario || 0;
        
        // Efeito cascata se preço mudou significativamente
        if (Math.abs(novoPrecoUnitario - precoAnterior) > 0.01) {
          onCascadeEffect?.(editingInsumo.id, novoPrecoUnitario);
          toast.success(`✅ Insumo "${formData.nome}" atualizado! Efeito cascata aplicado nos preços.`);
        } else {
          toast.success(`✅ Insumo "${formData.nome}" atualizado com sucesso!`);
        }
      } else {
        // Criar novo - deixar o trigger calcular preco_unitario automaticamente
        const insumoData = {
          nome: formData.nome.trim(),
          categoria: formData.categoria?.trim() || 'geral',
          preco_pago: precoNumerico,
          volume_embalagem: volumeNumerico,
          unidade_medida: formData.unidade_medida.trim(),
          fornecedor: formData.fornecedor?.trim() || 'Não informado',
          estoque_atual: Number(formData.estoque_atual) || 0,
          estoque_minimo: Number(formData.estoque_minimo) || 0,
          restaurant_id: currentRestaurant.id
        };

        console.log('💾 Criando novo insumo:', insumoData);

        const { error } = await supabase
          .from('insumos')
          .insert([insumoData]);

        if (error) {
          console.error('Erro ao criar insumo:', error);
          throw error;
        }
        
        const precoCalculado = precoNumerico / volumeNumerico;
        toast.success(`✅ Insumo "${formData.nome}" adicionado com sucesso!`, {
          description: `Preço unitário calculado: R$ ${precoCalculado.toFixed(4)}/${formData.unidade_medida}`
        });
      }

      resetForm();
      await loadInsumos();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      toast.error(`❌ Erro ao ${editingInsumo ? 'atualizar' : 'adicionar'} insumo`, {
        description: error.message || 'Verifique os dados e tente novamente'
      });
    }
  };

  const deleteInsumo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Insumo removido com sucesso!');
      loadInsumos();
    } catch (error) {
      console.error('Erro ao deletar insumo:', error);
      toast.error('Erro ao deletar insumo');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      preco_pago: 0,
      volume_embalagem: 0,
      unidade_medida: '',
      fornecedor: '',
      estoque_atual: 0,
      estoque_minimo: 0
    });
    setEditingInsumo(null);
    setShowForm(false);
  };

  const openEditForm = (insumo: Insumo) => {
    setFormData({
      nome: insumo.nome,
      categoria: insumo.categoria,
      preco_pago: insumo.preco_pago,
      volume_embalagem: insumo.volume_embalagem,
      unidade_medida: insumo.unidade_medida,
      fornecedor: insumo.fornecedor,
      estoque_atual: insumo.estoque_atual,
      estoque_minimo: insumo.estoque_minimo
    });
    setEditingInsumo(insumo);
    setShowForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Base de Dados de Insumos
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie ingredientes e matérias-primas
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do insumo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Insumo *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Tomate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="Ex: Verduras"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Preço Pago (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_pago || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_pago: Number(e.target.value) }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume da Embalagem *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.volume_embalagem || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume_embalagem: Number(e.target.value) }))}
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Unidade de Medida *</Label>
                  <Input
                    value={formData.unidade_medida}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidade_medida: e.target.value }))}
                    placeholder="kg, L, un"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    value={formData.fornecedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estoque Atual</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.estoque_atual || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estoque_atual: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.estoque_minimo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, estoque_minimo: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {formData.preco_pago > 0 && formData.volume_embalagem > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Preço por {formData.unidade_medida || 'unidade'}: {formatCurrency(formData.preco_pago / formData.volume_embalagem)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={saveInsumo} className="flex-1">
                  {editingInsumo ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar insumos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço Pago</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Preço/Unidade</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id}>
                  <TableCell className="font-medium">{insumo.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{insumo.categoria}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(insumo.preco_pago)}</TableCell>
                  <TableCell>{insumo.volume_embalagem} {insumo.unidade_medida}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(insumo.preco_unitario)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{insumo.estoque_atual} {insumo.unidade_medida}</div>
                      {insumo.estoque_atual <= insumo.estoque_minimo && (
                        <Badge variant="destructive" className="text-xs">
                          Baixo
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{insumo.fornecedor}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(insumo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteInsumo(insumo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInsumos.length === 0 && (
            <div className="text-center py-10">
              <Package2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum insumo encontrado' : 'Nenhum insumo cadastrado'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}