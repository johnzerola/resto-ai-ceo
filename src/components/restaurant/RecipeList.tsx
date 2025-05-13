
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Edit,
  MoreVertical, 
  Search, 
  Trash2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  costPerServing: number;
  sellingPrice: number;
  profitMargin: number;
}

interface RecipeListProps {
  onEdit: (recipeId: string) => void;
}

export function RecipeList({ onEdit }: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Carregar receitas do localStorage ou API
    loadRecipes();
  }, []);

  useEffect(() => {
    // Filtrar receitas com base no termo de pesquisa
    if (searchTerm) {
      const filtered = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchTerm, recipes]);

  // Função para carregar receitas
  const loadRecipes = () => {
    try {
      // Aqui deveria carregar da API ou backend
      // Por enquanto, vamos simular com localStorage
      const savedRecipes = localStorage.getItem("recipes");
      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes);
        setRecipes(parsedRecipes);
        setFilteredRecipes(parsedRecipes);
      }
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas.",
        variant: "destructive"
      });
    }
  };

  // Função para excluir uma receita
  const deleteRecipe = (recipeId: string) => {
    try {
      // Aqui deveria excluir da API ou backend
      // Por enquanto, vamos simular com localStorage
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
      localStorage.setItem("recipes", JSON.stringify(updatedRecipes));
      setRecipes(updatedRecipes);
      
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita.",
        variant: "destructive"
      });
    }
  };

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas e Produtos</CardTitle>
        <CardDescription>
          Gerencie suas receitas, calcule custos e defina preços
        </CardDescription>
        <div className="flex items-center mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecipes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Rendimento</TableHead>
                <TableHead>Custo/Porção</TableHead>
                <TableHead>Preço de Venda</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.category}</TableCell>
                  <TableCell>{recipe.servingSize} {recipe.servingUnit}</TableCell>
                  <TableCell>{formatCurrency(recipe.costPerServing)}</TableCell>
                  <TableCell>{formatCurrency(recipe.sellingPrice)}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        recipe.profitMargin < 30 
                          ? 'bg-red-100 text-red-800' 
                          : recipe.profitMargin > 70 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {recipe.profitMargin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(recipe.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteRecipe(recipe.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Nenhuma receita encontrada para a sua busca." 
                : "Nenhuma receita cadastrada ainda. Clique em 'Nova Receita' para começar."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
