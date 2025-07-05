import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Download, RefreshCw, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

interface ShoppingItem {
  id: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  consumoMedioSemanal: number;
  quantidadeComprar: number;
  fornecedor: string;
  precoUnitario: number;
  valorTotal: number;
  categoria: string;
  urgencia: 'baixa' | 'media' | 'alta';
}

export function ShoppingListGenerator() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateShoppingList();
  }, []);

  const generateShoppingList = async () => {
    setIsGenerating(true);
    try {
      // Simular geração baseada em dados do estoque e consumo
      const mockItems: ShoppingItem[] = [
        {
          id: '1',
          nome: 'Filé de Frango',
          estoqueAtual: 5,
          estoqueMinimo: 15,
          estoqueMaximo: 50,
          consumoMedioSemanal: 20,
          quantidadeComprar: 30,
          fornecedor: 'Frigorifico ABC',
          precoUnitario: 12.50,
          valorTotal: 375.00,
          categoria: 'Carnes',
          urgencia: 'alta'
        },
        {
          id: '2',
          nome: 'Tomate',
          estoqueAtual: 8,
          estoqueMinimo: 10,
          estoqueMaximo: 30,
          consumoMedioSemanal: 12,
          quantidadeComprar: 15,
          fornecedor: 'Hortifruti Central',
          precoUnitario: 4.50,
          valorTotal: 67.50,
          categoria: 'Hortaliças',
          urgencia: 'media'
        },
        {
          id: '3',
          nome: 'Óleo de Soja',
          estoqueAtual: 2,
          estoqueMinimo: 5,
          estoqueMaximo: 20,
          consumoMedioSemanal: 4,
          quantidadeComprar: 10,
          fornecedor: 'Distribuidora XYZ',
          precoUnitario: 6.80,
          valorTotal: 68.00,
          categoria: 'Óleos',
          urgencia: 'alta'
        },
        {
          id: '4',
          nome: 'Arroz Branco',
          estoqueAtual: 25,
          estoqueMinimo: 20,
          estoqueMaximo: 60,
          consumoMedioSemanal: 15,
          quantidadeComprar: 20,
          fornecedor: 'Arrozeira Sul',
          precoUnitario: 3.20,
          valorTotal: 64.00,
          categoria: 'Grãos',
          urgencia: 'baixa'
        },
        {
          id: '5',
          nome: 'Cebola',
          estoqueAtual: 12,
          estoqueMinimo: 15,
          estoqueMaximo: 40,
          consumoMedioSemanal: 10,
          quantidadeComprar: 18,
          fornecedor: 'Hortifruti Central',
          precoUnitario: 2.80,
          valorTotal: 50.40,
          categoria: 'Hortaliças',
          urgencia: 'media'
        }
      ];

      setShoppingList(mockItems);
      toast.success('Lista de compras gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar lista:', error);
      toast.error('Erro ao gerar lista de compras');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    // Mock para exportação PDF - em produção integraria com biblioteca de PDF
    const content = shoppingList.map(item => 
      `${item.nome} - ${item.quantidadeComprar} unidades - ${formatCurrency(item.valorTotal)}`
    ).join('\n');
    
    console.log('📄 EXPORTAÇÃO PDF MOCKUP:');
    console.log('=== LISTA DE COMPRAS ===');
    console.log(content);
    console.log(`\nTotal: ${formatCurrency(getTotalValue())}`);
    console.log(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
    
    toast.success('📄 Lista exportada! (Mock - verifique console)');
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setShoppingList(items => items.map(item => 
      item.id === id 
        ? { 
            ...item, 
            quantidadeComprar: newQuantity, 
            valorTotal: newQuantity * item.precoUnitario 
          }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setShoppingList(items => items.filter(item => item.id !== id));
    toast.success('Item removido da lista');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalValue = () => {
    return shoppingList.reduce((total, item) => total + item.valorTotal, 0);
  };

  const getTotalItems = () => {
    return shoppingList.reduce((total, item) => total + item.quantidadeComprar, 0);
  };

  const getUrgencyColor = (urgencia: ShoppingItem['urgencia']) => {
    switch (urgencia) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baixa': return 'default';
      default: return 'outline';
    }
  };

  const getUrgencyText = (urgencia: ShoppingItem['urgencia']) => {
    switch (urgencia) {
      case 'alta': return '🔴 Urgente';
      case 'media': return '🟡 Moderado';
      case 'baixa': return '🟢 Normal';
      default: return 'Normal';
    }
  };

  const criticalItems = shoppingList.filter(item => item.urgencia === 'alta').length;

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista de Compras Automática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Gerando lista baseada no consumo e estoque...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-red-800">
                ⚠️ {criticalItems} item(ns) com estoque crítico precisam ser comprados urgentemente!
              </span>
              <div className="text-sm text-red-700">
                Esses produtos podem acabar nos próximos dias baseado no consumo atual.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Lista de Compras Automática
              </CardTitle>
              <CardDescription>
                Baseada no consumo médio semanal e estoque mínimo configurado
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateShoppingList}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              <Button size="sm" onClick={exportToPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Resumo */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                    <p className="text-2xl font-bold">{shoppingList.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantidade Total</p>
                    <p className="text-2xl font-bold">{getTotalItems()}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(getTotalValue())}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Itens */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Consumo/Semana</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoppingList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.categoria} - {item.fornecedor}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={item.estoqueAtual <= item.estoqueMinimo ? 'text-red-600 font-medium' : ''}>
                        {item.estoqueAtual}
                      </span>
                    </TableCell>
                    <TableCell>{item.estoqueMinimo}</TableCell>
                    <TableCell>{item.consumoMedioSemanal}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantidadeComprar}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.precoUnitario)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.valorTotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyColor(item.urgencia)}>
                        {getUrgencyText(item.urgencia)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {shoppingList.length === 0 && (
            <div className="text-center py-10">
              <div className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum item precisa ser comprado no momento
                </p>
                <p className="text-sm text-muted-foreground">
                  Todos os produtos estão com estoque adequado
                </p>
              </div>
            </div>
          )}

          {/* Resumo Final */}
          {shoppingList.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Resumo da Compra</h3>
                  <p className="text-sm text-muted-foreground">
                    {shoppingList.length} produtos • {getTotalItems()} unidades
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(getTotalValue())}
                  </div>
                  <p className="text-sm text-muted-foreground">Total estimado</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}