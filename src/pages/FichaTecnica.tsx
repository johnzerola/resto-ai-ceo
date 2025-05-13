
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { RecipeForm } from "@/components/restaurant/RecipeForm";
import { RecipeList } from "@/components/restaurant/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FichaTecnica = () => {
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // Função para alternar entre visualização de lista e formulário
  const toggleAddRecipe = () => {
    setIsAddingRecipe(!isAddingRecipe);
    setSelectedRecipeId(null);
  };

  // Função para editar uma receita existente
  const editRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setIsAddingRecipe(true);
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ficha Técnica</h1>
          <p className="text-muted-foreground">
            Gerenciamento de receitas e cálculo de custos
          </p>
        </div>
        {!isAddingRecipe && (
          <Button onClick={toggleAddRecipe}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        )}
      </div>

      {isAddingRecipe ? (
        <RecipeForm 
          recipeId={selectedRecipeId} 
          onCancel={toggleAddRecipe} 
          onSuccess={() => {
            setIsAddingRecipe(false);
            setSelectedRecipeId(null);
          }}
        />
      ) : (
        <RecipeList onEdit={editRecipe} />
      )}
    </Layout>
  );
};

export default FichaTecnica;
