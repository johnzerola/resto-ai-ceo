
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Database } from "lucide-react";
import { loadRestaurantConfig } from "@/utils/pricing-calculations";
import { useToast } from "@/components/ui/use-toast";

interface ValidationIssue {
  id: string;
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

export function DataConsistencyValidator() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [lastValidation, setLastValidation] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationScore, setValidationScore] = useState(100);

  const runValidation = async () => {
    setIsValidating(true);
    const foundIssues: ValidationIssue[] = [];
    
    try {
      // 1. Validar dados de configuração
      const config = loadRestaurantConfig();
      
      if (!config.businessName || config.businessName === "Meu Restaurante") {
        foundIssues.push({
          id: "missing-business-name",
          severity: "warning",
          category: "Configuração",
          message: "Nome do negócio não personalizado",
          suggestion: "Configure o nome real do seu restaurante em /configuracoes",
          autoFixable: false
        });
      }

      if (!config.averageMonthlyRevenue || config.averageMonthlyRevenue === 0) {
        foundIssues.push({
          id: "missing-revenue",
          severity: "error",
          category: "Financeiro",
          message: "Receita mensal não configurada",
          suggestion: "Configure sua receita mensal média para cálculos precisos",
          autoFixable: false
        });
      }

      if (config.targetFoodCost > 35) {
        foundIssues.push({
          id: "high-food-cost-target",
          severity: "warning",
          category: "Operacional",
          message: `Meta de food cost muito alta (${config.targetFoodCost}%)`,
          suggestion: "Considere reduzir a meta para máximo 30-32%",
          autoFixable: true
        });
      }

      if (config.desiredProfitMargin < 15) {
        foundIssues.push({
          id: "low-profit-margin",
          severity: "error",
          category: "Financeiro",
          message: `Margem de lucro muito baixa (${config.desiredProfitMargin}%)`,
          suggestion: "Aumente para no mínimo 20% para sustentabilidade",
          autoFixable: true
        });
      }

      // 2. Validar dados do fluxo de caixa
      const cashFlowData = localStorage.getItem("cashFlow");
      if (cashFlowData) {
        try {
          const cashFlow = JSON.parse(cashFlowData);
          
          // Verificar transações com valores zerados
          const zeroTransactions = cashFlow.filter((t: any) => t.amount === 0);
          if (zeroTransactions.length > 0) {
            foundIssues.push({
              id: "zero-transactions",
              severity: "warning",
              category: "Fluxo de Caixa",
              message: `${zeroTransactions.length} transações com valor zero`,
              suggestion: "Remova ou corrija transações sem valor",
              autoFixable: true
            });
          }

          // Verificar transações muito antigas sem categoria
          const uncategorized = cashFlow.filter((t: any) => !t.category || t.category === "");
          if (uncategorized.length > 0) {
            foundIssues.push({
              id: "uncategorized-transactions",
              severity: "info",
              category: "Fluxo de Caixa",
              message: `${uncategorized.length} transações sem categoria`,
              suggestion: "Categorize todas as transações para relatórios precisos",
              autoFixable: false
            });
          }
        } catch (error) {
          foundIssues.push({
            id: "corrupted-cashflow",
            severity: "error",
            category: "Dados",
            message: "Dados de fluxo de caixa corrompidos",
            suggestion: "Restaure backup ou reinicialize os dados",
            autoFixable: true
          });
        }
      }

      // 3. Validar consistência entre módulos
      if (config.fixedExpenses > config.averageMonthlyRevenue * 0.6) {
        foundIssues.push({
          id: "high-fixed-costs",
          severity: "warning",
          category: "Financeiro",
          message: "Custos fixos representam mais de 60% da receita",
          suggestion: "Renegocie contratos ou aumente receita",
          autoFixable: false
        });
      }

      // 4. Validar metas
      const goalsData = localStorage.getItem("goals");
      if (goalsData) {
        try {
          const goals = JSON.parse(goalsData);
          const overdueGoals = goals.filter((g: any) => 
            new Date(g.deadline) < new Date() && !g.completed
          );
          
          if (overdueGoals.length > 0) {
            foundIssues.push({
              id: "overdue-goals",
              severity: "info",
              category: "Metas",
              message: `${overdueGoals.length} metas vencidas`,
              suggestion: "Atualize ou redefina metas em atraso",
              autoFixable: false
            });
          }
        } catch (error) {
          foundIssues.push({
            id: "corrupted-goals",
            severity: "warning",
            category: "Dados",
            message: "Dados de metas corrompidos",
            suggestion: "Verifique e reconfigure suas metas",
            autoFixable: true
          });
        }
      }

    } catch (error) {
      foundIssues.push({
        id: "validation-error",
        severity: "error",
        category: "Sistema",
        message: "Erro durante validação",
        suggestion: "Tente novamente ou contate o suporte",
        autoFixable: false
      });
    }

    setIssues(foundIssues);
    setLastValidation(new Date().toLocaleString());
    
    // Calcular score de qualidade dos dados
    const errorWeight = 30;
    const warningWeight = 10;
    const infoWeight = 5;
    
    const totalDeduction = 
      foundIssues.filter(i => i.severity === "error").length * errorWeight +
      foundIssues.filter(i => i.severity === "warning").length * warningWeight +
      foundIssues.filter(i => i.severity === "info").length * infoWeight;
    
    const score = Math.max(0, 100 - totalDeduction);
    setValidationScore(score);
    
    setTimeout(() => setIsValidating(false), 1000);
    
    toast({
      title: "Validação Concluída",
      description: `${foundIssues.length} problemas encontrados. Score: ${score}/100`,
    });
  };

  const autoFixIssues = () => {
    const fixableIssues = issues.filter(i => i.autoFixable);
    
    fixableIssues.forEach(issue => {
      switch (issue.id) {
        case "high-food-cost-target":
          // Auto-corrigir food cost target
          const config = loadRestaurantConfig();
          const updatedConfig = { ...config, targetFoodCost: 30 };
          localStorage.setItem("restaurantData", JSON.stringify(updatedConfig));
          break;
          
        case "low-profit-margin":
          // Auto-corrigir margem de lucro
          const currentConfig = loadRestaurantConfig();
          const newConfig = { ...currentConfig, desiredProfitMargin: 20 };
          localStorage.setItem("restaurantData", JSON.stringify(newConfig));
          break;
          
        case "zero-transactions":
          // Remover transações zeradas
          const cashFlowData = localStorage.getItem("cashFlow");
          if (cashFlowData) {
            const cashFlow = JSON.parse(cashFlowData);
            const cleanedData = cashFlow.filter((t: any) => t.amount !== 0);
            localStorage.setItem("cashFlow", JSON.stringify(cleanedData));
          }
          break;
      }
    });

    // Re-executar validação após correções
    setTimeout(() => {
      runValidation();
      toast({
        title: "Correções Aplicadas",
        description: `${fixableIssues.length} problemas corrigidos automaticamente`,
      });
    }, 500);
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Validador de Consistência de Dados
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Última validação: {lastValidation}
          </p>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(validationScore)}`}>
              Score: {validationScore}/100
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runValidation}
              disabled={isValidating}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isValidating ? 'animate-spin' : ''}`} />
              Validar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 && !isValidating ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              ✅ Todos os dados estão consistentes e válidos!
            </p>
          </div>
        ) : (
          <>
            {issues.filter(i => i.autoFixable).length > 0 && (
              <Button 
                onClick={autoFixIssues}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🔧 Corrigir Automaticamente ({issues.filter(i => i.autoFixable).length} problemas)
              </Button>
            )}
            
            <div className="space-y-3">
              {issues.map((issue) => (
                <Alert key={issue.id} className={getSeverityColor(issue.severity)}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{issue.message}</h4>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          {issue.autoFixable && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Auto-corrigível
                            </Badge>
                          )}
                        </div>
                      </div>
                      <AlertDescription className="text-xs">
                        💡 {issue.suggestion}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
