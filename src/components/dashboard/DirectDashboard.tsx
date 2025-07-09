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

const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  description,
  href
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  href?: string;
}) => (
  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
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
      {href && (
        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs" asChild>
          <a href={href}>Ver detalhes →</a>
        </Button>
      )}
    </CardContent>
  </Card>
));

export const DirectDashboard = memo(function DirectDashboard() {
  const { currentRestaurant, isLoading } = useAuth();

  // Memoizar dados para evitar re-renders desnecessários
  const memoizedStats = useMemo(() => ({
    revenue: 'R$ 25.430,00',
    profit: 'R$ 8.950,00', 
    goals: '5',
    inventory: '48'
  }), []);

  const memoizedQuickActions = useMemo(() => [
    { href: '/fluxo-de-caixa', icon: 'DollarSign', label: 'Fluxo de Caixa' },
    { href: '/metas', icon: 'Target', label: 'Metas' },
    { href: '/estoque', icon: 'Package', label: 'Estoque' },
    { href: '/dre', icon: 'TrendingUp', label: 'Relatórios' }
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Otimizado */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Dashboard Rápido
              </h1>
              <p className="text-slate-600 text-sm">
                {currentRestaurant?.name || 'Lucraí CEO'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Otimizadas */}
      <div className="px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Receita do Mês"
            value={memoizedStats.revenue}
            icon={DollarSign}
            description="Performance mensal"
            href="/fluxo-de-caixa"
          />
          
          <StatCard
            title="Lucro Líquido"
            value={memoizedStats.profit}
            icon={TrendingUp}
            description="Margem saudável"
            href="/dre"
          />
          
          <StatCard
            title="Metas Ativas"
            value={memoizedStats.goals}
            icon={Target}
            description="Objetivos em andamento"
            href="/metas"
          />
          
          <StatCard
            title="Itens em Estoque"
            value={memoizedStats.inventory}
            icon={Package}
            description="Produtos cadastrados"
            href="/estoque"
          />
        </div>

        {/* Ações Rápidas Otimizadas */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Acesso Rápido</CardTitle>
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

        {/* Status do Sistema */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900">Status do Sistema</h3>
                <p className="text-xs text-slate-600 mt-1">Todas as funcionalidades operacionais</p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                ✓ Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});