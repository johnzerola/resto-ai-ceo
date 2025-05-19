
import { 
  TypographyH2, 
  TypographyH3, 
  TypographyH4, 
  TypographyP, 
  TypographyList 
} from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Lock, UserCheck, AlertCircle } from "lucide-react";

export function IntegracaoModulos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integração entre Módulos e Segurança</h1>
        <TypographyP>
          Entenda como os diferentes módulos do sistema se integram e compartilham dados, 
          além das medidas de segurança implementadas para proteger suas informações.
        </TypographyP>
      </div>
      
      <TypographyH3>Fluxo de Dados entre Módulos</TypographyH3>
      <TypographyP>
        O Resto AI CEO foi projetado para que todos os módulos compartilhem dados entre si, 
        criando uma experiência integrada que evita a duplicação de informações e mantém a consistência.
      </TypographyP>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">DRE, CMV e Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>
              Transações registradas no Fluxo de Caixa alimentam automaticamente o DRE e os dados de CMV.
              As categorias mapeadas garantem que os dados sejam corretamente classificados.
            </TypographyP>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fichas Técnicas e Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>
              Ingredientes das fichas técnicas são conectados ao estoque para monitoramento automático
              de consumo e alertas de necessidade de reposição.
            </TypographyP>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sistema de Metas e Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>
              Metas financeiras são vinculadas automaticamente aos dados do DRE, CMV e Fluxo de Caixa
              para atualização em tempo real do progresso.
            </TypographyP>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <TypographyH3>Mapeamento de Categorias</TypographyH3>
      <TypographyP>
        Para garantir a correta integração entre os módulos financeiros, o sistema utiliza
        um mapeamento de categorias que classifica cada transação adequadamente.
      </TypographyP>
      
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Categoria no Fluxo de Caixa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Mapeamento Financeiro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Vendas</TableCell>
            <TableCell>Receita</TableCell>
            <TableCell>foodSales</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Delivery</TableCell>
            <TableCell>Receita</TableCell>
            <TableCell>deliverySales</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Eventos</TableCell>
            <TableCell>Receita</TableCell>
            <TableCell>foodSales</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Fornecedores</TableCell>
            <TableCell>Despesa</TableCell>
            <TableCell>foodCost</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Folha de pagamento</TableCell>
            <TableCell>Despesa</TableCell>
            <TableCell>expense</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <TypographyP>
        Este mapeamento pode ser customizado em Configurações > Integrações > Categorias Financeiras.
      </TypographyP>
      
      <Separator />
      
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-blue-600 h-5 w-5" />
        <TypographyH3 className="m-0">Segurança e Proteção de Dados</TypographyH3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TypographyH4>Controle de Acesso</TypographyH4>
          <TypographyP>
            O sistema possui controle granular de permissões baseado em funções:
          </TypographyP>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Nível de Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-500" />
                  Proprietário
                </TableCell>
                <TableCell>Acesso total a todos os módulos e configurações</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  Gerente
                </TableCell>
                <TableCell>Acesso a operações e relatórios, sem configurações avançadas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Funcionário
                </TableCell>
                <TableCell>Acesso limitado a operações específicas do dia a dia</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div>
          <TypographyH4>Proteção de Dados Sensíveis</TypographyH4>
          <TypographyP>
            O sistema adota várias medidas para proteger dados sensíveis:
          </TypographyP>
          <TypographyList>
            <li><strong>Autenticação segura</strong> - Senhas criptografadas e autenticação de múltiplos fatores opcional</li>
            <li><strong>Dados armazenados localmente</strong> - Informações armazenadas no navegador para maior privacidade</li>
            <li><strong>Backups criptografados</strong> - Opção para proteger seus backups com senha</li>
            <li><strong>Registro de atividades</strong> - Histórico de ações realizadas por usuários com data e hora</li>
            <li><strong>Timeout de sessão</strong> - Encerramento automático após período de inatividade</li>
          </TypographyList>
        </div>
      </div>
      
      <Separator />
      
      <TypographyH3>Recomendações de Segurança</TypographyH3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center text-amber-600">
              <Lock className="h-5 w-5 mr-2" />
              <strong>Senhas Fortes</strong>
            </div>
            <TypographyP>
              Utilize senhas complexas com pelo menos 10 caracteres, incluindo letras maiúsculas, minúsculas, 
              números e símbolos. Não compartilhe suas credenciais.
            </TypographyP>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center text-amber-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <strong>Atualizações</strong>
            </div>
            <TypographyP>
              Mantenha seu navegador e sistema sempre atualizados para garantir
              as últimas correções de segurança e melhor desempenho.
            </TypographyP>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center text-amber-600">
              <UserCheck className="h-5 w-5 mr-2" />
              <strong>Revisão de Acessos</strong>
            </div>
            <TypographyP>
              Revise periodicamente os usuários com acesso ao sistema e remova
              contas de colaboradores que não trabalham mais na empresa.
            </TypographyP>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
