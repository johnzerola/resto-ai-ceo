import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Image as ImageIcon, 
  Download, 
  Share2, 
  Copy, 
  RefreshCw,
  Instagram,
  Facebook,
  Calendar,
  Hash
} from "lucide-react";
import { toast } from "sonner";

interface MarketingContent {
  type: 'post' | 'image' | 'campaign';
  platform: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledTime?: string;
}

export function MarketingAI() {
  const [contentType, setContentType] = useState<'post' | 'image' | 'campaign'>('post');
  const [platform, setPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<MarketingContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, descreva o que você quer criar');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/marketing-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          platform,
          prompt,
          restaurantContext: JSON.parse(localStorage.getItem('restaurantData') || '{}')
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar conteúdo');

      const data = await response.json();
      
      setGeneratedContent({
        type: contentType,
        platform,
        content: data.content,
        hashtags: data.hashtags || [],
        imageUrl: data.imageUrl,
        scheduledTime: data.scheduledTime
      });

      toast.success('Conteúdo gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const downloadImage = () => {
    if (!generatedContent?.imageUrl) return;

    const link = document.createElement('a');
    link.href = generatedContent.imageUrl;
    link.download = `marketing-image-${Date.now()}.png`;
    link.click();
    
    toast.success('Imagem baixada com sucesso!');
  };

  const getContentTypeExamples = () => {
    switch (contentType) {
      case 'post':
        return [
          "Post promocional para o prato do dia",
          "Anúncio de horário especial no fim de semana",
          "Divulgação de nova sobremesa",
          "Post de agradecimento aos clientes"
        ];
      case 'image':
        return [
          "Imagem apetitosa da pizza margherita",
          "Banner promocional com 20% de desconto",
          "Foto lifestyle do ambiente do restaurante",
          "Imagem de cardápio digital"
        ];
      case 'campaign':
        return [
          "Campanha de Dia dos Namorados",
          "Promoção para delivery na segunda-feira",
          "Lançamento do menu vegetariano",
          "Campanha de fidelidade para clientes"
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Criação de Conteúdo</h3>
        <p className="text-sm text-muted-foreground">
          Gere posts, imagens e campanhas personalizadas para suas redes sociais
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de Criação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Configuração do Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Conteúdo</Label>
                <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post/Legenda</SelectItem>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="campaign">Campanha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plataforma</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição do Conteúdo</Label>
              <Textarea
                placeholder={`Descreva o que você quer criar...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Exemplos:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getContentTypeExamples().map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateContent} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gerar Conteúdo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedContent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Configure o tipo de conteúdo e clique em "Gerar Conteúdo"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Imagem */}
                {generatedContent.imageUrl && (
                  <div className="space-y-2">
                    <img
                      ref={imageRef}
                      src={generatedContent.imageUrl}
                      alt="Conteúdo gerado"
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadImage}>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Texto/Legenda */}
                {generatedContent.content && (
                  <div className="space-y-2">
                    <Label>Legenda/Texto:</Label>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{generatedContent.content}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                )}

                {/* Hashtags */}
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Hashtags Sugeridas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="secondary">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.hashtags.map(h => `#${h}`).join(' '))}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Copiar Hashtags
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Informações da Plataforma */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {platform === 'instagram' && <Instagram className="h-4 w-4" />}
                    {platform === 'facebook' && <Facebook className="h-4 w-4" />}
                    <span className="capitalize">{platform}</span>
                  </div>
                  <Badge variant="outline">{generatedContent.type}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
