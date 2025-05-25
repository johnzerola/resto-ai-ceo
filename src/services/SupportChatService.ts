
import { toast } from "sonner";

export interface SupportMessage {
  id: string;
  message: string;
  sender: 'user' | 'support' | 'bot';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'other';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  assignedAgent?: string;
}

export class SupportChatService {
  private static instance: SupportChatService;
  private tickets: SupportTicket[] = [];
  private isConnected = false;
  private botResponses = new Map<string, string[]>();

  public static getInstance(): SupportChatService {
    if (!SupportChatService.instance) {
      SupportChatService.instance = new SupportChatService();
    }
    return SupportChatService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeBotResponses();
  }

  private loadFromStorage(): void {
    try {
      const tickets = localStorage.getItem('support_tickets');
      if (tickets) this.tickets = JSON.parse(tickets);
    } catch (error) {
      console.error("Erro ao carregar tickets de suporte:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('support_tickets', JSON.stringify(this.tickets));
    } catch (error) {
      console.error("Erro ao salvar tickets de suporte:", error);
    }
  }

  private initializeBotResponses(): void {
    this.botResponses.set('greeting', [
      'Olá! Como posso ajudá-lo hoje?',
      'Seja bem-vindo ao suporte! Em que posso ser útil?',
      'Oi! Estou aqui para ajudá-lo. Qual é sua dúvida?'
    ]);

    this.botResponses.set('backup', [
      'Para fazer backup dos seus dados, acesse Configurações > Backups > Exportar Dados.',
      'Recomendamos fazer backups semanalmente. Você pode configurar backups automáticos na aba de Configurações.'
    ]);

    this.botResponses.set('security', [
      'A segurança dos seus dados é nossa prioridade. Utilizamos criptografia e monitoramento 24/7.',
      'Para questões de segurança, acesse o Centro de Segurança no menu principal.'
    ]);

    this.botResponses.set('performance', [
      'Se está enfrentando lentidão, tente limpar o cache do navegador.',
      'Para melhor performance, recomendamos usar navegadores atualizados como Chrome ou Firefox.'
    ]);

    this.botResponses.set('default', [
      'Entendo sua questão. Um agente humano entrará em contato em breve.',
      'Sua solicitação foi registrada. Tempo de resposta estimado: 2 horas.',
      'Obrigado por entrar em contato. Estamos analisando sua questão.'
    ]);
  }

  // Criar novo ticket
  createTicket(
    title: string, 
    description: string, 
    priority: SupportTicket['priority'] = 'medium',
    category: SupportTicket['category'] = 'technical'
  ): SupportTicket {
    const ticket: SupportTicket = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      status: 'open',
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    // Adicionar mensagem inicial
    const initialMessage: SupportMessage = {
      id: crypto.randomUUID(),
      message: description,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    ticket.messages.push(initialMessage);

    // Resposta automática do bot
    setTimeout(() => {
      this.addBotResponse(ticket.id, this.getBotResponse('greeting'));
    }, 1000);

    this.tickets.push(ticket);
    this.saveToStorage();

    toast.success('Ticket de suporte criado com sucesso!');
    return ticket;
  }

  // Adicionar mensagem ao ticket
  addMessage(ticketId: string, message: string, sender: 'user' | 'support' = 'user'): SupportMessage {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket não encontrado');

    const newMessage: SupportMessage = {
      id: crypto.randomUUID(),
      message,
      sender,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date().toISOString();

    // Atualizar status do ticket
    if (ticket.status === 'waiting' && sender === 'user') {
      ticket.status = 'open';
    }

    // Resposta automática do bot para mensagens do usuário
    if (sender === 'user') {
      setTimeout(() => {
        const response = this.generateBotResponse(message);
        this.addBotResponse(ticketId, response);
      }, 2000);
    }

    this.saveToStorage();
    return newMessage;
  }

  // Adicionar resposta do bot
  private addBotResponse(ticketId: string, message: string): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const botMessage: SupportMessage = {
      id: crypto.randomUUID(),
      message,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };

    ticket.messages.push(botMessage);
    ticket.updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  // Gerar resposta do bot baseada na mensagem
  private generateBotResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('backup') || lowerMessage.includes('exportar')) {
      return this.getBotResponse('backup');
    }

    if (lowerMessage.includes('segurança') || lowerMessage.includes('senha')) {
      return this.getBotResponse('security');
    }

    if (lowerMessage.includes('lento') || lowerMessage.includes('performance')) {
      return this.getBotResponse('performance');
    }

    return this.getBotResponse('default');
  }

  private getBotResponse(category: string): string {
    const responses = this.botResponses.get(category) || this.botResponses.get('default')!;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Atualizar status do ticket
  updateTicketStatus(ticketId: string, status: SupportTicket['status']): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // Conectar/desconectar chat
  connect(): void {
    this.isConnected = true;
    console.log('Chat de suporte conectado');
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('Chat de suporte desconectado');
  }

  // Getters
  getTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  getTicket(id: string): SupportTicket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  getOpenTickets(): SupportTicket[] {
    return this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  }

  isOnline(): boolean {
    return this.isConnected;
  }

  // Estatísticas
  getStats() {
    const total = this.tickets.length;
    const open = this.tickets.filter(t => t.status === 'open').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;
    const avgResponseTime = this.calculateAverageResponseTime();

    return {
      total,
      open,
      resolved,
      avgResponseTime,
      satisfaction: 4.2 // Simulado
    };
  }

  private calculateAverageResponseTime(): number {
    // Calcular tempo médio de resposta (simulado)
    return Math.floor(Math.random() * 120) + 30; // 30-150 minutos
  }
}

export const supportChatService = SupportChatService.getInstance();
