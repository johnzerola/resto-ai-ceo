
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface KPIOption {
  id: string;
  name: string;
  category: string;
  description: string;
  isDefault: boolean;
}

export interface DashboardCustomizerProps {
  onSaveSettings: (selectedKPIs: string[]) => void;
}

export function DashboardCustomizer({ onSaveSettings }: DashboardCustomizerProps) {
  // Available KPI options
  const availableKPIs: KPIOption[] = [
    // Financial
    { id: 'sales_today', name: 'Vendas Hoje', category: 'Financeiro', description: 'Total de vendas do dia atual', isDefault: true },
    { id: 'average_ticket', name: 'Ticket Médio', category: 'Financeiro', description: 'Valor médio gasto por cliente', isDefault: true },
    { id: 'monthly_revenue', name: 'Faturamento Mensal', category: 'Financeiro', description: 'Receita total do mês', isDefault: false },
    { id: 'weekly_sales', name: 'Vendas Semanais', category: 'Financeiro', description: 'Total de vendas dos últimos 7 dias', isDefault: false },
    
    // Operational
    { id: 'dishes_sold', name: 'Pratos Vendidos', category: 'Operacional', description: 'Quantidade de pratos vendidos hoje', isDefault: true },
    { id: 'dish_per_hour', name: 'Pratos por Hora', category: 'Operacional', description: 'Média de pratos servidos por hora', isDefault: false },
    { id: 'table_turnover', name: 'Rotatividade de Mesas', category: 'Operacional', description: 'Quantidade média de clientes por mesa', isDefault: false },
    { id: 'avg_service_time', name: 'Tempo Médio de Serviço', category: 'Operacional', description: 'Tempo médio entre pedido e entrega', isDefault: false },
    
    // Costs
    { id: 'cmv', name: 'CMV', category: 'Custos', description: 'Custo da Mercadoria Vendida (% das vendas)', isDefault: true },
    { id: 'labor_cost', name: 'Custo de Mão de Obra', category: 'Custos', description: 'Custo com funcionários (% das vendas)', isDefault: false },
    { id: 'utilities_cost', name: 'Custos Fixos', category: 'Custos', description: 'Aluguel, energia, etc. (% das vendas)', isDefault: false },
    
    // Analysis
    { id: 'profit_margin', name: 'Margem de Lucro', category: 'Análise', description: 'Lucro como percentual das vendas', isDefault: false },
    { id: 'sales_growth', name: 'Crescimento de Vendas', category: 'Análise', description: 'Comparado com o mesmo período anterior', isDefault: false },
    { id: 'top_products', name: 'Produtos Mais Vendidos', category: 'Análise', description: 'Lista dos itens mais populares', isDefault: false },
  ];
  
  // Get selected KPIs from localStorage or use defaults
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardKPIs');
    if (saved) {
      return JSON.parse(saved);
    }
    return availableKPIs.filter(kpi => kpi.isDefault).map(kpi => kpi.id);
  });
  
  // Organize KPIs by category
  const kpisByCategory: Record<string, KPIOption[]> = availableKPIs.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPIOption[]>);
  
  // Handle KPI selection
  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs(prev => {
      if (prev.includes(kpiId)) {
        return prev.filter(id => id !== kpiId);
      } else {
        return [...prev, kpiId];
      }
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    localStorage.setItem('dashboardKPIs', JSON.stringify(selectedKPIs));
    onSaveSettings(selectedKPIs);
    toast.success("Configurações do Dashboard salvas", {
      description: "Seus KPIs personalizados foram atualizados"
    });
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    const defaultKPIs = availableKPIs.filter(kpi => kpi.isDefault).map(kpi => kpi.id);
    setSelectedKPIs(defaultKPIs);
    toast.info("Configurações redefinidas para os padrões");
  };

  // Group categories by business logical order
  const categoryOrder = ["Financeiro", "Operacional", "Custos", "Análise"];
  const sortedCategories = Object.keys(kpisByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // Get category color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Financeiro": return "bg-blue-500";
      case "Operacional": return "bg-green-500";
      case "Custos": return "bg-red-500";
      case "Análise": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  // Get category background color
  const getCategoryBgColor = (category: string) => {
    switch(category) {
      case "Financeiro": return "bg-blue-50 border-blue-100";
      case "Operacional": return "bg-green-50 border-green-100";
      case "Custos": return "bg-red-50 border-red-100";
      case "Análise": return "bg-purple-50 border-purple-100";
      default: return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <Settings2 className="h-4 w-4" />
          <span>Personalizar Dashboard</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizar KPIs do Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-6">
            Selecione os indicadores que deseja visualizar no seu dashboard. Os KPIs escolhidos serão exibidos em tempo real.
            <span className="block mt-1 font-medium">Você pode escolher até 8 KPIs para seu dashboard.</span>
          </p>
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                {selectedKPIs.length} de 8 KPIs selecionados
              </Badge>
              {selectedKPIs.length === 8 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 animate-pulse">
                  Limite máximo atingido
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetDefaults}
              className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Restaurar Padrões
            </Button>
          </div>
          
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedCategories.map((category) => (
              <div 
                key={category} 
                className={`space-y-4 p-4 rounded-lg border ${getCategoryBgColor(category)}`}
              >
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></span>
                  {category}
                </h3>
                <div className="space-y-3">
                  {kpisByCategory[category].map(kpi => {
                    const isSelected = selectedKPIs.includes(kpi.id);
                    const isDisabled = !isSelected && selectedKPIs.length >= 8;
                    
                    return (
                      <div 
                        key={kpi.id}
                        className={`flex items-start space-x-2 p-3 rounded-md transition-all duration-200 ${
                          isSelected 
                            ? "bg-blue-50 border border-blue-200" 
                            : "hover:bg-gray-100 border border-transparent"
                        } ${isDisabled ? "opacity-50" : ""}`}
                      >
                        <Checkbox 
                          id={kpi.id}
                          checked={isSelected}
                          onCheckedChange={() => handleKPIToggle(kpi.id)}
                          className={isSelected ? "border-blue-500 text-blue-500" : ""}
                          disabled={isDisabled}
                        />
                        <div className="grid gap-1.5 cursor-pointer" onClick={() => !isDisabled && handleKPIToggle(kpi.id)}>
                          <Label 
                            htmlFor={kpi.id} 
                            className={`font-medium ${isSelected ? "text-blue-700" : ""}`}
                          >
                            {kpi.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {kpi.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Suas alterações serão aplicadas imediatamente ao salvar.
            </p>
            <Button 
              onClick={handleSaveSettings} 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
