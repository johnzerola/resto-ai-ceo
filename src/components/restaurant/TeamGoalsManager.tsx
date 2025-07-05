import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface TeamGoal {
  id: string;
  meta: string;
  valorMeta: number;
  valorAtual: number;
  periodo: 'diario' | 'semanal' | 'mensal';
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  status: 'ativa' | 'pausada' | 'concluida';
  categoria: 'vendas' | 'atendimento' | 'qualidade' | 'operacional';
}

export function TeamGoalsManager() {
  const [goals, setGoals] = useState<TeamGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [novaMeta, setNovaMeta] = useState<{
    meta: string;
    valorMeta: string;
    periodo: 'diario' | 'semanal' | 'mensal';
    responsavel: string;
    categoria: 'vendas' | 'atendimento' | 'qualidade' | 'operacional';
  }>({
    meta: '',
    valorMeta: '',
    periodo: 'diario',
    responsavel: '',
    categoria: 'vendas'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    setIsLoading(true);
    try {
      // Simular carregamento de metas
      const savedGoals = localStorage.getItem('teamGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        // Dados mockados para demonstração
        const mockGoals: TeamGoal[] = [
          {
            id: '1',
            meta: 'Vender R$ 2.000 por dia',
            valorMeta: 2000,
            valorAtual: 1450,
            periodo: 'diario',
            responsavel: 'Equipe Vendas',
            dataInicio: '2025-01-01',
            dataFim: '2025-01-31',
            status: 'ativa',
            categoria: 'vendas'
          },
          {
            id: '2',
            meta: 'Atender 50 clientes por dia',
            valorMeta: 50,
            valorAtual: 35,
            periodo: 'diario',
            responsavel: 'Equipe Atendimento',
            dataInicio: '2025-01-01',
            dataFim: '2025-01-31',
            status: 'ativa',
            categoria: 'atendimento'
          },
          {
            id: '3',
            meta: 'Manter CMV em 30%',
            valorMeta: 30,
            valorAtual: 28.5,
            periodo: 'mensal',
            responsavel: 'Chef Principal',
            dataInicio: '2025-01-01',
            dataFim: '2025-01-31',
            status: 'ativa',
            categoria: 'operacional'
          }
        ];
        setGoals(mockGoals);
        localStorage.setItem('teamGoals', JSON.stringify(mockGoals));
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast.error('Erro ao carregar metas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!novaMeta.meta || !novaMeta.valorMeta || !novaMeta.responsavel) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const valorMeta = parseFloat(novaMeta.valorMeta);
      if (isNaN(valorMeta) || valorMeta <= 0) {
        toast.error('Valor da meta deve ser um número positivo');
        return;
      }

      const dataAtual = new Date();
      let dataFim = new Date();
      
      // Calcular data fim baseada no período
      switch (novaMeta.periodo) {
        case 'diario':
          dataFim.setDate(dataFim.getDate() + 1);
          break;
        case 'semanal':
          dataFim.setDate(dataFim.getDate() + 7);
          break;
        case 'mensal':
          dataFim.setMonth(dataFim.getMonth() + 1);
          break;
      }

      const newGoal: TeamGoal = {
        id: Date.now().toString(),
        meta: novaMeta.meta,
        valorMeta,
        valorAtual: 0,
        periodo: novaMeta.periodo,
        responsavel: novaMeta.responsavel,
        dataInicio: dataAtual.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0],
        status: 'ativa',
        categoria: novaMeta.categoria
      };

      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      localStorage.setItem('teamGoals', JSON.stringify(updatedGoals));

      toast.success('Meta criada com sucesso!');
      setIsDialogOpen(false);
      setNovaMeta({
        meta: '',
        valorMeta: '',
        periodo: 'diario',
        responsavel: '',
        categoria: 'vendas'
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
    }
  };

  const calculateProgress = (goal: TeamGoal) => {
    return Math.min((goal.valorAtual / goal.valorMeta) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (categoria: TeamGoal['categoria']) => {
    switch (categoria) {
      case 'vendas': return '💰';
      case 'atendimento': return '👥';
      case 'qualidade': return '⭐';
      case 'operacional': return '⚙️';
      default: return '🎯';
    }
  };

  const formatValue = (value: number, categoria: TeamGoal['categoria']) => {
    if (categoria === 'vendas') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Metas da Equipe
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das metas e motive sua equipe
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma meta motivadora para sua equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Descrição da Meta *</label>
                  <Input
                    placeholder="Ex: Vender R$ 2.000 por dia"
                    value={novaMeta.meta}
                    onChange={(e) => setNovaMeta(prev => ({ ...prev, meta: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Valor da Meta *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="2000"
                      value={novaMeta.valorMeta}
                      onChange={(e) => setNovaMeta(prev => ({ ...prev, valorMeta: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Período</label>
                    <Select 
                      value={novaMeta.periodo} 
                      onValueChange={(value: 'diario' | 'semanal' | 'mensal') => 
                        setNovaMeta(prev => ({ ...prev, periodo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Select 
                      value={novaMeta.categoria} 
                      onValueChange={(value: 'vendas' | 'atendimento' | 'qualidade' | 'operacional') => 
                        setNovaMeta(prev => ({ ...prev, categoria: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendas">💰 Vendas</SelectItem>
                        <SelectItem value="atendimento">👥 Atendimento</SelectItem>
                        <SelectItem value="qualidade">⭐ Qualidade</SelectItem>
                        <SelectItem value="operacional">⚙️ Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Responsável *</label>
                    <Input
                      placeholder="Nome do responsável"
                      value={novaMeta.responsavel}
                      onChange={(e) => setNovaMeta(prev => ({ ...prev, responsavel: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateGoal} className="flex-1">
                    Criar Meta
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = calculateProgress(goal);
              return (
                <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryIcon(goal.categoria)}</span>
                        <h4 className="font-medium">{goal.meta}</h4>
                        <Badge variant="outline" className="text-xs">
                          {goal.periodo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Responsável: {goal.responsavel}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatValue(goal.valorAtual, goal.categoria)} / {formatValue(goal.valorMeta, goal.categoria)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {progress.toFixed(1)}% concluído
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Início: {new Date(goal.dataInicio).toLocaleDateString('pt-BR')}</span>
                      <span>Fim: {new Date(goal.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  {progress >= 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <Trophy className="h-4 w-4" />
                      Meta alcançada! Parabéns! 🎉
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Target className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma meta cadastrada ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Crie metas para motivar sua equipe e acompanhar resultados
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}