
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DRECompleto } from './DRECompleto';
import { KPIManager } from './KPIManager';
import { AlertCenter } from './AlertCenter';
import { BarChart3, Target, AlertTriangle, TrendingUp } from 'lucide-react';

export function FinancialDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Sistema Financeiro Completo
        </h1>
        <p className="text-muted-foreground">
          Análise Harvard + Oxford + MIT para transformar seu restaurante em máquina lucrativa
        </p>
      </div>

      <Tabs defaultValue="dre" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dre" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            DRE Completo
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            KPIs Diários
          </TabsTrigger>
          <TabsTrigger value="alertas" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-6">
          <DRECompleto />
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <KPIManager />
        </TabsContent>

        <TabsContent value="alertas" className="space-y-6">
          <AlertCenter />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Como Tornar Seu Restaurante Lucrativo</h3>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 1. Controle Rigoroso do CMV</h4>
                <p className="text-sm text-blue-700">
                  Mantenha o CMV entre 25-35%. Monitore diariamente através dos KPIs e 
                  ajuste preços ou fornecedores quando necessário.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">💰 2. Margem Líquida Ideal</h4>
                <p className="text-sm text-green-700">
                  Trabalhe para atingir margem líquida de 15-25%. Use o DRE para 
                  identificar onde estão os vazamentos de dinheiro.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🎯 3. Metas Baseadas em Dados</h4>
                <p className="text-sm text-purple-700">
                  Use os KPIs para definir metas realistas e acompanhe diariamente 
                  o desempenho. Ajuste estratégias rapidamente.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Benchmarks da Indústria</h3>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">📈 Métricas de Sucesso</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• CMV: 25-35% da receita</li>
                  <li>• Margem líquida: 15-25%</li>
                  <li>• Ticket médio: R$ 25-45</li>
                  <li>• Giro de estoque: 4-6x/mês</li>
                  <li>• Despesas fixas: max 30%</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Sinais de Alerta</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• CMV maior que 40%</li>
                  <li>• Margem líquida menor que 5%</li>
                  <li>• Receita em queda por mais de 3 meses</li>
                  <li>• Estoque parado por mais de 15 dias</li>
                  <li>• Despesas maiores que 60% da receita</li>
                </ul>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">🎓 Dicas dos Especialistas</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Analise dados diariamente</li>
                  <li>• Ajuste preços mensalmente</li>
                  <li>• Negocie com fornecedores</li>
                  <li>• Invista em treinamento</li>
                  <li>• Use tecnologia a seu favor</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
