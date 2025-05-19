
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
  // Opções de KPIs disponíveis
  const availableKPIs: KPIOption[] = [
    // Vendas
    { id: 'sales_today', name: 'Vendas Hoje', category: 'Financeiro', description: 'Total de vendas do dia atual', isDefault: true },
    { id: 'average_ticket', name: 'Ticket Médio', category: 'Financeiro', description: 'Valor médio gasto por cliente', isDefault: true },
    { id: 'monthly_revenue', name: 'Faturamento Mensal', category: 'Financeiro', description: 'Receita total do mês', isDefault: false },
    { id: 'weekly_sales', name: 'Vendas Semanais', category: 'Financeiro', description: 'Total de vendas dos últimos 7 dias', isDefault: false },
    
    // Operacional
    { id: 'dishes_sold', name: 'Pratos Vendidos', category: 'Operacional', description: 'Quantidade de pratos vendidos hoje', isDefault: true },
    { id: 'dish_per_hour', name: 'Pratos por Hora', category: 'Operacional', description: 'Média de pratos servidos por hora', isDefault: false },
    { id: 'table_turnover', name: 'Rotatividade de Mesas', category: 'Operacional', description: 'Quantidade média de clientes por mesa', isDefault: false },
    { id: 'avg_service_time', name: 'Tempo Médio de Serviço', category: 'Operacional', description: 'Tempo médio entre pedido e entrega', isDefault: false },
    
    // Custos
    { id: 'cmv', name: 'CMV', category: 'Custos', description: 'Custo da Mercadoria Vendida (% das vendas)', isDefault: true },
    { id: 'labor_cost', name: 'Custo de Mão de Obra', category: 'Custos', description: 'Custo com funcionários (% das vendas)', isDefault: false },
    { id: 'utilities_cost', name: 'Custos Fixos', category: 'Custos', description: 'Aluguel, energia, etc. (% das vendas)', isDefault: false },
    
    // Análise
    { id: 'profit_margin', name: 'Margem de Lucro', category: 'Análise', description: 'Lucro como percentual das vendas', isDefault: false },
    { id: 'sales_growth', name: 'Crescimento de Vendas', category: 'Análise', description: 'Comparado com o mesmo período anterior', isDefault: false },
    { id: 'top_products', name: 'Produtos Mais Vendidos', category: 'Análise', description: 'Lista dos itens mais populares', isDefault: false },
  ];
  
  // Obter KPIs selecionados do localStorage ou usar padrões
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardKPIs');
    if (saved) {
      return JSON.parse(saved);
    }
    return availableKPIs.filter(kpi => kpi.isDefault).map(kpi => kpi.id);
  });
  
  // Organizar KPIs por categoria
  const kpisByCategory: Record<string, KPIOption[]> = availableKPIs.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPIOption[]>);
  
  // Gerenciar seleção de KPI
  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs(prev => {
      if (prev.includes(kpiId)) {
        return prev.filter(id => id !== kpiId);
      } else {
        return [...prev, kpiId];
      }
    });
  };
  
  // Salvar configurações
  const handleSaveSettings = () => {
    localStorage.setItem('dashboardKPIs', JSON.stringify(selectedKPIs));
    onSaveSettings(selectedKPIs);
    toast.success("Configurações do Dashboard salvas", {
      description: "Seus KPIs personalizados foram atualizados"
    });
  };

  // Resetar para configurações padrão
  const handleResetDefaults = () => {
    const defaultKPIs = availableKPIs.filter(kpi => kpi.isDefault).map(kpi => kpi.id);
    setSelectedKPIs(defaultKPIs);
    toast.info("Configurações redefinidas para os padrões");
  };

  // Agrupar as categorias por ordem lógica de negócio
  const categoryOrder = ["Financeiro", "Operacional", "Custos", "Análise"];
  const sortedCategories = Object.keys(kpisByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

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
          </p>
          
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-600">
                {selectedKPIs.length} de 8 KPIs selecionados
              </Badge>
              {selectedKPIs.length === 8 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600">
                  Limite máximo atingido
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleResetDefaults}>
              Restaurar Padrões
            </Button>
          </div>
          
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedCategories.map((category) => (
              <div key={category} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    category === "Financeiro" ? "bg-blue-500" : 
                    category === "Operacional" ? "bg-green-500" : 
                    category === "Custos" ? "bg-red-500" : "bg-purple-500"
                  }`}></span>
                  {category}
                </h3>
                <div className="space-y-3">
                  {kpisByCategory[category].map(kpi => (
                    <div key={kpi.id} 
                      className={`flex items-start space-x-2 p-2 rounded-md transition-colors ${
                        selectedKPIs.includes(kpi.id) ? "bg-blue-50" : "hover:bg-gray-100"
                      }`}>
                      <Checkbox 
                        id={kpi.id}
                        checked={selectedKPIs.includes(kpi.id)}
                        onCheckedChange={() => handleKPIToggle(kpi.id)}
                        className={selectedKPIs.includes(kpi.id) ? "border-blue-500" : ""}
                        disabled={!selectedKPIs.includes(kpi.id) && selectedKPIs.length >= 8}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor={kpi.id} className={`font-medium ${
                          selectedKPIs.includes(kpi.id) ? "text-blue-700" : ""
                        }`}>
                          {kpi.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {kpi.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Seus KPIs selecionados serão exibidos no dashboard em tempo real.
            </p>
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
