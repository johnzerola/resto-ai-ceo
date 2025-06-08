
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Package,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Insumo {
  id: string;
  codigo: number;
  nome: string;
  preco_pago: number;
  volume_embalagem: number;
  unidade_medida: string;
  preco_unitario: number;
  created_at: string;
}

export function InsumosManager() {
  const { currentRestaurant } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    preco_pago: '',
    volume_embalagem: '',
    unidade_medida: 'kg'
  });

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
    if (!searchTerm) {
      setFilteredInsumos(insumos);
      return;
    }

    const filtered = insumos.filter(insumo => 
      insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.codigo.toString().includes(searchTerm)
    );
    setFilteredInsumos(filtered);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      preco_pago: '',
      volume_embalagem: '',
      unidade_medida: 'kg'
    });
    setEditingInsumo(null);
    setShowForm(false);
  };

  const editarInsumo = (insumo: Insumo) => {
    setFormData({
      codigo: insumo.codigo.toString(),
      nome: insumo.nome,
      preco_pago: insumo.preco_pago.toString(),
      volume_embalagem: insumo.volume_embalagem.toString(),
      unidade_medida: insumo.unidade_medida
    });
    setEditingInsumo(insumo);
    setShowForm(true);
  };

  const salvarInsumo = async () => {
    if (!currentRestaurant?.id) {
      toast.error('Nenhum restaurante selecionado');
      return;
    }

    if (!formData.nome.trim()) {
      toast.error('Nome do insumo é obrigatório');
      return;
    }

    if (!formData.preco_pago || parseFloat(formData.preco_pago) <= 0) {
      toast.error('Preço pago deve ser maior que zero');
      return;
    }

    if (!formData.volume_embalagem || parseFloat(formData.volume_embalagem) <= 0) {
      toast.error('Volume da embalagem deve ser maior que zero');
      return;
    }

    try {
      const dadosInsumo = {
        codigo: formData.codigo ? parseInt(formData.codigo) : null,
        nome: formData.nome.trim(),
        preco_pago: parseFloat(formData.preco_pago),
        volume_embalagem: parseFloat(formData.volume_embalagem),
        unidade_medida: formData.unidade_medida,
        restaurant_id: currentRestaurant.id
      };

      if (editingInsumo) {
        // Atualizar
        const { error } = await supabase
          .from('insumos')
          .update(dadosInsumo)
          .eq('id', editingInsumo.id);

        if (error) throw error;
        toast.success('Insumo atualizado com sucesso!');
      } else {
        // Inserir
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

  const deletarInsumo = async (id: string) => {
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
      {/* Header e Busca */}
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código (opcional)</Label>
                <Input
                  id="codigo"
                  type="number"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: 001"
                />
              </div>

              <div>
                <Label htmlFor="nome">Nome do Insumo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Farinha de Trigo"
                />
              </div>

              <div>
                <Label htmlFor="preco_pago">Preço Pago (R$) *</Label>
                <Input
                  id="preco_pago"
                  type="number"
                  step="0.01"
                  value={formData.preco_pago}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_pago: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="volume_embalagem">Volume da Embalagem *</Label>
                <Input
                  id="volume_embalagem"
                  type="number"
                  step="0.001"
                  value={formData.volume_embalagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume_embalagem: e.target.value }))}
                  placeholder="1.000"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                <Select 
                  value={formData.unidade_medida} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_medida: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="lt">Litro (lt)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="pct">Pacote</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={salvarInsumo}>
                {editingInsumo ? 'Atualizar' : 'Cadastrar'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Insumos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Nome</th>
                  <th className="p-4 font-medium">Preço Pago</th>
                  <th className="p-4 font-medium">Volume</th>
                  <th className="p-4 font-medium">Unidade</th>
                  <th className="p-4 font-medium">Preço Unitário</th>
                  <th className="p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInsumos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum insumo encontrado</p>
                      <p className="text-sm">
                        {searchTerm 
                          ? 'Tente ajustar o termo de busca'
                          : 'Comece cadastrando seu primeiro insumo'
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInsumos.map((insumo) => (
                    <tr key={insumo.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        {insumo.codigo && (
                          <span className="font-mono text-sm">{insumo.codigo.toString().padStart(3, '0')}</span>
                        )}
                      </td>
                      <td className="p-4 font-medium">{insumo.nome}</td>
                      <td className="p-4">R$ {insumo.preco_pago.toFixed(2)}</td>
                      <td className="p-4">{insumo.volume_embalagem}</td>
                      <td className="p-4">{insumo.unidade_medida}</td>
                      <td className="p-4">
                        <span className="font-medium text-green-600">
                          R$ {insumo.preco_unitario.toFixed(4)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editarInsumo(insumo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deletarInsumo(insumo.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {filteredInsumos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{filteredInsumos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Insumos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {filteredInsumos.reduce((total, insumo) => total + insumo.preco_pago, 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total Investido</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(filteredInsumos.reduce((total, insumo) => total + insumo.preco_unitario, 0) / filteredInsumos.length).toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">Preço Unitário Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
