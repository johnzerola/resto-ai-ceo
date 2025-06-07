
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Star
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3; // 1 = Urgente, 2 = Importante, 3 = Pode esperar
  category: "financial" | "operational" | "strategic";
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  estimatedGain?: number;
  deadline?: string;
  actionSteps: string[];
  completed: boolean;
}

export function PriorityActionCenter() {
  const { toast } = useToast();
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [filter, setFilter] = useState<"all" | "urgent" | "important" | "completed">("all");

  const generatePriorityActions = (): PriorityAction[] => {
    // Em produção, isso viria de análise de dados reais
    return [
      {
        id: "reduce-food-cost",
        title: "Reduzir Food Cost Urgentemente",
        description: "Food cost está em 32%, acima do recomendado (30%)",
        priority: 1,
        category: "financial",
        impact: "high",
        effort: "medium",
        estimatedGain: 2500,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        actionSteps: [
          "Renegociar com 3 principais fornecedores",
          "Reduzir porções em 5% nos pratos menos populares",
          "Implementar controle de desperdício na cozinha",
          "Revisar receitas para otimizar ingredientes"
        ],
        completed: false
      },
      {
        id: "increase-average-ticket",
        title: "Aumentar Ticket Médio",
        description: "Ticket atual R$ 41,67 - potencial para R$ 50",
        priority: 2,
        category: "operational",
        impact: "high",
        effort: "low",
        estimatedGain: 3200,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        actionSteps: [
          "Treinar equipe em técnicas de upselling",
          "Criar combos e sugestões de sobremesas",
          "Melhorar apresentação dos pratos premium",
          "Implementar programa de fidelidade"
        ],
        completed: false
      },
      {
        id: "optimize-fixed-costs",
        title: "Otimizar Custos Fixos",
        description: "Custos fixos representam 35% da receita",
        priority: 2,
        category: "financial",
        impact: "medium",
        effort: "high",
        estimatedGain: 1800,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        actionSteps: [
          "Renegociar contrato de aluguel",
          "Revisar seguros e contratos de manutenção",
          "Otimizar consumo de energia elétrica",
          "Avaliar terceirização de serviços"
        ],
        completed: false
      },
      {
        id: "implement-delivery",
        title: "Expandir Canal de Delivery",
        description: "Potencial de 25% a mais em receita",
        priority: 3,
        category: "strategic",
        impact: "high",
        effort: "high",
        estimatedGain: 12500,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
        actionSteps: [
          "Pesquisar plataformas de delivery",
          "Adaptar cardápio para delivery",
          "Estruturar operação de entrega",
          "Definir estratégia de marketing digital"
        ],
        completed: false
      }
    ];
  };

  useEffect(() => {
    const storedActions = localStorage.getItem("priorityActions");
    if (storedActions) {
      setActions(JSON.parse(storedActions));
    } else {
      const newActions = generatePriorityActions();
      setActions(newActions);
      localStorage.setItem("priorityActions", JSON.stringify(newActions));
    }
  }, []);

  const markAsCompleted = (actionId: string) => {
    const updatedActions = actions.map(action => 
      action.id === actionId ? { ...action, completed: true } : action
    );
    setActions(updatedActions);
    localStorage.setItem("priorityActions", JSON.stringify(updatedActions));
    
    const completedAction = actions.find(a => a.id === actionId);
    toast({
      title: "Ação Concluída! 🎉",
      description: `"${completedAction?.title}" foi marcada como concluída`,
    });
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 2:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "border-red-200 bg-red-50";
      case 2:
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "Urgente";
      case 2:
        return "Importante";
      default:
        return "Pode Esperar";
    }
  };

  const getEffortBadge = (effort: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[effort as keyof typeof colors];
  };

  const filteredActions = actions.filter(action => {
    if (filter === "all") return true;
    if (filter === "urgent") return action.priority === 1 && !action.completed;
    if (filter === "important") return action.priority === 2 && !action.completed;
    if (filter === "completed") return action.completed;
    return true;
  });

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Centro de Ações Prioritárias
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas ({actions.length})
          </Button>
          <Button 
            variant={filter === "urgent" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("urgent")}
          >
            Urgentes ({actions.filter(a => a.priority === 1 && !a.completed).length})
          </Button>
          <Button 
            variant={filter === "important" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("important")}
          >
            Importantes ({actions.filter(a => a.priority === 2 && !a.completed).length})
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Concluídas ({actions.filter(a => a.completed).length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma ação encontrada para este filtro
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const daysLeft = getDaysUntilDeadline(action.deadline);
            
            return (
              <Alert key={action.id} className={`${getPriorityColor(action.priority)} ${action.completed ? 'opacity-60' : ''}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {action.completed ? 
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" /> :
                        getPriorityIcon(action.priority)
                      }
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <AlertDescription className="text-xs">
                          {action.description}
                        </AlertDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`text-xs ${action.completed ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {action.completed ? 'Concluída' : getPriorityLabel(action.priority)}
                      </Badge>
                      {action.estimatedGain && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          +{formatCurrency(action.estimatedGain)}/mês
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!action.completed && (
                    <>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={getEffortBadge(action.effort)}>
                          Esforço: {action.effort === 'low' ? 'Baixo' : action.effort === 'medium' ? 'Médio' : 'Alto'}
                        </Badge>
                        <Badge variant="outline">
                          Impacto: {action.impact === 'high' ? 'Alto' : action.impact === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                        {daysLeft !== null && (
                          <Badge variant="outline" className={daysLeft <= 7 ? 'bg-red-100 text-red-800' : ''}>
                            {daysLeft > 0 ? `${daysLeft} dias` : 'Vencido'}
                          </Badge>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                        <p className="text-xs font-medium text-purple-900 mb-2">Passos para Execução:</p>
                        <ul className="text-xs text-purple-800 space-y-1">
                          {action.actionSteps.map((step, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => markAsCompleted(action.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        Marcar como Concluída
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </>
                  )}
                </div>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
