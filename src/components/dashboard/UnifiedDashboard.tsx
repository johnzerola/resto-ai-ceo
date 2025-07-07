import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  AlertTriangle,
  Package,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useOptimizedQueries";
import { useDataMigration } from "@/hooks/useDataMigration";
import { formatCurrency } from "@/lib/utils";

// Loading skeleton limpo e profissional
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-20 bg-muted rounded-lg"></div>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-lg"></div>
      ))}
    </div>
    <div className="h-48 bg-muted rounded-lg"></div>
  </div>
);

// Card de métrica clean e objetivo
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const MetricCard = ({ title, value, description, icon: Icon, trend, trendValue, variant = 'default' }: MetricCardProps) => {
  const variants = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    destructive: 'border-red-200 bg-red-50'
  };

  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    destructive: 'text-red-600'
  };

  return (
    <Card className={`${variants[variant]} border`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600">{description}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Status card para mostrar estado atual do sistema
const SystemStatusCard = ({ currentRestaurant }: { currentRestaurant: any }) => {
  const hasData = {
    restaurant: !!currentRestaurant,
    cashFlow: false, // Será atualizado com dados reais
    goals: false,
    inventory: false
  };

  const setupProgress = Object.values(hasData).filter(Boolean).length / Object.keys(hasData).length * 100;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-lg text-blue-900">Status do Sistema</CardTitle>
            <p className="text-sm text-blue-700">Configuração do seu restaurante</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Configuração Completa</span>
              <span className="text-sm text-blue-700">{Math.round(setupProgress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${setupProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${hasData.restaurant ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-blue-900">Restaurante Criado</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${hasData.cashFlow ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-blue-900">Fluxo de Caixa</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className={`h-4 w-4 ${hasData.goals ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-blue-900">Metas Definidas</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className={`h-4 w-4 ${hasData.inventory ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm text-blue-900">Estoque Configurado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick actions para guiar o usuário
const QuickActionsCard = () => {
  const actions = [
    {
      title: "Adicionar Receita",
      description: "Registre suas vendas do dia",
      href: "/fluxo-de-caixa",
      icon: DollarSign,
      variant: "success" as const
    },
    {
      title: "Criar Meta",
      description: "Defina objetivos mensais",
      href: "/metas",
      icon: Target,
      variant: "default" as const
    },
    {
      title: "Gerenciar Estoque",
      description: "Controle seus insumos",
      href: "/estoque",
      icon: Package,
      variant: "default" as const
    },
    {
      title: "Ficha Técnica",
      description: "Calcule custos dos pratos",
      href: "/ficha-tecnica-inteligente-completa",
      icon: PieChart,
      variant: "default" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                action.variant === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function UnifiedDashboard() {
  const { currentRestaurant } = useAuth();
  const { data, isLoading, error } = useDashboardData();
  
  // Migração automática de dados do localStorage
  useDataMigration();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Extrair métricas reais dos dados
  const metrics = data?.metrics || {
    receita_total: 0,
    cmv_valor: 0,
    lucro_bruto: 0,
    margem_bruta_percentual: 0
  };

  const cashFlowCount = data?.cashFlow?.length || 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header clean e direto */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Visão geral do {currentRestaurant?.name || "seu restaurante"}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Dados em tempo real
        </Badge>
      </div>

      {/* Métricas principais - apenas dados reais */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(metrics.receita_total)}
          description="Receita do mês atual"
          icon={DollarSign}
          variant={metrics.receita_total > 0 ? "success" : "default"}
        />
        
        <MetricCard
          title="CMV"
          value={formatCurrency(metrics.cmv_valor)}
          description={`${(metrics as any).cmv_percentual?.toFixed(1) || 0}% da receita`}
          icon={PieChart}
          variant={(metrics as any).cmv_percentual > 35 ? "warning" : "default"}
        />
        
        <MetricCard
          title="Lucro Bruto"
          value={formatCurrency(metrics.lucro_bruto)}
          description={`Margem: ${metrics.margem_bruta_percentual?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          variant={metrics.lucro_bruto > 0 ? "success" : metrics.lucro_bruto < 0 ? "destructive" : "default"}
        />
        
        <MetricCard
          title="Transações"
          value={cashFlowCount.toString()}
          description="Registros financeiros"
          icon={Activity}
          variant="default"
        />
      </div>

      {/* Cards de sistema e ações - apenas úteis */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SystemStatusCard currentRestaurant={currentRestaurant} />
        <QuickActionsCard />
      </div>

      {/* Alerta se não há dados */}
      {metrics.receita_total === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Comece agora:</strong> Registre suas primeiras receitas e despesas no{" "}
            <a href="/fluxo-de-caixa" className="underline text-blue-600 hover:text-blue-800">
              Fluxo de Caixa
            </a>{" "}
            para ver suas métricas financeiras.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}