
import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { CashFlowOverview } from "@/components/restaurant/CashFlowOverview";
import { CashFlowForm } from "@/components/restaurant/CashFlowForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FluxoDeCaixa() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleEdit = (entryId: string) => {
    setEditingEntryId(entryId);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEntryId(null);
  };

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Gerencie entradas e saídas do seu restaurante
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingEntryId ? "Editar Transação" : "Nova Transação"}
                </DialogTitle>
              </DialogHeader>
              <CashFlowForm 
                onSuccess={handleFormClose}
                editingEntryId={editingEntryId}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Controle Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                Gestão Completa
              </div>
              <p className="text-xs text-muted-foreground">
                Entradas e saídas em tempo real
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Relatórios Detalhados
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                Análises Precisas
              </div>
              <p className="text-xs text-muted-foreground">
                Gráficos e insights inteligentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planejamento
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                Visão Estratégica
              </div>
              <p className="text-xs text-muted-foreground">
                Projeções e cenários futuros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Cash Flow Component */}
        <CashFlowOverview onEdit={handleEdit} />
      </div>
    </ModernLayout>
  );
}
