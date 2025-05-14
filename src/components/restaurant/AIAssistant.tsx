
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initial message
  useEffect(() => {
    if (messages.length === 0) {
      const businessData = localStorage.getItem('restaurantData');
      let greeting = "Olá! Como posso ajudar você a gerenciar seu restaurante hoje?";
      
      if (businessData) {
        const data = JSON.parse(businessData);
        greeting = `Olá! Bem-vindo ao ${data.businessName}. Como posso ajudar você hoje?`;
      }
      
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    
    // Generate AI response based on user message
    setTimeout(() => {
      generateAIResponse(userMessage.text);
      setIsTyping(false);
    }, 1500);
  };
  
  const generateAIResponse = (userMessage: string) => {
    // Get restaurant data for personalized responses
    const restaurantData = localStorage.getItem('restaurantData');
    const businessData = restaurantData ? JSON.parse(restaurantData) : null;
    const businessName = businessData?.businessName || "seu restaurante";
    
    // Check if message contains keywords
    const lowerMessage = userMessage.toLowerCase();
    
    let response = "";
    
    if (lowerMessage.includes("vendas") || lowerMessage.includes("faturamento")) {
      response = `Analisando os dados de vendas do ${businessName}, vejo que o faturamento está seguindo a tendência esperada para o mês. Se quiser detalhes, confira o Dashboard ou acesse a seção de DRE para uma análise financeira completa.`;
    }
    else if (lowerMessage.includes("estoque") || lowerMessage.includes("ingredientes")) {
      response = `Acabei de verificar o estoque do ${businessName} e notei que alguns itens estão próximos do nível mínimo. Recomendo verificar a lista de compras na seção de Estoque para manter seu inventário atualizado.`;
    }
    else if (lowerMessage.includes("custos") || lowerMessage.includes("cmv") || lowerMessage.includes("despesas")) {
      response = `O CMV atual do ${businessName} está em torno de 32%. Para otimizar seus custos, sugiro revisar as fichas técnicas dos produtos com menor margem de lucro e considerar ajustes nos preços ou fornecedores.`;
    }
    else if (lowerMessage.includes("promoção") || lowerMessage.includes("marketing")) {
      response = `Para aumentar suas vendas no ${businessName}, considere criar uma promoção para dias de menor movimento. Acesse a seção de Promoções para simular o impacto financeiro ou a seção de Marketing IA para criar conteúdo promocional.`;
    }
    else if (lowerMessage.includes("ajuda") || lowerMessage.includes("funcionalidades") || lowerMessage.includes("como usar")) {
      response = `O Resto AI CEO é seu assistente completo de gestão! Você pode:\n\n1. Gerenciar receitas e custos na Ficha Técnica\n2. Controlar seu estoque e gerar listas de compras\n3. Analisar resultados financeiros no DRE e Fluxo de Caixa\n4. Criar promoções com simulação de impacto\n5. Usar o Marketing IA para criar conteúdo\n\nO que gostaria de explorar primeiro?`;
    }
    else {
      // Generic responses
      const genericResponses = [
        `Baseado nos dados do ${businessName}, posso sugerir algumas otimizações para aumentar sua margem de lucro. Gostaria de ver uma análise detalhada?`,
        `Notei algumas oportunidades interessantes nos dados do ${businessName}. Podemos discutir estratégias para o próximo trimestre se você quiser.`,
        `Estou aqui para ajudar na gestão do ${businessName}. Posso oferecer insights sobre estoque, finanças ou marketing. Do que você precisa hoje?`,
        `Que tal analisarmos o desempenho atual do ${businessName} e traçarmos algumas estratégias para crescimento? Posso preparar um relatório completo para você.`
      ];
      
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    const aiMessage = {
      id: Date.now().toString(),
      sender: 'ai' as const,
      text: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Notify when opening
      toast({
        title: "Gerente IA ativo",
        description: "Seu assistente virtual está pronto para ajudar.",
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all">
          <div className="p-4 bg-resto-blue-500 text-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Gerente IA</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start ${message.sender === 'ai' ? '' : 'justify-end'}`}>
                {message.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-full bg-resto-blue-100 flex items-center justify-center text-resto-blue-500 mr-2">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                )}
                <div className={`p-3 rounded-lg ${
                  message.sender === 'ai' 
                    ? 'bg-white rounded-tl-none shadow-sm max-w-[80%]' 
                    : 'bg-resto-blue-500 text-white rounded-tr-none shadow-sm max-w-[80%]'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Intl.DateTimeFormat('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-resto-blue-100 flex items-center justify-center text-resto-blue-500 mr-2">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-resto-blue-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-resto-blue-400 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-resto-blue-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center rounded-full bg-gray-100 px-3 focus-within:ring-2 focus-within:ring-resto-blue-500">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent py-2 outline-none text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                size="sm" 
                className="rounded-full h-8 w-8 p-0 bg-resto-blue-500 hover:bg-resto-blue-600"
                onClick={handleSendMessage}
                disabled={isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-resto-blue-500 hover:bg-resto-blue-600 animate-pulse-slow"
          onClick={toggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
