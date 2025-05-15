import { useState, useEffect } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { RecipeForm } from "@/components/restaurant/RecipeForm";
import { RecipeList } from "@/components/restaurant/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FichaTecnica = () => {
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [missingData, setMissingData] = useState<string[]>([]);
  const navigate = useNavigate();

  // Verificar se as configurações financeiras estão definidas
  useEffect(() => {
    const savedData = localStorage.getItem("restaurantData");
    if (savedData) {
      const data = JSON.parse(savedData);
      // Verificar quais dados financeiros estão faltando
      const missing: string[] = [];
      if (!data.fixedExpenses) missing.push("despesas fixas");
      if (!data.variableExpenses) missing.push("despesas variáveis");
      if (!data.desiredProfitMargin) missing.push("margem de lucro desejada");
      
      setMissingData(missing);
      setShowConfigAlert(missing.length > 0);
    } else {
      setShowConfigAlert(true);
      setMissingData(["todos os dados financeiros"]);
    }
  }, []);

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

  // Função para ir para a página de configurações
  const goToSettings = () => {
    navigate('/configuracoes');
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
        <div className="flex gap-2">
          {!isAddingRecipe && (
            <>
              <Button variant="outline" onClick={goToSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
              <Button onClick={toggleAddRecipe}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </>
          )}
        </div>
      </div>

      {showConfigAlert && (
        <Alert className="mb-6 border-amber-500 bg-amber-50">
          <AlertTitle className="text-amber-800">Configurações financeiras incompletas</AlertTitle>
          <AlertDescription className="text-amber-700">
            Para cálculos mais precisos de preços sugeridos, configure {missingData.join(", ")} nas configurações.
            <Button variant="link" className="text-amber-800 p-0 h-auto font-semibold ml-1" onClick={goToSettings}>
              Ir para Configurações
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
