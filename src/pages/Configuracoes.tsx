
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { TaskManager } from "@/components/restaurant/TaskManager";

export function Configuracoes() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-4 sm:space-y-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:justify-between sm:items-start">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Gestão de Tarefas
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Organize e acompanhe as atividades da sua equipe
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <TaskManager />
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
