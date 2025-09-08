import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingDown,
  Eye,
  Brain,
  Zap,
  Calculator,
  Target,
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Sparkles
} from "lucide-react";

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: "pricing" | "cost" | "margin" | "inventory";
  severity: "critical" | "warning" | "info";
  active: boolean;
  violations: number;
  lastTriggered?: string;
}

interface LossPreventionAlert {
  id: string;
  title: string;
  description: string;
  potentialLoss: number;
  timeframe: string;
  action: string;
  status: "pending" | "resolved" | "ignored";
  severity: "high" | "medium" | "low";
}

interface RealTimeValidation {
  field: string;
  oldValue: any;
  newValue: any;
  impact: number;
  recommendation: string;
  approved: boolean;
}

export function AntiLossSystem() {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [lossAlerts, setLossAlerts] = useState<LossPreventionAlert[]>([]);
  const [realTimeValidations, setRealTimeValidations] = useState<RealTimeValidation[]>([]);
  const [systemHealth, setSystemHealth] = useState(95);
  const [totalPrevented, setTotalPrevented] = useState(12450);

  useEffect(() => {
    generateValidationRules();
    generateLossAlerts();
    generateRealTimeValidations();
  }, []);

  const generateValidationRules = () => {
    const rules: ValidationRule[] = [
      {
        id: "1", 
        name: "Preço abaixo do custo",
        description: "Impede venda de produtos com margem negativa",
        type: "pricing",
        severity: "critical",
        active: true,
        violations: 0,
        lastTriggered: undefined
      },
      {
        id: "2",
        name: "Margem mínima",
        description: "Garante margem mínima de 25% em todos os produtos",
        type: "margin", 
        severity: "warning",
        active: true,
        violations: 3,
        lastTriggered: "2024-01-15 14:30"
      },
      {
        id: "3",
        name: "Custo ingrediente suspeito",
        description: "Detecta variações anômalas no custo de ingredientes",
        type: "cost",
        severity: "warning",
        active: true,
        violations: 1,
        lastTriggered: "2024-01-14 09:15"
      },
      {
        id: "4",
        name: "Estoque negativo",
        description: "Impede vendas quando estoque está zerado",
        type: "inventory",
        severity: "critical", 
        active: true,
        violations: 0,
        lastTriggered: undefined
      },
      {
        id: "5",
        name: "Desconto excessivo",
        description: "Alerta quando desconto ultrapassa 20%",
        type: "pricing",
        severity: "warning",
        active: true,
        violations: 2,
        lastTriggered: "2024-01-13 16:45"
      }
    ];
    setValidationRules(rules);
  };

  const generateLossAlerts = () => {
    const alerts: LossPreventionAlert[] = [
      {
        id: "1",
        title: "🚨 Pizza Portuguesa em prejuízo",
        description: "Custo aumentou 15% mas preço não foi ajustado",
        potentialLoss: 340,
        timeframe: "por mês",
        action: "Aumentar preço de R$ 28 para R$ 32",
        status: "pending",
        severity: "high"
      },
      {
        id: "2", 
        title: "⚠️ Hambúrguer com margem baixa",
        description: "Margem atual de 18% está abaixo da meta de 25%",
        potentialLoss: 180,
        timeframe: "por mês", 
        action: "Revisar ingredientes ou ajustar preço",
        status: "pending",
        severity: "medium"
      },
      {
        id: "3",
        title: "💡 Oportunidade de otimização",
        description: "Batata frita pode ter aumento de 10% sem perda de demanda",
        potentialLoss: -250,
        timeframe: "ganho por mês",
        action: "Testar aumento gradual de preço",
        status: "ignored",
        severity: "low"
      }
    ];
    setLossAlerts(alerts);
  };

  const generateRealTimeValidations = () => {
    const validations: RealTimeValidation[] = [
      {
        field: "Preço Pizza Margherita",
        oldValue: "R$ 25,00",
        newValue: "R$ 22,00", 
        impact: -120,
        recommendation: "Redução de 12% pode resultar em R$ 120/mês de prejuízo adicional",
        approved: false
      },
      {
        field: "Custo Mussarela (kg)",
        oldValue: "R$ 35,00",
        newValue: "R$ 42,00",
        impact: 85,
        recommendation: "Aumento de 20% no custo requer ajuste nos preços dos produtos",
        approved: true
      }
    ];
    setRealTimeValidations(validations);
  };

  const getRuleSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "from-red-500 to-red-600";
      case "warning": return "from-yellow-500 to-orange-500";
      case "info": return "from-blue-500 to-blue-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-green-200 bg-green-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const renderSystemOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
                Saúde do Sistema
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {systemHealth}%
              </p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Prejuízos Evitados
              </p>
              <p className="text-3xl font-bold text-blue-900">
                R$ {totalPrevented.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                Regras Ativas
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {validationRules.filter(rule => rule.active).length}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">
                Alertas Ativos
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {lossAlerts.filter(alert => alert.status === "pending").length}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderValidationRules = () => (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Regras de Validação</CardTitle>
            <CardDescription>Sistema proativo de prevenção de prejuízos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {validationRules.map((rule) => (
            <div key={rule.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-gradient-to-r ${getRuleSeverityColor(rule.severity)} rounded-lg text-white`}>
                    {rule.type === "pricing" && <DollarSign className="h-4 w-4" />}
                    {rule.type === "cost" && <Calculator className="h-4 w-4" />}
                    {rule.type === "margin" && <Target className="h-4 w-4" />}
                    {rule.type === "inventory" && <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.active ? "default" : "secondary"}>
                    {rule.active ? "Ativa" : "Inativa"}
                  </Badge>
                  <Badge variant={rule.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                    {rule.severity}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Violações: <strong>{rule.violations}</strong>
                  </span>
                  {rule.lastTriggered && (
                    <span className="text-xs text-muted-foreground">
                      Último: {rule.lastTriggered}
                    </span>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Configurar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderLossAlerts = () => (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Alertas de Prevenção</CardTitle>
            <CardDescription>Situações que podem gerar prejuízo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lossAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-2 ${getAlertSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                </div>
                <Badge variant={alert.status === "pending" ? "destructive" : alert.status === "resolved" ? "default" : "secondary"}>
                  {alert.status === "pending" ? "Pendente" : alert.status === "resolved" ? "Resolvido" : "Ignorado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {alert.potentialLoss > 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`font-semibold ${alert.potentialLoss > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R$ {Math.abs(alert.potentialLoss)} {alert.timeframe}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Ignorar
                  </Button>
                  <Button size="sm">
                    Resolver
                  </Button>
                </div>
              </div>

              <div className="mt-3 p-2 bg-white/70 rounded-md">
                <p className="text-xs font-medium text-primary">💡 {alert.action}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderRealTimeValidations = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Validações em Tempo Real</CardTitle>
            <CardDescription>Simulações de impacto de mudanças</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {realTimeValidations.map((validation, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">{validation.field}</h4>
                  <div className="flex items-center gap-3 text-sm">
                    <span>De: <strong>{validation.oldValue}</strong></span>
                    <span>→</span>
                    <span>Para: <strong>{validation.newValue}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {validation.impact > 0 ? (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`font-semibold text-sm ${validation.impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    R$ {Math.abs(validation.impact)}/mês
                  </span>
                </div>
              </div>

              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Brain className="h-4 w-4 inline mr-1" />
                  {validation.recommendation}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={validation.approved ? "default" : "secondary"}>
                  {validation.approved ? "Aprovado" : "Aguardando"}
                </Badge>
                {!validation.approved && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Rejeitar
                    </Button>
                    <Button size="sm">
                      Aprovar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Sistema Anti-Prejuízo 2.0
            </h2>
            <p className="text-muted-foreground text-sm">Proteção automática contra perdas financeiras</p>
          </div>
        </div>
      </div>

      {/* System Overview */}
      {renderSystemOverview()}

      {/* Validation Rules */}
      {renderValidationRules()}

      {/* Loss Prevention Alerts */}
      {renderLossAlerts()}

      {/* Real-time Validations */}
      {renderRealTimeValidations()}
    </div>
  );
}