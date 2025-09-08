import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Star,
  Award,
  Medal,
  Crown,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  Flame,
  Gem,
  Sparkles
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
  category: "financial" | "operational" | "growth" | "efficiency";
}

interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  requiredXP: number;
  benefits: string[];
  nextLevelRewards: string[];
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  daysLeft: number;
  difficulty: "easy" | "medium" | "hard";
}

export function GameficationProgress() {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 12,
    title: "Gestor Prata",
    currentXP: 2340,
    requiredXP: 3000,
    benefits: [
      "Dashboard personalizado",
      "Relatórios avançados",
      "Alertas em tempo real",
      "Suporte prioritário"
    ],
    nextLevelRewards: [
      "Previsões com IA",
      "Integração WhatsApp",
      "Consultoria mensal",
      "Badge especial"
    ]
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    generateAchievements();
    generateWeeklyChallenges();
  }, []);

  const generateAchievements = () => {
    const achievementsList: Achievement[] = [
      {
        id: "1",
        title: "Primeira Semana Lucrativa",
        description: "Mantenha margem positiva por 7 dias consecutivos",
        icon: Star,
        rarity: "common",
        progress: 7,
        maxProgress: 7,
        unlocked: true,
        reward: "+50 XP, Badge Bronze",
        category: "financial"
      },
      {
        id: "2",
        title: "Mestre do CMV",
        description: "Mantenha CMV abaixo de 30% por um mês",
        icon: Target,
        rarity: "rare",
        progress: 18,
        maxProgress: 30,
        unlocked: false,
        reward: "+150 XP, Análise gratuita",
        category: "financial"
      },
      {
        id: "3",
        title: "Eficiência Máxima",
        description: "Reduza desperdício para menos de 5%",
        icon: Zap,
        rarity: "epic",
        progress: 3,
        maxProgress: 5,
        unlocked: false,
        reward: "+300 XP, Consultoria premium",
        category: "efficiency"
      },
      {
        id: "4",
        title: "Crescimento Exponencial",
        description: "Aumente receita em 50% em 3 meses",
        icon: TrendingUp,
        rarity: "legendary",
        progress: 1,
        maxProgress: 3,
        unlocked: false,
        reward: "+500 XP, Plano gratuito 6 meses",
        category: "growth"
      },
      {
        id: "5",
        title: "Zero Desperdício",
        description: "Complete 30 dias sem perdas de ingredientes",
        icon: Gem,
        rarity: "rare",
        progress: 12,
        maxProgress: 30,
        unlocked: false,
        reward: "+200 XP, Certificado sustentabilidade",
        category: "operational"
      },
      {
        id: "6",
        title: "Cliente Fiel",
        description: "Alcance 100 clientes recorrentes",
        icon: Crown,
        rarity: "epic",
        progress: 67,
        maxProgress: 100,
        unlocked: false,
        reward: "+400 XP, Sistema CRM gratuito",
        category: "growth"
      }
    ];
    setAchievements(achievementsList);
  };

  const generateWeeklyChallenges = () => {
    const challenges: WeeklyChallenge[] = [
      {
        id: "1",
        title: "Meta de Vendas",
        description: "Alcance R$ 8.000 em vendas esta semana",
        target: 8000,
        current: 5240,
        reward: "+100 XP, Análise de performance",
        daysLeft: 3,
        difficulty: "medium"
      },
      {
        id: "2",
        title: "Controle de Custos",
        description: "Mantenha CMV abaixo de 28% por 7 dias",
        target: 7,
        current: 4,
        reward: "+75 XP, Dicas de otimização",
        daysLeft: 3,
        difficulty: "easy"
      },
      {
        id: "3",
        title: "Satisfação do Cliente",
        description: "Obtenha 20 avaliações 5 estrelas",
        target: 20,
        current: 12,
        reward: "+125 XP, Kit marketing",
        daysLeft: 3,
        difficulty: "hard"
      }
    ];
    setWeeklyChallenges(challenges);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "from-gray-400 to-gray-500";
      case "rare": return "from-blue-400 to-blue-600";
      case "epic": return "from-purple-400 to-purple-600";
      case "legendary": return "from-yellow-400 to-orange-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const renderUserLevel = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 via-white to-purple-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
              {userLevel.level}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {userLevel.title}
            </h3>
            <p className="text-muted-foreground mb-3">Nível {userLevel.level}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para próximo nível</span>
                <span className="font-semibold">
                  {userLevel.currentXP}/{userLevel.requiredXP} XP
                </span>
              </div>
              <Progress 
                value={(userLevel.currentXP / userLevel.requiredXP) * 100} 
                className="h-3 bg-gradient-to-r from-indigo-200 to-purple-200"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Benefícios Atuais
            </h4>
            <ul className="space-y-2">
              {userLevel.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Próximas Recompensas
            </h4>
            <ul className="space-y-2">
              {userLevel.nextLevelRewards.map((reward, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-50" />
                  {reward}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAchievements = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Conquistas</CardTitle>
            <CardDescription>Marcos importantes da sua jornada</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-xl text-white shadow-sm`}>
                  <achievement.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span className="font-semibold">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>

                  {achievement.unlocked && (
                    <div className="mt-3 p-2 bg-green-100 rounded-md">
                      <p className="text-xs text-green-700 font-medium">🎉 {achievement.reward}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderWeeklyChallenges = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Desafios da Semana</CardTitle>
            <CardDescription>Objetivos especiais com recompensas extras</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyChallenges.map((challenge) => (
            <div key={challenge.id} className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{challenge.title}</h4>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {challenge.daysLeft} dias restantes
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-semibold">
                    {typeof challenge.current === 'number' && challenge.current > 1000
                      ? `R$ ${challenge.current.toLocaleString()}`
                      : challenge.current
                    } / {typeof challenge.target === 'number' && challenge.target > 1000
                      ? `R$ ${challenge.target.toLocaleString()}`
                      : challenge.target
                    }
                  </span>
                </div>
                <Progress 
                  value={(challenge.current / challenge.target) * 100} 
                  className="h-3"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-green-600 font-medium">🎁 {challenge.reward}</p>
                <Button size="sm" variant="outline" className="text-xs">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Progressão & Conquistas
            </h2>
            <p className="text-muted-foreground text-sm">Acompanhe sua evolução como gestor</p>
          </div>
        </div>
      </div>

      {/* User Level */}
      {renderUserLevel()}

      {/* Grid de Conquistas e Desafios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAchievements()}
        {renderWeeklyChallenges()}
      </div>
    </div>
  );
}