
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Download,
  Image as ImageIcon,
  MessageSquare,
  Share2,
  ThumbsUp,
  Clipboard,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  MessageSquareText
} from "lucide-react";
import { toast } from "sonner";

export function MarketingAI() {
  const [activeTab, setActiveTab] = useState("post-generator");
  const [contentType, setContentType] = useState("promotion");
  const [platform, setPlatform] = useState("instagram");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copiedText, setCopiedText] = useState("");
  
  // Content type options
  const contentTypes = [
    { value: "promotion", label: "Promoção" },
    { value: "menu-item", label: "Item do Cardápio" },
    { value: "event", label: "Evento" },
    { value: "testimonial", label: "Depoimento" }
  ];
  
  // Platform options
  const platforms = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "twitter", label: "Twitter", icon: Twitter }
  ];
  
  // Function to generate content
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = generateSampleContent(platform, contentType, prompt);
      setGeneratedContent(result);
      setIsGenerating(false);
    }, 1500);
  };
  
  // Function to copy text
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success("Texto copiado para a área de transferência!");
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopiedText("");
    }, 3000);
  };
  
  // Function to clear content
  const handleClear = () => {
    setGeneratedContent(null);
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="post-generator">
            <MessageSquare className="h-4 w-4 mr-2" />
            Gerador de Posts
          </TabsTrigger>
          <TabsTrigger value="campaign-planner">
            <MessageSquareText className="h-4 w-4 mr-2" />
            Campanhas e Estratégias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="post-generator" className="space-y-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Posts</CardTitle>
              <CardDescription>
                Gere conteúdo para redes sociais com ajuda de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Conteúdo</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de conteúdo" />
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
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Promoção de 20% em pratos japoneses às terças-feiras"
                  />
                  <p className="text-xs text-muted-foreground">
                    Descreva o que você deseja que a IA crie para você
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  {generatedContent && (
                    <Button variant="outline" onClick={handleClear}>
                      Limpar
                    </Button>
                  )}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt || isGenerating}
                  >
                    {isGenerating ? "Gerando..." : "Gerar Conteúdo"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Output Card */}
          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conteúdo Gerado</span>
                  <Badge variant="outline" className="ml-2">
                    {platforms.find(p => p.value === platform)?.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="border rounded-lg p-6 bg-white">
                    {platform === "instagram" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <p className="font-medium">seu_restaurante</p>
                            <p className="text-xs text-gray-500">Patrocinado</p>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <AspectRatio ratio={1 / 1} className="bg-gray-100 rounded-md">
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          </AspectRatio>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex gap-4">
                            <ThumbsUp className="h-6 w-6" />
                            <MessageSquare className="h-6 w-6" />
                            <Share2 className="h-6 w-6" />
                          </div>
                          <p className="font-medium">124 curtidas</p>
                          <p>
                            <span className="font-medium">seu_restaurante</span> {generatedContent.caption}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {generatedContent.hashtags.map((tag: string, i: number) => (
                              <span key={i} className="text-blue-600">{tag}</span>
                            ))}
                          </div>
                          <p className="text-gray-500 text-xs">
                            <Clock className="inline h-3 w-3 mr-1" /> Há 2 horas
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {platform === "facebook" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <p className="font-medium">Seu Restaurante</p>
                            <p className="text-xs text-gray-500">
                              <Clock className="inline h-3 w-3 mr-1" /> Patrocinado
                            </p>
                          </div>
                        </div>
                        
                        <p>{generatedContent.caption}</p>
                        
                        <div className="relative">
                          <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-md">
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          </AspectRatio>
                        </div>
                        
                        <div className="flex gap-4 pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-5 w-5" />
                            <span>Curtir</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-5 w-5" />
                            <span>Comentar</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-5 w-5" />
                            <span>Compartilhar</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {platform === "twitter" && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">Seu Restaurante</p>
                              <p className="text-gray-500">@seurestaurante</p>
                            </div>
                            <p className="mt-1">{generatedContent.text}</p>
                            
                            {generatedContent.hashtags.slice(0, 3).map((tag: string, i: number) => (
                              <span key={i} className="text-blue-600 mr-1">{tag}</span>
                            ))}
                            
                            <div className="mt-3 text-gray-500 text-sm flex gap-4">
                              <Clock className="inline h-4 w-4 mr-1" /> Agora
                            </div>
                            
                            <div className="flex gap-4 mt-3">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm">3</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                <span className="text-sm">12</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-sm">24</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-medium">Texto da Publicação</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleCopy(platform === "twitter" ? generatedContent.text : generatedContent.caption)}
                        >
                          {copiedText === (platform === "twitter" ? generatedContent.text : generatedContent.caption) ? (
                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                          ) : (
                            <Clipboard className="h-4 w-4 mr-1" />
                          )}
                          {copiedText === (platform === "twitter" ? generatedContent.text : generatedContent.caption) ? "Copiado!" : "Copiar"}
                        </Button>
                      </div>
                      <div className="border rounded-md p-3 bg-gray-50">
                        <p>{platform === "twitter" ? generatedContent.text : generatedContent.caption}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-medium">Hashtags</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
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
                    
                    <div className="flex justify-end">
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Sugestão de Imagem
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="campaign-planner">
          <Card>
            <CardHeader>
              <CardTitle>Planejador de Campanhas</CardTitle>
              <CardDescription>
                Desenvolva estratégias de marketing e campanhas promocionais
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <MessageSquareText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground max-w-md">
                  O planejador de campanhas está sendo aprimorado para oferecer a melhor 
                  experiência possível. Em breve você poderá criar campanhas completas com ajuda da IA.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sample content generator
function generateSampleContent(platform: string, type: string, prompt: string) {
  let content = {
    caption: "",
    text: "",
    hashtags: []
  };
  
  // Simplify the prompt to identify key elements
  const isPromotion = prompt.toLowerCase().includes("promoção") || prompt.toLowerCase().includes("desconto") || type === "promotion";
  const isFoodItem = prompt.toLowerCase().includes("prato") || prompt.toLowerCase().includes("culinária") || type === "menu-item";
  const isEvent = prompt.toLowerCase().includes("evento") || prompt.toLowerCase().includes("noite") || type === "event";
  
  // Generate caption based on content type and platform
  if (isPromotion) {
    if (platform === "instagram") {
      content.caption = "✨ PROMOÇÃO ESPECIAL! ✨\n\nNão perca nossa incrível oferta por tempo limitado! Venha experimentar nossos pratos deliciosos com 20% de desconto em todos os pratos principais de terça a quinta-feira.\n\nReserve já pelo link na bio ou pelo telefone (11) 9876-5432.\n\nOferta válida até o fim do mês!";
    } else if (platform === "facebook") {
      content.caption = "🔥 PROMOÇÃO IMPERDÍVEL! 🔥\n\nQueremos celebrar este mês com você! Por isso, estamos oferecendo 20% de desconto em todos os nossos pratos principais de terça a quinta-feira.\n\nÉ a oportunidade perfeita para experimentar aquele prato que você sempre quis provar!\n\nReserve sua mesa agora mesmo: (11) 9876-5432\nOu visite nosso site: www.seurestaurante.com.br\n\nOferta por tempo limitado. Não é cumulativa com outras promoções.";
    } else { // Twitter
      content.text = "🔥 PROMOÇÃO! 20% OFF em todos os pratos principais de terça a quinta-feira! Reserve já: (11) 9876-5432. Oferta válida até o fim do mês!";
    }
    content.hashtags = ["#promoção", "#desconto", "#ofertaespecial", "#gastronomia", "#restaurante", "#bomapetite", "#jantarespecial", "#culinária"];
  } 
  else if (isFoodItem) {
    if (platform === "instagram") {
      content.caption = "😍 Conheça nossa nova estrela do cardápio! 😍\n\nO Risoto de Camarão com Limão Siciliano é preparado com os melhores ingredientes, arroz arbóreo italiano e camarões selecionados.\n\nUma explosão de sabores para surpreender seu paladar! Disponível todos os dias no jantar.\n\nVocê precisa experimentar esta obra-prima da nossa cozinha! 👨‍🍳✨";
    } else if (platform === "facebook") {
      content.caption = "🍽️ NOVIDADE NO CARDÁPIO! 🍽️\n\nApresentamos com orgulho nossa nova criação: Risoto de Camarão com Limão Siciliano!\n\nUm prato sofisticado que combina a cremosidade do arroz arbóreo italiano com a suculência dos camarões frescos, finalizado com raspas de limão siciliano que trazem um toque cítrico irresistível.\n\nDisponível todos os dias no jantar. Reserve sua mesa e venha experimentar esta delícia!";
    } else { // Twitter
      content.text = "🍽️ NOVO NO CARDÁPIO! Risoto de Camarão com Limão Siciliano - uma explosão de sabores que vai surpreender seu paladar! Disponível todos os dias no jantar. Venha experimentar! 😋";
    }
    content.hashtags = ["#novoprato", "#gastronomia", "#foodlovers", "#risoto", "#camarão", "#jantarespecial", "#restaurante", "#chefdetalento"];
  }
  else if (isEvent) {
    if (platform === "instagram") {
      content.caption = "🎵 NOITE ESPECIAL DE JAZZ! 🎵\n\nNeste sábado, a partir das 20h, teremos uma noite inesquecível com o Trio Jazz & Bossa trazendo os clássicos do jazz e da bossa nova para embalar seu jantar.\n\nReserve sua mesa com antecedência para garantir o melhor lugar!\n\nIngressos: R$30 por pessoa (consumação à parte)";
    } else if (platform === "facebook") {
      content.caption = "🎵 EVENTO IMPERDÍVEL: NOITE DE JAZZ & BOSSA NOVA 🎵\n\nÉ com grande prazer que convidamos você para uma noite especial em nosso restaurante!\n\nNeste sábado, a partir das 20h, o talentoso Trio Jazz & Bossa vai apresentar um repertório exclusivo com os maiores clássicos do jazz e da bossa nova, criando o ambiente perfeito para um jantar memorável.\n\nReserve sua mesa com antecedência - os lugares são limitados!\n\nIngressos: R$30 por pessoa (consumação à parte)\nReservas: (11) 9876-5432";
    } else { // Twitter
      content.text = "🎵 Neste sábado: Noite especial de Jazz & Bossa Nova! A partir das 20h, venha curtir boa música ao vivo enquanto desfruta de um jantar delicioso. Ingressos: R$30/pessoa. Reservas: (11) 9876-5432";
    }
    content.hashtags = ["#eventoexclusivo", "#jazznight", "#bossanova", "#musicaaovivo", "#jantarespecial", "#sabadoanoite", "#gastronomia", "#restaurante"];
  }
  else {
    // Default content if no specific type is detected
    if (platform === "instagram") {
      content.caption = "✨ Momentos especiais merecem sabores inesquecíveis! ✨\n\nVisite nosso restaurante e descubra uma experiência gastronômica que vai encantar todos os seus sentidos.\n\nCardápio exclusivo, ambiente aconchegante e atendimento impecável esperam por você!\n\nReserve pelo link na bio ou pelo telefone (11) 9876-5432.";
    } else if (platform === "facebook") {
      content.caption = "🍽️ EXPERIÊNCIA GASTRONÔMICA DE OUTRO NÍVEL! 🍽️\n\nNo nosso restaurante, cada prato é uma obra de arte criada para surpreender e encantar seu paladar.\n\nNosso chef se dedica a selecionar os melhores ingredientes e combiná-los em receitas exclusivas que contam histórias através dos sabores.\n\nVenha vivenciar esta experiência única em um ambiente acolhedor e com atendimento impecável.\n\nFaça sua reserva hoje mesmo: (11) 9876-5432";
    } else { // Twitter
      content.text = "✨ Celebre os bons momentos da vida com sabores inesquecíveis! Nosso menu foi cuidadosamente elaborado para proporcionar uma experiência gastronômica completa. Reservas: (11) 9876-5432";
    }
    content.hashtags = ["#gastronomia", "#restaurante", "#experiênciaúnica", "#finedining", "#bomapetite", "#foodlovers", "#chefspecial", "#saboresinesquecíveis"];
  }
  
  return content;
}
