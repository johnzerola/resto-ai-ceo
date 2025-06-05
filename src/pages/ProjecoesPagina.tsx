
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProfitForecasting } from "@/components/restaurant/ProfitForecasting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calculator, Target } from "lucide-react";

export function ProjecoesPagina() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projeções e Cenários</h1>
          <p className="text-muted-foreground">
            Planeje o futuro do seu restaurante com projeções inteligentes e análise de cenários
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projeção de Lucro
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Baseada em dados reais
              </div>
              <p className="text-xs text-muted-foreground">
                Projete lucros futuros com precisão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Simulação de Cenários
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Múltiplas variáveis
              </div>
              <p className="text-xs text-muted-foreground">
                Teste diferentes estratégias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planejamento Estratégico
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                Decisões informadas
              </div>
              <p className="text-xs text-muted-foreground">
                Base para investimentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Forecasting Component */}
        <ProfitForecasting />

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar as projeções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">📊 Análise de Cenários</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Use diferentes combinações de parâmetros para entender o impacto de mudanças no negócio.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Alterações de preço</li>
                  <li>• Redução de custos</li>
                  <li>• Aumento de volume</li>
                  <li>• Novos investimentos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🎯 Planejamento Estratégico</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Defina metas realistas e acompanhe o progresso em direção aos objetivos.
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Metas de crescimento</li>
                  <li>• Planejamento de expansão</li>
                  <li>• Análise de ROI</li>
                  <li>• Estratégias de precificação</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
