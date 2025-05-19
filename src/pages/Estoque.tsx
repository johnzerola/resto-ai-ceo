
import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { InventoryOverview } from "@/components/restaurant/InventoryOverview";
import { InventoryForm } from "@/components/restaurant/InventoryForm";
import { ShoppingList } from "@/components/restaurant/ShoppingList";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, FileUp, Link, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { SyncIndicator } from "@/components/restaurant/SyncIndicator";
import { syncModules } from "@/services/SyncService";
import { PerformanceCharts } from "@/components/restaurant/PerformanceCharts";
import { GoalsManager } from "@/components/restaurant/GoalsManager";

const Estoque = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showCashflowAlert, setShowCashflowAlert] = useState(false);
  const navigate = useNavigate();

  // Verificar integração com fluxo de caixa
  useEffect(() => {
    const cashFlowData = localStorage.getItem("cashFlow");
    
    // Se não houver dados de fluxo de caixa ou forem muito poucos, mostrar alerta de integração
    if (!cashFlowData || JSON.parse(cashFlowData).length < 3) {
      setShowCashflowAlert(true);
    } else {
      setShowCashflowAlert(false);
    }
  }, []);

  // Toggle between inventory list and add/edit form
  const toggleAddItem = () => {
    setIsAddingItem(!isAddingItem);
    setSelectedItemId(null);
  };

  // Function to edit existing item
  const editItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsAddingItem(true);
  };
  
  // Função para ir para fluxo de caixa
  const goToCashFlow = () => {
    navigate('/fluxo-caixa');
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Gerencie seu inventário e monitore níveis de estoque
            <SyncIndicator />
          </p>
        </div>
        <div className="flex gap-2">
          {!isAddingItem && (
            <>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <FileUp className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button onClick={toggleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Button>
            </>
          )}
        </div>
      </div>

      {showCashflowAlert && (
        <Alert className="mb-6 border-amber-500 bg-amber-50">
          <AlertTitle className="text-amber-800">Integração com Fluxo de Caixa</AlertTitle>
          <AlertDescription className="text-amber-700">
            Registre suas compras de estoque no Fluxo de Caixa para melhorar o controle financeiro e análises de CMV.
            <Button variant="link" className="text-amber-800 p-0 h-auto font-semibold ml-1" onClick={goToCashFlow}>
              Ir para Fluxo de Caixa
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isAddingItem ? (
        <InventoryForm 
          itemId={selectedItemId} 
          onCancel={toggleAddItem} 
          onSuccess={() => {
            setIsAddingItem(false);
            setSelectedItemId(null);
            
            // Usar novo sistema de sincronização
            const inventoryData = localStorage.getItem("inventory");
            if (inventoryData) {
              syncModules(JSON.parse(inventoryData), "inventory");
            }
          }}
        />
      ) : (
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="shopping">Lista de Compras</TabsTrigger>
            <TabsTrigger value="analytics">Análise de Estoque</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Metas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryOverview onEdit={editItem} />
          </TabsContent>
          
          <TabsContent value="shopping">
            <ShoppingList />
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white p-6 rounded-md shadow-sm border">
              <h2 className="text-lg font-medium mb-4">Análise de Estoque</h2>
              <p className="text-muted-foreground mb-8">
                Visualize métricas de rotatividade, itens críticos e sugestões de otimização.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium">Itens com Maior Rotatividade</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span>Carne Bovina</span>
                      <span className="text-green-600">12.4 dias</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Camarão</span>
                      <span className="text-green-600">8.2 dias</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Queijo Mussarela</span>
                      <span className="text-green-600">10.5 dias</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium">Itens com Menor Rotatividade</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span>Azeite Trufado</span>
                      <span className="text-amber-600">45.7 dias</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Cogumelos Secos</span>
                      <span className="text-amber-600">38.3 dias</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Vinho para Redução</span>
                      <span className="text-amber-600">32.1 dias</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium">Economia Potencial</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span>Desconto por Volume</span>
                      <span className="text-green-600">R$ 1.240,00</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Otimização de Pedidos</span>
                      <span className="text-green-600">R$ 850,00</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Redução de Desperdício</span>
                      <span className="text-green-600">R$ 620,00</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Link className="mr-2 h-4 w-4" />
                  Integrar com Fornecedores
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceCharts />
          </TabsContent>
          
          <TabsContent value="goals">
            <div className="bg-white p-6 rounded-md shadow-sm border">
              <GoalsManager />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
};

export default Estoque;
