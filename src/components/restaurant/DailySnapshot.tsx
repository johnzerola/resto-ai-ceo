
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Utensils, Users, Banknote, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Tipos de dados para a simulação
type DailyData = {
  currentValue: number;
  previousValue: number;
  percentChange: number;
  isPositive: boolean;
  forecast?: number;
};

type SnapshotData = {
  salesSoFar: DailyData;
  customerCount: DailyData;
  averageTicket: DailyData;
  dishesServed: DailyData;
  peakHour: {
    hour: string;
    sales: number;
    isCurrent: boolean;
  };
  upcomingReservations: number;
};

// Componente que mostra um snapshot do dia atual
export const DailySnapshot = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
  const [view, setView] = useState<'today' | 'forecast'>('today');
  
  // Simular carregamento de dados
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      // Simulação de carregamento de dados da API
      setTimeout(() => {
        // Dados simulados
        const data: SnapshotData = {
          salesSoFar: {
            currentValue: 2350,
            previousValue: 2240,
            percentChange: 4.9,
            isPositive: true,
            forecast: 4800
          },
          customerCount: {
            currentValue: 54,
            previousValue: 49,
            percentChange: 10.2,
            isPositive: true,
            forecast: 112
          },
          averageTicket: {
            currentValue: 85,
            previousValue: 82,
            percentChange: 3.7,
            isPositive: true,
            forecast: 82
          },
          dishesServed: {
            currentValue: 138,
            previousValue: 127,
            percentChange: 8.7,
            isPositive: true,
            forecast: 295
          },
          peakHour: {
            hour: "19:00 - 20:00",
            sales: 1250,
            isCurrent: false
          },
          upcomingReservations: 8
        };
        
        setSnapshotData(data);
        setIsLoading(false);
      }, 1200);
    };
    
    loadData();
    
    // Atualizar dados a cada 5 minutos
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Função para atualizar os dados manualmente
  const handleRefresh = () => {
    toast.info("Atualizando dados...");
    setSnapshotData(null);
    setIsLoading(true);
    
    // Simulação de carregamento
    setTimeout(() => {
      // Dados atualizados simulados
      const updatedData: SnapshotData = {
        salesSoFar: {
          currentValue: 2520,
          previousValue: 2240,
          percentChange: 12.5,
          isPositive: true,
          forecast: 4950
        },
        customerCount: {
          currentValue: 59,
          previousValue: 49,
          percentChange: 20.4,
          isPositive: true,
          forecast: 118
        },
        averageTicket: {
          currentValue: 87,
          previousValue: 82,
          percentChange: 6.1,
          isPositive: true,
          forecast: 84
        },
        dishesServed: {
          currentValue: 152,
          previousValue: 127,
          percentChange: 19.7,
          isPositive: true,
          forecast: 310
        },
        peakHour: {
          hour: "19:00 - 20:00",
          sales: 1250,
          isCurrent: false
        },
        upcomingReservations: 10
      };
      
      setSnapshotData(updatedData);
      setIsLoading(false);
      toast.success("Dados atualizados com sucesso!");
    }, 1500);
  };
  
  // Obter a hora atual para exibição
  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  // Componente de carregamento
  if (isLoading || !snapshotData) {
    return (
      <Card className="mb-6 border-blue-100">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-blue-700">
              Carregando informações do dia...
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6 border-blue-100 overflow-hidden">
      <CardHeader className="pb-2 bg-blue-50/50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg font-medium text-blue-700 capitalize">
              {currentDate}
            </span>
            <span className="text-sm text-blue-600 font-normal">
              {currentTime}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs 
          defaultValue="today" 
          value={view}
          onValueChange={(v) => setView(v as 'today' | 'forecast')}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-blue-100">
              <TabsTrigger 
                value="today"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Hoje
              </TabsTrigger>
              <TabsTrigger 
                value="forecast"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Previsão
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-blue-600">
              {view === 'today' ? (
                <span>Comparado com ontem</span>
              ) : (
                <span>Previsão para o fim do dia</span>
              )}
            </div>
          </div>
          
          <TabsContent value="today" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Vendas até agora"
                value={formatCurrency(snapshotData.salesSoFar.currentValue)}
                trend={{
                  value: snapshotData.salesSoFar.percentChange,
                  isPositive: snapshotData.salesSoFar.isPositive,
                }}
                icon={<TrendingUp className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Clientes"
                value={snapshotData.customerCount.currentValue.toString()}
                trend={{
                  value: snapshotData.customerCount.percentChange,
                  isPositive: snapshotData.customerCount.isPositive,
                }}
                icon={<Users className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Ticket médio"
                value={formatCurrency(snapshotData.averageTicket.currentValue)}
                trend={{
                  value: snapshotData.averageTicket.percentChange,
                  isPositive: snapshotData.averageTicket.isPositive,
                }}
                icon={<Banknote className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Pratos servidos"
                value={snapshotData.dishesServed.currentValue.toString()}
                trend={{
                  value: snapshotData.dishesServed.percentChange,
                  isPositive: snapshotData.dishesServed.isPositive,
                }}
                icon={<Utensils className="h-5 w-5" />}
                className="border-blue-100"
              />
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600">Horário de pico</div>
                  <div className="text-lg font-semibold mt-1 flex items-center gap-2">
                    {snapshotData.peakHour.hour}
                    {snapshotData.peakHour.isCurrent && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        Agora
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {formatCurrency(snapshotData.peakHour.sales)} em vendas
                  </div>
                </div>
                <Clock className="h-10 w-10 text-blue-300" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600">Reservas restantes</div>
                  <div className="text-lg font-semibold mt-1">
                    {snapshotData.upcomingReservations} reservas
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    para hoje
                  </div>
                </div>
                <Calendar className="h-10 w-10 text-blue-300" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="forecast" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Vendas previstas"
                value={formatCurrency(snapshotData.salesSoFar.forecast || 0)}
                description={`${Math.round((snapshotData.salesSoFar.currentValue / (snapshotData.salesSoFar.forecast || 1)) * 100)}% alcançado`}
                icon={<TrendingUp className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Clientes esperados"
                value={snapshotData.customerCount.forecast?.toString() || "0"}
                description={`${Math.round((snapshotData.customerCount.currentValue / (snapshotData.customerCount.forecast || 1)) * 100)}% alcançado`}
                icon={<Users className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Ticket médio previsto"
                value={formatCurrency(snapshotData.averageTicket.forecast || 0)}
                description="para o dia todo"
                icon={<Banknote className="h-5 w-5" />}
                className="border-blue-100"
              />
              
              <StatsCard
                title="Pratos previstos"
                value={snapshotData.dishesServed.forecast?.toString() || "0"}
                description={`${Math.round((snapshotData.dishesServed.currentValue / (snapshotData.dishesServed.forecast || 1)) * 100)}% servidos`}
                icon={<Utensils className="h-5 w-5" />}
                className="border-blue-100"
              />
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-blue-700 text-sm">
                <InfoIcon className="h-4 w-4 inline-block mr-1" />
                Previsões baseadas no histórico de vendas, reservas confirmadas e desempenho médio da semana.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Importação de componentes e ícones
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCcw, Info as InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
