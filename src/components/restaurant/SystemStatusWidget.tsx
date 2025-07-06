
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { useSystemValidation } from '@/hooks/useSystemValidation';
import { useNavigate } from 'react-router-dom';

export function SystemStatusWidget() {
  const { validation, isLoading } = useSystemValidation();
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

  return (
    <Card className="mb-6">
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
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              validation.completionPercentage >= 90 ? 'bg-green-500' :
              validation.completionPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${validation.completionPercentage}%` }}
          />
        </div>

        {/* Campos faltantes */}
        {validation.missingFields.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Configurações essenciais faltando:</strong>
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
              <strong>Recomendações:</strong>
              <ul className="mt-2 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">• {warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/configuracoes')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Gestão de Tarefas
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/estoque')}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Insumos
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/ficha-tecnica-inteligente-completa')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Ficha Técnica
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
