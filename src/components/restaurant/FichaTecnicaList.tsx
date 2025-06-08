
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Prato {
  id: string;
  nome_prato: string;
  categoria: string | null;
  rendimento_porcoes: number | null;
  custo_total: number | null;
  custo_por_porcao: number | null;
  preco_sugerido: number | null;
  preco_praticado: number | null;
  lucro_estimado: number | null;
  margem_percentual: number | null;
  status_viabilidade: 'prejuizo' | 'margem_baixa' | 'saudavel' | null;
  created_at: string;
  updated_at: string;
}

export function FichaTecnicaList() {
  const { currentRestaurant } = useAuth();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [filteredPratos, setFilteredPratos] = useState<Prato[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarPratos();
  }, [currentRestaurant]);

  useEffect(() => {
    filtrarPratos();
  }, [pratos, searchTerm, filterStatus]);

  const carregarPratos = async () => {
    if (!currentRestaurant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que os dados estão no formato correto
      const pratosFormatados = (data || []).map(prato => ({
        ...prato,
        categoria: prato.categoria || '',
        rendimento_porcoes: prato.rendimento_porcoes || 0,
        custo_total: prato.custo_total || 0,
        custo_por_porcao: prato.custo_por_porcao || 0,
        preco_sugerido: prato.preco_sugerido || 0,
        preco_praticado: prato.preco_praticado || 0,
        lucro_estimado: prato.lucro_estimado || 0,
        margem_percentual: prato.margem_percentual || 0,
        status_viabilidade: prato.status_viabilidade as 'prejuizo' | 'margem_baixa' | 'saudavel' | null
      }));
      
      setPratos(pratosFormatados);
    } catch (error) {
      console.error('Erro ao carregar pratos:', error);
      toast.error('Erro ao carregar fichas técnicas');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarPratos = () => {
    let filtered = pratos;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(prato => 
        prato.nome_prato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prato.categoria && prato.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(prato => prato.status_viabilidade === filterStatus);
    }

    setFilteredPratos(filtered);
  };

  const deletarPrato = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha técnica?')) return;

    try {
      const { error } = await supabase
        .from('pratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ficha técnica excluída com sucesso!');
      carregarPratos();
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      toast.error('Erro ao excluir ficha técnica');
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'prejuizo':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'margem_baixa':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'saudavel':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'prejuizo':
        return 'Prejuízo';
      case 'margem_baixa':
        return 'Margem Baixa';
      case 'saudavel':
        return 'Saudável';
      default:
        return 'Não calculado';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'prejuizo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'margem_baixa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'saudavel':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportarPDF = async (prato: Prato) => {
    // Implementar exportação PDF futuramente
    toast.info('Exportação PDF será implementada em breve');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carregando fichas técnicas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fichas Técnicas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do prato ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('todos')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'saudavel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('saudavel')}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Saudáveis
              </Button>
              <Button
                variant={filterStatus === 'margem_baixa' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('margem_baixa')}
                className="text-yellow-600"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Margem Baixa
              </Button>
              <Button
                variant={filterStatus === 'prejuizo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('prejuizo')}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Prejuízo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pratos */}
      <div className="grid gap-4">
        {filteredPratos.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma ficha técnica encontrada</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterStatus !== 'todos' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira ficha técnica'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPratos.map((prato) => (
            <Card key={prato.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{prato.nome_prato}</h3>
                      <Badge variant="outline" className={getStatusColor(prato.status_viabilidade)}>
                        {getStatusIcon(prato.status_viabilidade)}
                        <span className="ml-1">{getStatusText(prato.status_viabilidade)}</span>
                      </Badge>
                      {prato.categoria && (
                        <Badge variant="secondary">{prato.categoria}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Custo/Porção:</span>
                        <p className="font-medium">R$ {(prato.custo_por_porcao || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço Sugerido:</span>
                        <p className="font-medium text-blue-600">R$ {(prato.preco_sugerido || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lucro:</span>
                        <p className={`font-medium ${(prato.lucro_estimado || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {(prato.lucro_estimado || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margem:</span>
                        <p className={`font-medium ${(prato.margem_percentual || 0) >= 20 ? 'text-green-600' : (prato.margem_percentual || 0) >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {(prato.margem_percentual || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Criado em: {new Date(prato.created_at).toLocaleDateString('pt-BR')}
                      {prato.rendimento_porcoes && (
                        <span className="ml-4">Rendimento: {prato.rendimento_porcoes} porção(ões)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => exportarPDF(prato)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deletarPrato(prato.id)}
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

      {/* Estatísticas Rápidas */}
      {filteredPratos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{filteredPratos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Pratos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredPratos.filter(p => p.status_viabilidade === 'saudavel').length}
                </p>
                <p className="text-sm text-muted-foreground">Saudáveis</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredPratos.filter(p => p.status_viabilidade === 'margem_baixa').length}
                </p>
                <p className="text-sm text-muted-foreground">Margem Baixa</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {filteredPratos.filter(p => p.status_viabilidade === 'prejuizo').length}
                </p>
                <p className="text-sm text-muted-foreground">Prejuízo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
