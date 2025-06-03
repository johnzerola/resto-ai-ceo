import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { PromotionsList } from "@/components/restaurant/PromotionsList";
import { PromotionForm } from "@/components/restaurant/PromotionForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Promocoes = () => {
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

  // Toggle between promotions list and add/edit form
  const toggleAddPromotion = () => {
    setIsAddingPromotion(!isAddingPromotion);
    setSelectedPromotionId(null);
  };

  // Function to edit existing promotion
  const editPromotion = (promotionId: string) => {
    setSelectedPromotionId(promotionId);
    setIsAddingPromotion(true);
  };

  return (
    <ModernLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rodízios e Promoções</h1>
          <p className="text-muted-foreground">
            Gerencie rodízios, combos e ofertas especiais
          </p>
        </div>
        {!isAddingPromotion && (
          <Button onClick={toggleAddPromotion}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Promoção
          </Button>
        )}
      </div>

      {isAddingPromotion ? (
        <PromotionForm 
          promotionId={selectedPromotionId} 
          onCancel={toggleAddPromotion} 
          onSuccess={() => {
            setIsAddingPromotion(false);
            setSelectedPromotionId(null);
          }}
        />
      ) : (
        <PromotionsList onEdit={editPromotion} />
      )}
    </ModernLayout>
  );
};

export default Promocoes;
