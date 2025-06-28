
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { systemFeatures, seoKeywords } from "@/utils/system-audit";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Package,
  Target,
  Users,
  Cloud,
  Bell,
  Zap,
  Shield
} from "lucide-react";

const featureIcons = {
  'Precificação Inteligente com Markup Automático': Calculator,
  'DRE Completo em Tempo Real': TrendingUp,
  'Controle de CMV por Produto': DollarSign,
  'Fluxo de Caixa Detalhado': BarChart3,
  'Ficha Técnica Profissional': FileText,
  'Controle de Estoque Integrado': Package,
  'Análise de Rentabilidade por Prato': Target,
  'Projeções Financeiras': TrendingUp,
  'Metas e KPIs Automáticos': Target,
  'Relatórios Gerenciais': FileText,
  'Controle Multi-usuário': Users,
  'Backup Automático na Nuvem': Cloud,
  'Integração com Delivery': Zap,
  'Sincronização Bancária': DollarSign,
  'Emissão de Relatórios PDF': FileText,
  'Dashboard Executivo': BarChart3,
  'Alertas Automáticos': Bell,
  'API para Terceiros': Shield
};

export function SystemFeatures() {
  return (
    <div className="space-y-8">
      {/* SEO Optimized Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Sistema Completo para Gestão Financeira de Restaurantes
        </h1>
        <h2 className="text-xl text-gray-600">
          Precificação Inteligente, DRE, CMV e Fluxo de Caixa em Uma Única Plataforma
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {seoKeywords.slice(0, 8).map((keyword, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Funcionalidades Essenciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemFeatures.core.map((feature, index) => {
              const Icon = featureIcons[feature as keyof typeof featureIcons] || Calculator;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{feature}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Recursos Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemFeatures.advanced.map((feature, index) => {
              const Icon = featureIcons[feature as keyof typeof featureIcons] || BarChart3;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{feature}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Integrações e Conectividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemFeatures.integrations.map((feature, index) => {
              const Icon = featureIcons[feature as keyof typeof featureIcons] || Zap;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{feature}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Como Ter um Restaurante Lucrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              Nosso <strong>sistema para restaurante</strong> oferece todas as ferramentas necessárias 
              para <strong>controle financeiro completo</strong>. Com nossa <strong>precificação inteligente</strong>, 
              você calcula o preço ideal considerando todos os custos, garantindo <strong>margem de lucro adequada</strong>.
            </p>
            
            <p className="text-gray-700">
              O <strong>DRE para restaurante</strong> em tempo real mostra exatamente onde estão seus 
              gastos e receitas, enquanto o <strong>controle de CMV</strong> mantém seus custos sempre 
              atualizados. Nosso <strong>fluxo de caixa detalhado</strong> previne surpresas financeiras.
            </p>
            
            <p className="text-gray-700">
              Seja você proprietário de restaurante, bar, lanchonete ou food truck, nossa 
              <strong>ferramenta de gestão gastronômica</strong> adapta-se ao seu negócio, 
              fornecendo <strong>análises financeiras precisas</strong> e <strong>relatórios gerenciais</strong> 
              que facilitam a tomada de decisão.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
