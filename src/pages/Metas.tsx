
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { GoalsManager } from "@/components/restaurant/GoalsManager";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

export function Metas() {
  const [hasGoals, setHasGoals] = useState(false);

  useEffect(() => {
    // Check if there are any goals stored
    const storedGoals = localStorage.getItem("goals");
    if (storedGoals) {
      try {
        const goals = JSON.parse(storedGoals);
        setHasGoals(Array.isArray(goals) && goals.length > 0);
      } catch (error) {
        console.error("Error parsing goals:", error);
        setHasGoals(false);
      }
    }

    // Listen for goal updates
    const handleGoalsUpdate = () => {
      const storedGoals = localStorage.getItem("goals");
      if (storedGoals) {
        try {
          const goals = JSON.parse(storedGoals);
          setHasGoals(Array.isArray(goals) && goals.length > 0);
        } catch (error) {
          console.error("Error parsing goals:", error);
          setHasGoals(false);
        }
      } else {
        setHasGoals(false);
      }
    };

    window.addEventListener("goalsUpdated", handleGoalsUpdate);
    
    return () => {
      window.removeEventListener("goalsUpdated", handleGoalsUpdate);
    };
  }, []);

  return (
    <ModernLayout>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6 bg-background min-h-screen max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight truncate">Metas</h1>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                Defina e acompanhe objetivos de negócio
              </p>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 overflow-hidden">
          {!hasGoals ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 lg:py-10">
                <div className="text-center space-y-3 max-w-md mx-auto px-3 sm:px-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-semibold">Nenhuma meta definida</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Comece definindo suas primeiras metas de negócio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="w-full overflow-x-auto">
            <div className="min-w-[280px] w-full">
              <GoalsManager />
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
