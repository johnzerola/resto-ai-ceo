
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  Users,
  Package,
  BarChart3,
  Settings,
  Shield,
  Zap
} from "lucide-react";

interface AuditItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "failed" | "warning";
  priority: "high" | "medium" | "low";
  impact: string;
}

const auditItems: AuditItem[] = [
  {
    id: "ui-consistency",
    category: "Interface",
    title: "Consistência de Layout",
    description: "Unificação do sistema de navegação e eliminação de sidebars duplicadas",
    status: "completed",
    priority: "high",
    impact: "Melhoria significativa na UX"
  },
  {
    id: "data-integration",
    category: "Dados",
    title: "Integração Real com Supabase",
    description: "Substituição de dados simulados por dados reais do banco",
    status: "pending",
    priority: "high",
    impact: "Funcionalidade core do sistema"
  },
  {
    id: "performance",
    category: "Performance",
    title: "Otimização de Carregamento",
    description: "Implementação de lazy loading e otimização de queries",
    status: "completed",
    priority: "medium",
    impact: "Melhor experiência do usuário"
  },
  {
    id: "pricing-models",
    category: "Negócio",
    title: "Modelos de Precificação",
    description: "Implementação de precificação para delivery, salão, buffet, rodízio",
    status: "pending",
    priority: "high",
    impact: "Diferencial competitivo"
  },
  {
    id: "financial-accuracy",
    category: "Financeiro",
    title: "Precisão de Cálculos Financeiros",
    description: "Validação de DRE, CMV e fluxo de caixa",
    status: "warning",
    priority: "high",
    impact: "Confiabilidade dos dados"
  },
  {
    id: "mobile-optimization",
    category: "Mobile",
    title: "Otimização Mobile",
    description: "Garantir experiência fluida em dispositivos móveis",
    status: "completed",
    priority: "medium",
    impact: "Acessibilidade"
  },
  {
    id: "security-audit",
    category: "Segurança",
    title: "Auditoria de Segurança",
    description: "Validação de autenticação e proteção de dados",
    status: "warning",
    priority: "high",
    impact: "Confiança e compliance"
  },
  {
    id: "competitor-analysis",
    category: "Mercado",
    title: "Análise Competitiva",
    description: "Benchmarking com iFood, Goomer, Apptite",
    status: "pending",
    priority: "medium",
    impact: "Posicionamento de mercado"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

export function AuditDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = ["all", "Interface", "Dados", "Performance", "Negócio", "Financeiro", "Mobile", "Segurança", "Mercado"];
  
  const filteredItems = selectedCategory === "all" 
    ? auditItems 
    : auditItems.filter(item => item.category === selectedCategory);
  
  const completedItems = auditItems.filter(item => item.status === "completed").length;
  const totalItems = auditItems.length;
  const completionRate = Math.round((completedItems / totalItems) * 100);
  
  const highPriorityPending = auditItems.filter(
    item => item.priority === "high" && item.status !== "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B2C4F] to-[#00D887] bg-clip-text text-transparent">
            Auditoria RestaurIA CEO
          </h1>
          <p className="text-gray-600 mt-2">
            Análise completa do sistema por CEO experiente do setor alimentício
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatório Completo
          </Button>
          <Button className="bg-gradient-to-r from-[#00D887] to-[#00B572] hover:shadow-lg">
            <Zap className="h-4 w-4 mr-2" />
            Aplicar Correções
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-[#1B2C4F]">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <Progress value={completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Itens Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{completedItems}/{totalItems}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityPending}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score de Qualidade</p>
                <p className="text-2xl font-bold text-[#00D887]">A-</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#00D887] to-[#00B572] rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Items */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category === "all" ? "Todos" : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(item.status)}
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Impacto: {item.impact}
                        </span>
                      </div>
                    </div>
                    
                    {item.status === "pending" && (
                      <Button variant="outline" size="sm">
                        Corrigir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Próximos Passos Críticos
          </CardTitle>
          <CardDescription>
            Ações prioritárias para maximizar o ROI do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Implementar Integração Real de Dados</h4>
                <p className="text-sm text-red-700">Conectar efetivamente com Supabase para dados reais de produção</p>
              </div>
              <Badge className="bg-red-500 text-white">Alta</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Modelos de Precificação Competitivos</h4>
                <p className="text-sm text-orange-700">Implementar precificação para todos os canais de venda</p>
              </div>
              <Badge className="bg-orange-500 text-white">Alta</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">Auditoria de Segurança</h4>
                <p className="text-sm text-yellow-700">Fortalecer autenticação e proteção de dados sensíveis</p>
              </div>
              <Badge className="bg-yellow-500 text-white">Média</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
