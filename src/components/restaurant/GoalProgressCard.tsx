
import { useState } from "react";
import { Goal, updateGoalProgress } from "@/services/GoalsService";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Edit, Trash2, CheckCircle2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface GoalProgressCardProps {
  goal: Goal;
  onDelete: (goalId: string) => void;
  onEdit?: (goal: Goal) => void;
}

export function GoalProgressCard({ goal, onDelete, onEdit }: GoalProgressCardProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.current);
  
  // Calcular o progresso em porcentagem
  const progressPercentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
  
  // Formatar data limite
  const formattedDeadline = goal.deadline 
    ? new Date(goal.deadline).toLocaleDateString('pt-BR')
    : 'Sem prazo';
  
  // Atualizar o progresso da meta
  const handleUpdateProgress = () => {
    updateGoalProgress(goal.id, progressValue);
    setIsUpdateDialogOpen(false);
    toast.success("Progresso atualizado", {
      description: `${goal.title} atualizado para ${progressValue} ${goal.unit}`
    });
  };
  
  // Confirmar exclusão da meta
  const handleConfirmDelete = () => {
    onDelete(goal.id);
    setIsDeleteDialogOpen(false);
  };
  
  // Mapeamento de fontes de dados para texto amigável
  const sourceNames = {
    "dre": "DRE",
    "cmv": "CMV",
    "cashFlow": "Fluxo de Caixa"
  };
  
  // Mapeamento de métricas para texto amigável
  const metricNames = {
    "profit_margin": "Margem de Lucro",
    "reduction": "Redução",
    "revenue_growth": "Crescimento de Receita"
  };
  
  return (
    <div className={cn(
      "rounded-md border p-4 transition-all hover:shadow-md",
      goal.completed ? "bg-green-50 border-green-200" : "bg-white"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{goal.title}</h3>
            {goal.completed && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Concluído
              </span>
            )}
            {goal.linkedTo && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                <Link2 className="mr-1 h-3 w-3" />
                Sincronizado
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
          {goal.linkedTo && (
            <p className="text-xs text-blue-600 mt-1">
              Vinculado a: {sourceNames[goal.linkedTo.source]} ({metricNames[goal.linkedTo.metric as keyof typeof metricNames] || goal.linkedTo.metric})
            </p>
          )}
        </div>
        
        {/* Ícone de troféu para recompensa */}
        {goal.reward && (
          <div className="text-amber-500" title={`Recompensa: ${goal.reward}`}>
            <Trophy className="h-5 w-5" />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <div>
            Progresso: {goal.current} de {goal.target} {goal.unit}
          </div>
          <div>{progressPercentage}%</div>
        </div>
        <Progress value={progressPercentage} className={cn(
          progressPercentage >= 100 ? "bg-green-100" : "bg-blue-50",
          "h-2"
        )} />
      </div>
      
      {/* Meta info e ações */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {goal.deadline && (
            <span>Prazo: {formattedDeadline}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setIsUpdateDialogOpen(true)}
            disabled={!!goal.linkedTo}
            title={goal.linkedTo ? "Progresso atualizado automaticamente" : "Atualizar progresso"}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Atualizar progresso</span>
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 text-blue-600" 
              onClick={() => onEdit(goal)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar meta</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 text-red-600" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir meta</span>
          </Button>
        </div>
      </div>
      
      {/* Diálogo para atualizar progresso */}
      <AlertDialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar progresso</AlertDialogTitle>
            <AlertDialogDescription>
              Atualize o progresso atual para a meta: <strong>{goal.title}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4">
              <input
                type="number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                min={0}
                max={goal.target * 2}
                step={goal.unit === "%" ? 0.1 : 1}
              />
              <span>{goal.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Meta: {goal.target} {goal.unit}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProgress}>Atualizar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo para confirmar exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
