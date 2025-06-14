
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Table,
  PieChart,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportField {
  id: string;
  name: string;
  table: string;
  type: 'number' | 'text' | 'date' | 'currency';
  category: string;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number | [string, string];
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  chartType?: 'table' | 'bar' | 'pie' | 'line';
  dateRange?: DateRange;
  createdAt: string;
}

export function CustomReportBuilder() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [currentReport, setCurrentReport] = useState<Partial<CustomReport>>({
    name: '',
    description: '',
    fields: [],
    filters: [],
    sortOrder: 'desc',
    chartType: 'table'
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const availableFields: ReportField[] = [
    // Campos financeiros
    { id: 'cash_flow.amount', name: 'Valor', table: 'cash_flow', type: 'currency', category: 'Financeiro' },
    { id: 'cash_flow.date', name: 'Data', table: 'cash_flow', type: 'date', category: 'Financeiro' },
    { id: 'cash_flow.category', name: 'Categoria', table: 'cash_flow', type: 'text', category: 'Financeiro' },
    { id: 'cash_flow.type', name: 'Tipo (Entrada/Saída)', table: 'cash_flow', type: 'text', category: 'Financeiro' },
    
    // Campos de receitas
    { id: 'recipes.name', name: 'Nome da Receita', table: 'recipes', type: 'text', category: 'Receitas' },
    { id: 'recipes.cost', name: 'Custo', table: 'recipes', type: 'currency', category: 'Receitas' },
    { id: 'recipes.selling_price', name: 'Preço de Venda', table: 'recipes', type: 'currency', category: 'Receitas' },
    { id: 'recipes.category', name: 'Categoria', table: 'recipes', type: 'text', category: 'Receitas' },
    
    // Campos de estoque
    { id: 'inventory.name', name: 'Item', table: 'inventory', type: 'text', category: 'Estoque' },
    { id: 'inventory.quantity', name: 'Quantidade', table: 'inventory', type: 'number', category: 'Estoque' },
    { id: 'inventory.cost_per_unit', name: 'Custo por Unidade', table: 'inventory', type: 'currency', category: 'Estoque' },
    { id: 'inventory.minimum_stock', name: 'Estoque Mínimo', table: 'inventory', type: 'number', category: 'Estoque' },
    
    // Campos de pratos
    { id: 'pratos.nome_prato', name: 'Nome do Prato', table: 'pratos', type: 'text', category: 'Pratos' },
    { id: 'pratos.custo_total', name: 'Custo Total', table: 'pratos', type: 'currency', category: 'Pratos' },
    { id: 'pratos.preco_sugerido', name: 'Preço Sugerido', table: 'pratos', type: 'currency', category: 'Pratos' },
    { id: 'pratos.margem_percentual', name: 'Margem %', table: 'pratos', type: 'number', category: 'Pratos' }
  ];

  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  const addField = (fieldId: string) => {
    if (!currentReport.fields?.includes(fieldId)) {
      setCurrentReport(prev => ({
        ...prev,
        fields: [...(prev.fields || []), fieldId]
      }));
    }
  };

  const removeField = (fieldId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      fields: prev.fields?.filter(f => f !== fieldId) || []
    }));
  };

  const addFilter = () => {
    setCurrentReport(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { field: '', operator: 'equals', value: '' }]
    }));
  };

  const updateFilter = (index: number, filter: Partial<ReportFilter>) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters?.map((f, i) => i === index ? { ...f, ...filter } : f) || []
    }));
  };

  const removeFilter = (index: number) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index) || []
    }));
  };

  const generateReport = async () => {
    if (!currentReport.fields?.length) {
      toast.error('Selecione pelo menos um campo para o relatório');
      return;
    }

    setIsGenerating(true);
    try {
      // Simular geração de dados do relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados simulados baseados nos campos selecionados
      const simulatedData = generateSimulatedData(currentReport.fields);
      setReportData(simulatedData);
      
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimulatedData = (fields: string[]) => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      const row: any = {};
      fields.forEach(fieldId => {
        const field = availableFields.find(f => f.id === fieldId);
        if (field) {
          switch (field.type) {
            case 'currency':
              row[fieldId] = (Math.random() * 1000).toFixed(2);
              break;
            case 'number':
              row[fieldId] = Math.floor(Math.random() * 100);
              break;
            case 'date':
              row[fieldId] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            case 'text':
              const options = ['Categoria A', 'Categoria B', 'Categoria C', 'Produto X', 'Produto Y'];
              row[fieldId] = options[Math.floor(Math.random() * options.length)];
              break;
          }
        }
      });
      data.push(row);
    }
    return data;
  };

  const saveReport = () => {
    if (!currentReport.name) {
      toast.error('Digite um nome para o relatório');
      return;
    }

    const newReport: CustomReport = {
      id: `report-${Date.now()}`,
      name: currentReport.name,
      description: currentReport.description || '',
      fields: currentReport.fields || [],
      filters: currentReport.filters || [],
      groupBy: currentReport.groupBy,
      sortBy: currentReport.sortBy,
      sortOrder: currentReport.sortOrder || 'desc',
      chartType: currentReport.chartType || 'table',
      dateRange: currentReport.dateRange,
      createdAt: new Date().toISOString()
    };

    setReports(prev => [...prev, newReport]);
    setCurrentReport({
      name: '',
      description: '',
      fields: [],
      filters: [],
      sortOrder: 'desc',
      chartType: 'table'
    });
    setIsBuilding(false);
    
    toast.success('Relatório salvo com sucesso!');
  };

  const loadReport = (report: CustomReport) => {
    setCurrentReport(report);
    setIsBuilding(true);
  };

  const exportReport = (format: 'csv' | 'json' | 'pdf') => {
    if (!reportData.length) {
      toast.error('Gere o relatório primeiro');
      return;
    }

    let content = '';
    let filename = `relatorio-${Date.now()}`;

    switch (format) {
      case 'csv':
        const headers = currentReport.fields?.map(f => 
          availableFields.find(field => field.id === f)?.name || f
        ).join(',') || '';
        const rows = reportData.map(row => 
          currentReport.fields?.map(f => row[f]).join(',')
        ).join('\n');
        content = `${headers}\n${rows}`;
        filename += '.csv';
        break;
      
      case 'json':
        content = JSON.stringify(reportData, null, 2);
        filename += '.json';
        break;
      
      case 'pdf':
        toast.info('Exportação PDF em desenvolvimento');
        return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Relatório exportado como ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios Customizáveis</h1>
          <p className="text-muted-foreground">Crie e gerencie relatórios personalizados</p>
        </div>
        <Button onClick={() => setIsBuilding(true)} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {/* Relatórios salvos */}
      {!isBuilding && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadReport(report)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.fields.length} campos</Badge>
                    <Badge variant="outline">{report.chartType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {reports.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum relatório criado</p>
                <p className="text-muted-foreground">Clique em "Novo Relatório" para começar</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Constructor de relatório */}
      {isBuilding && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Construtor de Relatório</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBuilding(false)}>
                Cancelar
              </Button>
              <Button onClick={saveReport}>
                Salvar Relatório
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações */}
            <div className="space-y-6">
              {/* Informações básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <input
                      type="text"
                      value={currentReport.name || ''}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Nome do relatório"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={currentReport.description || ''}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Descrição do relatório"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Seleção de campos */}
              <Card>
                <CardHeader>
                  <CardTitle>Campos do Relatório</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(fieldsByCategory).map(([category, fields]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-2">{category}</h4>
                        <div className="space-y-2">
                          {fields.map(field => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={currentReport.fields?.includes(field.id) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) addField(field.id);
                                  else removeField(field.id);
                                }}
                              />
                              <label className="text-sm">{field.name}</label>
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filtros */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Filtros</CardTitle>
                    <Button size="sm" onClick={addFilter}>
                      <Filter className="h-4 w-4 mr-2" />
                      Adicionar Filtro
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentReport.filters?.map((filter, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => updateFilter(index, { field: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(index, { operator: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Igual</SelectItem>
                          <SelectItem value="contains">Contém</SelectItem>
                          <SelectItem value="greater">Maior que</SelectItem>
                          <SelectItem value="less">Menor que</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <input
                        type="text"
                        value={filter.value as string || ''}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 px-2 py-1 border rounded"
                        placeholder="Valor"
                      />
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFilter(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Preview e geração */}
            <div className="space-y-6">
              {/* Configurações de visualização */}
              <Card>
                <CardHeader>
                  <CardTitle>Visualização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Gráfico</label>
                    <Select
                      value={currentReport.chartType}
                      onValueChange={(value) => setCurrentReport(prev => ({ ...prev, chartType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Tabela</SelectItem>
                        <SelectItem value="bar">Gráfico de Barras</SelectItem>
                        <SelectItem value="pie">Gráfico de Pizza</SelectItem>
                        <SelectItem value="line">Gráfico de Linha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Período</label>
                    <DatePickerWithRange
                      selected={currentReport.dateRange}
                      onSelect={(range) => setCurrentReport(prev => ({ ...prev, dateRange: range }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Geração do relatório */}
              <Card>
                <CardHeader>
                  <CardTitle>Gerar Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={generateReport} 
                    disabled={isGenerating || !currentReport.fields?.length}
                    className="w-full"
                  >
                    {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
                  </Button>

                  {reportData.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Relatório gerado com {reportData.length} registros
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => exportReport('csv')}>
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button size="sm" onClick={() => exportReport('json')}>
                          <Download className="h-4 w-4 mr-2" />
                          JSON
                        </Button>
                        <Button size="sm" onClick={() => exportReport('pdf')}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview dos dados */}
              {reportData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview dos Dados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {currentReport.fields?.map(fieldId => {
                              const field = availableFields.find(f => f.id === fieldId);
                              return (
                                <th key={fieldId} className="text-left p-2">
                                  {field?.name || fieldId}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b">
                              {currentReport.fields?.map(fieldId => (
                                <td key={fieldId} className="p-2">
                                  {row[fieldId]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {reportData.length > 5 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Mostrando 5 de {reportData.length} registros
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
