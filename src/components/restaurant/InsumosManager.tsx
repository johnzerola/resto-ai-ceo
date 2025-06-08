
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Insumo {
  id: string;
  codigo: number | null;
  nome: string;
  preco_pago: number;
  volume_embalagem: number;
  unidade_medida: string;
  preco_unitario: number;
  created_at: string;
  updated_at: string;
}

interface InsumoForm {
  codigo: number | null;
  nome: string;
  preco_pago: number;
  volume_embalagem: number;
  unidade_medida: string;
}

export function InsumosManager() {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InsumoForm>({
    codigo: null,
    nome: '',
    preco_pago: 0,
    volume_embalagem: 0,
    unidade_medida: 'kg'
  });

  const unidadesMedida = [
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'g', label: 'Grama (g)' },
    { value: 'lt', label: 'Litro (lt)' },
    { value: 'ml', label: 'Mililitro (ml)' },
    { value: 'unidade', label: 'Unidade' },
    { value: 'dz', label: 'Dúzia' },
    { value: 'm', label: 'Metro' },
    { value: 'cm', label: 'Centímetro' }
  ];

  useEffect(() => {
    carregarInsumos();
  }, [currentRestaurant]);

  useEffect(() => {
    filtrarInsumos();
  }, [insumos, searchTerm]);

  const carregarInsumos = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('nome');

      if (error) throw error;
      setInsumos(data || []);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar insumos');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarInsumos = () => {
    let filtered = insumos;

    if (searchTerm) {
      filtered = filtered.filter(insumo => 
        insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (insumo.codigo && insumo.codigo.toString().includes(searchTerm))
      );
    }

    setFilteredInsumos(filtered);
  };

  const resetForm = () => {
    setForm({
      codigo: null,
      nome: '',
      preco_pago: 0,
      volume_embalagem: 0,
      unidade_medida: 'kg'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const editarInsumo = (insumo: Insumo) => {
    setForm({
      codigo: insumo.codigo,
      nome: insumo.nome,
      preco_pago: insumo.preco_pago,
      volume_embalagem: insumo.volume_embalagem,
      unidade_medida: insumo.unidade_medida
    });
    setEditingId(insumo.id);
    setShowForm(true);
  };

  const salvarInsumo = async () => {
    if (!currentRestaurant?.id || !form.nome.trim()) {
      toast.error('Preencha o nome do insumo');
      return;
    }

    if (form.preco_pago <= 0 || form.volume_embalagem <= 0) {
      toast.error('Preço pago e volume da embalagem devem ser maiores que zero');
      return;
    }

    try {
      const dadosInsumo = {
        ...form,
        restaurant_id: currentRestaurant.id
      };

      if (editingId) {
        // Atualizar
        const { error } = await supabase
          .from('insumos')
          .update(dadosInsumo)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Insumo atualizado com sucesso!');
      } else {
        // Criar novo
        const { error } = await supabase
          .from('insumos')
          .insert(dadosInsumo);

        if (error) throw error;
        toast.success('Insumo cadastrado com sucesso!');
      }

      resetForm();
      carregarInsumos();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      toast.error('Erro ao salvar insumo');
    }
  };

  const excluirInsumo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return;

    try {
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Insumo excluído com sucesso!');
      carregarInsumos();
    } catch (error) {
      console.error('Erro ao excluir insumo:', error);
      toast.error('Erro ao excluir insumo');
    }
  };

  const calcularPrecoUnitario = (preco_pago: number, volume_embalagem: number) => {
    return volume_embalagem > 0 ? preco_pago / volume_embalagem : 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carregando insumos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestão de Insumos
            </CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Insumo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Badge variant="secondary">
              {filteredInsumos.length} insumo(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? 'Editar Insumo' : 'Novo Insumo'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codigo">Código (opcional)</Label>
                <Input
                  id="codigo"
                  type="number"
                  placeholder="Ex: 001"
                  value={form.codigo || ''}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="nome">Nome do Insumo *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Farinha de trigo"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="preco_pago">Preço Pago (R$) *</Label>
                <Input
                  id="preco_pago"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 25.50"
                  value={form.preco_pago}
                  onChange={(e) => setForm({ ...form, preco_pago: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="volume_embalagem">Volume da Embalagem *</Label>
                <Input
                  id="volume_embalagem"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="Ex: 1.000"
                  value={form.volume_embalagem}
                  onChange={(e) => setForm({ ...form, volume_embalagem: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                <Select value={form.unidade_medida} onValueChange={(value) => setForm({ ...form, unidade_medida: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidade) => (
                      <SelectItem key={unidade.value} value={unidade.value}>
                        {unidade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {form.preco_pago > 0 && form.volume_embalagem > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Preço Unitário Calculado:</strong> R$ {calcularPrecoUnitario(form.preco_pago, form.volume_embalagem).toFixed(3)} por {form.unidade_medida}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <Button onClick={salvarInsumo}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Insumos */}
      <div className="grid gap-4">
        {filteredInsumos.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum insumo encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar o filtro de busca'
                    : 'Comece cadastrando seu primeiro insumo'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInsumos.map((insumo) => (
            <Card key={insumo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{insumo.nome}</h3>
                      {insumo.codigo && (
                        <Badge variant="outline">#{insumo.codigo}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Preço Pago:</span>
                        <p className="font-medium">R$ {insumo.preco_pago.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <p className="font-medium">{insumo.volume_embalagem} {insumo.unidade_medida}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço Unitário:</span>
                        <p className="font-medium text-blue-600">R$ {insumo.preco_unitario.toFixed(3)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unidade:</span>
                        <p className="font-medium">{insumo.unidade_medida}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Cadastrado em: {new Date(insumo.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => editarInsumo(insumo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => excluirInsumo(insumo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      {filteredInsumos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{filteredInsumos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Insumos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {filteredInsumos.reduce((total, insumo) => total + insumo.preco_pago, 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total Investido</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {(filteredInsumos.reduce((total, insumo) => total + insumo.preco_unitario, 0) / filteredInsumos.length).toFixed(3)}
                </p>
                <p className="text-sm text-muted-foreground">Preço Unitário Médio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(filteredInsumos.map(i => i.unidade_medida))].length}
                </p>
                <p className="text-sm text-muted-foreground">Tipos de Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
