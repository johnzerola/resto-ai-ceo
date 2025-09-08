import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Flame,
  Zap,
  ArrowRight,
  Star,
  Timer
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  urgency: "urgent" | "moderate" | "low";
  estimatedReturn: number;
  timeToComplete: string;
  category: "pricing" | "cost" | "operational" | "strategic";
  status: "pending" | "in_progress" | "completed";
  steps: string[];
  completedSteps: number;
}

interface DailyChecklist {
  id: string;
  task: string;
  category: string;
  profitImpact: number;
  completed: boolean;
  icon: any;
}

export function PriorityActionCenter() {
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [dailyChecklist, setDailyChecklist] = useState<DailyChecklist[]>([]);
  const [activeTab, setActiveTab] = useState<"actions" | "checklist">("actions");

  useEffect(() => {
    generatePriorityActions();
    generateDailyChecklist();
  }, []);

  const generatePriorityActions = () => {
    const priorityActions: PriorityAction[] = [
      {
        id: "1",
        title: "Ajustar preço Pizza Margherita",
        description: "Produto está gerando prejuízo de R$ 2,30 por unidade",
        impact: "high",
        urgency: "urgent", 
        estimatedReturn: 340,
        timeToComplete: "15 min",
        category: "pricing",
        status: "pending",
        steps: [
          "Analisar custo atual dos ingredientes",
          "Calcular novo preço com margem de 35%",
          "Testar aceitação com 10 clientes",
          "Implementar novo preço no sistema"
        ],
        completedSteps: 0
      },
      {
        id: "2", 
        title: "Renegociar taxa do iFood",
        description: "Taxa atual de 15% pode ser reduzida para 12%",
        impact: "high",
        urgency: "moderate",
        estimatedReturn: 890,
        timeToComplete: "2 horas",
        category: "cost",
        status: "pending",
        steps: [
          "Reunir dados de volume de vendas",
          "Contactar gerente comercial iFood",
          "Negociar redução da taxa",
          "Documentar novo acordo"
        ],
        completedSteps: 1
      },
      {
        id: "3",
        title: "Implementar controle de porções",
        description: "Padronizar porções pode reduzir desperdício em 12%",
        impact: "medium",
        urgency: "moderate",
        estimatedReturn: 450,
        timeToComplete: "1 dia",
        category: "operational",
        status: "in_progress",
        steps: [
          "Definir peso padrão de cada ingrediente",
          "Treinar equipe sobre porcionamento",
          "Implementar balança na cozinha",
          "Monitorar resultados por 1 semana"
        ],
        completedSteps: 2
      },
      {
        id: "4",
        title: "Lançar programa de fidelidade",
        description: "Reduzir dependência de apps de delivery",
        impact: "high",
        urgency: "low",
        estimatedReturn: 1200,
        timeToComplete: "1 semana",
        category: "strategic",
        status: "pending",
        steps: [
          "Definir mecânica do programa",
          "Criar sistema de pontuação",
          "Desenvolver comunicação",
          "Lançar para clientes VIP"
        ],
        completedSteps: 0
      }
    ];
    setActions(priorityActions);
  };

  const generateDailyChecklist = () => {
    const checklist: DailyChecklist[] = [
      {
        id: "1",
        task: "Verificar estoque crítico de ingredientes",
        category: "Operacional",
        profitImpact: 85,
        completed: false,
        icon: AlertTriangle
      },
      {
        id: "2", 
        task: "Analisar vendas do dia anterior",
        category: "Financeiro",
        profitImpact: 70,
        completed: true,
        icon: TrendingUp
      },
      {
        id: "3",
        task: "Atualizar cardápio com ingredientes sazonais",
        category: "Estratégico", 
        profitImpact: 60,
        completed: false,
        icon: Star
      },
      {
        id: "4",
        task: "Revisar despesas do último pedido",
        category: "Financeiro",
        profitImpact: 75,
        completed: false,
        icon: DollarSign
      },
      {
        id: "5",
        task: "Conferir temperatura dos equipamentos",
        category: "Operacional",
        profitImpact: 45,
        completed: true,
        icon: CheckCircle
      }
    ];
    setDailyChecklist(checklist);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(actions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActions(items);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "from-red-500 to-orange-500";
      case "medium": return "from-yellow-500 to-orange-500"; 
      case "low": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pricing": return DollarSign;
      case "cost": return TrendingUp;
      case "operational": return Target;
      case "strategic": return Star;
      default: return Target;
    }
  };

  const renderActionCard = (action: PriorityAction, index: number) => {
    const CategoryIcon = getCategoryIcon(action.category);
    const progressPercentage = (action.completedSteps / action.steps.length) * 100;

    return (
      <Card key={action.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={`p-3 bg-gradient-to-r ${getImpactColor(action.impact)} rounded-xl text-white shadow-lg`}>
                <CategoryIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={action.impact === "high" ? "destructive" : action.impact === "medium" ? "secondary" : "default"} className="text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    {action.impact} impact
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Timer className="h-3 w-3 mr-1" />
                    {action.timeToComplete}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    <DollarSign className="h-3 w-3 mr-1" />
                    +R$ {action.estimatedReturn}/mês
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">
                      {action.completedSteps}/{action.steps.length} etapas
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {action.steps.map((step, stepIndex) => (
              <div key={stepIndex} className={`flex items-center gap-2 p-2 rounded-lg ${stepIndex < action.completedSteps ? 'bg-green-50 text-green-800' : 'bg-gray-50'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${stepIndex < action.completedSteps ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {stepIndex < action.completedSteps && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm flex-1">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="text-xs">
              Ver Detalhes
            </Button>
            <Button size="sm" className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              Iniciar Agora
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDailyChecklist = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Checklist Diário Inteligente</h3>
        <Badge variant="secondary" className="text-xs">
          {dailyChecklist.filter(item => item.completed).length}/{dailyChecklist.length} concluídas
        </Badge>
      </div>

      <div className="grid gap-3">
        {dailyChecklist.map((item) => (
          <Card key={item.id} className={`border-0 shadow-sm transition-all duration-200 ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => {
                    setDailyChecklist(prev =>
                      prev.map(prevItem =>
                        prevItem.id === item.id
                          ? { ...prevItem, completed: checked as boolean }
                          : prevItem
                      )
                    );
                  }}
                  className="w-5 h-5"
                />
                <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <item.icon className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Impacto no lucro: {item.profitImpact}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Centro de Ações Prioritárias
            </h2>
            <p className="text-muted-foreground text-sm">Tarefas organizadas por impacto no lucro</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "actions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("actions")}
            className="text-sm"
          >
            <Target className="h-4 w-4 mr-2" />
            Ações Prioritárias
          </Button>
          <Button
            variant={activeTab === "checklist" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("checklist")}
            className="text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Checklist Diário
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "actions" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="priority-actions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {actions.map((action, index) => (
                  <Draggable key={action.id} draggableId={action.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${snapshot.isDragging ? 'rotate-1 scale-105' : ''} transition-all duration-200`}
                      >
                        {renderActionCard(action, index)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        renderDailyChecklist()
      )}
    </div>
  );
}