
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Megaphone, 
  Send, 
  User, 
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiType: 'manager' | 'social';
  imageUrl?: string;
  queryType?: 'system_query' | 'direct_ai';
}

interface AIChatProps {
  aiType: 'manager' | 'social';
  context: any;
}

export function AIChat({ aiType, context }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    console.log('🚀 sendMessage iniciado - Input:', inputMessage);
    console.log('🚀 Loading state:', isLoading);
    
    if (!inputMessage.trim() || isLoading) {
      console.log('❌ Condição de saída - Input vazio ou carregando');
      return;
    }

    console.log('✅ Iniciando processo de envio da mensagem');

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      aiType: aiType
    };

    setMessages(prev => [...prev, userMessage]);

    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔐 Verificando autenticação...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Usuário autenticado:', user.id);

      const requestPayload = {
        userId: user.id,
        restaurantId: context?.restaurantId || null,
        message: currentInput,
        aiType: aiType,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Fazendo requisição para IA externa...');
      console.log('📤 Payload:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch('https://restauria.app.n8n.cloud/webhook/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('📨 Status da resposta:', response.status);

      if (!response.ok) {
        console.log('❌ Resposta HTTP não OK:', response.status, response.statusText);
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📥 Resposta bruta recebida:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parseado com sucesso:', data);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        throw new Error('Resposta da API não é um JSON válido');
      }

      let aiResponseContent = '';
      
      if (data.response) {
        aiResponseContent = data.response;
      } else if (data.reply) {
        aiResponseContent = data.reply;
      } else if (data.message) {
        aiResponseContent = data.message;
      } else if (data.content) {
        aiResponseContent = data.content;
      } else if (data.answer) {
        aiResponseContent = data.answer;
      } else if (typeof data === 'string') {
        aiResponseContent = data;
      } else {
        console.warn('⚠️ Estrutura de resposta não reconhecida:', data);
        aiResponseContent = 'Recebi uma resposta da IA, mas não consegui interpretá-la corretamente.';
      }

      console.log('💬 Conteúdo da resposta da IA:', aiResponseContent);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
        aiType: aiType,
        queryType: 'system_query',
        imageUrl: data.imageUrl
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log('✅ Resposta da IA adicionada às mensagens');
      toast.success('Resposta recebida da IA!');

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Desculpe, estou enfrentando dificuldades técnicas no momento. Erro: ${error.message}. Tente novamente em alguns instantes.`,
        timestamp: new Date(),
        aiType: aiType
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro ao comunicar com a IA. Tente novamente.');
    } finally {
      console.log('🏁 Finalizando sendMessage');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    toast.success(`Histórico do ${aiType === 'manager' ? 'Gerente Virtual' : 'Social Media'} limpo!`);
  };

  const getPlaceholderText = () => {
    if (aiType === 'manager') {
      return 'Ex: "Qual foi meu faturamento total na semana passada?" ou "Como está meu estoque de ingredientes?"';
    }
    return 'Ex: "Crie uma campanha para promoção de pizza" ou "Que hashtags usar para posts de sobremesas?"';
  };

  const getQuickActions = () => {
    if (aiType === 'manager') {
      return [
        "Qual foi meu faturamento da semana passada?",
        "Como está meu estoque atual?",
        "Quais são minhas metas pendentes?",
        "Análise do fluxo de caixa do mês"
      ];
    }
    return [
      "Criar post para nova promoção",
      "Gerar imagem de prato especial",
      "Sugerir hashtags populares",
      "Planejar calendário editorial"
    ];
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          {aiType === 'manager' ? (
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          ) : (
            <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
          )}
          <span className="hidden sm:inline">
            {aiType === 'manager' ? 'Gerente Virtual - Assistente Inteligente' : 'Social Media IA - Marketing Digital'}
          </span>
          <span className="sm:hidden">
            {aiType === 'manager' ? 'Gerente Virtual' : 'Social Media IA'}
          </span>
          {context?.restaurantId && (
            <Badge variant="default" className="text-xs bg-green-600">
              Sistema Conectado
            </Badge>
          )}
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {aiType === 'manager' 
            ? 'Faça perguntas sobre seus dados reais: faturamento, estoque, metas e muito mais.'
            : 'Especialista em redes sociais, criação de conteúdo, imagens e campanhas.'
          }
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col">
        <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
          <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {aiType === 'manager' ? (
                  <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mb-4" />
                ) : (
                  <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600 mb-4" />
                )}
                <h3 className="font-medium mb-2 text-sm sm:text-base">
                  Olá! Sou {aiType === 'manager' ? 'seu Gerente Virtual Inteligente' : 'sua Social Media IA'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                  {aiType === 'manager' 
                    ? 'Posso consultar seus dados reais para responder sobre vendas, estoque, metas e muito mais.'
                    : 'Estou aqui para criar conteúdo, imagens e estratégias de marketing para suas redes sociais.'
                  }
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 max-w-md">
                  {getQuickActions().map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(action)}
                      className="text-xs sm:text-sm"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                        message.type === 'user'
                          ? aiType === 'manager' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'assistant' && (
                          <div className="flex items-center gap-1">
                            {aiType === 'manager' ? (
                              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-blue-600 flex-shrink-0" />
                            ) : (
                              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-pink-600 flex-shrink-0" />
                            )}
                            {message.queryType === 'system_query' && (
                              <Badge variant="secondary" className="text-xs">Sistema</Badge>
                            )}
                          </div>
                        )}
                        {message.type === 'user' && (
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.imageUrl && (
                            <img
                              src={message.imageUrl}
                              alt="Imagem gerada pela IA"
                              className="mt-2 rounded-lg max-w-full"
                            />
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="p-2 sm:p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder={getPlaceholderText()}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mt-2 flex-shrink-0">
          <span>
            {messages.length} mensagens nesta conversa
          </span>
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs sm:text-sm">
            Limpar histórico
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
