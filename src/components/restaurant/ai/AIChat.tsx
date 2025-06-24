
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
    console.log('🚀 [AIChat] === INICIANDO ENVIO DE MENSAGEM ===');
    
    if (!inputMessage.trim()) {
      console.log('❌ [AIChat] Mensagem vazia');
      return;
    }

    if (isLoading) {
      console.log('❌ [AIChat] Já está processando');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      aiType: aiType
    };

    console.log('✅ [AIChat] Adicionando mensagem do usuário:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔐 [AIChat] Obtendo usuário autenticado...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ [AIChat] Usuário:', user.email);

      const payload = {
        userId: user.id,
        restaurantId: context?.restaurantId || null,
        message: messageToSend,
        aiType: aiType,
        timestamp: new Date().toISOString()
      };

      console.log('📦 [AIChat] Payload preparado:', JSON.stringify(payload, null, 2));

      const webhookUrl = 'https://restauria.app.n8n.cloud/webhook/ai-assistant';
      console.log('🌐 [AIChat] Fazendo requisição POST para:', webhookUrl);
      console.log('📡 [AIChat] Iniciando fetch...');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📨 [AIChat] Response status:', response.status);
      console.log('📨 [AIChat] Response statusText:', response.statusText);
      console.log('📨 [AIChat] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AIChat] Erro HTTP:', response.status, response.statusText, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📥 [AIChat] Response text completo:', responseText);

      if (!responseText.trim()) {
        throw new Error('Resposta vazia do servidor');
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ [AIChat] JSON parseado com sucesso:', responseData);
      } catch (parseError) {
        console.error('❌ [AIChat] Erro ao parsear JSON:', parseError);
        console.log('📄 [AIChat] Texto da resposta que falhou no parse:', responseText);
        throw new Error(`Resposta não é JSON válido: ${responseText.substring(0, 200)}...`);
      }

      let aiContent = '';
      if (responseData.response) {
        aiContent = responseData.response;
      } else if (responseData.reply) {
        aiContent = responseData.reply;
      } else if (responseData.message) {
        aiContent = responseData.message;
      } else if (responseData.content) {
        aiContent = responseData.content;
      } else if (typeof responseData === 'string') {
        aiContent = responseData;
      } else {
        console.log('⚠️ [AIChat] Formato de resposta não reconhecido:', responseData);
        aiContent = `Resposta recebida: ${JSON.stringify(responseData, null, 2)}`;
      }

      console.log('💬 [AIChat] Conteúdo final da IA:', aiContent);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        aiType: aiType,
        imageUrl: responseData.imageUrl
      };

      console.log('✅ [AIChat] Adicionando resposta da IA:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);
      toast.success('Resposta recebida da IA!');

    } catch (error) {
      console.error('❌ [AIChat] ERRO COMPLETO:', error);
      console.error('❌ [AIChat] Stack trace:', error.stack);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Erro ao processar sua mensagem: ${error.message}

Detalhes técnicos:
- URL: https://restauria.app.n8n.cloud/webhook/ai-assistant
- Método: POST
- Erro: ${error.message}

Por favor, verifique os logs do console para mais detalhes.`,
        timestamp: new Date(),
        aiType: aiType
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error(`Erro na comunicação: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🏁 [AIChat] === FIM DO PROCESSAMENTO ===');
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
      return 'Ex: "Qual foi meu faturamento total na semana passada?"';
    }
    return 'Ex: "Crie uma campanha para promoção de pizza"';
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
                          aiType === 'manager' ? (
                            <Brain className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-pink-600 flex-shrink-0" />
                          )
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
