
import { Layout } from "@/components/restaurant/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCode, Shield, Database, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/services/AuthService";

const Documentacao = () => {
  const { user, hasPermission } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Verificar permissões - apenas proprietário ou gerente pode ver esta página
  if (!hasPermission(UserRole.MANAGER)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Alert className="bg-amber-50 border-amber-200">
            <Shield className="h-5 w-5 text-amber-500" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription>
              Esta documentação técnica é destinada apenas a administradores do sistema.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Documentação Técnica</h1>
        <p className="text-lg text-gray-700 mb-8">
          Esta área contém documentação técnica para desenvolvedores que trabalham na manutenção
          e aprimoramento do Resto AI CEO. Você encontrará informações sobre a estrutura do código,
          componentes principais e instruções para implementar novas funcionalidades.
        </p>

        <Tabs defaultValue="estrutura" className="mb-10">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="estrutura">Estrutura do Projeto</TabsTrigger>
            <TabsTrigger value="componentes">Componentes</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="melhorias">Melhorias Futuras</TabsTrigger>
          </TabsList>
          
          <TabsContent value="estrutura">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Estrutura do Projeto
                </CardTitle>
                <CardDescription>
                  Organização de diretórios e arquivos principais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Diretórios Principais</h3>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/components</span> - 
                      Componentes React reutilizáveis, separados por contexto
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/pages</span> - 
                      Páginas principais da aplicação
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/contexts</span> - 
                      Contextos React para gerenciamento de estado global
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/services</span> - 
                      Serviços para lógica de negócio e integrações
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/hooks</span> - 
                      Hooks customizados para lógica compartilhada
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/lib</span> - 
                      Utilidades e funções auxiliares
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Arquivos Principais</h3>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/App.tsx</span> - 
                      Configuração de roteamento e provedores de contexto
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/main.tsx</span> - 
                      Ponto de entrada da aplicação
                    </li>
                    <li className="text-gray-700">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">src/contexts/AuthContext.tsx</span> - 
                      Gerenciamento de autenticação e controle de acesso
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tecnologias Utilizadas</h3>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li className="text-gray-700">React + TypeScript</li>
                    <li className="text-gray-700">Tailwind CSS para estilização</li>
                    <li className="text-gray-700">React Router para navegação</li>
                    <li className="text-gray-700">Shadcn UI para componentes de interface</li>
                    <li className="text-gray-700">React Query para gerenciamento de estado servidor</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="componentes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Componentes Principais
                </CardTitle>
                <CardDescription>
                  Documentação dos componentes mais importantes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Layout e Navegação</h3>
                  <ul className="list-disc list-inside space-y-4 pl-4">
                    <li className="text-gray-700">
                      <strong className="font-mono">Layout</strong> - Componente principal de layout 
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleSection('layout')}
                        className="ml-2"
                      >
                        {expandedSection === 'layout' ? 'Ocultar' : 'Ver detalhes'}
                      </Button>
                      
                      {expandedSection === 'layout' && (
                        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="mb-2">
                            O componente <code>Layout</code> é a estrutura principal que envolve todas as páginas da aplicação.
                            Ele é responsável por renderizar:
                          </p>
                          <ul className="list-disc list-inside pl-4 mb-2">
                            <li>Barra lateral (Sidebar) com navegação</li>
                            <li>Cabeçalho com menu de usuário</li>
                            <li>Container principal para o conteúdo</li>
                            <li>Assistente IA</li>
                          </ul>
                          <p>
                            <strong>Localização:</strong> <code>src/components/restaurant/Layout.tsx</code>
                          </p>
                        </div>
                      )}
                    </li>
                    
                    <li className="text-gray-700">
                      <strong className="font-mono">Sidebar</strong> - Barra lateral de navegação
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleSection('sidebar')}
                        className="ml-2"
                      >
                        {expandedSection === 'sidebar' ? 'Ocultar' : 'Ver detalhes'}
                      </Button>
                      
                      {expandedSection === 'sidebar' && (
                        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="mb-2">
                            O componente <code>Sidebar</code> exibe links de navegação para as diferentes seções do aplicativo.
                            Características principais:
                          </p>
                          <ul className="list-disc list-inside pl-4 mb-2">
                            <li>Design responsivo que se adapta a dispositivos móveis</li>
                            <li>Funcionalidade de colapsar/expandir</li>
                            <li>Indicação visual da página atual</li>
                          </ul>
                          <p>
                            <strong>Localização:</strong> <code>src/components/restaurant/Sidebar.tsx</code>
                          </p>
                        </div>
                      )}
                    </li>
                    
                    <li className="text-gray-700">
                      <strong className="font-mono">ProtectedRoute</strong> - Controle de acesso baseado em papéis
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleSection('protectedRoute')}
                        className="ml-2"
                      >
                        {expandedSection === 'protectedRoute' ? 'Ocultar' : 'Ver detalhes'}
                      </Button>
                      
                      {expandedSection === 'protectedRoute' && (
                        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="mb-2">
                            O componente <code>ProtectedRoute</code> implementa a lógica de controle de acesso baseada em papéis.
                            Ele verifica:
                          </p>
                          <ul className="list-disc list-inside pl-4 mb-2">
                            <li>Se o usuário está autenticado</li>
                            <li>Se o usuário possui o papel (role) necessário para acessar a rota</li>
                            <li>Redireciona para login ou página de acesso negado quando necessário</li>
                          </ul>
                          <p>
                            <strong>Localização:</strong> <code>src/components/auth/ProtectedRoute.tsx</code>
                          </p>
                        </div>
                      )}
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Módulos de Negócio</h3>
                  <ul className="list-disc list-inside space-y-4 pl-4">
                    <li className="text-gray-700">
                      <strong className="font-mono">RecipeForm</strong> - Formulário de cadastro de receitas
                    </li>
                    <li className="text-gray-700">
                      <strong className="font-mono">InventoryOverview</strong> - Visão geral do estoque
                    </li>
                    <li className="text-gray-700">
                      <strong className="font-mono">CashFlowForm</strong> - Formulário de registro de fluxo de caixa
                    </li>
                    <li className="text-gray-700">
                      <strong className="font-mono">DREOverview</strong> - Demonstrativo de Resultados do Exercício
                    </li>
                    <li className="text-gray-700">
                      <strong className="font-mono">CMVAnalysis</strong> - Análise de Custo de Mercadorias Vendidas
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="servicos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Serviços
                </CardTitle>
                <CardDescription>
                  Serviços principais para lógica de negócios e integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 text-lg">Serviços de Dados e Integração</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-semibold mb-2">AuthService</h4>
                      <p className="mb-2">
                        Gerencia autenticação, registro de usuários e controle de acesso baseado em papéis.
                      </p>
                      <ul className="list-disc list-inside pl-4 mb-2">
                        <li>Enumeração <code>UserRole</code> define níveis de acesso: OWNER, MANAGER, EMPLOYEE</li>
                        <li>Funções para registro, login, logout e verificação de permissões</li>
                        <li>Armazena dados temporariamente no localStorage</li>
                        <li><span className="text-amber-600 font-medium">⚠️ Pendência:</span> Migrar para banco de dados seguro</li>
                      </ul>
                      <p><strong>Localização:</strong> <code>src/services/AuthService.ts</code></p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-semibold mb-2">SyncService</h4>
                      <p className="mb-2">
                        Gerencia sincronização de dados entre diferentes módulos da aplicação.
                      </p>
                      <ul className="list-disc list-inside pl-4 mb-2">
                        <li>Sincroniza dados entre módulos como estoque, ficha técnica, DRE, etc.</li>
                        <li>Implementa eventos personalizados para comunicação entre componentes</li>
                        <li><span className="text-amber-600 font-medium">⚠️ Pendência:</span> Refatorar para reduzir tamanho e complexidade</li>
                      </ul>
                      <p><strong>Localização:</strong> <code>src/services/SyncService.ts</code></p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-semibold mb-2">FinancialDataService</h4>
                      <p className="mb-2">
                        Gerencia dados financeiros como DRE, CMV e fluxo de caixa.
                      </p>
                      <ul className="list-disc list-inside pl-4 mb-2">
                        <li>Calcula indicadores financeiros como margem de lucro, CMV, etc.</li>
                        <li>Armazena dados temporariamente no localStorage</li>
                        <li><span className="text-amber-600 font-medium">⚠️ Pendência:</span> Migrar para banco de dados seguro</li>
                      </ul>
                      <p><strong>Localização:</strong> <code>src/services/FinancialDataService.ts</code></p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <h4 className="font-semibold mb-2">ModuleIntegrationService</h4>
                      <p className="mb-2">
                        Gerencia integração entre diferentes módulos do sistema.
                      </p>
                      <ul className="list-disc list-inside pl-4">
                        <li>Sistema de alertas e notificações</li>
                        <li>Comunicação entre módulos</li>
                      </ul>
                      <p><strong>Localização:</strong> <code>src/services/ModuleIntegrationService.ts</code></p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Contextos React</h3>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="font-semibold mb-2">AuthContext</h4>
                    <p className="mb-2">
                      Contexto React para compartilhamento de estado de autenticação e funções relacionadas.
                    </p>
                    <ul className="list-disc list-inside pl-4">
                      <li>Fornece acesso ao usuário atual</li>
                      <li>Funções de login/logout em toda a aplicação</li>
                      <li>Verificação de permissões</li>
                    </ul>
                    <p><strong>Localização:</strong> <code>src/contexts/AuthContext.tsx</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="melhorias">
            <Card>
              <CardHeader>
                <CardTitle>Melhorias Futuras</CardTitle>
                <CardDescription>
                  Sugestões para aprimoramento e expansão do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                    <h3 className="font-semibold mb-2 text-amber-800">Segurança e Persistência de Dados</h3>
                    <ul className="list-disc list-inside space-y-2 pl-4 text-amber-700">
                      <li>
                        <strong>Migrar para banco de dados seguro</strong> - Substituir o armazenamento local (localStorage) 
                        por um banco de dados como Firebase, PostgreSQL ou MongoDB
                      </li>
                      <li>
                        <strong>Implementar criptografia</strong> - Adicionar criptografia para dados sensíveis
                      </li>
                      <li>
                        <strong>Melhorar autenticação</strong> - Implementar autenticação baseada em JWT ou OAuth
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h3 className="font-semibold mb-2 text-blue-800">Performance e Escalabilidade</h3>
                    <ul className="list-disc list-inside space-y-2 pl-4 text-blue-700">
                      <li>
                        <strong>Refatorar serviços grandes</strong> - Dividir SyncService e AuthService em módulos menores
                      </li>
                      <li>
                        <strong>Implementar lazy loading</strong> - Carregar componentes sob demanda para melhorar performance
                      </li>
                      <li>
                        <strong>Otimizar renderização</strong> - Usar React.memo e useCallback para reduzir re-renderizações
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-md border border-green-200">
                    <h3 className="font-semibold mb-2 text-green-800">Novas Funcionalidades</h3>
                    <ul className="list-disc list-inside space-y-2 pl-4 text-green-700">
                      <li>
                        <strong>Modo offline</strong> - Implementar funcionalidades offline com sincronização quando online
                      </li>
                      <li>
                        <strong>Relatórios avançados</strong> - Adicionar mais opções de relatórios e análises
                      </li>
                      <li>
                        <strong>Integração com PDV</strong> - Conectar com sistemas de Ponto de Venda
                      </li>
                      <li>
                        <strong>Módulo de RH</strong> - Gerenciamento de funcionários, escalas e pagamentos
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                    <h3 className="font-semibold mb-2 text-purple-800">Experiência do Usuário</h3>
                    <ul className="list-disc list-inside space-y-2 pl-4 text-purple-700">
                      <li>
                        <strong>Tema personalizável</strong> - Permitir personalização de cores e tema
                      </li>
                      <li>
                        <strong>Tutoriais interativos</strong> - Adicionar tutoriais para novos usuários
                      </li>
                      <li>
                        <strong>Notificações push</strong> - Implementar sistema de notificações em tempo real
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Alert className="bg-blue-50 border-blue-200 mb-8">
          <Code className="h-5 w-5 text-blue-500" />
          <AlertTitle>Guia para Desenvolvedores</AlertTitle>
          <AlertDescription className="text-blue-700">
            Esta documentação está em constante evolução. Se você é um desenvolvedor trabalhando
            neste projeto, sinta-se à vontade para expandir e melhorar esta documentação à medida
            que o sistema evolui.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default Documentacao;
