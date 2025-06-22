
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingDown,
  DollarSign,
  Calculator,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemValidation } from '@/hooks/useSystemValidation';
import { supabase } from '@/integrations/supabase/client';

interface ValidationAlert {
  type: 'error' | 'warning' | 'success';
  title: string;
  message: string;
  action?: string;
  actionHref?: string;
}

export function AdvancedSystemValidator() {
  const { currentRestaurant } = useAuth();
  const { validation, revalidate } = useSystemValidation();
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const runAdvancedValidation = async () => {
    if (!currentRestaurant?.id) return;
    
    setIsValidating(true);
    const newAlerts: ValidationAlert[] = [];
    
    try {
      // 1. Validar configurações essenciais
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (!config) {
        newAlerts.push({
          type: 'error',
          title: 'Configurações Não Encontradas',
          message: 'Configure as informações básicas do seu restaurante antes de usar o sistema.',
          action: 'Configurar Agora',
          actionHref: '/configuracoes'
        });
      } else {
        // Validar markup
        if (!config.markup_padrao || config.markup_padrao < 200) {
          newAlerts.push({
            type: 'warning',
            title: 'Markup Muito Baixo',
            message: `Seu markup atual é ${config.markup_padrao}%. Para restaurantes, recomendamos 250% ou mais para garantir lucratividade.`,
            action: 'Ajustar Markup',
            actionHref: '/configuracoes'
          });
        }

        // Validar margem de lucro
        if (!config.margem_lucro_esperada || config.margem_lucro_esperada < 20) {
          newAlerts.push({
            type: 'warning',
            title: 'Margem de Lucro Baixa',
            message: `Sua margem esperada é ${config.margem_lucro_esperada}%. Para sustentabilidade, recomendamos pelo menos 25%.`,
            action: 'Ajustar Margem',
            actionHref: '/configuracoes'
          });
        }

        // Validar receita mensal
        if (!config.receita_mensal_esperada || config.receita_mensal_esperada === 0) {
          newAlerts.push({
            type: 'error',
            title: 'Meta de Receita Não Definida',
            message: 'Defina sua meta de receita mensal para que o sistema possa calcular metas diárias e alertas.',
            action: 'Definir Meta',
            actionHref: '/configuracoes'
          });
        }
      }

      // 2. Validar pratos cadastrados
      const { data: pratos } = await supabase
        .from('pratos')
        .select(`
          id, nome_prato, custo_por_porcao, preco_sugerido,
          ingredientes_por_prato!left(id)
        `)
        .eq('restaurant_id', currentRestaurant.id);

      if (!pratos || pratos.length === 0) {
        newAlerts.push({
          type: 'warning',
          title: 'Nenhum Prato Cadastrado',
          message: 'Cadastre seus pratos principais para começar a usar o sistema de precificação.',
          action: 'Cadastrar Pratos',
          actionHref: '/ficha-tecnica-inteligente-completa'
        });
      } else {
        // Verificar pratos sem ingredientes
        const pratosSemIngredientes = pratos.filter(p => !p.ingredientes_por_prato || p.ingredientes_por_prato.length === 0);
        if (pratosSemIngredientes.length > 0) {
          newAlerts.push({
            type: 'warning',
            title: `${pratosSemIngredientes.length} Prato(s) Sem Ingredientes`,
            message: 'Alguns pratos não possuem ingredientes cadastrados, o que impede o cálculo correto do CMV.',
            action: 'Completar Fichas',
            actionHref: '/ficha-tecnica-inteligente-completa'
          });
        }

        // Verificar pratos com margem muito baixa
        const pratosComMargemBaixa = pratos.filter(p => {
          if (p.custo_por_porcao && p.preco_sugerido) {
            const margem = ((p.preco_sugerido - p.custo_por_porcao) / p.preco_sugerido) * 100;
            return margem < 60; // Menos de 60% de margem bruta
          }
          return false;
        });

        if (pratosComMargemBaixa.length > 0) {
          newAlerts.push({
            type: 'error',
            title: `${pratosComMargemBaixa.length} Prato(s) com Margem Crítica`,
            message: 'Alguns pratos podem estar com prejuízo oculto. Verifique os preços e custos.',
            action: 'Revisar Preços',
            actionHref: '/ficha-tecnica-inteligente-completa'
          });
        }
      }

      // 3. Validar insumos
      const { data: insumos } = await supabase
        .from('insumos')
        .select('id, nome, preco_unitario')
        .eq('restaurant_id', currentRestaurant.id);

      if (!insumos || insumos.length === 0) {
        newAlerts.push({
          type: 'error',
          title: 'Nenhum Insumo Cadastrado',
          message: 'Cadastre seus ingredientes principais para calcular o custo real dos pratos.',
          action: 'Cadastrar Insumos',
          actionHref: '/ficha-tecnica-inteligente-completa'
        });
      } else {
        const insumosSemPreco = insumos.filter(i => !i.preco_unitario || i.preco_unitario === 0);
        if (insumosSemPreco.length > 0) {
          newAlerts.push({
            type: 'warning',
            title: `${insumosSemPreco.length} Ingrediente(s) Sem Preço`,
            message: 'Alguns ingredientes não possuem preço definido, o que pode afetar os cálculos.',
            action: 'Definir Preços',
            actionHref: '/ficha-tecnica-inteligente-completa'
          });
        }
      }

      // 4. Sucesso se tudo estiver ok
      if (newAlerts.length === 0) {
        newAlerts.push({
          type: 'success',
          title: 'Sistema Configurado Corretamente! 🎉',
          message: 'Todas as validações passaram. Seu sistema está pronto para uso profissional.'
        });
      }

    } catch (error) {
      console.error('Erro na validação avançada:', error);
      newAlerts.push({
        type: 'error',
        title: 'Erro na Validação',
        message: 'Ocorreu um erro ao validar o sistema. Tente novamente.',
        action: 'Tentar Novamente'
      });
    } finally {
      setIsValidating(false);
      setAlerts(newAlerts);
    }
  };

  useEffect(() => {
    if (currentRestaurant?.id) {
      runAdvancedValidation();
    }
  }, [currentRestaurant]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = alerts.filter(a => a.type === 'success').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const errorCount = alerts.filter(a => a.type === 'error').length;
  const totalCount = alerts.length;
  const healthScore = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Validação Avançada do Sistema
            </CardTitle>
            <Button 
              onClick={runAdvancedValidation}
              disabled={isValidating}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validando...' : 'Revalidar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-muted-foreground">Validações OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Avisos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{healthScore}%</div>
              <div className="text-sm text-muted-foreground">Saúde Geral</div>
            </div>
          </div>
          
          <Progress value={healthScore} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {healthScore >= 90 ? 'Sistema em excelente estado' : 
             healthScore >= 70 ? 'Sistema em bom estado, alguns ajustes recomendados' :
             'Sistema necessita ajustes importantes'}
          </p>
        </CardContent>
      </Card>

      {/* Alertas Detalhados */}
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <Alert key={index} className={getAlertBgColor(alert.type)}>
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <AlertDescription className="mb-3">
                  {alert.message}
                </AlertDescription>
                {alert.action && (
                  <Button 
                    size="sm" 
                    variant={alert.type === 'error' ? 'destructive' : 'secondary'}
                    onClick={alert.actionHref ? () => window.location.href = alert.actionHref : undefined}
                  >
                    {alert.action}
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {/* Dicas para Usuários Iniciantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dicas para Maximizar Lucros
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• <strong>Markup ideal:</strong> 250-300% para restaurantes (ex: custo R$ 10 → venda R$ 25-30)</li>
            <li>• <strong>CMV recomendado:</strong> Máximo 35% da receita (se estiver acima, revise custos)</li>
            <li>• <strong>Margem líquida:</strong> Mínimo 20% após todos os custos e impostos</li>
            <li>• <strong>Controle semanal:</strong> Acompanhe custos e margens semanalmente</li>
            <li>• <strong>Preços dinâmicos:</strong> Ajuste preços conforme sazonalidade e concorrência</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
