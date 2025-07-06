
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Megaphone, 
  Send, 
  User, 
  Lock,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiType: 'manager' | 'social';
}

interface AILimitedChatProps {
  aiType: 'manager' | 'social';
}

export function AILimitedChat({ aiType }: AILimitedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const sendLimitedMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      aiType: aiType
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const limitedResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `Olá! Sou o ${aiType === 'manager' ? 'Gerente Virtual' : 'Social Media IA'} do RestaurIA. 

Esta funcionalidade está limitada no seu plano atual. Para ter acesso completo a todas as minhas capacidades, incluindo:

${aiType === 'manager' ? 
  '• Análises financeiras avançadas\n• Relatórios personalizados\n• Sugestões estratégicas detalhadas\n• Integração completa com seus dados' :
  '• Geração de imagens promocionais\n• Criação de campanhas completas\n• Análise de tendências\n• Estratégias de marketing avançadas'
}

Faça upgrade para o plano Profissional e tenha acesso completo ao meu potencial!`,
      timestamp: new Date(),
      aiType: aiType
    };

    setTimeout(() => {
      setMessages(prev => [...prev, limitedResponse]);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <Alert className="border-amber-200 bg-amber-50 flex-shrink-0">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs sm:text-sm">Assistente IA com funcionalidades limitadas no seu plano atual.</span>
          <Button size="sm" asChild>
            <Link to="/assinatura">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            {aiType === 'manager' ? (
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            ) : (
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
            )}
            <span className="hidden sm:inline">
              {aiType === 'manager' ? 'Gerente Virtual' : 'Social Media IA'}
            </span>
            <span className="sm:hidden">
              {aiType === 'manager' ? 'Gerente' : 'Social'}
            </span>
            <Badge variant="outline" className="text-xs">Versão Limitada</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col">
          <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative">
                    {aiType === 'manager' ? (
                      <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mb-4" />
                    ) : (
                      <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600 mb-4" />
                    )}
                    <Lock className="h-4 w-4 sm:h-6 sm:w-6 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-amber-500 text-white rounded-full p-1" />
                  </div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">
                    {aiType === 'manager' ? 'Gerente Virtual' : 'Social Media IA'} - Versão Limitada
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md px-2">
                    Você pode fazer perguntas básicas, mas as respostas serão limitadas. 
                    Upgrade para o plano Profissional para acesso completo.
                  </p>
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
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator />

            <div className="p-2 sm:p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta (funcionalidade limitada)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendLimitedMessage();
                    }
                  }}
                  className="text-xs sm:text-sm"
                />
                <Button onClick={sendLimitedMessage} disabled={!inputMessage.trim()} size="sm">
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
