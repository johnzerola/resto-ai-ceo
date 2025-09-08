import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Target, 
  Package, 
  BarChart3,
  Calculator,
  Utensils,
  TrendingUp,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickActions = [
  { 
    href: '/fluxo-caixa', 
    icon: DollarSign, 
    label: 'Fluxo de Caixa',
    description: 'Controle financeiro',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
  },
  { 
    href: '/metas', 
    icon: Target, 
    label: 'Metas',
    description: 'Objetivos e KPIs',
    color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
  },
  { 
    href: '/estoque', 
    icon: Package, 
    label: 'Estoque',
    description: 'Inventário',
    color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700'
  },
  { 
    href: '/dre', 
    icon: BarChart3, 
    label: 'Relatórios',
    description: 'DRE e análises',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
  },
  { 
    href: '/cmv', 
    icon: Calculator, 
    label: 'CMV',
    description: 'Custo mercadoria',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
  },
  { 
    href: '/cardapio', 
    icon: Utensils, 
    label: 'Cardápio',
    description: 'Gestão de pratos',
    color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
  },
  { 
    href: '/projecoes', 
    icon: TrendingUp, 
    label: 'Projeções',
    description: 'Planejamento',
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
  },
  { 
    href: '/configuracoes', 
    icon: Settings, 
    label: 'Configurações',
    description: 'Sistema',
    color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
  }
];

const QuickActionGrid = memo(function QuickActionGrid() {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-lg">Acesso Rápido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button 
              key={action.href}
              variant="outline" 
              className={cn(
                "h-24 flex-col gap-2 p-4 transition-all duration-200 responsive-button",
                action.color
              )} 
              asChild
            >
              <a href={action.href} className="w-full h-full flex flex-col items-center justify-center gap-2">
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="text-xs font-medium">{action.label}</div>
                  <div className="text-xs opacity-75 hidden sm:block">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default QuickActionGrid;