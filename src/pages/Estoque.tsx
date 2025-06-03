
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { InventoryOverview } from "@/components/restaurant/InventoryOverview";
import { InventoryForm } from "@/components/restaurant/InventoryForm";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  expiryDate?: string;
  minStock: number;
  location: string;
  lastUpdated: string;
}

const Estoque = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Inicia sempre vazio, sem dados pré-carregados
    const storedItems = localStorage.getItem("inventoryItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        // Only load if there are actual items, otherwise start empty
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setInventoryItems(parsedItems);
        }
      } catch (error) {
        console.error("Error parsing stored inventory items:", error);
        // Start with empty array if parsing fails
        setInventoryItems([]);
      }
    }
  }, []);

  const toggleAddItem = () => {
    setIsAddingItem(!isAddingItem);
    setSelectedItemId(null);
  };

  const editItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsAddingItem(true);
  };

  const handleItemSaved = (item: InventoryItem) => {
    const updatedItems = selectedItemId 
      ? inventoryItems.map(i => i.id === selectedItemId ? item : i)
      : [...inventoryItems, { ...item, id: Date.now().toString() }];
    
    setInventoryItems(updatedItems);
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));
    setIsAddingItem(false);
    setSelectedItemId(null);
    
    toast.success(selectedItemId ? "Item atualizado com sucesso" : "Item adicionado com sucesso");
  };

  const handleItemDeleted = (itemId: string) => {
    const updatedItems = inventoryItems.filter(item => item.id !== itemId);
    setInventoryItems(updatedItems);
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems));
    toast.success("Item removido com sucesso");
  };

  const exportData = () => {
    try {
      if (inventoryItems.length === 0) {
        toast.error("Nenhum item no estoque para exportar");
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inventoryItems, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `estoque-${new Date().toLocaleDateString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast.success("Dados do estoque exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error("Erro na exportação:", error);
    }
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Estoque</h1>
            <p className="text-muted-foreground">
              Controle completo do seu inventário
            </p>
          </div>
          <div className="flex gap-2">
            {!isAddingItem && (
              <>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
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
            onSuccess={handleItemSaved}
          />
        ) : (
          <InventoryOverview 
            onEdit={editItem} 
            onDelete={handleItemDeleted}
          />
        )}
      </div>
    </ModernLayout>
  );
};

export default Estoque;
