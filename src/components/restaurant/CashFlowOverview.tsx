import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Search, 
  CalendarRange, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart4
} from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { updateFinancialData } from "@/services/FinancialDataService";

// Interface for cash flow entry
export interface CashFlowEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  status: "completed" | "pending" | "canceled";
}

interface CashFlowOverviewProps {
  onEdit: (entryId: string) => void;
}

export function CashFlowOverview({ onEdit }: CashFlowOverviewProps) {
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedView, setSelectedView] = useState("list");
  
  // Cash flow summary state
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    pendingIncome: 0,
    pendingExpense: 0
  });

  // Load cash flow data
  useEffect(() => {
    const savedCashFlow = localStorage.getItem("cashFlow");
    if (savedCashFlow) {
      const parsedCashFlow = JSON.parse(savedCashFlow);
      setCashFlow(parsedCashFlow);
      calculateSummary(parsedCashFlow);
    } else {
      // Set sample data if no data in localStorage
      const sampleCashFlow = generateSampleCashFlow();
      localStorage.setItem("cashFlow", JSON.stringify(sampleCashFlow));
      setCashFlow(sampleCashFlow);
      calculateSummary(sampleCashFlow);
    }
  }, []);

  // Calculate summary data
  const calculateSummary = (entries: CashFlowEntry[]) => {
    const completedEntries = entries.filter(entry => entry.status === "completed");
    const pendingEntries = entries.filter(entry => entry.status === "pending");
    
    const totalIncome = completedEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const totalExpense = completedEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const pendingIncome = pendingEntries
      .filter(entry => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const pendingExpense = pendingEntries
      .filter(entry => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    setSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingIncome,
      pendingExpense
    });
  };

  // Filter cash flow based on search and filters
  const getFilteredCashFlow = () => {
    return cashFlow.filter((entry) => {
      // Text search filter
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const today = new Date();
        const entryDate = new Date(entry.date);
        
        switch (dateFilter) {
          case "today":
            matchesDate = entryDate.toDateString() === today.toDateString();
            break;
          case "thisWeek":
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            matchesDate = entryDate >= startOfWeek && entryDate <= today;
            break;
          case "thisMonth":
            matchesDate = entryDate.getMonth() === today.getMonth() && 
                          entryDate.getFullYear() === today.getFullYear();
            break;
        }
      }
      
      // Type filter
      let matchesType = true;
      if (typeFilter !== "all") {
        matchesType = entry.type === typeFilter;
      }
      
      return matchesSearch && matchesDate && matchesType;
    });
  };

  // Delete cash flow entry
  const deleteEntry = (entryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      const updatedCashFlow = cashFlow.filter((entry) => entry.id !== entryId);
      setCashFlow(updatedCashFlow);
      localStorage.setItem("cashFlow", JSON.stringify(updatedCashFlow));
      calculateSummary(updatedCashFlow);
      
      // Atualizar dados financeiros após exclusão de transação
      updateFinancialData(updatedCashFlow);
      
      toast.success("Transação excluída com sucesso!");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Generate monthly data for chart
  const generateMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];
    
    // Initialize month data
    for (let month = 0; month < 6; month++) {
      const date = new Date(currentYear, new Date().getMonth() - 5 + month);
      monthlyData.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        income: 0,
        expense: 0,
        balance: 0
      });
    }
    
    // Sum up entries by month
    cashFlow.forEach(entry => {
      if (entry.status !== "completed") return;
      
      const entryDate = new Date(entry.date);
      const monthIndex = monthlyData.findIndex(data => {
        const dataMonth = new Date(currentYear, new Date().getMonth() - 5 + monthlyData.indexOf(data)).getMonth();
        return dataMonth === entryDate.getMonth() && 
               currentYear === entryDate.getFullYear();
      });
      
      if (monthIndex !== -1) {
        if (entry.type === "income") {
          monthlyData[monthIndex].income += entry.amount;
        } else {
          monthlyData[monthIndex].expense += entry.amount;
        }
        monthlyData[monthIndex].balance = 
          monthlyData[monthIndex].income - monthlyData[monthIndex].expense;
      }
    });
    
    return monthlyData;
  };

  const monthlyData = generateMonthlyData();
  const filteredCashFlow = getFilteredCashFlow();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary.balance)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
            {summary.pendingIncome > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {formatCurrency(summary.pendingIncome)} pendente
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpense)}</div>
            {summary.pendingExpense > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {formatCurrency(summary.pendingExpense)} pendente
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">
            <CalendarRange className="h-4 w-4 mr-2" />
            Lista de Transações
          </TabsTrigger>
          <TabsTrigger value="chart">
            <BarChart4 className="h-4 w-4 mr-2" />
            Gráfico Mensal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="thisWeek">Esta semana</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Entradas</SelectItem>
                  <SelectItem value="expense">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCashFlow.length > 0 ? (
                    filteredCashFlow.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {entry.type === "income" ? (
                              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                            )}
                            {entry.type === "income" ? "Entrada" : "Saída"}
                          </div>
                        </TableCell>
                        <TableCell className={entry.type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {entry.type === "income" ? "+" : "-"} {formatCurrency(entry.amount)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs 
                            ${entry.status === "completed" ? 'bg-green-100 text-green-800' : 
                              entry.status === "pending" ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {entry.status === "completed" ? "Concluído" : 
                              entry.status === "pending" ? "Pendente" : "Cancelado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(entry.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
              <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name="Entradas" 
                      stroke="#16a34a" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name="Saídas" 
                      stroke="#dc2626" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      name="Saldo" 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                  <p className="text-lg font-medium text-green-600">
                    {formatCurrency(monthlyData.reduce((sum, month) => sum + month.income, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                  <p className="text-lg font-medium text-red-600">
                    {formatCurrency(monthlyData.reduce((sum, month) => sum + month.expense, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Período</p>
                  <p className={`text-lg font-medium ${monthlyData[5].balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(monthlyData.reduce((sum, month) => sum + month.balance, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Generate sample cash flow data
function generateSampleCashFlow(): CashFlowEntry[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  return [
    {
      id: "1",
      date: today.toISOString(),
      description: "Vendas do dia",
      amount: 3500,
      type: "income",
      category: "Vendas",
      paymentMethod: "Diversos",
      notes: "Faturamento total do restaurante",
      status: "completed"
    },
    {
      id: "2",
      date: today.toISOString(),
      description: "Pagamento fornecedor",
      amount: 1250,
      type: "expense",
      category: "Fornecedores",
      paymentMethod: "Transferência",
      reference: "NF 12345",
      status: "completed"
    },
    {
      id: "3",
      date: yesterday.toISOString(),
      description: "Vendas delivery",
      amount: 850,
      type: "income",
      category: "Vendas",
      paymentMethod: "App",
      status: "completed"
    },
    {
      id: "4",
      date: yesterday.toISOString(),
      description: "Pagamento funcionários",
      amount: 4800,
      type: "expense",
      category: "Folha de pagamento",
      paymentMethod: "Transferência",
      status: "completed"
    },
    {
      id: "5",
      date: lastWeek.toISOString(),
      description: "Aluguel",
      amount: 3000,
      type: "expense",
      category: "Aluguel",
      paymentMethod: "Transferência",
      status: "completed"
    },
    {
      id: "6",
      date: lastWeek.toISOString(),
      description: "Vendas final de semana",
      amount: 8500,
      type: "income",
      category: "Vendas",
      paymentMethod: "Diversos",
      status: "completed"
    },
    {
      id: "7",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(),
      description: "Pagamento evento corporativo",
      amount: 6000,
      type: "income",
      category: "Eventos",
      paymentMethod: "Transferência",
      status: "pending"
    },
    {
      id: "8",
      date: lastMonth.toISOString(),
      description: "Conta de luz",
      amount: 850,
      type: "expense",
      category: "Utilidades",
      paymentMethod: "Débito automático",
      status: "completed"
    },
    {
      id: "9",
      date: lastMonth.toISOString(),
      description: "Conta de água",
      amount: 350,
      type: "expense",
      category: "Utilidades",
      paymentMethod: "Débito automático",
      status: "completed"
    }
  ];
}
