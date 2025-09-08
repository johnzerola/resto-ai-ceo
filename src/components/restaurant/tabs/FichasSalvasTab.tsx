import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  Percent,
  TrendingUp
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FichaSalva {
  id: string;
  nome_prato: string;
  categoria: string;
  custo_total: number;
  preco_sugerido: number;
  margem_percentual: number;
  status_viabilidade: string;
  created_at: string;
  canal_venda: string;
}

export function FichasSalvasTab() {
  const { currentRestaurant } = useAuth();
  const [fichas, setFichas] = useState<FichaSalva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaNome, setBuscaNome] = useState('');

  // Carregar fichas salvas
  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarFichas();
    }
  }, [currentRestaurant]);

  const carregarFichas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pratos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFichas(data || []);
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
      toast.error('Erro ao carregar fichas técnicas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fichas
  const fichasFiltradas = fichas.filter(ficha => {
    const matchNome = ficha.nome_prato.toLowerCase().includes(buscaNome.toLowerCase());
    const matchCategoria = !filtroCategoria || ficha.categoria === filtroCategoria;
    return matchNome && matchCategoria;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'bg-green-100 text-green-800';
      case 'atencao': return 'bg-yellow-100 text-yellow-800';
      case 'prejuizo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'saudavel': return '✅ Lucrativo';
      case 'atencao': return '⚠️ Atenção';
      case 'prejuizo': return '🚨 Prejuízo';
      default: return '📊 Analisando';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando fichas técnicas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Fichas Técnicas Salvas
          </h3>
          <p className="text-sm text-gray-600">
            {fichas.length} ficha(s) técnica(s) criada(s)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do prato..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                <SelectItem value="entrada">🥗 Entrada</SelectItem>
                <SelectItem value="prato_principal">🍽️ Prato Principal</SelectItem>
                <SelectItem value="sobremesa">🍰 Sobremesa</SelectItem>
                <SelectItem value="bebida">🥤 Bebida</SelectItem>
                <SelectItem value="lanche">🍔 Lanche</SelectItem>
                <SelectItem value="acompanhamento">🍟 Acompanhamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fichas */}
      {fichasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {fichas.length === 0 ? 'Nenhuma ficha técnica encontrada' : 'Nenhum resultado encontrado'}
            </h4>
            <p className="text-gray-600 mb-4">
              {fichas.length === 0 
                ? 'Crie sua primeira ficha técnica na aba "Nova Ficha"'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fichasFiltradas.map((ficha) => (
            <Card key={ficha.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base line-clamp-2">
                      {ficha.nome_prato}
                    </CardTitle>
                    <p className="text-sm text-gray-600 capitalize">
                      {ficha.categoria?.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(ficha.status_viabilidade)}>
                    {getStatusText(ficha.status_viabilidade)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-3 w-3 text-red-600" />
                      <span className="text-red-800 font-medium">Custo</span>
                    </div>
                    <div className="font-bold text-red-900">
                      R$ {ficha.custo_total.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-800 font-medium">Preço</span>
                    </div>
                    <div className="font-bold text-green-900">
                      R$ {ficha.preco_sugerido.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center p-2 bg-blue-50 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Percent className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-800 font-medium">Margem</span>
                    </div>
                    <div className={`font-bold ${
                      ficha.margem_percentual > 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {ficha.margem_percentual.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado em {formatarData(ficha.created_at)}
                </div>

                {/* Canal de venda */}
                {ficha.canal_venda && (
                  <Badge variant="outline" className="text-xs">
                    {ficha.canal_venda === 'balcao' ? '🍽️ Balcão' :
                     ficha.canal_venda === 'ifood' ? '🛵 iFood' : 
                     ficha.canal_venda === 'uber_eats' ? '🚗 Uber Eats' : ficha.canal_venda}
                  </Badge>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo Estatístico */}
      {fichas.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">
              📊 Resumo das Suas Fichas Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">
                  {fichas.length}
                </div>
                <div className="text-blue-700">Total de Fichas</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">
                  {fichas.filter(f => f.status_viabilidade === 'saudavel').length}
                </div>
                <div className="text-green-700">Pratos Lucrativos</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-900">
                  {fichas.filter(f => f.status_viabilidade === 'atencao').length}
                </div>
                <div className="text-yellow-700">Precisam Atenção</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-red-900">
                  {fichas.filter(f => f.status_viabilidade === 'prejuizo').length}
                </div>
                <div className="text-red-700">Com Prejuízo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}