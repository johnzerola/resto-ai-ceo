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
import { useAuth } from "@/contexts/AuthContext";

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
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentRestaurant } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initializeRestaurantId = async () => {
      console.log('🚀 [AIChat] Inicializando carregamento do restaurantId...');
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 [AIChat] Tentativa ${attempts} de carregar restaurantId...`);
        
        const loadedId = await loadRestaurantId();
        if (loadedId) {
          console.log('✅ [AIChat] RestaurantId carregado com sucesso na inicialização');
          break;
        }
        
        if (attempts < maxAttempts) {
          console.log(`⏳ [AIChat] Aguardando antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    initializeRestaurantId();
  }, []);

  const forceLoadRestaurantId = async (userId: string): Promise<string> => {
    console.log('🔄 [AIChat] Forçando carregamento do restaurantId...');
    
    // Primeiro, tentar usar o restaurante do contexto de autenticação
    if (currentRestaurant && currentRestaurant.id !== 'default') {
      console.log('✅ [AIChat] Usando restaurante do contexto:', currentRestaurant.id);
      setRestaurantId(currentRestaurant.id);
      return currentRestaurant.id;
    }
    
    // Se não tiver restaurante válido no contexto, buscar no banco
    console.log('🔄 [AIChat] Buscando restaurante no banco de dados...');
    
    // Tentar múltiplas vezes
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`🔄 [AIChat] Tentativa ${attempt} de carregar restaurantId...`);
      
      try {
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', userId)
          .limit(1);

        if (error) {
          console.error(`❌ [AIChat] Erro na tentativa ${attempt}:`, error);
          continue;
        }

        console.log(`📋 [AIChat] Tentativa ${attempt} - dados:`, restaurants);

        if (restaurants && restaurants.length > 0) {
          const restaurantId = restaurants[0].id;
          setRestaurantId(restaurantId);
          console.log(`✅ [AIChat] RestaurantId carregado na tentativa ${attempt}:`, restaurantId);
          return restaurantId;
        }
        
        console.log(`⚠️ [AIChat] Nenhum restaurante encontrado na tentativa ${attempt}`);
        
        // Aguardar antes da próxima tentativa
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ [AIChat] Exceção na tentativa ${attempt}:`, error);
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw new Error('Falha ao carregar restaurantId após 5 tentativas');
  };

  const loadRestaurantId = async () => {
    try {
      console.log('🏪 [AIChat] Carregando restaurantId...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('❌ [AIChat] Usuário não autenticado');
        return null;
      }

      console.log('✅ [AIChat] Usuário autenticado:', user.email);

      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', user.id)
        .limit(1);

      if (restaurantError) {
        console.error('❌ [AIChat] Erro ao buscar restaurantes:', restaurantError);
        return null;
      }

      console.log('📋 [AIChat] Restaurantes encontrados:', restaurants);

      const restaurant = restaurants?.[0];
      if (restaurant) {
        setRestaurantId(restaurant.id);
        console.log('✅ [AIChat] RestaurantId carregado:', restaurant.id, 'Nome:', restaurant.name);
        return restaurant.id;
      } else {
        console.log('⚠️ [AIChat] Nenhum restaurante encontrado, tentando novamente...');
        // Tentar novamente após um pequeno delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: retryRestaurants } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', user.id)
          .limit(1);
          
        const retryRestaurant = retryRestaurants?.[0];
        if (retryRestaurant) {
          setRestaurantId(retryRestaurant.id);
          console.log('✅ [AIChat] RestaurantId carregado na segunda tentativa:', retryRestaurant.id, 'Nome:', retryRestaurant.name);
          return retryRestaurant.id;
        }
        
        console.log('❌ [AIChat] Falha ao carregar restaurantId após retry');
        return null;
      }
    } catch (error) {
      console.error('❌ [AIChat] Erro ao carregar restaurantId:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    console.log('🚀 [AIChat] === INICIANDO ENVIO DE MENSAGEM ===');
    console.log('🔍 [AIChat] Estado atual do restaurantId:', restaurantId);
    
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
      console.log('🆔 [AIChat] User ID:', user.id);
      
      // Garantir que temos o restaurantId
      let currentRestaurantId = restaurantId;
      console.log('🔍 [AIChat] RestaurantId atual do estado:', currentRestaurantId);
      
      if (!currentRestaurantId) {
        console.log('🔄 [AIChat] RestaurantId não encontrado, forçando carregamento...');
        try {
          currentRestaurantId = await forceLoadRestaurantId(user.id);
          console.log('✅ [AIChat] RestaurantId carregado com sucesso:', currentRestaurantId);
        } catch (error) {
          console.error('❌ [AIChat] Erro ao forçar carregamento:', error);
          throw new Error('Não foi possível obter o restaurantId');
        }
      }

      console.log('🏪 [AIChat] RestaurantId final para envio:', currentRestaurantId);

      if (!currentRestaurantId) {
        throw new Error('Não foi possível obter o restaurantId');
      }

      // Verificação final para garantir que é uma string válida
      if (typeof currentRestaurantId !== 'string' || currentRestaurantId.trim() === '') {
        throw new Error('RestaurantId inválido: deve ser uma string não vazia');
      }

      console.log('✅ [AIChat] RestaurantId validado:', currentRestaurantId);

      const payload = {
        userId: user.id,
        restaurantId: currentRestaurantId,
        message: messageToSend,
        aiType: aiType,
        timestamp: new Date().toISOString()
      };

      console.log('📦 [AIChat] Payload preparado:', JSON.stringify(payload, null, 2));
      console.log('🔍 [AIChat] Verificação do payload:');
      console.log('  - userId:', typeof payload.userId, payload.userId);
      console.log('  - restaurantId:', typeof payload.restaurantId, payload.restaurantId);
      console.log('  - message:', typeof payload.message, payload.message);
      console.log('  - aiType:', typeof payload.aiType, payload.aiType);

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
          {restaurantId && (
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
        {restaurantId && (
          <p className="text-xs text-green-600">
            Conectado ao restaurante: {restaurantId}
          </p>
        )}
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

