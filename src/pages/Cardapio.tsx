
import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImportDialog } from '@/components/cardapio/CSVImportDialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calculator,
  DollarSign,
  Utensils,
  Upload,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

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

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'entrada', label: 'Entradas' },
    { value: 'prato-principal', label: 'Pratos Principais' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'lanche', label: 'Lanches' }
  ];

  // Carregar dados do localStorage quando o componente for montado
  useEffect(() => {
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
      try {
        const parsedItems = JSON.parse(savedMenuItems);
        setMenuItems(parsedItems);
      } catch (error) {
        console.error('Erro ao carregar itens do cardápio:', error);
        setMenuItems([]);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que menuItems for alterado
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cardapio" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger value="precificacao" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Precificação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cardapio" className="space-y-6">
            {/* Filtros */}
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
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Nenhum item encontrado no cardápio</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione itens usando a aba "Precificação" ou importe um arquivo CSV
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Preço de Venda:</span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Custo:</span>
                          <span className="text-sm">
                            R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Margem:</span>
                          <span className={`text-sm font-bold ${getMarginColor(item.margin)}`}>
                            {item.margin.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => editMenuItem(item.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => removeMenuItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
