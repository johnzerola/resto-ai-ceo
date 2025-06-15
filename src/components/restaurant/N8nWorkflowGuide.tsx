
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Workflow, 
  Settings, 
  Database, 
  MessageSquare,
  Shield,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export function N8nWorkflowGuide() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const workflowNodes = [
    {
      name: "Webhook - Receber Pergunta",
      type: "trigger",
      description: "Recebe a pergunta do usuário via HTTP POST",
      config: {
        httpMethod: "POST",
        path: "restaurante-ai",
        responseMode: "responseNode"
      }
    },
    {
      name: "Autenticação",
      type: "function",
      description: "Processa dados de entrada e prepara contexto",
      code: `// Extrair dados da requisição
const message = $json.message;
const restaurantId = $json.restaurantId;

return {
  json: {
    message: message,
    restaurantId: restaurantId,
    timestamp: new Date().toISOString()
  }
};`
    },
    {
      name: "Dados do Restaurante",
      type: "supabase",
      description: "Busca informações básicas do restaurante",
      config: {
        operation: "select",
        table: "restaurants",
        filterType: "manual",
        conditions: "id=eq.{{ $node.Autenticação.json.restaurantId }}"
      }
    },
    {
      name: "Fluxo de Caixa",
      type: "supabase",
      description: "Busca últimas 50 transações financeiras",
      config: {
        operation: "select",
        table: "cash_flow",
        filterType: "manual",
        conditions: "restaurant_id=eq.{{ $node.Autenticação.json.restaurantId }}",
        sort: "date.desc",
        limit: 50
      }
    },
    {
      name: "Estoque",
      type: "supabase",
      description: "Busca dados atuais do inventário",
      config: {
        operation: "select",
        table: "inventory",
        filterType: "manual",
        conditions: "restaurant_id=eq.{{ $node.Autenticação.json.restaurantId }}"
      }
    },
    {
      name: "Receitas e Pratos",
      type: "supabase",
      description: "Busca receitas e pratos cadastrados",
      config: {
        operation: "select",
        table: "recipes",
        filterType: "manual",
        conditions: "restaurant_id=eq.{{ $node.Autenticação.json.restaurantId }}"
      }
    },
    {
      name: "Metas",
      type: "supabase",
      description: "Busca metas definidas pelo usuário",
      config: {
        operation: "select",
        table: "goals",
        filterType: "manual",
        conditions: "restaurant_id=eq.{{ $node.Autenticação.json.restaurantId }}"
      }
    },
    {
      name: "Compilar Contexto",
      type: "function",
      description: "Compila todos os dados em um contexto estruturado",
      code: `// Compilar todos os dados em um contexto estruturado
const authData = $input.first().$node["Autenticação"].json;
const restaurantData = $input.first().$node["Dados do Restaurante"].json[0];
const cashFlowData = $input.first().$node["Fluxo de Caixa"].json;
const inventoryData = $input.first().$node["Estoque"].json;
const recipesData = $input.first().$node["Receitas e Pratos"].json;
const goalsData = $input.first().$node["Metas"].json;

// Calcular métricas úteis
const totalReceitas = cashFlowData
  .filter(item => item.type === 'income')
  .reduce((total, item) => total + parseFloat(item.amount), 0);

const totalDespesas = cashFlowData
  .filter(item => item.type === 'expense')
  .reduce((total, item) => total + parseFloat(item.amount), 0);

const contextData = {
  restaurante: {
    nome: restaurantData?.name,
    tipo: restaurantData?.business_type,
    id: restaurantData?.id
  },
  financeiro: {
    receitas: cashFlowData.filter(item => item.type === 'income'),
    despesas: cashFlowData.filter(item => item.type === 'expense'),
    totalReceitas: totalReceitas,
    totalDespesas: totalDespesas,
    saldoAtual: totalReceitas - totalDespesas,
    ultimasTransacoes: cashFlowData.slice(0, 10)
  },
  estoque: {
    itens: inventoryData,
    totalItens: inventoryData.length,
    itensComEstoqueBaixo: inventoryData.filter(item => 
      item.quantity <= (item.minimum_stock || 0)
    ),
    valorTotalEstoque: inventoryData.reduce((total, item) => 
      total + (parseFloat(item.quantity || 0) * parseFloat(item.cost_per_unit || 0)), 0
    )
  },
  cardapio: {
    receitas: recipesData,
    totalReceitas: recipesData.length,
    categorias: [...new Set(recipesData.map(r => r.category).filter(Boolean))]
  },
  metas: {
    todas: goalsData,
    concluidas: goalsData.filter(m => m.completed),
    pendentes: goalsData.filter(m => !m.completed),
    porcentagemConclusao: goalsData.length > 0 ? 
      (goalsData.filter(m => m.completed).length / goalsData.length) * 100 : 0
  }
};

return {
  json: {
    contexto_completo: JSON.stringify(contextData, null, 2),
    pergunta: authData.message,
    prompt: \`Analise os dados do restaurante e responda à pergunta: "\${authData.message}"\n\nDados do restaurante:\n\${JSON.stringify(contextData, null, 2)}\`
  }
};`
    },
    {
      name: "IA Groq",
      type: "http",
      description: "Chama a API do Groq para gerar resposta inteligente",
      config: {
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          "Authorization": "Bearer SUA_API_KEY_AQUI",
          "Content-Type": "application/json"
        },
        body: {
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Você é um gerente virtual especializado em restaurantes. Analise os dados fornecidos e forneça insights precisos e acionáveis. Sempre cite números específicos quando disponíveis."
            },
            {
              role: "user",
              content: "={{ $node['Compilar Contexto'].json.prompt }}"
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }
      }
    },
    {
      name: "Resposta Final",
      type: "function",
      description: "Formata e retorna a resposta final",
      code: `// Formatar resposta final
const groqResponse = $json.choices[0].message.content;
const contexto = JSON.parse($node['Compilar Contexto'].json.contexto_completo);

return {
  json: {
    response: groqResponse,
    metadata: {
      pergunta: $node['Compilar Contexto'].json.pergunta,
      timestamp: new Date().toISOString(),
      dadosConsultados: {
        transacoesFinanceiras: contexto.financeiro.ultimasTransacoes.length,
        itensEstoque: contexto.estoque.totalItens,
        receitas: contexto.cardapio.totalReceitas,
        metas: contexto.metas.todas.length
      }
    }
  }
};`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Guia de Configuração do Workflow n8n</h2>
        <p className="text-muted-foreground">
          Siga este guia para configurar o workflow n8n que permitirá à IA consultar dados do sistema em tempo real.
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Configure as credenciais do Supabase e Groq antes de ativar o workflow.
          Nunca exponha suas API keys diretamente no código.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {workflowNodes.map((node, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <span>{node.name}</span>
                <Badge variant={
                  node.type === 'trigger' ? 'default' :
                  node.type === 'function' ? 'secondary' :
                  node.type === 'supabase' ? 'outline' : 'destructive'
                }>
                  {node.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{node.description}</p>
              
              {node.config && (
                <div className="space-y-2">
                  <h4 className="font-medium">Configuração:</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(node.config, null, 2)}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(node.config, null, 2), 'Configuração')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Configuração
                  </Button>
                </div>
              )}

              {node.code && (
                <div className="space-y-2">
                  <h4 className="font-medium">Código JavaScript:</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {node.code}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(node.code, 'Código')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Código
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Finais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">1. URL do Webhook</h4>
                <p className="text-sm text-muted-foreground">
                  Após criar o workflow, copie a URL do webhook e atualize na Edge Function:
                </p>
                <code className="block bg-muted p-2 rounded mt-2 text-xs">
                  const n8nWebhookUrl = 'https://SEU_N8N.com/webhook/restaurante-ai';
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">2. Credenciais do Supabase</h4>
                <p className="text-sm text-muted-foreground">
                  Configure as credenciais do Supabase no n8n:
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• URL: https://llndccqumkrblpgystom.supabase.co</li>
                  <li>• Service Role Key: (usar o secret SUPABASE_SERVICE_ROLE_KEY)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">3. API Key do Groq</h4>
                <p className="text-sm text-muted-foreground">
                  Obtenha sua API key gratuita do Groq e configure no nó "IA Groq".
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Obter API Key Groq
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">4. Testar o Workflow</h4>
                <p className="text-sm text-muted-foreground">
                  Após configurar tudo, teste com uma pergunta como: "Qual foi meu faturamento da semana passada?"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
