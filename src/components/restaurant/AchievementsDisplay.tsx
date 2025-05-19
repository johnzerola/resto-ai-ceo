
import { useEffect, useState } from "react";
import { Achievement, getAllAchievements } from "@/services/GoalsService";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    const loadedAchievements = getAllAchievements();
    setAchievements(loadedAchievements);
    
    // Adicionar listener para atualização de conquistas
    const handleAchievementsUpdate = () => {
      setAchievements(getAllAchievements());
    };
    
    window.addEventListener("achievementsUpdated", handleAchievementsUpdate);
    
    return () => {
      window.removeEventListener("achievementsUpdated", handleAchievementsUpdate);
    };
  }, []);
  
  // Agrupar conquistas por categoria
  const achievementsByCategory: Record<string, Achievement[]> = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);
  
  // Mapping para nomes em português
  const categoryNames: Record<string, string> = {
    'financial': 'Financeiro',
    'inventory': 'Estoque',
    'sales': 'Vendas',
    'operational': 'Operacional',
    'customer': 'Clientes'
  };
  
  // Contagem de conquistas desbloqueadas
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-amber-600 font-medium">
            {unlockedCount} de {totalCount} conquistas desbloqueadas ({progressPercentage}%)
          </span>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          <Trophy className="h-3 w-3 mr-1" />
          Nível de Progresso: {Math.floor(unlockedCount / 3) + 1}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <div 
            key={category} 
            className="rounded-lg border p-4 shadow-sm"
          >
            <h3 className="font-medium mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500" />
              <span>{categoryNames[category] || category}</span>
            </h3>
            
            <div className="space-y-3">
              {categoryAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-md border transition-all",
                    achievement.isUnlocked 
                      ? "bg-green-50 border-green-100" 
                      : "bg-gray-50 border-gray-100 opacity-70"
                  )}
                >
                  <div className="flex-shrink-0 text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{achievement.name}</h4>
                      {!achievement.isUnlocked && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.dateUnlocked && (
                      <p className="text-xs text-green-600 mt-1">
                        Desbloqueado em: {new Date(achievement.dateUnlocked).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-center text-muted-foreground mt-4">
        Complete metas para desbloquear conquistas e aumentar seu nível!
      </div>
    </div>
  );
}
