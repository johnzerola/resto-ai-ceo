
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { CashFlowOverview } from "@/components/restaurant/CashFlowOverview";
import { CashFlowForm } from "@/components/restaurant/CashFlowForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, FileDown, BarChart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SyncIndicator } from "@/components/restaurant/SyncIndicator";
import jsPDF from 'jspdf';

const FluxoCaixa = () => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const navigate = useNavigate();

  // Verificar se é a primeira visita à página
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedCashFlow");
    if (!hasVisited) {
      setShowIntegrationInfo(true);
      localStorage.setItem("hasVisitedCashFlow", "true");
    }
  }, []);

  const toggleAddEntry = () => {
    setIsAddingEntry(!isAddingEntry);
    setEditingEntry(null);
  };

  const handleEditEntry = (entryId: string) => {
    // Buscar a entrada pelo ID
    const cashFlowData = localStorage.getItem('cashFlowEntries');
    if (cashFlowData) {
      const entries = JSON.parse(cashFlowData);
      const entry = entries.find((e: any) => e.id === entryId);
      if (entry) {
        setEditingEntry(entry);
        setIsAddingEntry(true);
      }
    }
  };

  const handleBackToList = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
    // Não mostra mensagem de sucesso ao voltar
  };

  const goToDreCmv = () => {
    navigate('/dre');
  };

  const exportToPDF = () => {
    try {
      const cashFlowData = localStorage.getItem("cashFlowEntries");
      if (!cashFlowData) {
        toast.error("Nenhum dado disponível para exportar");
        return;
      }

      const entries = JSON.parse(cashFlowData);
      if (entries.length === 0) {
        toast.error("Nenhuma transação encontrada para exportar");
        return;
      }

      // Criar novo documento PDF
      const pdf = new jsPDF();
      
      // Configurações
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 30;
      
      // Header com logo e nome do sistema
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sistema de Gestão Restaurante', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Relatório de Fluxo de Caixa', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      // Linha separadora
      yPosition += 15;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;
      
      // Calcular totais
      const totalIncome = entries
        .filter((entry: any) => entry.type === 'income' && entry.status === 'completed')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
      const totalExpense = entries
        .filter((entry: any) => entry.type === 'expense' && entry.status === 'completed')
        .reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
      const balance = totalIncome - totalExpense;
      
      // Resumo financeiro
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 128, 0); // Verde
      pdf.text(`Total de Entradas: R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(255, 0, 0); // Vermelho
      pdf.text(`Total de Saídas: R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 8;
      
      pdf.setTextColor(balance >= 0 ? 0 : 255, balance >= 0 ? 0 : 0, 0); // Verde se positivo, vermelho se negativo
      pdf.text(`Saldo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 15;
      
      // Reset cor do texto
      pdf.setTextColor(0, 0, 0);
      
      // Tabela de transações
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalhamento das Transações:', 20, yPosition);
      yPosition += 15;
      
      // Cabeçalho da tabela
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data', 20, yPosition);
      pdf.text('Descrição', 50, yPosition);
      pdf.text('Categoria', 100, yPosition);
      pdf.text('Tipo', 130, yPosition);
      pdf.text('Valor', 160, yPosition);
      
      // Linha do cabeçalho
      yPosition += 2;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Tradução das categorias
      const categoryTranslations: { [key: string]: string } = {
        "sales": "Vendas",
        "food": "Alimentação",
        "beverage": "Bebidas",
        "delivery": "Delivery",
        "other_income": "Outras Receitas",
        "food_supplies": "Insumos Alimentares",
        "beverage_supplies": "Insumos Bebidas",
        "supplies": "Suprimentos",
        "rent": "Aluguel",
        "utilities": "Utilidades",
        "salaries": "Salários",
        "marketing": "Marketing",
        "maintenance": "Manutenção",
        "other_expense": "Outras Despesas"
      };
      
      // Ordenar entradas do mais recente para o mais antigo
      const sortedEntries = entries.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Dados das transações
      pdf.setFont('helvetica', 'normal');
      sortedEntries.forEach((entry: any) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        
        const formattedDate = new Date(entry.date).toLocaleDateString('pt-BR');
        const description = entry.description.length > 20 ? 
          entry.description.substring(0, 17) + '...' : entry.description;
        const category = categoryTranslations[entry.category] || entry.category;
        const categoryText = category.length > 15 ? category.substring(0, 12) + '...' : category;
        const type = entry.type === 'income' ? 'Entrada' : 'Saída';
        const amount = `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
        // Cor baseada no tipo
        if (entry.type === 'income') {
          pdf.setTextColor(0, 128, 0); // Verde para entradas
        } else {
          pdf.setTextColor(255, 0, 0); // Vermelho para saídas
        }
        
        pdf.text(formattedDate, 20, yPosition);
        pdf.setTextColor(0, 0, 0); // Reset para preto
        pdf.text(description, 50, yPosition);
        pdf.text(categoryText, 100, yPosition);
        pdf.text(type, 130, yPosition);
        
        // Valor com cor
        if (entry.type === 'income') {
          pdf.setTextColor(0, 128, 0);
        } else {
          pdf.setTextColor(255, 0, 0);
        }
        pdf.text(amount, 160, yPosition);
        pdf.setTextColor(0, 0, 0); // Reset
        
        yPosition += 8;
      });
      
      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Página ${i} de ${totalPages} - Sistema de Gestão Restaurante`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Salvar o PDF
      const fileName = `fluxo-caixa-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Relatório PDF gerado com sucesso!");
      
    } catch (error) {
      toast.error("Erro ao gerar relatório PDF");
      console.error("Erro na geração do PDF:", error);
    }
  };

  return (
    <ModernLayout>
      <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 bg-background min-h-screen max-w-full overflow-hidden">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
          <div className="w-full sm:w-auto min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight truncate">Fluxo de Caixa</h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1 sm:gap-2 truncate">
              <span className="truncate">Controle de entradas e saídas</span>
              <SyncIndicator />
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
            {!isAddingEntry && (
              <>
                <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs h-7 sm:h-8 flex-1 sm:flex-none min-w-0">
                  <FileDown className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button variant="outline" size="sm" onClick={goToDreCmv} className="text-xs h-7 sm:h-8 flex-1 sm:flex-none min-w-0">
                  <BarChart className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Ver</span>
                  <span>DRE</span>
                </Button>
                <Button onClick={toggleAddEntry} size="sm" className="text-xs h-7 sm:h-8 flex-1 sm:flex-none min-w-0">
                  <Plus className="mr-1 h-3 w-3" />
                  <span>Nova</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {showIntegrationInfo && (
          <Alert className="border-blue-500 bg-blue-50 p-2 sm:p-3">
            <AlertTitle className="text-blue-800 text-xs sm:text-sm">Integração Automática</AlertTitle>
            <AlertDescription className="text-blue-700 text-xs">
              <p className="mb-1">Todas as transações são sincronizadas com:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>• DRE</span>
                <span>• CMV</span>
                <span>• Dashboard</span>
                <span>• Metas</span>
              </div>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="link" 
                  className="text-blue-800 p-0 h-auto font-semibold text-xs" 
                  onClick={() => setShowIntegrationInfo(false)}
                >
                  Entendi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full min-w-0 overflow-hidden">
          {isAddingEntry ? (
            <CashFlowForm 
              editingEntry={editingEntry}
              onEntryAdded={() => {
                // Callback necessário mas manipulamos o sucesso de forma diferente
              }}
              onEditComplete={() => {
                setIsAddingEntry(false);
                setEditingEntry(null);
                toast.success("Transação salva com sucesso");
              }}
              onCancel={handleBackToList}
            />
          ) : (
            <CashFlowOverview 
              onEdit={handleEditEntry}
            />
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default FluxoCaixa;
