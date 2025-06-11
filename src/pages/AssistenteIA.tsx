
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { AIAssistant } from "@/components/restaurant/AIAssistant";

const AssistenteIA = () => {
  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Assistente de IA</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Seu consultor pessoal para gestão inteligente do restaurante
          </p>
        </div>

        <div className="w-full overflow-hidden">
          <AIAssistant />
        </div>
      </div>
    </ModernLayout>
  );
};

export default AssistenteIA;
