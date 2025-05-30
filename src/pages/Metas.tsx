
import { Layout } from "@/components/restaurant/Layout";
import { GoalsManager } from "@/components/restaurant/GoalsManager";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { AchievementsDisplay } from "@/components/restaurant/AchievementsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Trophy, TrendingUp, Plus, DollarSign, TrendingDown } from "lucide-react";
import { useState } from "react";

// Mock data for goals
const mockGoals = [
  {
    id: "1",
    title: "Aumentar Receita Mensal",
    description: "Meta de crescimento de receita para este mês",
    target: 50000,
    current: 35000,
    unit: "R$",
    deadline: "2024-12-31",
    completed: false,
    reward: "Bônus para equipe",
    category: "financial",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    linkedTo: {
      source: "dre" as const,
      metric: "revenue_growth"
    }
  },
  {
    id: "2", 
    title: "Reduzir CMV",
    description: "Otimizar custos dos produtos vendidos",
    target: 30,
    current: 35,
    unit: "%",
    deadline: "2024-12-31",
    completed: false,
    reward: null,
    category: "operational",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-10",
    linkedTo: {
      source: "cmv" as const,
      metric: "reduction"
    }
  },
  {
    id: "3",
    title: "Margem de Lucro",
    description: "Atingir margem de lucro desejada",
    target: 25,
    current: 28,
    unit: "%",
    deadline: "2024-12-31", 
    completed: true,
    reward: "Meta alcançada!",
    category: "financial",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-20",
    linkedTo: null
  }
];

export function Metas() {
  const [activeTab, setActiveTab] = useState("overview");
  const [goals, setGoals] = useState(mockGoals);

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleEditGoal = (goal: any) => {
    console.log("Editar meta:", goal);
    // Implementar lógica de edição
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Metas</h1>
            <p className="text-muted-foreground">
              Gerencie metas financeiras e acompanhe o progresso do seu restaurante
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.filter(g => !g.completed).length}</div>
              <p className="text-xs text-muted-foreground">
                em andamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.filter(g => g.completed).length}</div>
              <p className="text-xs text-muted-foreground">
                este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((goals.filter(g => g.completed).length / goals.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                das metas atingidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(goals.reduce((acc, goal) => acc + (goal.current / goal.target * 100), 0) / goals.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                das metas em progresso
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {goals.map((goal) => (
                <GoalProgressCard 
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onEdit={handleEditGoal}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsManager />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
