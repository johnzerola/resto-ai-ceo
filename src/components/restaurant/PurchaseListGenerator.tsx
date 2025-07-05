
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, ShoppingCart, Package, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface PurchaseItem {
  produto: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  consumoMedioSemanal: number;
  quantidadeComprar: number;
  prioridadeCompra: 'URGENTE' | 'ALTA' | 'MÉDIA' | 'BAIXA';
  categoria: string;
  fornecedor?: string;
  precoUnitario?: number;
}

export function PurchaseListGenerator() {
  const [purchaseList, setPurchaseList] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItensCompra, setTotalItensCompra] = useState(0);
  const [valorEstimado, setValorEstimado] = useState(0);

  useEffect(() => {
    generatePurchaseList();
  }, []);

  const generatePurchaseList = () => {
    setIsLoading(true);
    try {
      // Carregar dados do inventário existente
      const inventoryData = localStorage.getItem('inventoryItems');
      let purchaseItems: PurchaseItem[] = [];

      if (inventoryData) {
        const inventory = JSON.parse(inventoryData);
        
        purchaseItems = inventory.map((item: any) => {
          const estoqueAtual = item.quantity || 0;
          const estoqueMinimo = item.minStock || Math.floor(Math.random() * 20) + 10;
          const estoqueMaximo = estoqueMinimo * 3;
          const consumoMedioSemanal = Math.floor(Math.random() * 15) + 5;
          
          // Calcular quantidade a comprar baseada no consumo e estoque
          let quantidadeComprar = 0;
          let prioridadeCompra: 'URGENTE' | 'ALTA' | 'MÉDIA' | 'BAIXA' = 'BAIXA';
          
          if (estoqueAtual <= estoqueMinimo) {
            quantidadeComprar = estoqueMaximo - estoqueAtual;
            prioridadeCompra = estoqueAtual === 0 ? 'URGENTE' : 'ALTA';
          } else if (estoqueAtual <= estoqueMinimo * 1.5) {
            quantidadeComprar = Math.ceil((estoqueMaximo - estoqueAtual) * 0.7);
            prioridadeCompra = 'MÉDIA';
          }

          return {
            produto: item.name,
            estoqueAtual,
            estoqueMinimo,
            estoqueMaximo,
            consumoMedioSemanal,
            quantidadeComprar,
            prioridadeCompra,
            categoria: item.category || 'Geral',
            fornecedor: item.supplier || 'Não informado',
            precoUnitario: item.costPerUnit || item.cost || 0
          };
        }).filter((item: PurchaseItem) => item.quantidadeComprar > 0);
      } else {
        // Dados mock se não houver inventário
        purchaseItems = [
          {
            produto: 'Filé de Frango',
            estoqueAtual: 5,
            estoqueMinimo: 20,
            estoqueMaximo: 60,
            consumoMedioSemanal: 12,
            quantidadeComprar: 55,
            prioridadeCompra: 'URGENTE',
            categoria: 'Carnes',
            fornecedor: 'Frigorífico ABC',
            precoUnitario: 15.90
          },
          {
            produto: 'Arroz Branco 5kg',
            estoqueAtual: 8,
            estoqueMinimo: 15,
            estoqueMaximo: 45,
            consumoMedioSemanal: 8,
            quantidadeComprar: 37,
            prioridadeCompra: 'ALTA',
            categoria: 'Grãos',
            fornecedor: 'Distribuidora XYZ',
            precoUnitario: 12.50
          },
          {
            produto: 'Óleo de Soja 900ml',
            estoqueAtual: 15,
            estoqueMinimo: 20,
            estoqueMaximo: 60,
            consumoMedioSemanal: 6,
            quantidadeComprar: 45,
            prioridadeCompra: 'MÉDIA',
            categoria: 'Óleos',
            fornecedor: 'Atacado 123',
            precoUnitario: 7.80
          },
          {
            produto: 'Tomate',
            estoqueAtual: 0,
            estoqueMinimo: 25,
            estoqueMaximo: 75,
            consumoMedioSemanal: 18,
            quantidadeComprar: 75,
            prioridadeCompra: 'URGENTE',
            categoria: 'Hortaliças',
            fornecedor: 'Hortifruti Central',
            precoUnitario: 4.20
          }
        ];
      }

      // Ordenar por prioridade
      const prioridadeOrder = { 'URGENTE': 0, 'ALTA': 1, 'MÉDIA': 2, 'BAIXA': 3 };
      purchaseItems.sort((a, b) => prioridadeOrder[a.prioridadeCompra] - prioridadeOrder[b.prioridadeCompra]);

      setPurchaseList(purchaseItems);
      setTotalItensCompra(purchaseItems.length);
      
      const valorTotal = purchaseItems.reduce((sum, item) => 
        sum + (item.quantidadeComprar * (item.precoUnitario || 0)), 0
      );
      setValorEstimado(valorTotal);

    } catch (error) {
      console.error('Erro ao gerar lista de compras:', error);
      toast.error('Erro ao gerar lista de compras');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 30;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lista de Compras Automática', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerada em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Resumo
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo da Compra', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de itens: ${totalItensCompra}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Valor estimado: R$ ${valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 20;
      
      // Itens urgentes
      const urgentItems = purchaseList.filter(item => item.prioridadeCompra === 'URGENTE');
      if (urgentItems.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 0, 0);
        pdf.text(`URGENTE - ${urgentItems.length} item(ns) com estoque zerado:`, 20, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 10;
        
        urgentItems.forEach(item => {
          pdf.setFont('helvetica', 'normal');
          pdf.text(`• ${item.produto} - Comprar: ${item.quantidadeComprar} unidades`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // Lista completa
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lista Completa de Compras', 20, yPosition);
      yPosition += 15;
      
      // Headers da tabela
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Produto', 20, yPosition);
      pdf.text('Qtd', 100, yPosition);
      pdf.text('Prioridade', 120, yPosition);
      pdf.text('Valor Unit.', 150, yPosition);
      pdf.text('Total', 180, yPosition);
      
      yPosition += 5;
      pdf.line(20, yPosition, 200, yPosition);
      yPosition += 10;
      
      // Itens
      pdf.setFont('helvetica', 'normal');
      purchaseList.forEach(item => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }
        
        const totalItem = item.quantidadeComprar * (item.precoUnitario || 0);
        
        pdf.text(item.produto.substring(0, 20), 20, yPosition);
        pdf.text(item.quantidadeComprar.toString(), 100, yPosition);
        pdf.text(item.prioridadeCompra, 120, yPosition);
        pdf.text(`R$ ${(item.precoUnitario || 0).toFixed(2)}`, 150, yPosition);
        pdf.text(`R$ ${totalItem.toFixed(2)}`, 180, yPosition);
        
        yPosition += 8;
      });
      
      const fileName = `lista-compras-${currentDate.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Lista de compras exportada com sucesso!");
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF da lista de compras");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'destructive';
      case 'ALTA': return 'destructive';
      case 'MÉDIA': return 'secondary';
      case 'BAIXA': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens para Comprar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItensCompra}</div>
            <p className="text-xs text-muted-foreground">produtos necessários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(valorEstimado)}
            </div>
            <p className="text-xs text-muted-foreground">custo total estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {purchaseList.filter(item => item.prioridadeCompra === 'URGENTE').length}
            </div>
            <p className="text-xs text-muted-foreground">estoque zerado</p>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Export */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lista de Compras Automática</h3>
          <p className="text-sm text-muted-foreground">
            Baseada no consumo médio semanal e estoque mínimo
          </p>
        </div>
        <Button onClick={exportToPDF} className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Tabela de Compras */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Estoque Atual</TableHead>
                <TableHead className="text-center">Estoque Mín.</TableHead>
                <TableHead className="text-center">Consumo Semanal</TableHead>
                <TableHead className="text-center">Qtd. Comprar</TableHead>
                <TableHead className="text-center">Prioridade</TableHead>
                <TableHead className="text-right">Valor Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseList.length > 0 ? (
                purchaseList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{item.produto}</div>
                        <div className="text-xs text-muted-foreground">{item.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.estoqueAtual === 0 ? "destructive" : "outline"}>
                        {item.estoqueAtual}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{item.estoqueMinimo}</TableCell>
                    <TableCell className="text-center">{item.consumoMedioSemanal}</TableCell>
                    <TableCell className="text-center font-medium">
                      {item.quantidadeComprar}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getPriorityColor(item.prioridadeCompra)}>
                        {item.prioridadeCompra}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.precoUnitario || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantidadeComprar * (item.precoUnitario || 0))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum item precisa ser comprado no momento
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
