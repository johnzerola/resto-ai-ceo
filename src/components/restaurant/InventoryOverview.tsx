
import { useEffect, useState } from "react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  AlertCircle,
  Search, 
  PlusCircle,
  MinusCircle 
} from "lucide-react";
import { toast } from "sonner";

// Interface for inventory item
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  minStockLevel: number;
  lastUpdated: string;
}

interface InventoryOverviewProps {
  onEdit: (itemId: string) => void;
}

export function InventoryOverview({ onEdit }: InventoryOverviewProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [totalInventoryCost, setTotalInventoryCost] = useState(0);

  // Load inventory data
  useEffect(() => {
    const savedInventory = localStorage.getItem("inventory");
    if (savedInventory) {
      const parsedInventory = JSON.parse(savedInventory);
      setInventory(parsedInventory);
      
      // Calculate low stock items
      const lowStock = parsedInventory.filter(
        (item: InventoryItem) => item.quantity <= item.minStockLevel
      );
      setLowStockItems(lowStock);
      
      // Calculate total inventory cost
      const totalCost = parsedInventory.reduce(
        (sum: number, item: InventoryItem) => sum + item.totalCost,
        0
      );
      setTotalInventoryCost(totalCost);
    } else {
      // Set sample data if no data in localStorage
      const sampleInventory = generateSampleInventory();
      localStorage.setItem("inventory", JSON.stringify(sampleInventory));
      setInventory(sampleInventory);
      
      // Calculate low stock items
      const lowStock = sampleInventory.filter(
        (item: InventoryItem) => item.quantity <= item.minStockLevel
      );
      setLowStockItems(lowStock);
      
      // Calculate total inventory cost
      const totalCost = sampleInventory.reduce(
        (sum: number, item: InventoryItem) => sum + item.totalCost,
        0
      );
      setTotalInventoryCost(totalCost);
    }
  }, []);

  // Filter inventory based on search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle stock movements (quick update)
  const handleStockMovement = (itemId: string, amount: number) => {
    const updatedInventory = inventory.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + amount);
        const newTotalCost = newQuantity * item.costPerUnit;
        
        return {
          ...item,
          quantity: newQuantity,
          totalCost: newTotalCost,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    localStorage.setItem("inventory", JSON.stringify(updatedInventory));
    
    // Update low stock items
    const lowStock = updatedInventory.filter(
      (item: InventoryItem) => item.quantity <= item.minStockLevel
    );
    setLowStockItems(lowStock);
    
    // Update total inventory cost
    const totalCost = updatedInventory.reduce(
      (sum: number, item: InventoryItem) => sum + item.totalCost,
      0
    );
    setTotalInventoryCost(totalCost);
    
    toast.success("Estoque atualizado com sucesso!");
  };

  // Function to delete inventory item
  const deleteItem = (itemId: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      const updatedInventory = inventory.filter((item) => item.id !== itemId);
      setInventory(updatedInventory);
      localStorage.setItem("inventory", JSON.stringify(updatedInventory));
      
      // Update low stock items
      const lowStock = updatedInventory.filter(
        (item: InventoryItem) => item.quantity <= item.minStockLevel
      );
      setLowStockItems(lowStock);
      
      // Update total inventory cost
      const totalCost = updatedInventory.reduce(
        (sum: number, item: InventoryItem) => sum + item.totalCost,
        0
      );
      setTotalInventoryCost(totalCost);
      
      toast.success("Item excluído com sucesso!");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInventoryCost)}</div>
          </CardContent>
        </Card>
        
        <Card className={lowStockItems.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens em Baixo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? "text-red-600" : ""}`}>
              {lowStockItems.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Alerta de Estoque Baixo
            </CardTitle>
            <CardDescription>
              Os seguintes itens estão abaixo do nível mínimo de estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={`low-${item.id}`} className="flex items-center justify-between bg-white p-2 rounded-md">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Atual: <span className="text-red-600 font-medium">{item.quantity} {item.unit}</span> | 
                      Mínimo: {item.minStockLevel} {item.unit}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(item.id)}
                  >
                    Repor
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search and Filter */}
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Unitário</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={item.quantity <= item.minStockLevel ? "text-red-600 font-medium" : ""}>
                          {item.quantity} {item.unit}
                        </div>
                        {item.quantity <= item.minStockLevel && (
                          <Badge variant="destructive" className="text-xs">Baixo</Badge>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStockMovement(item.id, -1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStockMovement(item.id, 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.costPerUnit)}</TableCell>
                    <TableCell>{formatCurrency(item.totalCost)}</TableCell>
                    <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">Nenhum item encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate sample inventory data
function generateSampleInventory(): InventoryItem[] {
  return [
    {
      id: "1",
      name: "Farinha de Trigo",
      category: "Secos",
      quantity: 15.5,
      unit: "kg",
      costPerUnit: 4.5,
      totalCost: 69.75,
      minStockLevel: 10,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      name: "Filé Mignon",
      category: "Carnes",
      quantity: 8.2,
      unit: "kg",
      costPerUnit: 72.9,
      totalCost: 597.78,
      minStockLevel: 10,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      name: "Queijo Mussarela",
      category: "Laticínios",
      quantity: 5.8,
      unit: "kg",
      costPerUnit: 39.9,
      totalCost: 231.42,
      minStockLevel: 8,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "4",
      name: "Tomate",
      category: "Hortifruti",
      quantity: 7,
      unit: "kg",
      costPerUnit: 7.5,
      totalCost: 52.5,
      minStockLevel: 10,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "5",
      name: "Azeite Extra Virgem",
      category: "Óleos",
      quantity: 3,
      unit: "L",
      costPerUnit: 32.9,
      totalCost: 98.7,
      minStockLevel: 5,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "6",
      name: "Camarão",
      category: "Frutos do Mar",
      quantity: 4.5,
      unit: "kg",
      costPerUnit: 85,
      totalCost: 382.5,
      minStockLevel: 5,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "7",
      name: "Vinho Tinto",
      category: "Bebidas",
      quantity: 12,
      unit: "garrafas",
      costPerUnit: 42.9,
      totalCost: 514.8,
      minStockLevel: 6,
      lastUpdated: new Date().toISOString()
    }
  ];
}
