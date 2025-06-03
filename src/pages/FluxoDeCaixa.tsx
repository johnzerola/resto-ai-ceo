
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, FileDown, BarChart, Trash2, Edit, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CashFlowEntry {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  recurring?: boolean;
}

const FluxoDeCaixa = () => {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<CashFlowEntry>>({
    description: '',
    amount: 0,
    type: 'income',
    category: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  });
  const navigate = useNavigate();

  const incomeCategories = ['Vendas', 'Delivery', 'Eventos', 'Outros'];
  const expenseCategories = ['Ingredientes', 'Salários', 'Aluguel', 'Utilities', 'Marketing', 'Equipamentos', 'Outros'];

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedCashFlow");
    if (!hasVisited) {
      setShowIntegrationInfo(true);
      localStorage.setItem("hasVisitedCashFlow", "true");
    }

    const storedEntries = localStorage.getItem("cashFlowEntries");
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  const saveEntries = (updatedEntries: CashFlowEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem("cashFlowEntries", JSON.stringify(updatedEntries));
    
    // Integrar com outras telas
    const event = new CustomEvent('cashFlowUpdated', { detail: updatedEntries });
    window.dispatchEvent(event);
  };

  const handleSaveEntry = () => {
    if (!newEntry.description || !newEntry.amount || !newEntry.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const entry: CashFlowEntry = {
      id: editingEntry?.id || Date.now().toString(),
      description: newEntry.description!,
      amount: Number(newEntry.amount),
      type: newEntry.type!,
      category: newEntry.category!,
      date: newEntry.date!,
      recurring: newEntry.recurring || false
    };

    let updatedEntries;
    if (editingEntry) {
      updatedEntries = entries.map(e => e.id === editingEntry.id ? entry : e);
      toast.success("Transação atualizada com sucesso");
    } else {
      updatedEntries = [...entries, entry];
      toast.success("Transação adicionada com sucesso");
    }

    saveEntries(updatedEntries);
    resetForm();
  };

  const handleEditEntry = (entry: CashFlowEntry) => {
    setEditingEntry(entry);
    setNewEntry({ ...entry });
    setIsAddingEntry(true);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    saveEntries(updatedEntries);
    toast.success("Transação removida com sucesso");
  };

  const resetForm = () => {
    setNewEntry({
      description: '',
      amount: 0,
      type: 'income',
      category: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false
    });
    setIsAddingEntry(false);
    setEditingEntry(null);
  };

  const calculateTotals = () => {
    const income = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const balance = income - expenses;

    return { income, expenses, balance };
  };

  const exportData = () => {
    try {
      if (entries.length === 0) {
        toast.error("Nenhum dado disponível para exportar");
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `fluxo-caixa-${new Date().toLocaleDateString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast.success("Dados exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error("Erro na exportação:", error);
    }
  };

  const goToDreCmv = () => {
    navigate('/dre');
  };

  const { income, expenses, balance } = calculateTotals();

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">
              Controle completo de entradas e saídas financeiras
            </p>
          </div>
          <div className="flex gap-2">
            {!isAddingEntry && (
              <>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={goToDreCmv}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Ver DRE
                </Button>
                <Button onClick={() => setIsAddingEntry(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Transação
                </Button>
              </>
            )}
          </div>
        </div>

        {showIntegrationInfo && (
          <Alert className="border-blue-500 bg-blue-50">
            <AlertTitle className="text-blue-800">Integração Automática</AlertTitle>
            <AlertDescription className="text-blue-700">
              <p>Todas as transações registradas no fluxo de caixa são automaticamente sincronizadas com:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Demonstrativo de Resultados (DRE)</li>
                <li>Análise de Custo de Mercadoria Vendida (CMV)</li>
                <li>Dashboard Financeiro</li>
                <li>Metas e Indicadores de Desempenho</li>
              </ul>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="link" 
                  className="text-blue-800 p-0 h-auto font-semibold" 
                  onClick={() => setShowIntegrationInfo(false)}
                >
                  Entendi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo Financeiro */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {income.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {expenses.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </div>

        {isAddingEntry ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingEntry ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
              <CardDescription>
                Registre suas entradas e saídas de caixa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newEntry.description || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Descrição da transação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newEntry.amount || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={newEntry.type} 
                    onValueChange={(value: 'income' | 'expense') => setNewEntry({ ...newEntry, type: value, category: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={newEntry.category} 
                    onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {(newEntry.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveEntry}>
                  {editingEntry ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Acompanhe todas as movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma transação registrada ainda.</p>
                  <Button onClick={() => setIsAddingEntry(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar primeira transação
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{entry.description}</h4>
                          <Badge variant={entry.type === 'income' ? 'default' : 'destructive'}>
                            {entry.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                          <Badge variant="outline">{entry.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-semibold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR')}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ModernLayout>
  );
};

export { FluxoDeCaixa };
