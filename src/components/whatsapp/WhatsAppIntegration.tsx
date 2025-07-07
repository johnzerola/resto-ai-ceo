import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle,
  Bot,
  Mic,
  Camera,
  FileText,
  Zap,
  CheckCircle,
  Settings,
  Send,
  Phone,
  Image,
  BarChart3,
  DollarSign,
  Package,
  AlertTriangle,
  PlayCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppCommand {
  id: string;
  command: string;
  description: string;
  example: string;
  category: "sales" | "inventory" | "expenses" | "reports";
  type: "text" | "voice" | "image";
}

interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  webhook_url: string;
  triggers: string[];
  actions: string[];
  status: "active" | "inactive";
}

export function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [commands, setCommands] = useState<WhatsAppCommand[]>([]);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [activeTab, setActiveTab] = useState("setup");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    generateCommands();
    generateWorkflows();
  }, []);

  const generateCommands = () => {
    const commandsList: WhatsAppCommand[] = [
      {
        id: "1",
        command: "vendi {quantidade} {produto}",
        description: "Registrar venda de produto",
        example: "vendi 5 pizza margherita",
        category: "sales",
        type: "text"
      },
      {
        id: "2",
        command: "comprei {item} R$ {valor}",
        description: "Registrar compra de ingrediente",
        example: "comprei 10kg mussarela R$ 80",
        category: "inventory",
        type: "text"
      },
      {
        id: "3",
        command: "acabou {ingrediente}",
        description: "Alertar sobre estoque zerado",
        example: "acabou molho de tomate",
        category: "inventory",
        type: "text"
      },
      {
        id: "4",
        command: "vendas hoje",
        description: "Relatório de vendas por voz",
        example: "Envie áudio: 'vendas hoje'",
        category: "reports",
        type: "voice"
      },
      {
        id: "5",
        command: "despesa {categoria} R$ {valor}",
        description: "Registrar despesa",
        example: "despesa luz R$ 280",
        category: "expenses",
        type: "text"
      },
      {
        id: "6",
        command: "nota fiscal",
        description: "Extrair dados de nota por foto",
        example: "Tire foto da nota fiscal",
        category: "expenses",
        type: "image"
      }
    ];
    setCommands(commandsList);
  };

  const generateWorkflows = () => {
    const workflowsList: N8nWorkflow[] = [
      {
        id: "1",
        name: "Registro de Vendas Automático",
        description: "Captura mensagens de venda e atualiza sistema",
        webhook_url: "https://n8n.exemplo.com/webhook/vendas",
        triggers: ["vendi", "venda", "vendeu"],
        actions: ["Atualizar faturamento", "Calcular CMV", "Atualizar estoque"],
        status: "active"
      },
      {
        id: "2",
        name: "Controle de Estoque Inteligente",
        description: "Monitora estoque e envia alertas automáticos",
        webhook_url: "https://n8n.exemplo.com/webhook/estoque",
        triggers: ["acabou", "estoque baixo", "comprei"],
        actions: ["Atualizar estoque", "Gerar lista de compras", "Alertar gestor"],
        status: "active"
      },
      {
        id: "3",
        name: "Análise de Notas Fiscais",
        description: "OCR automático de notas fiscais por foto",
        webhook_url: "https://n8n.exemplo.com/webhook/ocr",
        triggers: ["foto de nota", "imagem"],
        actions: ["Extrair dados", "Categorizar despesas", "Atualizar custos"],
        status: "inactive"
      },
      {
        id: "4",
        name: "Relatórios por Voz",
        description: "Gera relatórios falados automáticamente",
        webhook_url: "https://n8n.exemplo.com/webhook/relatorios",
        triggers: ["relatório", "como está", "vendas"],
        actions: ["Calcular métricas", "Gerar áudio", "Enviar WhatsApp"],
        status: "active"
      }
    ];
    setWorkflows(workflowsList);
  };

  const handleConnect = () => {
    if (phoneNumber.length < 10) {
      toast.error("Digite um número válido");
      return;
    }
    
    setIsConnected(true);
    toast.success("WhatsApp conectado com sucesso!", {
      description: "Agora você pode gerenciar seu restaurante por mensagem"
    });
  };

  const handleTestMessage = () => {
    if (!testMessage.trim()) {
      toast.error("Digite uma mensagem para testar");
      return;
    }

    toast.success("Mensagem processada!", {
      description: "Comando enviado para o sistema com sucesso"
    });
    setTestMessage("");
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para área de transferência");
  };

  const renderSetup = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Conectar WhatsApp</CardTitle>
              <CardDescription>Configure sua integração em 3 passos simples</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">1. Número do WhatsApp</h4>
              <p className="text-sm text-muted-foreground">Digite o número que receberá os comandos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">2. Configurar N8n</h4>
              <p className="text-sm text-muted-foreground">Conecte os workflows de automação</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Testar & Usar</h4>
              <p className="text-sm text-muted-foreground">Teste os comandos e comece a usar</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Número do WhatsApp</label>
              <div className="flex gap-3">
                <Input
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleConnect}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isConnected}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conectar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isConnected && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Parabéns!</strong> Seu WhatsApp está conectado. Agora você pode enviar comandos para gerenciar seu restaurante.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommands = () => (
    <div className="space-y-6">
      {["sales", "inventory", "expenses", "reports"].map((category) => (
        <Card key={category} className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg capitalize flex items-center gap-2">
              {category === "sales" && <DollarSign className="h-5 w-5 text-green-500" />}
              {category === "inventory" && <Package className="h-5 w-5 text-blue-500" />}
              {category === "expenses" && <AlertTriangle className="h-5 w-5 text-red-500" />}
              {category === "reports" && <BarChart3 className="h-5 w-5 text-purple-500" />}
              {category === "sales" ? "Vendas" : 
               category === "inventory" ? "Estoque" :
               category === "expenses" ? "Despesas" : "Relatórios"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {commands.filter(cmd => cmd.category === category).map((command) => (
                <div key={command.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        command.type === "text" ? "bg-blue-100" :
                        command.type === "voice" ? "bg-green-100" : "bg-purple-100"
                      }`}>
                        {command.type === "text" && <FileText className="h-4 w-4 text-blue-600" />}
                        {command.type === "voice" && <Mic className="h-4 w-4 text-green-600" />}
                        {command.type === "image" && <Camera className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{command.command}</h4>
                        <p className="text-sm text-muted-foreground">{command.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {command.type}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">💡 Exemplo:</p>
                    <p className="text-sm text-gray-600 mt-1">{command.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderN8nIntegration = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Workflows N8n Ativos
          </CardTitle>
          <CardDescription>
            Automações que processam seus comandos do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                        {workflow.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Palavras-chave que ativam:</h5>
                    <div className="flex flex-wrap gap-1">
                      {workflow.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Ações executadas:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {workflow.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                      {workflow.webhook_url}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyWebhookUrl(workflow.webhook_url)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Abrir N8n
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTesting = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-500" />
            Testar Comandos
          </CardTitle>
          <CardDescription>
            Simule comandos do WhatsApp para verificar se estão funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Simular mensagem do WhatsApp:</label>
            <div className="flex gap-3">
              <Textarea
                placeholder="Digite um comando... Ex: vendi 3 pizza margherita"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1"
                rows={3}
              />
            </div>
          </div>
          <Button onClick={handleTestMessage} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Testar Comando
          </Button>

          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Teste comandos como "vendi 5 pizza", "acabou queijo", ou "vendas hoje" para ver como o sistema responde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Integração WhatsApp + N8n
            </h2>
            <p className="text-muted-foreground text-sm">Primeira solução no Brasil para gestão por WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted h-12">
          <TabsTrigger value="setup" className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Configurar
          </TabsTrigger>
          <TabsTrigger value="commands" className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4" />
            Comandos
          </TabsTrigger>
          <TabsTrigger value="n8n" className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            N8n Workflows
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2 text-sm">
            <PlayCircle className="h-4 w-4" />
            Testar
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="setup">{renderSetup()}</TabsContent>
          <TabsContent value="commands">{renderCommands()}</TabsContent>
          <TabsContent value="n8n">{renderN8nIntegration()}</TabsContent>
          <TabsContent value="testing">{renderTesting()}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}