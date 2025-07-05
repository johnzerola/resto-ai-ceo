
import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImportDialog } from '@/components/cardapio/CSVImportDialog';
import { EnhancedBreakEvenDashboard } from '@/components/restaurant/EnhancedBreakEvenDashboard';
import { CascadePriceUpdater } from '@/components/restaurant/CascadePriceUpdater';
import { AIBusinessAssistant } from '@/components/restaurant/AIBusinessAssistant';
import { InsumoManager } from '@/components/restaurant/InsumoManager';
import { FichaTecnicaManager } from '@/components/restaurant/FichaTecnicaManager';
import { PrecificacaoManager } from '@/components/restaurant/PrecificacaoManager';
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
  };

  const handleFichaUpdate = (novasFichas: any[]) => {
    setFichasTecnicas(novasFichas);
  };

  const handlePriceUpdate = (updates: any[]) => {
    // Atualizar fichas técnicas com novos preços
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

          {/* Aba Cardápio */}
          <TabsContent value="cardapio" className="space-y-6">
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
            
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em breve: Lista do Cardápio</h3>
              <p>Use as abas Insumos e Fichas Técnicas para criar seus produtos</p>
            </div>
          </TabsContent>

          {/* Aba Insumos */}
          <TabsContent value="insumos" className="space-y-6">
            <InsumoManager onInsumoUpdate={handleInsumoUpdate} />
          </TabsContent>

          {/* Aba Fichas Técnicas */}
          <TabsContent value="fichas" className="space-y-6">
            <FichaTecnicaManager 
              insumos={insumos} 
              onFichaUpdate={handleFichaUpdate}
            />
          </TabsContent>

          {/* Aba Precificação */}
          <TabsContent value="precificacao" className="space-y-6">
            <PrecificacaoManager 
              fichasTecnicas={fichasTecnicas}
              onPriceUpdate={handlePriceUpdate}
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
