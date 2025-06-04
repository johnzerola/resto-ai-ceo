
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
    const storedItems = localStorage.getItem("inventoryItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setInventoryItems(parsedItems);
        }
      } catch (error) {
        console.error("Error parsing stored inventory items:", error);
        setInventoryItems([]);
      }
    }
  }, []);

  const toggleAddItem = () => {
    setIsAddingItem(!isAddingItem);
    setSelectedItemId(null);
  };

  const handleCancelForm = () => {
    setIsAddingItem(false);
    setSelectedItemId(null);
  };

  const editItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsAddingItem(true);
  };

  const handleFormSuccess = () => {
    const storedItems = localStorage.getItem("inventoryItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        setInventoryItems(parsedItems);
      } catch (error) {
        console.error("Error parsing stored inventory items:", error);
        setInventoryItems([]);
      }
    }
    
    setIsAddingItem(false);
    setSelectedItemId(null);
    
    toast.success(selectedItemId ? "Item atualizado com sucesso" : "Item adicionado com sucesso");
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
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Gestão de Estoque
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Controle completo do seu inventário
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isAddingItem && (
              <>
                <Button variant="outline" size="sm" onClick={exportData} className="text-xs sm:text-sm flex-1 sm:flex-none">
                  <FileDown className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Exportar</span>
                </Button>
                <Button onClick={toggleAddItem} size="sm" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Novo Item</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm">
          {isAddingItem ? (
            <InventoryForm 
              itemId={selectedItemId} 
              onCancel={handleCancelForm} 
              onSuccess={handleFormSuccess}
            />
          ) : (
            <InventoryOverview 
              onEdit={editItem}
            />
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default Estoque;
