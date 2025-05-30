
import { Layout } from "@/components/restaurant/Layout";
import { GoalsManager } from "@/components/restaurant/GoalsManager";
import { GoalProgressCard } from "@/components/restaurant/GoalProgressCard";
import { AchievementsDisplay } from "@/components/restaurant/AchievementsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Trophy, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

export function Metas() {
  const [activeTab, setActiveTab] = useState("overview");

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <GoalProgressCard />
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
