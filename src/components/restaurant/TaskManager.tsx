
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Plus, Filter, Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  titulo: string;
  descricao: string;
  dataLimite: string;
  responsavel: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  criadaEm: string;
  prioridade: 'baixa' | 'media' | 'alta';
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [novaTask, setNovaTask] = useState<{
    titulo: string;
    descricao: string;
    dataLimite: string;
    responsavel: string;
    prioridade: 'baixa' | 'media' | 'alta';
  }>({
    titulo: '',
    descricao: '',
    dataLimite: '',
    responsavel: '',
    prioridade: 'media'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setIsLoading(true);
    try {
      // Para novas contas, limpar qualquer dado antigo de tarefas
      const isNewAccount = !localStorage.getItem('restaurantTasks');
      if (isNewAccount) {
        localStorage.removeItem('restaurantTasks');
        console.log('🧹 Nova conta detectada - localStorage limpo');
      }
      
      // Carregar tarefas do localStorage
      const savedTasks = localStorage.getItem('restaurantTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Nova conta: não há tarefas pré-definidas
        setTasks([]);
        console.log('📝 Nova conta - lista de tarefas vazia');
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!novaTask.titulo || !novaTask.dataLimite || !novaTask.responsavel) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const newTask: Task = {
        id: Date.now().toString(),
        titulo: novaTask.titulo,
        descricao: novaTask.descricao,
        dataLimite: novaTask.dataLimite,
        responsavel: novaTask.responsavel,
        status: 'pendente',
        criadaEm: new Date().toISOString().split('T')[0],
        prioridade: novaTask.prioridade
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('restaurantTasks', JSON.stringify(updatedTasks));

      // Simular notificação
      mockNotification(newTask);

      toast.success('Tarefa criada com sucesso!');
      setIsDialogOpen(false);
      setNovaTask({
        titulo: '',
        descricao: '',
        dataLimite: '',
        responsavel: '',
        prioridade: 'media'
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const mockNotification = (task: Task) => {
    // Mock para futura integração com WhatsApp/SMS
    console.log(`📱 NOTIFICAÇÃO MOCKUP:
    Para: ${task.responsavel}
    Mensagem: "Nova tarefa atribuída: ${task.titulo}
    Prazo: ${new Date(task.dataLimite).toLocaleDateString('pt-BR')}
    Prioridade: ${task.prioridade.toUpperCase()}"`);
    
    toast.success(`📱 Notificação enviada para ${task.responsavel}`);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('restaurantTasks', JSON.stringify(updatedTasks));
    toast.success('Status da tarefa atualizado');
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pendente': return 'destructive';
      case 'em_andamento': return 'secondary';
      case 'concluida': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (prioridade: Task['prioridade']) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pendente': return <AlertCircle className="h-4 w-4" />;
      case 'em_andamento': return <Clock className="h-4 w-4" />;
      case 'concluida': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filtroStatus === 'todos' || task.status === filtroStatus;
    const responsavelMatch = filtroResponsavel === 'todos' || task.responsavel === filtroResponsavel;
    return statusMatch && responsavelMatch;
  });

  const tasksPendentes = tasks.filter(task => task.status === 'pendente').length;
  const tasksEmAndamento = tasks.filter(task => task.status === 'em_andamento').length;
  const tasksConcluidas = tasks.filter(task => task.status === 'concluida').length;

  // Responsáveis únicos para filtro
  const responsaveisUnicos = Array.from(new Set(tasks.map(task => task.responsavel)));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{tasksPendentes}</div>
            <p className="text-xs text-muted-foreground">tarefas para fazer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{tasksEmAndamento}</div>
            <p className="text-xs text-muted-foreground">tarefas iniciadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tasksConcluidas}</div>
            <p className="text-xs text-muted-foreground">tarefas finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex gap-2">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {responsaveisUnicos.map(responsavel => (
                <SelectItem key={responsavel} value={responsavel}>
                  {responsavel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha as informações da tarefa para sua equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Ex: Revisar cardápio"
                  value={novaTask.titulo}
                  onChange={(e) => setNovaTask(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Detalhes da tarefa..."
                  value={novaTask.descricao}
                  onChange={(e) => setNovaTask(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data Limite *</label>
                  <Input
                    type="date"
                    value={novaTask.dataLimite}
                    onChange={(e) => setNovaTask(prev => ({ ...prev, dataLimite: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select 
                    value={novaTask.prioridade} 
                    onValueChange={(value: 'baixa' | 'media' | 'alta') => 
                      setNovaTask(prev => ({ ...prev, prioridade: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Responsável *</label>
                <Input
                  placeholder="Nome do responsável"
                  value={novaTask.responsavel}
                  onChange={(e) => setNovaTask(prev => ({ ...prev, responsavel: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTask} className="flex-1">
                  Criar Tarefa
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Tarefas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Lista de Tarefas
          </CardTitle>
          <CardDescription>
            Gerencie e acompanhe todas as tarefas da sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.titulo}</div>
                          {task.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {task.descricao.length > 50 
                                ? `${task.descricao.substring(0, 50)}...` 
                                : task.descricao
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{task.responsavel}</TableCell>
                      <TableCell>
                        {new Date(task.dataLimite).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${getPriorityColor(task.prioridade)}`}>
                          {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status)} className="gap-1">
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Nenhuma tarefa encontrada
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Tarefas Vencendo */}
      {tasks.some(task => {
        const today = new Date();
        const deadline = new Date(task.dataLimite);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0 && task.status !== 'concluida';
      }) && (
        <Alert className="border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-orange-800">
                🔔 Tarefas vencendo nos próximos 3 dias:
              </span>
              <div className="space-y-1">
                {tasks
                  .filter(task => {
                    const today = new Date();
                    const deadline = new Date(task.dataLimite);
                    const diffTime = deadline.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 3 && diffDays >= 0 && task.status !== 'concluida';
                  })
                  .map(task => (
                    <div key={task.id} className="text-sm">
                      <strong>{task.titulo}</strong> - {task.responsavel} 
                      <span className="text-orange-700">
                        {' '}(prazo: {new Date(task.dataLimite).toLocaleDateString('pt-BR')})
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
