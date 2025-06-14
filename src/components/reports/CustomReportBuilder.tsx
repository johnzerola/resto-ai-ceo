
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  FileText,
  Settings,
  Filter,
  Calendar
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

interface ReportField {
  id: string;
  name: string;
  category: string;
  type: 'number' | 'text' | 'date' | 'currency';
  table: string;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'between';
  value: any;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy?: string;
  chartType: 'table' | 'bar' | 'pie' | 'line';
  dateRange?: DateRange;
}

export function CustomReportBuilder() {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string>('');
  const [chartType, setChartType] = useState<'table' | 'bar' | 'pie' | 'line'>('table');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const [savedReports, setSavedReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'Relatório de Vendas Mensal',
      description: 'Análise de vendas por categoria nos últimos 30 dias',
      fields: ['receita', 'categoria', 'data'],
      filters: [],
      groupBy: 'categoria',
      chartType: 'bar',
      dateRange: { from: addDays(new Date(), -30), to: new Date() }
    },
    {
      id: '2',
      name: 'Análise de Custos',
      description: 'Breakdown de custos por tipo',
      fields: ['custos', 'tipo', 'valor'],
      filters: [],
      groupBy: 'tipo',
      chartType: 'pie'
    }
  ]);

  const availableFields: ReportField[] = [
    // Campos financeiros
    { id: 'receita', name: 'Receita', category: 'Financeiro', type: 'currency', table: 'cash_flow' },
    { id: 'custos', name: 'Custos', category: 'Financeiro', type: 'currency', table: 'cash_flow' },
    { id: 'lucro', name: 'Lucro', category: 'Financeiro', type: 'currency', table: 'cash_flow' },
    { id: 'data', name: 'Data', category: 'Temporal', type: 'date', table: 'cash_flow' },
    
    // Campos de produto
    { id: 'nome_prato', name: 'Nome do Prato', category: 'Produto', type: 'text', table: 'pratos' },
    { id: 'categoria_prato', name: 'Categoria', category: 'Produto', type: 'text', table: 'pratos' },
    { id: 'custo_prato', name: 'Custo do Prato', category: 'Produto', type: 'currency', table: 'pratos' },
    { id: 'preco_prato', name: 'Preço do Prato', category: 'Produto', type: 'currency', table: 'pratos' },
    { id: 'margem_prato', name: 'Margem', category: 'Produto', type: 'number', table: 'pratos' },
    
    // Campos de estoque
    { id: 'nome_insumo', name: 'Nome do Insumo', category: 'Estoque', type: 'text', table: 'insumos' },
    { id: 'quantidade_estoque', name: 'Quantidade', category: 'Estoque', type: 'number', table: 'inventory' },
    { id: 'valor_estoque', name: 'Valor do Estoque', category: 'Estoque', type: 'currency', table: 'inventory' },
    
    // Campos operacionais
    { id: 'tipo_pagamento', name: 'Tipo de Pagamento', category: 'Operacional', type: 'text', table: 'cash_flow' },
    { id: 'status_pedido', name: 'Status', category: 'Operacional', type: 'text', table: 'cash_flow' }
  ];

  const fieldCategories = [...new Set(availableFields.map(f => f.category))];

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const saveReport = () => {
    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: `Relatório ${savedReports.length + 1}`,
      description: 'Relatório personalizado',
      fields: selectedFields,
      filters,
      groupBy: groupBy || undefined,
      chartType,
      dateRange
    };
    
    setSavedReports(prev => [...prev, newReport]);
  };

  const loadReport = (report: CustomReport) => {
    setSelectedFields(report.fields);
    setFilters(report.filters);
    setGroupBy(report.groupBy || '');
    setChartType(report.chartType);
    setDateRange(report.dateRange);
  };

  const generateReport = useCallback(() => {
    // Aqui você implementaria a lógica para gerar o relatório
    console.log('Gerando relatório com:', {
      fields: selectedFields,
      filters,
      groupBy,
      chartType,
      dateRange
    });
  }, [selectedFields, filters, groupBy, chartType, dateRange]);

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementar lógica de exportação
    console.log(`Exportando relatório em ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Construtor de Relatórios Personalizados
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="build" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="build">Construir</TabsTrigger>
          <TabsTrigger value="saved">Salvos</TabsTrigger>
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
        </TabsList>

        {/* Aba de Construção */}
        <TabsContent value="build" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seleção de Campos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campos do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldCategories.map(category => (
                  <div key={category}>
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-2">
                      {availableFields
                        .filter(field => field.category === category)
                        .map(field => (
                          <div key={field.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={field.id}
                              checked={selectedFields.includes(field.id)}
                              onCheckedChange={() => toggleField(field.id)}
                            />
                            <Label htmlFor={field.id} className="text-sm">
                              {field.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Filtros e Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Período */}
                <div>
                  <Label className="text-sm font-medium">Período</Label>
                  <DatePickerWithRange 
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                </div>

                {/* Filtros customizados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Filtros Customizados</Label>
                    <Button size="sm" variant="outline" onClick={addFilter}>
                      Adicionar
                    </Button>
                  </div>
                  
                  {filters.map((filter, index) => (
                    <div key={index} className="border rounded p-3 space-y-2">
                      <Select 
                        value={filter.field} 
                        onValueChange={(value) => updateFilter(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar campo" />
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
                        onValueChange={(value: any) => updateFilter(index, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Igual a</SelectItem>
                          <SelectItem value="greater">Maior que</SelectItem>
                          <SelectItem value="less">Menor que</SelectItem>
                          <SelectItem value="contains">Contém</SelectItem>
                          <SelectItem value="between">Entre</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          placeholder="Valor"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, { value: e.target.value })}
                        />
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeFilter(index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agrupamento */}
                <div>
                  <Label className="text-sm font-medium">Agrupar por</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {selectedFields.map(fieldId => {
                        const field = availableFields.find(f => f.id === fieldId);
                        return field ? (
                          <SelectItem key={fieldId} value={fieldId}>
                            {field.name}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Visualização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de gráfico */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo de Visualização</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'table', icon: FileText, label: 'Tabela' },
                      { value: 'bar', icon: BarChart3, label: 'Barras' },
                      { value: 'pie', icon: PieChart, label: 'Pizza' },
                      { value: 'line', icon: TrendingUp, label: 'Linha' }
                    ].map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={chartType === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType(value as any)}
                        className="flex flex-col gap-1 h-16"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="space-y-2">
                  <Button 
                    onClick={generateReport} 
                    className="w-full" 
                    disabled={selectedFields.length === 0}
                  >
                    Gerar Relatório
                  </Button>
                  
                  <Button 
                    onClick={saveReport} 
                    variant="outline" 
                    className="w-full"
                    disabled={selectedFields.length === 0}
                  >
                    Salvar Configuração
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => exportReport('pdf')} 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      PDF
                    </Button>
                    <Button 
                      onClick={() => exportReport('excel')} 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      Excel
                    </Button>
                    <Button 
                      onClick={() => exportReport('csv')} 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Relatórios Salvos */}
        <TabsContent value="saved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map(report => (
              <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">{report.name}</h4>
                    <Badge variant="outline">{report.chartType}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {report.description}
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Campos:</span> {report.fields.length}
                    </div>
                    <div>
                      <span className="font-medium">Filtros:</span> {report.filters.length}
                    </div>
                    {report.dateRange && (
                      <div>
                        <span className="font-medium">Período:</span>{' '}
                        {report.dateRange.from && format(report.dateRange.from, 'dd/MM')} -{' '}
                        {report.dateRange.to && format(report.dateRange.to, 'dd/MM')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => loadReport(report)}
                      className="flex-1"
                    >
                      Carregar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateReport()}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Preview */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFields.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Campos selecionados: {selectedFields.join(', ')}
                  </div>
                  
                  {/* Aqui você implementaria a visualização real */}
                  <div className="border-2 border-dashed border-gray-200 p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Preview do relatório apareceria aqui
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Selecione campos para ver o preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
