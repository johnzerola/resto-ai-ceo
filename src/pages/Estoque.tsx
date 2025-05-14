
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { InventoryOverview } from "@/components/restaurant/InventoryOverview";
import { InventoryForm } from "@/components/restaurant/InventoryForm";
import { ShoppingList } from "@/components/restaurant/ShoppingList";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, FileUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Estoque = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie seu inventário e monitore níveis de estoque
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

      {isAddingItem ? (
        <InventoryForm 
          itemId={selectedItemId} 
          onCancel={toggleAddItem} 
          onSuccess={() => {
            setIsAddingItem(false);
            setSelectedItemId(null);
          }}
        />
      ) : (
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="shopping">Lista de Compras</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryOverview onEdit={editItem} />
          </TabsContent>
          
          <TabsContent value="shopping">
            <ShoppingList />
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
};

export default Estoque;
