
import { useState } from "react";
import { Layout } from "@/components/restaurant/Layout";
import { CashFlowOverview } from "@/components/restaurant/CashFlowOverview";
import { CashFlowForm } from "@/components/restaurant/CashFlowForm";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";

const FluxoCaixa = () => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Toggle between cash flow list and add/edit form
  const toggleAddEntry = () => {
    setIsAddingEntry(!isAddingEntry);
    setSelectedEntryId(null);
  };

  // Function to edit existing entry
  const editEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setIsAddingEntry(true);
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Controle de entradas e saídas financeiras
          </p>
        </div>
        <div className="flex gap-2">
          {!isAddingEntry && (
            <>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={toggleAddEntry}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </>
          )}
        </div>
      </div>

      {isAddingEntry ? (
        <CashFlowForm 
          entryId={selectedEntryId} 
          onCancel={toggleAddEntry} 
          onSuccess={() => {
            setIsAddingEntry(false);
            setSelectedEntryId(null);
          }}
        />
      ) : (
        <CashFlowOverview onEdit={editEntry} />
      )}
    </Layout>
  );
};

export default FluxoCaixa;
