
import { 
  TypographyH2, 
  TypographyH3, 
  TypographyH4, 
  TypographyP, 
  TypographyList 
} from "@/components/ui/typography";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info } from "lucide-react";

export function ManualUsuario() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual do Usuário</h1>
        <TypographyP>
          Manual completo com todas as funcionalidades do Resto AI CEO para gestão do seu restaurante.
          Consulte esta seção para aprender a utilizar cada módulo do sistema.
        </TypographyP>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800">
          Este manual é atualizado continuamente. Verifique regularmente para acessar as informações mais recentes.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dashboard">
          <AccordionTrigger className="text-lg font-medium">Dashboard e Personalização</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>Visão Geral</TypographyH4>
            <TypographyP>
              O dashboard é a tela inicial do sistema, onde você pode visualizar as principais métricas do seu restaurante.
              Ele é totalmente personalizável de acordo com suas necessidades.
            </TypographyP>
            
            <TypographyH4>Personalizando seu Dashboard</TypographyH4>
            <TypographyList>
              <li>Clique no botão "Personalizar Dashboard" no canto superior direito</li>
              <li>Selecione até 8 KPIs para exibição</li>
              <li>Arraste e reorganize os widgets conforme sua preferência</li>
              <li>Salve suas configurações que serão mantidas para próximos acessos</li>
            </TypographyList>

            <TypographyH4>KPIs Disponíveis</TypographyH4>
            <TypographyP>
              O sistema oferece mais de 20 indicadores de desempenho que podem ser adicionados ao seu dashboard,
              divididos nas categorias Financeiro, Operacional, Custos e Análise.
            </TypographyP>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="goals">
          <AccordionTrigger className="text-lg font-medium">Sistema de Metas</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>Como funciona</TypographyH4>
            <TypographyP>
              O sistema de metas permite definir objetivos específicos para seu restaurante e acompanhar
              o progresso de forma gamificada, desbloqueando conquistas à medida que alcança resultados.
            </TypographyP>
            
            <TypographyH4>Criando Metas</TypographyH4>
            <TypographyList>
              <li>Acesse a seção "Metas" no dashboard</li>
              <li>Clique em "Nova Meta" e preencha os detalhes</li>
              <li>Defina um valor alvo, prazo e categoria</li>
              <li>Opcionalmente, vincule a meta a dados financeiros para atualização automática</li>
            </TypographyList>

            <TypographyH4>Conquistas</TypographyH4>
            <TypographyP>
              Complete metas para desbloquear conquistas. As conquistas são agrupadas por categoria
              e oferecem uma forma divertida de acompanhar o progresso do seu negócio.
            </TypographyP>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="financial">
          <AccordionTrigger className="text-lg font-medium">Gestão Financeira</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>DRE (Demonstrativo de Resultado)</TypographyH4>
            <TypographyP>
              O módulo DRE apresenta uma visão geral das receitas, custos e lucro do seu restaurante.
              Utilize este relatório para analisar a saúde financeira do negócio e identificar oportunidades de melhoria.
            </TypographyP>
            
            <TypographyH4>CMV (Custo da Mercadoria Vendida)</TypographyH4>
            <TypographyP>
              Monitore o CMV por categoria de produto e receba recomendações para redução de custos.
              O sistema analisa automaticamente tendências e sugere ações corretivas.
            </TypographyP>

            <TypographyH4>Fluxo de Caixa</TypographyH4>
            <TypographyList>
              <li>Registre entradas e saídas de caixa por categoria</li>
              <li>Visualize projeções futuras com base nos dados históricos</li>
              <li>Receba alertas sobre períodos de possível déficit de caixa</li>
              <li>Exporte relatórios em PDF ou Excel para reuniões e apresentações</li>
            </TypographyList>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inventory">
          <AccordionTrigger className="text-lg font-medium">Estoque e Compras</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>Gestão de Estoque</TypographyH4>
            <TypographyP>
              Cadastre todos os produtos do seu estoque, defina níveis mínimos e acompanhe o consumo.
              O sistema gera alertas automáticos quando itens precisam ser repostos.
            </TypographyP>
            
            <TypographyH4>Lista de Compras</TypographyH4>
            <TypographyP>
              A lista de compras é gerada automaticamente com base nos níveis de estoque e no consumo previsto.
              Você pode editá-la manualmente antes de enviar para fornecedores.
            </TypographyP>

            <TypographyH4>Controle de Perdas</TypographyH4>
            <TypographyP>
              Registre perdas de estoque para manter seu inventário preciso e identificar problemas
              recorrentes que podem estar impactando sua operação e lucratividade.
            </TypographyP>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recipes">
          <AccordionTrigger className="text-lg font-medium">Fichas Técnicas</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>Criando Fichas Técnicas</TypographyH4>
            <TypographyP>
              Cadastre receitas com ingredientes, quantidades, modo de preparo e informações adicionais.
              O sistema calcula automaticamente o custo de cada prato com base nos preços dos ingredientes.
            </TypographyP>
            
            <TypographyH4>Precificação</TypographyH4>
            <TypographyList>
              <li>Defina sua margem de lucro desejada para cada categoria</li>
              <li>Receba sugestões de preço baseadas no custo e margem</li>
              <li>Compare seus preços com a média do mercado (recurso premium)</li>
              <li>Simule impactos de alterações de preço no volume de vendas</li>
            </TypographyList>

            <TypographyH4>Fotos e Apresentação</TypographyH4>
            <TypographyP>
              Adicione fotos às suas fichas técnicas para padronizar a apresentação dos pratos.
              Isso ajuda sua equipe a manter a consistência na produção.
            </TypographyP>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai">
          <AccordionTrigger className="text-lg font-medium">Gerente IA</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <TypographyH4>Assistente Virtual</TypographyH4>
            <TypographyP>
              O Gerente IA é um assistente virtual que analisa seus dados e oferece recomendações
              personalizadas para melhorar a gestão do seu restaurante.
            </TypographyP>
            
            <TypographyH4>Análises Preditivas</TypographyH4>
            <TypographyP>
              O sistema utiliza inteligência artificial para prever tendências de venda,
              necessidades de estoque e possíveis problemas financeiros.
            </TypographyP>

            <TypographyH4>Recomendações</TypographyH4>
            <TypographyList>
              <li>Otimização de cardápio com base em rentabilidade</li>
              <li>Sugestões para redução de custos específicos</li>
              <li>Ideias para promoções baseadas no histórico de vendas</li>
              <li>Alertas sobre padrões anormais que possam indicar problemas</li>
            </TypographyList>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <TypographyH3>Atalhos de Teclado</TypographyH3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center justify-between p-2 border rounded-md">
          <span>Abrir Busca</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Ctrl + K</span>
        </div>
        <div className="flex items-center justify-between p-2 border rounded-md">
          <span>Salvar Dados</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Ctrl + S</span>
        </div>
        <div className="flex items-center justify-between p-2 border rounded-md">
          <span>Dashboard</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Alt + 1</span>
        </div>
        <div className="flex items-center justify-between p-2 border rounded-md">
          <span>Navegação por Menu</span>
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Alt + Setas</span>
        </div>
      </div>
    </div>
  );
}
