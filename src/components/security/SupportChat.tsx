
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportChatService, SupportTicket, SupportMessage } from "@/services/SupportChatService";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Clock, 
  User, 
  Bot,
  Headphones,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export function SupportChat() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "technical" as const
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
    supportChatService.connect();
    
    return () => {
      supportChatService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const loadTickets = () => {
    setTickets(supportChatService.getTickets());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createTicket = () => {
    if (!newTicketForm.title || !newTicketForm.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const ticket = supportChatService.createTicket(
      newTicketForm.title,
      newTicketForm.description,
      newTicketForm.priority,
      newTicketForm.category
    );

    setSelectedTicket(ticket);
    setShowNewTicket(false);
    setNewTicketForm({
      title: "",
      description: "",
      priority: "medium",
      category: "technical"
    });
    loadTickets();
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    supportChatService.addMessage(selectedTicket.id, newMessage);
    setNewMessage("");
    
    // Recarregar ticket atualizado
    const updatedTicket = supportChatService.getTicket(selectedTicket.id);
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
    loadTickets();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'user': return <User className="h-4 w-4" />;
      case 'support': return <Headphones className="h-4 w-4" />;
      case 'bot': return <Bot className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const stats = supportChatService.getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat de Suporte</h2>
          <p className="text-muted-foreground">
            Obtenha ajuda e suporte técnico
          </p>
        </div>
        <Button onClick={() => setShowNewTicket(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Estatísticas do Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tickets Abertos</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Headphones className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">{stats.satisfaction}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tickets */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{ticket.title}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority}
                      </Badge>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum ticket encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ticket #{selectedTicket.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mensagens */}
                  <div className="max-h-96 overflow-y-auto space-y-3 p-4 border rounded-lg bg-gray-50">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.sender === 'bot'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-green-600 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getSenderIcon(message.sender)}
                            <span className="text-xs opacity-75">
                              {message.sender === 'user' ? 'Você' : 
                               message.sender === 'bot' ? 'Bot' : 'Suporte'}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Campo de mensagem */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um ticket para visualizar a conversa
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Modal Novo Ticket */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Novo Ticket de Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input
                  placeholder="Descreva brevemente o problema"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select
                  value={newTicketForm.category}
                  onValueChange={(value: any) => setNewTicketForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="billing">Faturamento</SelectItem>
                    <SelectItem value="feature">Funcionalidade</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <Select
                  value={newTicketForm.priority}
                  onValueChange={(value: any) => setNewTicketForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição *</label>
                <Textarea
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                  Cancelar
                </Button>
                <Button onClick={createTicket}>
                  Criar Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
