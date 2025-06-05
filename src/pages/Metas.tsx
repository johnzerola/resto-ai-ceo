
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { GoalsManager } from "@/components/restaurant/GoalsManager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

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
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 ml-4 sm:ml-0" />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Sistema de Metas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Defina e acompanhe seus objetivos de negócio
              </p>
            </div>
          </div>
        </div>

        {!hasGoals ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Nenhuma meta definida</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Comece definindo suas primeiras metas de negócio para acompanhar o crescimento do seu restaurante.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <GoalsManager />
      </div>
    </ModernLayout>
  );
}
