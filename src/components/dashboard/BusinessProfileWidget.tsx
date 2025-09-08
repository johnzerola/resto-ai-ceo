import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { 
  Building2, 
  TrendingUp, 
  Target, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Lightbulb
} from "lucide-react";

export const BusinessProfileWidget = () => {
  const { profile, isLoading } = useBusinessProfile();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não há perfil empresarial, mostrar banner para preenchimento
  if (!profile) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Complete seu perfil empresarial!</strong>
            <p className="text-sm text-muted-foreground mt-1">
              Configure os dados do seu negócio para receber insights inteligentes e projeções personalizadas.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/dados-negocio')}
            className="ml-4"
          >
            Configurar Agora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Calcular métricas de destaque
  const dailyRevenue = profile.average_monthly_revenue / 30;
  const dailyTarget = Math.ceil(dailyRevenue / profile.average_ticket);
  const breakEvenDaily = profile.break_even_point / 30;

  return (
    <div className="space-y-4">
      {/* Card Principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Building2 className="h-5 w-5" />
            Perfil do Negócio
          </CardTitle>
          <CardDescription>
            Dados estratégicos e métricas do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Faturamento */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Faturamento Mensal</p>
                <p className="text-lg font-bold text-green-700">
                  R$ {profile.average_monthly_revenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Ticket Médio */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Ticket Médio</p>
                <p className="text-lg font-bold text-blue-700">
                  R$ {profile.average_ticket.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Meta Diária */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Meta Diária</p>
                <p className="text-lg font-bold text-purple-700">
                  {dailyTarget} pedidos
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dados-negocio')}
            >
              Editar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights Motivacionais */}
      {profile.motivational_insights && Array.isArray(profile.motivational_insights) && profile.motivational_insights.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Lightbulb className="h-5 w-5" />
              Insights Estratégicos
            </CardTitle>
            <CardDescription>
              Análises inteligentes baseadas no seu perfil empresarial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.motivational_insights.slice(0, 2).map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <Badge variant="secondary" className="mt-1">
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-gray-700 flex-1">{insight}</p>
                </div>
              ))}
            </div>
            
            {profile.motivational_insights.length > 2 && (
              <div className="mt-3 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dados-negocio')}
                >
                  Ver Todos os Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status do Ponto de Equilíbrio */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Ponto de Equilíbrio</p>
                <p className="text-sm text-emerald-600">
                  R$ {profile.break_even_point.toLocaleString('pt-BR')} mensais
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Meta diária</p>
              <p className="font-bold text-emerald-700">
                R$ {breakEvenDaily.toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};