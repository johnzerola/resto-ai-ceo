
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Crown, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PlanComparisonTable() {
  const features = [
    {
      category: 'Gestão Básica',
      items: [
        { name: 'Dashboard', free: true, essencial: true, profissional: true },
        { name: 'Controle de Estoque', free: false, essencial: true, profissional: true },
        { name: 'Fluxo de Caixa', free: 'Limitado', essencial: true, profissional: true },
        { name: 'Relatórios Básicos', free: true, essencial: true, profissional: true }
      ]
    },
    {
      category: 'Análises Avançadas',
      items: [
        { name: 'Relatórios Avançados', free: false, essencial: true, profissional: true },
        { name: 'Análise Financeira', free: false, essencial: true, profissional: true },
        { name: 'Simulador de Cenários', free: false, essencial: false, profissional: true },
        { name: 'Projeções de Crescimento', free: false, essencial: false, profissional: true }
      ]
    },
    {
      category: 'Inteligência Artificial',
      items: [
        { name: 'Assistente IA Básico', free: false, essencial: 'Limitado', profissional: true },
        { name: 'Assistente IA Completo', free: false, essencial: false, profissional: true },
        { name: 'Social Media IA', free: false, essencial: false, profissional: true },
        { name: 'Recomendações Personalizadas', free: false, essencial: false, profissional: true }
      ]
    },
    {
      category: 'Capacidade',
      items: [
        { name: 'Restaurantes', free: '1', essencial: '2', profissional: '5' },
        { name: 'Itens do Menu', free: '10', essencial: '100', profissional: 'Ilimitado' },
        { name: 'Registros Financeiros', free: '50', essencial: '500', profissional: 'Ilimitado' },
        { name: 'Membros da Equipe', free: '1', essencial: '3', profissional: '10' }
      ]
    },
    {
      category: 'Suporte',
      items: [
        { name: 'Suporte por Email', free: true, essencial: true, profissional: true },
        { name: 'Suporte Prioritário', free: false, essencial: true, profissional: true },
        { name: 'Suporte 24/7', free: false, essencial: false, profissional: true },
        { name: 'Consultoria Especializada', free: false, essencial: false, profissional: true }
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-500 mx-auto" />
      );
    }
    
    if (value === 'Limitado') {
      return (
        <Badge variant="outline" className="text-xs">
          Limitado
        </Badge>
      );
    }
    
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Comparação Detalhada dos Planos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Funcionalidade</th>
                <th className="text-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Zap className="h-6 w-6 text-gray-500" />
                    <span className="font-medium">Gratuito</span>
                    <Badge variant="outline">R$ 0</Badge>
                  </div>
                </th>
                <th className="text-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Star className="h-6 w-6 text-blue-500" />
                    <span className="font-medium">Essencial</span>
                    <Badge className="bg-blue-500">R$ 99/mês</Badge>
                  </div>
                </th>
                <th className="text-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Crown className="h-6 w-6 text-purple-600" />
                    <span className="font-medium">Profissional</span>
                    <Badge className="bg-purple-600">R$ 199/mês</Badge>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="p-4 font-semibold text-sm uppercase tracking-wide">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-b border-muted/30">
                      <td className="p-4 text-sm">{item.name}</td>
                      <td className="p-4 text-center">
                        {renderFeatureValue(item.free)}
                      </td>
                      <td className="p-4 text-center">
                        {renderFeatureValue(item.essencial)}
                      </td>
                      <td className="p-4 text-center">
                        {renderFeatureValue(item.profissional)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
