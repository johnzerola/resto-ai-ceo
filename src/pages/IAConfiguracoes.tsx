import { useState } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bot, 
  Image as ImageIcon, 
  BarChart3, 
  Share2, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Settings,
  Sparkles
} from "lucide-react";

const IAConfiguracoes = () => {
  const [apiStatus, setApiStatus] = useState({
    openai: false,
    stability: false,
    google: false,
    facebook: false,
    instagram: false
  });

  const apiConfigs = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Chat inteligente e geração de imagens DALL-E',
      icon: Bot,
      features: ['Chat GPT-4', 'DALL-E 3', 'Análise de texto'],
      required: ['OPENAI_API_KEY'],
      status: apiStatus.openai
    },
    {
      id: 'stability',
      name: 'Stability AI',
      description: 'Geração avançada de imagens',
      icon: ImageIcon,
      features: ['Stable Diffusion', 'Imagens HD', 'Controle preciso'],
      required: ['STABILITY_API_KEY'],
      status: apiStatus.stability
    },
    {
      id: 'google',
      name: 'Google Analytics',
      description: 'Análise de presença digital',
      icon: BarChart3,
      features: ['Métricas de site', 'Relatórios automáticos', 'Insights de audiência'],
      required: ['GOOGLE_API_KEY', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GA4_PROPERTY_ID'],
      status: apiStatus.google
    },
    {
      id: 'social',
      name: 'Redes Sociais',
      description: 'Publicação automática no Facebook e Instagram',
      icon: Share2,
      features: ['Auto-posting', 'Agendamento', 'Stories'],
      required: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID', 'INSTAGRAM_BUSINESS_ID'],
      status: apiStatus.facebook && apiStatus.instagram
    }
  ];

  const handleConfigureAPI = (apiId: string) => {
    // Aqui você pode implementar a lógica para abrir modais de configuração
    // ou redirecionar para páginas específicas de configuração
    console.log(`Configurar API: ${apiId}`);
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações de IA
          </h1>
          <p className="text-muted-foreground">
            Configure as APIs de inteligência artificial para desbloquear todas as funcionalidades
          </p>
        </div>

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Sistema IA Unificado:</strong> Todas as integrações estão prontas! 
            Basta configurar suas chaves de API para começar a usar os recursos avançados de IA.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiConfigs.map((api) => {
            const IconComponent = api.icon;
            return (
              <Card key={api.id} className={`transition-all hover:shadow-md ${api.status ? 'border-green-200 bg-green-50/30' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${api.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <span>{api.name}</span>
                      <Badge 
                        variant={api.status ? "default" : "secondary"} 
                        className="ml-2"
                      >
                        {api.status ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>{api.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Funcionalidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {api.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Chaves necessárias:</h4>
                      <div className="space-y-1">
                        {api.required.map((key, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Key className="h-3 w-3" />
                            <code className="bg-gray-100 px-1 py-0.5 rounded">{key}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleConfigureAPI(api.id)}
                      variant={api.status ? "outline" : "default"}
                      className="w-full"
                    >
                      {api.status ? "Reconfigurar" : "Configurar Agora"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Visão geral das integrações e funcionalidades disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Bot className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">Chat IA</p>
                <Badge variant={apiStatus.openai ? "default" : "secondary"} className="mt-1">
                  {apiStatus.openai ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">Geração de Imagens</p>
                <Badge variant={apiStatus.openai || apiStatus.stability ? "default" : "secondary"} className="mt-1">
                  {apiStatus.openai || apiStatus.stability ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">Analytics</p>
                <Badge variant={apiStatus.google ? "default" : "secondary"} className="mt-1">
                  {apiStatus.google ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Share2 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="font-medium">Auto-posting</p>
                <Badge variant={apiStatus.facebook && apiStatus.instagram ? "default" : "secondary"} className="mt-1">
                  {apiStatus.facebook && apiStatus.instagram ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> As chaves de API são armazenadas de forma segura no Supabase. 
            Nunca compartilhe suas credenciais e mantenha-as sempre atualizadas.
          </AlertDescription>
        </Alert>
      </div>
    </ModernLayout>
  );
};

export default IAConfiguracoes;
