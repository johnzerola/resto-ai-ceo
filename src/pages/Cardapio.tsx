
import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSVImportDialog } from '@/components/cardapio/CSVImportDialog';
import { EnhancedBreakEvenDashboard } from '@/components/restaurant/EnhancedBreakEvenDashboard';
import { CascadePriceUpdater } from '@/components/restaurant/CascadePriceUpdater';
import { AIBusinessAssistant } from '@/components/restaurant/AIBusinessAssistant';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calculator,
  DollarSign,
  Utensils,
  Upload,
  Download,
  Package2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces expandidas para sistema completo
interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  preco_pago: number;
  volume_embalagem: number;
  preco_unitario: number;
  unidade_medida: string;
  fornecedor: string;
  data_atualizacao: string;
}

interface IngredienteFicha {
  id: string;
  insumo_id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  custo_total: number;
}

interface FichaTecnica {
  id: string;
  nome_prato: string;
  categoria: string;
  rendimento: number;
  ingredientes: IngredienteFicha[];
  custo_total_ingredientes: number;
  custo_embalagem: number;
  custo_perdas: number;
  custo_final: number;
  preco_sugerido: number;
  preco_praticado: number;
  margem_bruta: number;
  margem_liquida: number;
  status_viabilidade: 'saudavel' | 'atencao' | 'prejuizo';
  observacoes?: string;
}

interface ConfiguracaoRestaurante {
  markup_padrao: number;
  margem_lucro_esperada: number;
  taxa_impostos: number;
  despesas_fixas_mensais: number;
  despesas_variaveis_mensais: number;
  perda_media_percentual: number;
}

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
  
  // Estados existentes
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: 'entrada',
    price: 0,
    cost: 0,
    margin: 0,
    ingredients: [],
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Estados para sistema completo
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoRestaurante>({
    markup_padrao: 250,
    margem_lucro_esperada: 30,
    taxa_impostos: 12,
    despesas_fixas_mensais: 5000,
    despesas_variaveis_mensais: 15,
    perda_media_percentual: 5
  });
  const [novoInsumo, setNovoInsumo] = useState({
    nome: '',
    categoria: '',
    preco_pago: 0,
    volume_embalagem: 0,
    unidade_medida: '',
    fornecedor: ''
  });
  const [novaFicha, setNovaFicha] = useState<Partial<FichaTecnica>>({
    nome_prato: '',
    categoria: 'entrada',
    rendimento: 1,
    ingredientes: [],
    observacoes: ''
  });
  const [alertas, setAlertas] = useState<string[]>([]);
  const [showInsumoForm, setShowInsumoForm] = useState(false);
  const [showFichaForm, setShowFichaForm] = useState(false);

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'entrada', label: 'Entradas' },
    { value: 'prato-principal', label: 'Pratos Principais' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'lanche', label: 'Lanches' }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDados();
    } else {
      // Fallback para dados locais se não estiver conectado
      carregarDadosLocais();
    }
  }, [currentRestaurant]);

  const carregarDados = async () => {
    try {
      await Promise.all([
        carregarInsumos(),
        carregarFichasTecnicas(),
        carregarConfiguracoes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      carregarDadosLocais();
    }
  };

  const carregarDadosLocais = () => {
    const savedMenuItems = localStorage.getItem('menuItems');
    const savedInsumos = localStorage.getItem('insumos');
    const savedFichas = localStorage.getItem('fichasTecnicas');
    
    if (savedMenuItems) {
      try {
        setMenuItems(JSON.parse(savedMenuItems));
      } catch (error) {
        console.error('Erro ao carregar menu items:', error);
      }
    }

    if (savedInsumos) {
      try {
        setInsumos(JSON.parse(savedInsumos));
      } catch (error) {
        console.error('Erro ao carregar insumos:', error);
      }
    }

    if (savedFichas) {
      try {
        setFichasTecnicas(JSON.parse(savedFichas));
      } catch (error) {
        console.error('Erro ao carregar fichas técnicas:', error);
      }
    }
  };

  const carregarInsumos = async () => {
    if (!currentRestaurant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (error) throw error;
      
      const insumosFormatados = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        preco_pago: item.preco_pago,
        volume_embalagem: item.volume_embalagem,
        preco_unitario: item.preco_unitario,
        unidade_medida: item.unidade_medida,
        fornecedor: item.fornecedor || 'Não informado',
        data_atualizacao: item.updated_at || new Date().toISOString()
      })) || [];

      setInsumos(insumosFormatados);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
    }
  };

  const carregarFichasTecnicas = async () => {
    if (!currentRestaurant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('pratos')
        .select(`
          *,
          ingredientes_por_prato (
            *,
            insumos (nome, unidade_medida, preco_unitario)
          )
        `)
        .eq('restaurant_id', currentRestaurant.id);

      if (error) throw error;
      
      const fichasFormatadas = data?.map(prato => ({
        id: prato.id,
        nome_prato: prato.nome_prato,
        categoria: prato.categoria || 'entrada',
        rendimento: prato.rendimento_porcoes || 1,
        ingredientes: prato.ingredientes_por_prato?.map((ing: any) => ({
          id: ing.id,
          insumo_id: ing.insumo_id,
          nome: ing.insumos?.nome || 'Ingrediente',
          quantidade: ing.quantidade_liquida || 0,
          unidade: ing.insumos?.unidade_medida || 'g',
          preco_unitario: ing.insumos?.preco_unitario || 0,
          custo_total: ing.custo_total || 0
        })) || [],
        custo_total_ingredientes: prato.custo_total || 0,
        custo_embalagem: prato.custo_embalagem || 0,
        custo_perdas: prato.custo_perdas || 0,
        custo_final: prato.custo_total || 0,
        preco_sugerido: prato.preco_sugerido || 0,
        preco_praticado: prato.preco_praticado || 0,
        margem_bruta: prato.margem_percentual || 0,
        margem_liquida: prato.margem_percentual || 0,
        status_viabilidade: (prato.status_viabilidade as any) || 'saudavel',
        observacoes: prato.observacoes || ''
      })) || [];

      setFichasTecnicas(fichasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar fichas técnicas:', error);
    }
  };

  const carregarConfiguracoes = async () => {
    if (!currentRestaurant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguracao({
          markup_padrao: data.markup_padrao || 250,
          margem_lucro_esperada: data.margem_lucro_esperada || 30,
          taxa_impostos: data.taxa_impostos || 12,
          despesas_fixas_mensais: data.despesas_fixas_mensais || 5000,
          despesas_variaveis_mensais: data.despesas_variaveis_mensais || 15,
          perda_media_percentual: data.perda_media_percentual || 5
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Funções para gerenciar insumos
  const adicionarInsumo = async () => {
    if (!novoInsumo.nome || !novoInsumo.preco_pago || !novoInsumo.volume_embalagem || !novoInsumo.unidade_medida) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const preco_unitario = novoInsumo.preco_pago / novoInsumo.volume_embalagem;
    
    const insumo: Insumo = {
      id: Date.now().toString(),
      nome: novoInsumo.nome,
      categoria: novoInsumo.categoria || 'Geral',
      preco_pago: novoInsumo.preco_pago,
      volume_embalagem: novoInsumo.volume_embalagem,
      preco_unitario,
      unidade_medida: novoInsumo.unidade_medida,
      fornecedor: novoInsumo.fornecedor || 'Não informado',
      data_atualizacao: new Date().toISOString()
    };

    try {
      if (currentRestaurant?.id) {
        const { error } = await supabase
          .from('insumos')
          .insert({
            nome: insumo.nome,
            categoria: insumo.categoria,
            preco_pago: insumo.preco_pago,
            volume_embalagem: insumo.volume_embalagem,
            preco_unitario: insumo.preco_unitario,
            unidade_medida: insumo.unidade_medida,
            fornecedor: insumo.fornecedor,
            restaurant_id: currentRestaurant.id
          });

        if (error) throw error;
      }

      setInsumos(prev => [...prev, insumo]);
      
      // Salvar também localmente
      const novosInsumos = [...insumos, insumo];
      localStorage.setItem('insumos', JSON.stringify(novosInsumos));
      
      setNovoInsumo({
        nome: '',
        categoria: '',
        preco_pago: 0,
        volume_embalagem: 0,
        unidade_medida: '',
        fornecedor: ''
      });
      
      setShowInsumoForm(false);
      toast.success('Insumo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar insumo:', error);
      toast.error('Erro ao adicionar insumo');
    }
  };

  // Função para calcular ficha técnica
  const calcularFichaTecnica = (ficha: Partial<FichaTecnica>) => {
    if (!ficha.ingredientes || ficha.ingredientes.length === 0) return null;

    const custo_total_ingredientes = ficha.ingredientes.reduce((total, ing) => total + ing.custo_total, 0);
    const custo_embalagem = custo_total_ingredientes * 0.05; // 5% do custo
    const custo_perdas = custo_total_ingredientes * (configuracao.perda_media_percentual / 100);
    const custo_final = custo_total_ingredientes + custo_embalagem + custo_perdas;
    
    const preco_sugerido = custo_final * (configuracao.markup_padrao / 100);
    const margem_bruta = preco_sugerido > 0 ? ((preco_sugerido - custo_final) / preco_sugerido) * 100 : 0;
    const impostos = preco_sugerido * (configuracao.taxa_impostos / 100);
    const lucro_liquido = (preco_sugerido - custo_final) - impostos;
    const margem_liquida = preco_sugerido > 0 ? (lucro_liquido / preco_sugerido) * 100 : 0;
    
    let status_viabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
    if (margem_liquida < 0) {
      status_viabilidade = 'prejuizo';
    } else if (margem_liquida < configuracao.margem_lucro_esperada) {
      status_viabilidade = 'atencao';
    }

    return {
      custo_total_ingredientes,
      custo_embalagem,
      custo_perdas,
      custo_final,
      preco_sugerido,
      margem_bruta,
      margem_liquida,
      status_viabilidade
    };
  };

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatePrice = async () => {
    if (!newItem.cost || newItem.cost <= 0) {
      toast.error('Informe o custo do item para calcular o preço');
      return;
    }

    setIsCalculating(true);
    
    // Simular cálculo inteligente de preço
    setTimeout(() => {
      const targetMargin = 60; // Margem desejada de 60%
      const suggestedPrice = newItem.cost! / (1 - targetMargin / 100);
      const calculatedMargin = ((suggestedPrice - newItem.cost!) / suggestedPrice) * 100;

      setNewItem(prev => ({
        ...prev,
        price: Math.round(suggestedPrice * 100) / 100,
        margin: Math.round(calculatedMargin * 100) / 100
      }));

      toast.success('Preço calculado com base na margem de 60%');
      setIsCalculating(false);
    }, 1500);
  };

  const addMenuItem = () => {
    if (!newItem.name || !newItem.price || !newItem.cost) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description || '',
      category: newItem.category || 'entrada',
      price: newItem.price,
      cost: newItem.cost,
      margin: ((newItem.price - newItem.cost) / newItem.price) * 100,
      ingredients: newItem.ingredients || [],
      isActive: true
    };

    setMenuItems(prev => [...prev, item]);
    setNewItem({
      name: '',
      description: '',
      category: 'entrada',
      price: 0,
      cost: 0,
      margin: 0,
      ingredients: [],
      isActive: true
    });

    toast.success('Item adicionado ao cardápio!');
  };

  const removeMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removido do cardápio!');
  };

  const editMenuItem = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      setNewItem(item);
      toast.info('Item carregado para edição');
    }
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

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-yellow-600';
    return 'text-red-600';
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
            <Button variant="outline" onClick={() => setShowCSVImport(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="cardapio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
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
              Fichas Técnicas
            </TabsTrigger>
            <TabsTrigger value="precificacao" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precificação
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

          {/* Aba Cardápio - existente */}
          <TabsContent value="cardapio" className="space-y-6">
            {/* Conteúdo existente do cardápio */}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Insumos - Base de Dados */}
          <TabsContent value="insumos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package2 className="h-5 w-5" />
                    Base de Dados de Insumos
                  </span>
                  <Button onClick={() => setShowInsumoForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Insumo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço Pago</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Preço/Unidade</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insumos.map((insumo) => (
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
                        <TableCell>{insumo.fornecedor}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Análises Financeiras */}
          <TabsContent value="analises" className="space-y-6">
            <EnhancedBreakEvenDashboard />
            <AIBusinessAssistant />
          </TabsContent>

          {/* Aba Cascata de Preços */}
          <TabsContent value="cascata" className="space-y-6">
            <CascadePriceUpdater />
          </TabsContent>

          <TabsContent value="precificacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculadora de Preços Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemName">Nome do Item *</Label>
                    <Input
                      id="itemName"
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Hambúrguer Artesanal"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      value={newItem.category || 'entrada'}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o item do cardápio..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cost">Custo Total (R$) *</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newItem.cost || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Preço de Venda (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.price || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label>Margem Calculada</Label>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <span className={`text-lg font-bold ${getMarginColor(newItem.margin || 0)}`}>
                        {newItem.price && newItem.cost 
                          ? (((newItem.price - newItem.cost) / newItem.price) * 100).toFixed(1)
                          : '0.0'
                        }%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={calculatePrice} 
                    disabled={isCalculating || !newItem.cost}
                    className="flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    {isCalculating ? 'Calculando...' : 'Calcular Preço'}
                  </Button>

                  <Button onClick={addMenuItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ao Cardápio
                  </Button>
                </div>

                {/* Dicas de Precificação */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Precificação</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Margem ideal para restaurantes: 60-70%</li>
                    <li>• Considere custos fixos (aluguel, funcionários, energia)</li>
                    <li>• Analise preços da concorrência</li>
                    <li>• Teste diferentes preços e monitore as vendas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
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
