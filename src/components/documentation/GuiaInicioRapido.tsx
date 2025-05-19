
import { 
  TypographyH2, 
  TypographyH3, 
  TypographyH4, 
  TypographyP, 
  TypographyList 
} from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function GuiaInicioRapido() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Guia de Início Rápido</h1>
        <TypographyP>
          Este guia ajudará você a começar a usar o sistema Resto AI CEO rapidamente. 
          Siga os passos abaixo para configurar seu restaurante e começar a usar as funcionalidades.
        </TypographyP>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              1
            </div>
            <TypographyH4>Primeiros Passos</TypographyH4>
            <TypographyP>
              Crie sua conta e configure os dados básicos do seu restaurante.
            </TypographyP>
            <TypographyList>
              <li>Faça login com suas credenciais</li>
              <li>Preencha os dados do estabelecimento</li>
              <li>Convide sua equipe para acessar o sistema</li>
            </TypographyList>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              2
            </div>
            <TypographyH4>Configuração Financeira</TypographyH4>
            <TypographyP>
              Configure os dados financeiros para análises precisas.
            </TypographyP>
            <TypographyList>
              <li>Configure categorias de receita e despesa</li>
              <li>Defina suas metas de CMV e margem de lucro</li>
              <li>Importe dados financeiros existentes (opcional)</li>
            </TypographyList>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              3
            </div>
            <TypographyH4>Use o Dashboard</TypographyH4>
            <TypographyP>
              Personalize seu dashboard e comece a acompanhar métricas.
            </TypographyP>
            <TypographyList>
              <li>Selecione os KPIs mais importantes</li>
              <li>Configure metas de desempenho</li>
              <li>Verifique relatórios diários e semanais</li>
            </TypographyList>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <TypographyH3>Funções Principais</TypographyH3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TypographyH4>Ficha Técnica</TypographyH4>
          <TypographyP>
            Cadastre suas receitas, ingredientes e calcule custos automaticamente.
            Controle suas margens de lucro por prato e monitore variações de custo.
          </TypographyP>
        </div>

        <div>
          <TypographyH4>Estoque</TypographyH4>
          <TypographyP>
            Gerencie seu inventário, defina níveis mínimos de estoque e
            receba alertas automáticos para compras. Evite perdas e desperdícios.
          </TypographyP>
        </div>

        <div>
          <TypographyH4>DRE e CMV</TypographyH4>
          <TypographyP>
            Acompanhe seu Demonstrativo de Resultado e Custo da Mercadoria Vendida.
            Visualize gráficos e relatórios detalhados sobre sua operação financeira.
          </TypographyP>
        </div>

        <div>
          <TypographyH4>Fluxo de Caixa</TypographyH4>
          <TypographyP>
            Registre entradas e saídas, categorize transações e planeje seu fluxo de caixa futuro.
            Evite surpresas financeiras com projeções precisas.
          </TypographyP>
        </div>
      </div>

      <Separator />

      <TypographyH3>Recursos Avançados</TypographyH3>
      <TypographyP>
        O sistema Resto AI CEO oferece recursos avançados para ajudar na gestão do seu restaurante:
      </TypographyP>
      <TypographyList>
        <li><strong>Gerente IA</strong> - Assistente virtual que analisa seus dados e oferece recomendações</li>
        <li><strong>Sistema de Metas</strong> - Defina objetivos e acompanhe seu progresso com gamificação</li>
        <li><strong>Simulador</strong> - Teste cenários financeiros antes de implementá-los</li>
        <li><strong>Marketing</strong> - Ferramentas para planejar e avaliar campanhas promocionais</li>
      </TypographyList>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
        <TypographyH4 className="mt-0">Precisa de ajuda?</TypographyH4>
        <TypographyP>
          Caso tenha dúvidas ou precise de suporte, acesse o manual completo do usuário 
          ou entre em contato com nosso suporte através do menu Configurações.
        </TypographyP>
      </div>
    </div>
  );
}
