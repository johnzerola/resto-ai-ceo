
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
}

export function ShoppingList() {
  const { toast } = useToast();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("un");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    // Carregar lista de compras do localStorage
    const savedList = localStorage.getItem("shoppingList");
    if (savedList) {
      setItems(JSON.parse(savedList));
    }
  }, []);

  const saveList = (updatedList: ShoppingItem[]) => {
    localStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const addItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Nome do item necessário",
        description: "Por favor, informe o nome do item para adicionar à lista.",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: newItemQuantity || "1",
      unit: newItemUnit,
      checked: false
    };
    
    const updatedList = [...items, newItem];
    setItems(updatedList);
    saveList(updatedList);
    
    // Limpar campos
    setNewItemName("");
    setNewItemQuantity("");
    
    toast({
      title: "Item adicionado",
      description: `${newItem.name} foi adicionado à lista de compras.`,
    });
  };

  const toggleItem = (id: string) => {
    const updatedList = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedList);
    saveList(updatedList);
  };

  const removeItem = (id: string) => {
    const updatedList = items.filter(item => item.id !== id);
    setItems(updatedList);
    saveList(updatedList);
    
    toast({
      title: "Item removido",
      description: "Item removido da lista de compras.",
    });
  };

  const clearCompleted = () => {
    const updatedList = items.filter(item => !item.checked);
    setItems(updatedList);
    saveList(updatedList);
    
    toast({
      title: "Itens concluídos removidos",
      description: "Todos os itens marcados foram removidos da lista.",
    });
  };

  // Adicionar vários itens do inventário com estoque baixo
  const addInventoryItems = () => {
    try {
      const savedInventory = localStorage.getItem("inventory");
      if (savedInventory) {
        const inventory = JSON.parse(savedInventory);
        const lowStockItems = inventory.filter((item: any) => 
          item.quantity <= item.minStockLevel
        );
        
        if (lowStockItems.length === 0) {
          toast({
            title: "Sem itens com estoque baixo",
            description: "Não há itens com estoque abaixo do mínimo para adicionar."
          });
          return;
        }
        
        // Adicionar itens que não estão na lista
        const currentItemNames = items.map(item => item.name.toLowerCase());
        const newItems = lowStockItems
          .filter((item: any) => !currentItemNames.includes(item.name.toLowerCase()))
          .map((item: any) => ({
            id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
            name: item.name,
            quantity: Math.ceil(item.minStockLevel - item.quantity).toString(),
            unit: item.unit,
            checked: false
          }));
          
        if (newItems.length === 0) {
          toast({
            title: "Itens já adicionados",
            description: "Os itens com estoque baixo já estão na lista de compras."
          });
          return;
        }
        
        const updatedList = [...items, ...newItems];
        setItems(updatedList);
        saveList(updatedList);
        
        toast({
          title: `${newItems.length} itens adicionados`,
          description: "Itens com estoque baixo foram adicionados à lista de compras."
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar itens do inventário:", error);
      toast({
        title: "Erro ao adicionar itens",
        description: "Ocorreu um erro ao adicionar itens do inventário.",
        variant: "destructive"
      });
    }
  };

  // Filtrar itens com base na preferência de exibição
  const filteredItems = showCompleted 
    ? items 
    : items.filter(item => !item.checked);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Lista de Compras</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Ocultar Concluídos" : "Mostrar Todos"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCompleted}
              disabled={!items.some(item => item.checked)}
            >
              Limpar Concluídos
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <Label htmlFor="item-name" className="mb-1 block">Item</Label>
            <Input
              id="item-name"
              placeholder="Nome do item"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <div className="w-20">
            <Label htmlFor="item-quantity" className="mb-1 block">Qtd</Label>
            <Input
              id="item-quantity"
              placeholder="Qtd"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <div className="w-20">
            <Label htmlFor="item-unit" className="mb-1 block">Un</Label>
            <Input
              id="item-unit"
              placeholder="un"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <Button onClick={addItem} className="mb-0">
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        <Button 
          variant="outline" 
          className="w-full mb-4" 
          onClick={addInventoryItems}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Adicionar Itens com Estoque Baixo
        </Button>

        <div className="border rounded-md">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhum item na lista de compras
            </div>
          ) : (
            <ul className="divide-y max-h-[400px] overflow-y-auto">
              {filteredItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={item.checked} 
                      onCheckedChange={() => toggleItem(item.id)}
                      id={`check-${item.id}`}
                    />
                    <Label 
                      htmlFor={`check-${item.id}`}
                      className={`cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.name} - {item.quantity} {item.unit}
                    </Label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => {
              saveList(items);
              toast({
                title: "Lista salva",
                description: "Sua lista de compras foi salva com sucesso.",
              });
            }}>
              <Save className="h-4 w-4 mr-2" /> Salvar Lista
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
