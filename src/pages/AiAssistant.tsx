import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou seu assistente IA especializado em gestão de restaurantes. Como posso ajudá-lo hoje? Posso auxiliar com análises financeiras, otimização de cardápio, gestão de custos e muito mais!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const initializeRestaurantId = async () => {
      console.log('🚀 [AiAssistant] Inicializando carregamento do restaurantId...');
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 [AiAssistant] Tentativa ${attempts} de carregar restaurantId...`);
        
        const loadedId = await loadRestaurantId();
        if (loadedId) {
          console.log('✅ [AiAssistant] RestaurantId carregado com sucesso na inicialização');
          break;
        }
        
        if (attempts < maxAttempts) {
          console.log(`⏳ [AiAssistant] Aguardando antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    initializeRestaurantId();
  }, []);

  const forceLoadRestaurantId = async (userId: string): Promise<string> => {
    console.log('🔄 [AiAssistant] Forçando carregamento do restaurantId...');
    
    // Tentar múltiplas vezes
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`🔄 [AiAssistant] Tentativa ${attempt} de carregar restaurantId...`);
      
      try {
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', userId)
          .limit(1);

        if (error) {
          console.error(`❌ [AiAssistant] Erro na tentativa ${attempt}:`, error);
          continue;
        }

        console.log(`📋 [AiAssistant] Tentativa ${attempt} - dados:`, restaurants);

        if (restaurants && restaurants.length > 0) {
          const restaurantId = restaurants[0].id;
          setRestaurantId(restaurantId);
          console.log(`✅ [AiAssistant] RestaurantId carregado na tentativa ${attempt}:`, restaurantId);
          return restaurantId;
        }
        
        console.log(`⚠️ [AiAssistant] Nenhum restaurante encontrado na tentativa ${attempt}`);
        
        // Aguardar antes da próxima tentativa
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ [AiAssistant] Exceção na tentativa ${attempt}:`, error);
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw new Error('Falha ao carregar restaurantId após 5 tentativas');
  };

  const loadRestaurantId = async () => {
    try {
      console.log('🏪 [AiAssistant] Carregando restaurantId...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('❌ [AiAssistant] Usuário não autenticado');
        return null;
      }

      console.log('✅ [AiAssistant] Usuário autenticado:', user.email);

      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', user.id)
        .limit(1);

      if (restaurantError) {
        console.error('❌ [AiAssistant] Erro ao buscar restaurantes:', restaurantError);
        return null;
      }

      console.log('📋 [AiAssistant] Restaurantes encontrados:', restaurants);

      const restaurant = restaurants?.[0];
      if (restaurant) {
        setRestaurantId(restaurant.id);
        console.log('✅ [AiAssistant] RestaurantId carregado:', restaurant.id, 'Nome:', restaurant.name);
        return restaurant.id;
      } else {
        console.log('⚠️ [AiAssistant] Nenhum restaurante encontrado, tentando novamente...');
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
          console.log('✅ [AiAssistant] RestaurantId carregado na segunda tentativa:', retryRestaurant.id, 'Nome:', retryRestaurant.name);
          return retryRestaurant.id;
        }
        
        console.log('❌ [AiAssistant] Falha ao carregar restaurantId após retry');
        return null;
      }
    } catch (error) {
      console.error('❌ [AiAssistant] Erro ao carregar restaurantId:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    console.log('🚀 [AiAssistant] === INICIANDO ENVIO DE MENSAGEM ===');
    console.log('🔍 [AiAssistant] Estado atual do restaurantId:', restaurantId);
    
    if (!inputMessage.trim()) {
      console.log('❌ [AiAssistant] Mensagem vazia');
      return;
    }

    if (isLoading) {
      console.log('❌ [AiAssistant] Já está processando');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    console.log('✅ [AiAssistant] Adicionando mensagem do usuário:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔐 [AiAssistant] Obtendo usuário autenticado...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ [AiAssistant] Usuário:', user.email);
      console.log('🆔 [AiAssistant] User ID:', user.id);
      
      // Garantir que temos o restaurantId
      let currentRestaurantId = restaurantId;
      console.log('🔍 [AiAssistant] RestaurantId atual do estado:', currentRestaurantId);
      
      if (!currentRestaurantId) {
        console.log('🔄 [AiAssistant] RestaurantId não encontrado, forçando carregamento...');
        try {
          currentRestaurantId = await forceLoadRestaurantId(user.id);
          console.log('✅ [AiAssistant] RestaurantId carregado com sucesso:', currentRestaurantId);
        } catch (error) {
          console.error('❌ [AiAssistant] Erro ao forçar carregamento:', error);
          throw new Error('Não foi possível obter o restaurantId');
        }
      }

      console.log('🏪 [AiAssistant] RestaurantId final para envio:', currentRestaurantId);

      if (!currentRestaurantId) {
        throw new Error('Não foi possível obter o restaurantId');
      }

      // Verificação final para garantir que é uma string válida
      if (typeof currentRestaurantId !== 'string' || currentRestaurantId.trim() === '') {
        throw new Error('RestaurantId inválido: deve ser uma string não vazia');
      }

      console.log('✅ [AiAssistant] RestaurantId validado:', currentRestaurantId);

      const payload = {
        userId: user.id,
        restaurantId: currentRestaurantId,
        message: messageToSend,
        aiType: 'manager',
        timestamp: new Date().toISOString()
      };

      console.log('📦 [AiAssistant] Payload preparado:', JSON.stringify(payload, null, 2));
      console.log('🔍 [AiAssistant] Verificação do payload:');
      console.log('  - userId:', typeof payload.userId, payload.userId);
      console.log('  - restaurantId:', typeof payload.restaurantId, payload.restaurantId);
      console.log('  - message:', typeof payload.message, payload.message);
      console.log('  - aiType:', typeof payload.aiType, payload.aiType);

      const webhookUrl = 'https://restauria.app.n8n.cloud/webhook/ai-assistant';
      console.log('🌐 [AiAssistant] Fazendo requisição POST para:', webhookUrl);
      console.log('📡 [AiAssistant] Iniciando fetch...');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📨 [AiAssistant] Response status:', response.status);
      console.log('📨 [AiAssistant] Response statusText:', response.statusText);
      console.log('📨 [AiAssistant] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AiAssistant] Erro HTTP:', response.status, response.statusText, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📥 [AiAssistant] Response text completo:', responseText);

      if (!responseText.trim()) {
        throw new Error('Resposta vazia do servidor');
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('✅ [AiAssistant] JSON parseado com sucesso:', responseData);
      } catch (parseError) {
        console.error('❌ [AiAssistant] Erro ao parsear JSON:', parseError);
        console.log('📄 [AiAssistant] Texto da resposta que falhou no parse:', responseText);
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
        console.log('⚠️ [AiAssistant] Formato de resposta não reconhecido:', responseData);
        aiContent = `Resposta recebida: ${JSON.stringify(responseData, null, 2)}`;
      }

      console.log('💬 [AiAssistant] Conteúdo final da IA:', aiContent);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        isUser: false,
        timestamp: new Date()
      };
      
      console.log('✅ [AiAssistant] Adicionando resposta da IA:', aiResponse);
      setMessages(prev => [...prev, aiResponse]);
      toast.success('Resposta recebida da IA!');

    } catch (error) {
      console.error('❌ [AiAssistant] ERRO COMPLETO:', error);
      console.error('❌ [AiAssistant] Stack trace:', error.stack);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Erro ao processar sua mensagem: ${error.message}

Detalhes técnicos:
- URL: https://restauria.app.n8n.cloud/webhook/ai-assistant
- Método: POST
- Erro: ${error.message}

Por favor, verifique os logs do console para mais detalhes.`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error(`Erro na comunicação: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🏁 [AiAssistant] === FIM DO PROCESSAMENTO ===');
    }
  };

  const quickActions = [
    "Analisar CMV dos pratos",
    "Otimizar preços do cardápio",
    "Revisar despesas fixas",
    "Sugerir metas de vendas"
  ];

  return (
    <ModernLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-600" />
            Assistente IA
          </h1>
          <p className="text-muted-foreground">
            Seu consultor inteligente para gestão estratégica do restaurante
          </p>
          {restaurantId && (
            <p className="text-xs text-green-600 mt-1">
              Conectado ao restaurante: {restaurantId}
            </p>
          )}
        </div>

        <div className="grid gap-6">
          {/* Chat Interface */}
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversa com IA
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-1 min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processando requisição...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua pergunta sobre gestão do restaurante..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => {
                      setInputMessage(action);
                      toast.success(`Pergunta selecionada: ${action}`);
                    }}
                  >
                    <span className="text-left">{action}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}

