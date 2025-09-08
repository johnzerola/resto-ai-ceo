import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Package,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedLoader } from '@/components/common/OptimizedLoader';

const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}) => (
  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-700">
        {title}
      </CardTitle>
      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {value}
      </div>
      {description && (
        <p className="text-xs text-slate-600 mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
));

export const FastDashboard = memo(function FastDashboard() {
  const { currentRestaurant, isLoading } = useAuth();

  const mockStats = useMemo(() => ({
    revenue: 'R$ 25.430,00',
    profit: 'R$ 8.950,00', 
    goals: '5',
    inventory: '48'
  }), []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OptimizedLoader type="spinner" text="Carregando sistema..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Simples */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-600 text-sm">
                {currentRestaurant?.name || 'Lucraí CEO'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Rápidas */}
      <div className="px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Receita do Mês"
            value={mockStats.revenue}
            icon={DollarSign}
            description="Performance mensal"
          />
          
          <StatCard
            title="Lucro Líquido"
            value={mockStats.profit}
            icon={TrendingUp}
            description="Margem saudável"
          />
          
          <StatCard
            title="Metas Ativas"
            value={mockStats.goals}
            icon={Target}
            description="Objetivos em andamento"
          />
          
          <StatCard
            title="Itens em Estoque"
            value={mockStats.inventory}
            icon={Package}
            description="Produtos cadastrados"
          />
        </div>

        {/* Ações Rápidas */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/fluxo-de-caixa">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-xs">Fluxo de Caixa</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/metas">
                  <Target className="h-6 w-6" />
                  <span className="text-xs">Metas</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/estoque">
                  <Package className="h-6 w-6" />
                  <span className="text-xs">Estoque</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/dre">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-xs">Relatórios</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});