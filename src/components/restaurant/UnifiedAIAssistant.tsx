
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Megaphone, 
  Send, 
  Bot, 
  User, 
  Download,
  Star,
  MessageCircle,
  Image as ImageIcon,
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiType: 'manager' | 'social';
  imageUrl?: string;
}

interface ChatHistory {
  manager: Message[];
  social: Message[];
}

interface RestaurantContext {
  restaurantData: any;
  menuData: any;
  financialData: any;
  simulatorData: any;
}

export function UnifiedAIAssistant() {
  const [activeTab, setActiveTab] = useState<'manager' | 'social'>('manager');
  const [messages, setMessages] = useState<ChatHistory>({
    manager: [],
    social: []
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<RestaurantContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar contexto do restaurante
  useEffect(() => {
    loadRestaurantContext();
  }, []);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRestaurantContext = () => {
    try {
      // Carregar dados do localStorage (ou integrar com API do Supabase)
      const restaurantData = JSON.parse(localStorage.getItem('restaurantData') || '{}');
      const menuData = JSON.parse(localStorage.getItem('menuItems') || '[]');
      const financialData = JSON.parse(localStorage.getItem('cashFlowData') || '[]');
      const simulatorData = JSON.parse(localStorage.getItem('simulatorData') || '{}');

      setContext({
        restaurantData,
        menuData,
        financialData,
        simulatorData
      });
    } catch (error) {
      console.error('Erro ao carregar contexto do restaurante:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      aiType: activeTab
    };

    setMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], userMessage]
    }));

    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          aiType: activeTab,
          context: context,
          conversationHistory: messages[activeTab].slice(-10) // Últimas 10 mensagens para contexto
        })
      });

      if (!response.ok) throw new Error('Erro na comunicação com a IA');

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.reply || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
        aiType: activeTab,
        imageUrl: data.imageUrl // Para imagens do Social Media IA
      };

      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], aiMessage]
      }));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao comunicar com a IA. Tente novamente.');
      
      // Mensagem de erro da IA
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, estou enfrentando dificuldades técnicas. Pode tentar novamente em alguns instantes?',
        timestamp: new Date(),
        aiType: activeTab
      };

      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], errorMessage]
      }));
    } finally {
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
    setMessages(prev => ({
      ...prev,
      [activeTab]: []
    }));
    toast.success(`Histórico do ${activeTab === 'manager' ? 'Gerente Virtual' : 'Social Media'} limpo!`);
  };

  const exportHistory = () => {
    const historyData = messages[activeTab];
    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado com sucesso!');
  };

  const currentMessages = messages[activeTab];

  const getPlaceholderText = () => {
    if (activeTab === 'manager') {
      return 'Ex: "Como calcular a margem ideal para o meu prato principal?" ou "Preciso de ajuda com gestão de equipe"';
    }
    return 'Ex: "Crie uma imagem promocional para pizza" ou "Que hashtags usar para posts de sobremesas?"';
  };

  const getQuickActions = () => {
    if (activeTab === 'manager') {
      return [
        "Analisar meu cardápio atual",
        "Calcular ponto de equilíbrio",
        "Dicas para reduzir custos",
        "Como treinar minha equipe",
        "Estratégias de precificação"
      ];
    }
    return [
      "Criar post para nova promoção",
      "Gerar imagem de prato especial",
      "Sugerir hashtags populares",
      "Planejar calendário editorial",
      "Analisar melhor horário para posts"
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assistentes IA</h2>
          <p className="text-muted-foreground">
            Dois assistentes especializados para gestão e marketing do seu restaurante
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRestaurantContext}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Contexto
          </Button>
          <Button variant="outline" onClick={exportHistory}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manager' | 'social')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Gerente Virtual
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Social Media IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Gerente Virtual - Assistente de Gestão
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Especialista em administração, finanças, operação e gestão de equipe. 
                Integrado com todos os dados do seu restaurante.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Area */}
              <div className="border rounded-lg h-96">
                <ScrollArea className="h-80 p-4">
                  {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Brain className="h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="font-medium mb-2">Olá! Sou seu Gerente Virtual</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Estou aqui para ajudar com gestão, finanças, operação e estratégias do seu restaurante.
                      </p>
                      <div className="flex flex-wrap gap-2 max-w-md">
                        {getQuickActions().map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage(action)}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.type === 'assistant' && (
                                <Brain className="h-4 w-4 mt-1 text-blue-600" />
                              )}
                              {message.type === 'user' && (
                                <User className="h-4 w-4 mt-1" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

                {/* Input Area */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={getPlaceholderText()}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isLoading || !inputMessage.trim()}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {currentMessages.length} mensagens nesta conversa
                </span>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Limpar histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-pink-600" />
                Social Media IA - Marketing Digital
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Especialista em redes sociais, criação de conteúdo, imagens e campanhas. 
                Gera posts e visuais personalizados para seu restaurante.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Area */}
              <div className="border rounded-lg h-96">
                <ScrollArea className="h-80 p-4">
                  {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Megaphone className="h-12 w-12 text-pink-600 mb-4" />
                      <h3 className="font-medium mb-2">Olá! Sou sua Social Media IA</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Estou aqui para criar conteúdo, imagens e estratégias de marketing para suas redes sociais.
                      </p>
                      <div className="flex flex-wrap gap-2 max-w-md">
                        {getQuickActions().map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage(action)}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-pink-600 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.type === 'assistant' && (
                                <Megaphone className="h-4 w-4 mt-1 text-pink-600" />
                              )}
                              {message.type === 'user' && (
                                <User className="h-4 w-4 mt-1" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

                {/* Input Area */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={getPlaceholderText()}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isLoading || !inputMessage.trim()}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {currentMessages.length} mensagens nesta conversa
                </span>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Limpar histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Context Info */}
      {context && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contexto do Restaurante Carregado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Badge variant="outline">Restaurante</Badge>
                <p className="mt-1">{context.restaurantData.name || 'Não configurado'}</p>
              </div>
              <div>
                <Badge variant="outline">Itens do Menu</Badge>
                <p className="mt-1">{context.menuData.length || 0} itens</p>
              </div>
              <div>
                <Badge variant="outline">Registros Financeiros</Badge>
                <p className="mt-1">{context.financialData.length || 0} registros</p>
              </div>
              <div>
                <Badge variant="outline">Dados do Simulador</Badge>
                <p className="mt-1">{Object.keys(context.simulatorData).length > 0 ? 'Configurado' : 'Pendente'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
