import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles,
  CheckCircle,
  Clock,
  Target,
  Star,
  Gift,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Play,
  Lightbulb,
  Zap,
  Heart,
  Rocket,
  Crown,
  Wand2
} from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: "info" | "form" | "action" | "celebration";
  completed: boolean;
  xpReward: number;
  tasks: OnboardingTask[];
}

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  reward: string;
}

interface MascotMessage {
  message: string;
  type: "welcome" | "encouragement" | "celebration" | "tip";
  emoji: string;
}

export function GuidedOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [mascotMessage, setMascotMessage] = useState<MascotMessage | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    generateOnboardingSteps();
    showWelcomeMessage();
  }, []);

  useEffect(() => {
    calculateProgress();
  }, [steps]);

  const generateOnboardingSteps = () => {
    const onboardingSteps: OnboardingStep[] = [
      {
        id: "welcome",
        title: "🎉 Bem-vindo ao Lucraí!",
        description: "Vamos configurar seu restaurante para o sucesso",
        icon: Sparkles,
        type: "celebration",
        completed: false,
        xpReward: 100,
        tasks: [
          {
            id: "1",
            title: "Assistir vídeo de boas-vindas",
            description: "Conheça como o Lucraí vai revolucionar sua gestão",
            completed: false,
            required: true,
            reward: "+50 XP"
          }
        ]
      },
      {
        id: "restaurant-info",
        title: "🏪 Dados do Restaurante",
        description: "Conte sobre seu negócio para personalizarmos a experiência",
        icon: Target,
        type: "form",
        completed: false,
        xpReward: 150,
        tasks: [
          {
            id: "1",
            title: "Nome do restaurante",
            description: "Como seus clientes conhecem você",
            completed: false,
            required: true,
            reward: "+25 XP"
          },
          {
            id: "2",
            title: "Tipo de cozinha",
            description: "Pizza, hambúrguer, comida caseira, etc.",
            completed: false,
            required: true,
            reward: "+25 XP"
          },
          {
            id: "3",
            title: "Faturamento aproximado",
            description: "Para calibrar nossas recomendações",
            completed: false,
            required: true,
            reward: "+25 XP"
          }
        ]
      },
      {
        id: "first-product",
        title: "🍕 Primeiro Produto",
        description: "Vamos calcular o CMV do seu produto mais vendido",
        icon: Star,
        type: "action",
        completed: false,
        xpReward: 200,
        tasks: [
          {
            id: "1",
            title: "Escolher produto principal",
            description: "Qual é o carro-chefe do seu cardápio?",
            completed: false,
            required: true,
            reward: "+50 XP"
          },
          {
            id: "2",
            title: "Adicionar ingredientes",
            description: "Lista completa com custos",
            completed: false,
            required: true,
            reward: "+75 XP"
          },
          {
            id: "3",
            title: "Definir preço de venda",
            description: "Preço atual no cardápio",
            completed: false,
            required: true,
            reward: "+50 XP"
          }
        ]
      },
      {
        id: "financial-goals",
        title: "🎯 Metas Financeiras",
        description: "Defina seus objetivos para acompanharmos juntos",
        icon: Trophy,
        type: "form",
        completed: false,
        xpReward: 175,
        tasks: [
          {
            id: "1",
            title: "Meta de faturamento mensal",
            description: "Quanto quer faturar por mês?",
            completed: false,
            required: true,
            reward: "+50 XP"
          },
          {
            id: "2",
            title: "Margem de lucro desejada",
            description: "Qual margem considera ideal?",
            completed: false,
            required: true,
            reward: "+50 XP"
          }
        ]
      },
      {
        id: "first-analysis",
        title: "📊 Sua Primeira Análise",
        description: "Veja o poder do Lucraí em ação",
        icon: Zap,
        type: "celebration",
        completed: false,
        xpReward: 250,
        tasks: [
          {
            id: "1",
            title: "Ver análise de lucratividade",
            description: "Descubra se seus preços estão corretos",
            completed: false,
            required: true,
            reward: "+100 XP"
          },
          {
            id: "2",
            title: "Receber recomendações",
            description: "Dicas personalizadas para seu negócio",
            completed: false,
            required: true,
            reward: "+75 XP"
          }
        ]
      },
      {
        id: "celebration",
        title: "🏆 Parabéns, Gestor!",
        description: "Você desbloqueou o poder da gestão inteligente",
        icon: Crown,
        type: "celebration",
        completed: false,
        xpReward: 300,
        tasks: [
          {
            id: "1",
            title: "Receber badge de conclusão",
            description: "Você é agora um Gestor Certificado Lucraí",
            completed: false,
            required: true,
            reward: "Badge Especial + 300 XP"
          }
        ]
      }
    ];
    setSteps(onboardingSteps);
  };

  const showWelcomeMessage = () => {
    setMascotMessage({
      message: "Olá! Eu sou o Luca, seu assistente pessoal! 🤖 Vou te guiar nesta jornada incrível para transformar seu restaurante em uma máquina de lucros!",
      type: "welcome",
      emoji: "👋"
    });
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    const percentage = (completedSteps / steps.length) * 100;
    setCompletionPercentage(percentage);
    
    const earnedXP = steps
      .filter(step => step.completed)
      .reduce((total, step) => total + step.xpReward, 0);
    setTotalXP(earnedXP);
  };

  const completeTask = (stepId: string, taskId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedTasks = step.tasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        );
        const allTasksCompleted = updatedTasks.every(task => task.completed);
        
        if (allTasksCompleted && !step.completed) {
          // Step completed - show celebration
          triggerCelebration();
          showEncouragementMessage();
        }
        
        return {
          ...step,
          tasks: updatedTasks,
          completed: allTasksCompleted
        };
      }
      return step;
    }));
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const showEncouragementMessage = () => {
    const encouragementMessages = [
      "Incrível! Você está se tornando um expert em gestão! 🚀",
      "Perfeito! Cada passo te aproxima do sucesso! ⭐",
      "Fantástico! Seu restaurante vai agradecer por isso! 💎",
      "Excelente! Você está dominando a arte de lucrar! 🎯",
      "Maravilhoso! Continue assim e o sucesso é garantido! 🏆"
    ];
    
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    setMascotMessage({
      message: randomMessage,
      type: "encouragement",
      emoji: "🎉"
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderMascot = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 via-white to-purple-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">Luca - Seu Assistente IA</h4>
              <Badge variant="secondary" className="text-xs">
                {mascotMessage?.emoji}
              </Badge>
            </div>
            {mascotMessage && (
              <p className="text-sm text-muted-foreground">{mascotMessage.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProgressHeader = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-blue-50 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Jornada para o Sucesso
            </h2>
            <p className="text-muted-foreground text-sm">
              Etapa {currentStep + 1} de {steps.length} • {totalXP} XP conquistados
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">
              {completionPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Concluído</p>
          </div>
        </div>
        
        <Progress value={completionPercentage} className="h-3 mb-4" />
        
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    const step = steps[currentStep];
    if (!step) return null;

    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
              <step.icon className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-base">{step.description}</CardDescription>
          <Badge variant="secondary" className="mx-auto">
            +{step.xpReward} XP ao completar
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step.type === "celebration" && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <p className="text-lg font-medium text-muted-foreground">
                Prepare-se para uma experiência incrível!
              </p>
            </div>
          )}

          <div className="space-y-4">
            {step.tasks.map((task, taskIndex) => (
              <div 
                key={task.id} 
                className={`p-4 border-2 rounded-lg transition-all ${
                  task.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => completeTask(step.id, task.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm mb-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                      {task.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {task.reward}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {step.type === "form" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <Input placeholder="Digite aqui..." />
              <Textarea placeholder="Conte mais sobre seu negócio..." rows={3} />
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button 
              onClick={nextStep}
              disabled={currentStep === steps.length - 1 || !step.completed}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-2xl animate-scale-in">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold">Etapa Concluída!</h3>
              <p className="text-muted-foreground">Você está arrasando!</p>
            </div>
          </div>
        )}

        {/* Progress Header */}
        {renderProgressHeader()}

        {/* Mascot */}
        {renderMascot()}

        {/* Current Step */}
        {renderCurrentStep()}

        {/* Motivational Quote */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 mt-6">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                "O sucesso é a soma de pequenos esforços repetidos dia após dia." - Robert Collier
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}