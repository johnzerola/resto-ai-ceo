
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare,
  Download,
  Image as ImageIcon,
  Share2,
  Clipboard,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  Sparkles
} from "lucide-react";

export function MarketingAI() {
  const [activeTab, setActiveTab] = useState("ai-generator");
  const [contentType, setContentType] = useState("promotion");
  const [platform, setPlatform] = useState("instagram");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copiedText, setCopiedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageProvider, setImageProvider] = useState("dalle");
  const { toast } = useToast();
  
  const contentTypes = [
    { value: "promotion", label: "Promoção" },
    { value: "menu-item", label: "Item do Cardápio" },
    { value: "event", label: "Evento" },
    { value: "testimonial", label: "Depoimento" }
  ];
  
  const platforms = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "twitter", label: "Twitter", icon: Twitter }
  ];

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    try {
      // Gerar conteúdo com OpenAI
      const { data: contentData, error: contentError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: `Crie um post para ${platform} sobre ${contentType}. Descrição: ${prompt}`,
          context: `Você é um especialista em marketing digital para restaurantes. Crie conteúdo envolvente e profissional.`
        }
      });

      if (contentError) throw contentError;

      // Gerar hashtags específicas
      const { data: hashtagsData, error: hashtagsError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: `Crie 8-10 hashtags relevantes para: ${prompt}. Retorne apenas as hashtags separadas por espaço.`,
          context: `Você é um especialista em hashtags para restaurantes. Foque em hashtags populares e relevantes.`
        }
      });

      if (hashtagsError) throw hashtagsError;

      const content = {
        caption: contentData.reply,
        hashtags: hashtagsData.reply.split(' ').filter(tag => tag.startsWith('#')),
        text: contentData.reply
      };
      
      setGeneratedContent(content);

      toast({
        title: "Conteúdo gerado!",
        description: "Seu post foi criado com IA. Agora você pode gerar uma imagem para acompanhar.",
      });
    } catch (error: any) {
      console.error('Erro na geração:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Erro ao gerar conteúdo",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    
    setIsGenerating(true);
    
    try {
      const imagePrompt = `Create a high-quality marketing image for a restaurant social media post. Context: ${prompt}. Style: professional, appetizing, modern, social media ready`;
      
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

      toast({
        title: "Imagem gerada!",
        description: "Sua imagem foi criada com IA. Agora você pode publicar diretamente.",
      });
    } catch (error: any) {
      console.error('Erro na geração de imagem:', error);
      toast({
        title: "Erro na geração",
        description: error.message || "Erro ao gerar imagem",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishToSocial = async () => {
    if (!generatedContent) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('social-media-publisher', {
        body: {
          platform: platform,
          content: generatedContent.caption,
          imageUrl: generatedImage || undefined,
          hashtags: generatedContent.hashtags
        }
      });

      if (error) throw error;

      toast({
        title: "Publicado com sucesso!",
        description: `Seu post foi publicado no ${platform}.`,
      });
    } catch (error: any) {
      console.error('Erro na publicação:', error);
      toast({
        title: "Erro na publicação",
        description: error.message || "Erro ao publicar. Verifique suas credenciais das redes sociais.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência"
    });
    
    setTimeout(() => setCopiedText(""), 3000);
  };
  
  const handleClear = () => {
    setGeneratedContent(null);
    setGeneratedImage("");
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-generator">
            <Sparkles className="h-4 w-4 mr-2" />
            Gerador IA Avançado
          </TabsTrigger>
          <TabsTrigger value="campaign-planner">
            <MessageSquare className="h-4 w-4 mr-2" />
            Planejador de Campanhas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Gerador de Conteúdo com IA
              </CardTitle>
              <CardDescription>
                Crie posts profissionais com OpenAI, imagens com DALL-E/Stability AI e publique automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Conteúdo</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plataforma</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center">
                              <p.icon className="h-4 w-4 mr-2" />
                              {p.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição do Conteúdo</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Promoção de 20% em pratos japoneses às terças-feiras"
                    className="min-h-20"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  {generatedContent && (
                    <Button variant="outline" onClick={handleClear}>
                      Limpar
                    </Button>
                  )}
                  <Button 
                    onClick={handleGenerateContent} 
                    disabled={!prompt || isGenerating}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Gerar Conteúdo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conteúdo Gerado</span>
                  <Badge variant="outline">
                    {platforms.find(p => p.value === platform)?.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-medium">Texto da Publicação</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedContent.caption)}
                      >
                        {copiedText === generatedContent.caption ? (
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                          <Clipboard className="h-4 w-4 mr-1" />
                        )}
                        {copiedText === generatedContent.caption ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <p>{generatedContent.caption}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-medium">Hashtags</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopy(generatedContent.hashtags.join(" "))}
                      >
                        {copiedText === generatedContent.hashtags.join(" ") ? (
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                          <Clipboard className="h-4 w-4 mr-1" />
                        )}
                        {copiedText === generatedContent.hashtags.join(" ") ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.hashtags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium">Provedor de Imagem IA</label>
                      <Select value={imageProvider} onValueChange={setImageProvider}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dalle">DALL-E 3 (OpenAI)</SelectItem>
                          <SelectItem value="stability">Stability AI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleGenerateImage} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                        Gerar Imagem
                      </Button>
                    </div>
                  </div>

                  {generatedImage && (
                    <div className="space-y-2">
                      <h4 className="text-base font-medium">Imagem Gerada</h4>
                      <img src={generatedImage} alt="Imagem gerada" className="max-w-full rounded-lg border" />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => handleCopy(`${generatedContent.caption}\n\n${generatedContent.hashtags.join(" ")}`)}>
                      <Clipboard className="h-4 w-4 mr-2" />
                      Copiar Tudo
                    </Button>
                    <Button onClick={handlePublishToSocial} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                      Publicar no {platforms.find(p => p.value === platform)?.label}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="campaign-planner">
          <Card>
            <CardHeader>
              <CardTitle>Planejador de Campanhas IA</CardTitle>
              <CardDescription>
                Em breve: Planejamento automático de campanhas com análise de dados e sugestões personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Funcionalidade Avançada</h3>
                <p className="text-muted-foreground max-w-md">
                  O planejador de campanhas com IA está sendo desenvolvido para oferecer 
                  análises preditivas e estratégias personalizadas baseadas em seus dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
