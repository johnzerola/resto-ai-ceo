
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  BarChart3, 
  Share2, 
  Send, 
  Download,
  Loader2,
  Bot,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'analytics' | 'social';
  metadata?: any;
}

export function UnifiedAIAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();

  // Estados para geração de imagem
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageProvider, setImageProvider] = useState("dalle");
  const [generatedImage, setGeneratedImage] = useState<string>("");

  // Estados para analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Estados para redes sociais
  const [socialContent, setSocialContent] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("facebook");
  const [socialImageUrl, setSocialImageUrl] = useState("");
  const [socialHashtags, setSocialHashtags] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, sender: 'user' | 'ai', type: 'text' | 'image' | 'analytics' | 'social' = 'text', metadata?: any) => {
    const message: Message = {
      id: Date.now().toString() + Math.random(),
      sender,
      content,
      timestamp: new Date(),
      type,
      metadata
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const handleChatMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage;
    setNewMessage("");
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      // Obter contexto do restaurante
      const restaurantData = localStorage.getItem('restaurantData');
      const context = restaurantData ? JSON.parse(restaurantData) : null;

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: userMessage,
          context: context ? `Restaurante: ${context.businessName}. Dados disponíveis: ${JSON.stringify(context)}` : '',
          conversationHistory: conversationHistory.slice(-10) // Últimas 10 mensagens
        }
      });

      if (error) throw error;

      const aiResponse = data.reply;
      addMessage(aiResponse, 'ai');
      
      // Atualizar histórico da conversa
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]);

      toast({
        title: "Resposta gerada",
        description: "O assistente IA respondeu sua pergunta.",
      });
    } catch (error: any) {
      console.error('Erro no chat:', error);
      addMessage("Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se a API do OpenAI está configurada.", 'ai');
      toast({
        title: "Erro no chat",
        description: error.message || "Erro ao conectar com o assistente IA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim() || isLoading) return;

    setIsLoading(true);
    setGeneratedImage("");

    try {
      const functionName = imageProvider === 'dalle' ? 'dalle-image-generator' : 'stability-ai-generator';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          prompt: imagePrompt,
          size: "1024x1024",
          style: "vivid",
          quality: "standard"
        }
      });

      if (error) throw error;

      const imageUrl = data.imageUrl || data.imageBase64;
      setGeneratedImage(imageUrl);
      
      addMessage(`Imagem gerada: ${imagePrompt}`, 'ai', 'image', { imageUrl, provider: imageProvider });

      toast({
        title: "Imagem gerada",
        description: "Sua imagem foi criada com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro na geração de imagem:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Erro ao gerar imagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalytics = async () => {
    setAnalyticsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('google-analytics', {
        body: {
          startDate: '30daysAgo',
          endDate: 'today',
          metrics: ['sessions', 'users', 'pageviews', 'bounceRate'],
          dimensions: ['date', 'country']
        }
      });

      if (error) throw error;

      setAnalyticsData(data.data);
      addMessage("Relatório do Google Analytics gerado", 'ai', 'analytics', data.data);

      toast({
        title: "Analytics carregado",
        description: "Dados do Google Analytics foram obtidos com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro no analytics:', error);
      toast({
        title: "Erro no Analytics",
        description: error.message || "Erro ao obter dados do Google Analytics",
        variant: "destructive"
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSocialPublish = async () => {
    if (!socialContent.trim() || publishLoading) return;

    setPublishLoading(true);

    try {
      const hashtags = socialHashtags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const { data, error } = await supabase.functions.invoke('social-media-publisher', {
        body: {
          platform: socialPlatform,
          content: socialContent,
          imageUrl: socialImageUrl || undefined,
          hashtags
        }
      });

      if (error) throw error;

      addMessage(`Publicado no ${socialPlatform}: ${socialContent}`, 'ai', 'social', data.result);

      toast({
        title: "Publicação realizada",
        description: `Conteúdo publicado no ${socialPlatform} com sucesso!`,
      });

      // Limpar campos
      setSocialContent("");
      setSocialImageUrl("");
      setSocialHashtags("");
    } catch (error: any) {
      console.error('Erro na publicação:', error);
      toast({
        title: "Erro na publicação",
        description: error.message || "Erro ao publicar nas redes sociais",
        variant: "destructive"
      });
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          Assistente IA Unificado
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat IA
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {messages.filter(m => m.type === 'text').map((message) => (
                <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-white border">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua pergunta sobre gestão do restaurante..."
                onKeyDown={(e) => e.key === 'Enter' && handleChatMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleChatMessage} disabled={isLoading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provedor de IA</label>
                <Select value={imageProvider} onValueChange={setImageProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dalle">DALL-E 3 (OpenAI)</SelectItem>
                    <SelectItem value="stability">Stability AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrição da Imagem</label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Descreva a imagem que você quer gerar para seu restaurante..."
                  className="min-h-20"
                />
              </div>

              <Button onClick={handleImageGeneration} disabled={isLoading || !imagePrompt.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                Gerar Imagem
              </Button>

              {generatedImage && (
                <div className="space-y-2">
                  <img src={generatedImage} alt="Imagem gerada" className="max-w-full rounded-lg border" />
                  <Button variant="outline" size="sm" onClick={() => setSocialImageUrl(generatedImage)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Usar nas Redes Sociais
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="space-y-4">
              <Button onClick={handleAnalytics} disabled={analyticsLoading}>
                {analyticsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                Carregar Dados do Google Analytics
              </Button>

              {analyticsData && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Resumo dos Últimos 30 Dias</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData.totals?.[0]?.metricValues?.[0]?.value || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Sessões</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.totals?.[0]?.metricValues?.[1]?.value || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Usuários</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analyticsData.totals?.[0]?.metricValues?.[2]?.value || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Páginas Vistas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {(parseFloat(analyticsData.totals?.[0]?.metricValues?.[3]?.value || '0') * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Taxa de Rejeição</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Plataforma</label>
                <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Conteúdo da Publicação</label>
                <Textarea
                  value={socialContent}
                  onChange={(e) => setSocialContent(e.target.value)}
                  placeholder="Escreva o conteúdo da sua publicação..."
                  className="min-h-20"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">URL da Imagem (opcional)</label>
                <Input
                  value={socialImageUrl}
                  onChange={(e) => setSocialImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hashtags (separadas por vírgula)</label>
                <Input
                  value={socialHashtags}
                  onChange={(e) => setSocialHashtags(e.target.value)}
                  placeholder="#restaurante, #gastronomia, #food"
                />
              </div>

              <Button onClick={handleSocialPublish} disabled={publishLoading || !socialContent.trim()}>
                {publishLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                Publicar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
