import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Bot, 
  User, 
  Download,
  Star,
  MessageCircle,
  Image as ImageIcon,
  TrendingUp,
  Settings,
  RefreshCw,
  Lock,
  Crown
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { PlanGate } from "@/components/subscription/PlanGate";
import { Link } from "react-router-dom";

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
  const { hasFeature, showUpgradeMessage, planType } = useSubscriptionPlan();
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

  // Função para enviar mensagem limitada (plano essencial)
  const sendLimitedMessage = async () => {
    if (!inputMessage.trim()) return;

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

    // Resposta limitada para plano essencial
    const limitedResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `Olá! Sou o ${activeTab === 'manager' ? 'Gerente Virtual' : 'Social Media IA'} do RestaurIA. 

Esta funcionalidade está limitada no seu plano atual. Para ter acesso completo a todas as minhas capacidades, incluindo:

${activeTab === 'manager' ? 
  '• Análises financeiras avançadas\n• Relatórios personalizados\n• Sugestões estratégicas detalhadas\n• Integração completa com seus dados' :
  '• Geração de imagens promocionais\n• Criação de campanhas completas\n• Análise de tendências\n• Estratégias de marketing avançadas'
}

Faça upgrade para o plano Profissional e tenha acesso completo ao meu potencial!`,
      timestamp: new Date(),
      aiType: activeTab
    };

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], limitedResponse]
      }));
    }, 1000);
  };

  // Renderizar conteúdo baseado no plano
  const renderAIContent = () => {
    if (!hasFeature('hasFullAIAssistant')) {
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

          <div className="flex-1 min-h-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manager' | 'social')} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="manager" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Gerente Virtual</span>
                  <span className="sm:hidden">Gerente</span>
                  <Badge variant="secondary" className="text-xs">Limitado</Badge>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Social Media IA</span>
                  <span className="sm:hidden">Social</span>
                  <Badge variant="secondary" className="text-xs">Limitado</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo limitado para ambas as abas */}
              <TabsContent value={activeTab} className="flex-1 min-h-0 mt-2 sm:mt-4">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      {activeTab === 'manager' ? (
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      ) : (
                        <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                      )}
                      <span className="hidden sm:inline">
                        {activeTab === 'manager' ? 'Gerente Virtual' : 'Social Media IA'}
                      </span>
                      <span className="sm:hidden">
                        {activeTab === 'manager' ? 'Gerente' : 'Social'}
                      </span>
                      <Badge variant="outline" className="text-xs">Versão Limitada</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col">
                    {/* Chat Area Limitado */}
                    <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
                      <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
                        {messages[activeTab].length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative">
                              {activeTab === 'manager' ? (
                                <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mb-4" />
                              ) : (
                                <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600 mb-4" />
                              )}
                              <Lock className="h-4 w-4 sm:h-6 sm:w-6 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-amber-500 text-white rounded-full p-1" />
                            </div>
                            <h3 className="font-medium mb-2 text-sm sm:text-base">
                              {activeTab === 'manager' ? 'Gerente Virtual' : 'Social Media IA'} - Versão Limitada
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md px-2">
                              Você pode fazer perguntas básicas, mas as respostas serão limitadas. 
                              Upgrade para o plano Profissional para acesso completo.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages[activeTab].map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                                    message.type === 'user'
                                      ? activeTab === 'manager' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    {message.type === 'assistant' && (
                                      activeTab === 'manager' ? (
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

                      {/* Input Area */}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      );
    }

    // Conteúdo completo para plano profissional (removendo header redundante)
    return (
      <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRestaurantContext} size="sm">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar Contexto</span>
            <span className="sm:hidden">Atualizar</span>
          </Button>
          <Button variant="outline" onClick={exportHistory} size="sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manager' | 'social')} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="manager" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Gerente Virtual</span>
              <span className="sm:hidden">Gerente</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Social Media IA</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manager" className="flex-1 min-h-0 mt-2 sm:mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="hidden sm:inline">Gerente Virtual - Assistente de Gestão</span>
                  <span className="sm:hidden">Gerente Virtual</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Especialista em administração, finanças, operação e gestão de equipe. 
                  Integrado com todos os dados do seu restaurante.
                </p>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col">
                {/* Chat Area */}
                <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mb-4" />
                        <h3 className="font-medium mb-2 text-sm sm:text-base">Olá! Sou seu Gerente Virtual</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                          Estou aqui para ajudar com gestão, finanças, operação e estratégias do seu restaurante.
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
                        {currentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === 'assistant' && (
                                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-blue-600 flex-shrink-0" />
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

                  {/* Input Area */}
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

                {/* Stats */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mt-2 flex-shrink-0">
                  <span>
                    {currentMessages.length} mensagens nesta conversa
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs sm:text-sm">
                    Limpar histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="flex-1 min-h-0 mt-2 sm:mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                  <span className="hidden sm:inline">Social Media IA - Marketing Digital</span>
                  <span className="sm:hidden">Social Media IA</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Especialista em redes sociais, criação de conteúdo, imagens e campanhas. 
                  Gera posts e visuais personalizados para seu restaurante.
                </p>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-2 sm:p-4 flex flex-col">
                {/* Chat Area */}
                <div className="border rounded-lg flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600 mb-4" />
                        <h3 className="font-medium mb-2 text-sm sm:text-base">Olá! Sou sua Social Media IA</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                          Estou aqui para criar conteúdo, imagens e estratégias de marketing para suas redes sociais.
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
                        {currentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                                message.type === 'user'
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === 'assistant' && (
                                  <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-pink-600 flex-shrink-0" />
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

                  {/* Input Area */}
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

                {/* Stats */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mt-2 flex-shrink-0">
                  <span>
                    {currentMessages.length} mensagens nesta conversa
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs sm:text-sm">
                    Limpar histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Context Info */}
      {context && (
        <Card className="flex-shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm">Contexto do Restaurante Carregado</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <Badge variant="outline" className="text-xs">Restaurante</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.restaurantData.name || 'Não configurado'}</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Itens do Menu</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.menuData.length || 0} itens</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Registros Financeiros</Badge>
                <p className="mt-1 text-xs sm:text-sm">{context.financialData.length || 0} registros</p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">Dados do Simulador</Badge>
                <p className="mt-1 text-xs sm:text-sm">{Object.keys(context.simulatorData).length > 0 ? 'Configurado' : 'Pendente'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    );
  };

  return renderAIContent();
}
