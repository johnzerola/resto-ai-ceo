
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  TrendingUp,
  DollarSign,
  Package,
  Users,
  FileText
} from 'lucide-react';
import { useSystemValidation } from '@/hooks/useSystemValidation';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { useNavigate } from 'react-router-dom';

export function EnhancedSystemStatusWidget() {
  const { validation, isLoading } = useSystemValidation();
  const { getTotalPendente: getTotalPagar } = useAccountsPayable();
  const { getTotalPendente: getTotalReceber } = useAccountsReceivable();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (validation.completionPercentage >= 90) return 'text-green-600';
    if (validation.completionPercentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (validation.completionPercentage >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  const totalPagar = getTotalPagar();
  const totalReceber = getTotalReceber();
  const saldoFinanceiro = totalReceber - totalPagar;

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            Status do Sistema
            <Badge variant={validation.isValid ? 'default' : 'secondary'}>
              {validation.completionPercentage}% completo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de progresso com cores dinâmicas */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Configuração do Sistema</span>
              <span className={getStatusColor()}>{validation.completionPercentage}%</span>
            </div>
            <Progress 
              value={validation.completionPercentage} 
              className="h-3"
            />
          </div>

          {/* Resumo Financeiro Rápido */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">A Receber</div>
              <div className="text-lg font-bold text-green-600">
                R$ {totalReceber.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">A Pagar</div>
              <div className="text-lg font-bold text-red-600">
                R$ {totalPagar.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Saldo</div>
              <div className={`text-lg font-bold ${saldoFinanceiro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoFinanceiro.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Campos faltantes */}
          {validation.missingFields.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>🚨 Configurações essenciais faltando:</strong>
                <ul className="mt-2 space-y-1">
                  {validation.missingFields.map((field, index) => (
                    <li key={index} className="text-sm">• {field}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Avisos */}
          {validation.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>⚠️ Recomendações importantes:</strong>
                <ul className="mt-2 space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Sistema OK */}
          {validation.isValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ Sistema configurado com sucesso!</strong>
                <p className="mt-1 text-sm">
                  Todos os módulos estão prontos para uso. Você pode começar a cadastrar produtos e acompanhar suas vendas.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Ações rápidas organizadas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/configuracoes')}
              className="flex items-center gap-2 h-10"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/estoque')}
              className="flex items-center gap-2 h-10"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Insumos</span>
              <span className="sm:hidden">Estoque</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/ficha-tecnica-inteligente-completa')}
              className="flex items-center gap-2 h-10"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Ficha Técnica</span>
              <span className="sm:hidden">Receitas</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/fluxo-caixa')}
              className="flex items-center gap-2 h-10"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
              <span className="sm:hidden">Fluxo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
