
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Store, ChevronDown, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function RestaurantSelector() {
  const { userRestaurants, currentRestaurant, setCurrentRestaurant, createRestaurant } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRestaurant = async () => {
    if (newRestaurantName.trim().length < 3) {
      toast.error("Nome do restaurante deve ter pelo menos 3 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRestaurant(newRestaurantName);
      setNewRestaurantName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar restaurante:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentRestaurant) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 max-w-[200px] md:max-w-xs">
            <Store className="h-4 w-4" />
            <span className="truncate">{currentRestaurant.name}</span>
            {userRestaurants.length > 1 && <ChevronDown className="h-4 w-4 ml-auto" />}
          </Button>
        </DropdownMenuTrigger>
        
        {userRestaurants.length > 1 && (
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Seus Restaurantes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {userRestaurants.map((restaurant) => (
              <DropdownMenuItem 
                key={restaurant.id}
                onClick={() => setCurrentRestaurant(restaurant)}
                className={`${currentRestaurant.id === restaurant.id ? 'bg-muted' : ''} cursor-pointer`}
              >
                <Store className="h-4 w-4 mr-2" />
                <span className="truncate">{restaurant.name}</span>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>Novo Restaurante</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input
                id="name"
                value={newRestaurantName}
                onChange={(e) => setNewRestaurantName(e.target.value)}
                placeholder="Ex: Cantina Italiana da Nonna"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleCreateRestaurant}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Restaurante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
