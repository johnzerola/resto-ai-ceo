
import { useState, useEffect } from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { InventoryOverview } from "@/components/restaurant/InventoryOverview";
import { InventoryForm } from "@/components/restaurant/InventoryForm";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  expiryDate?: string;
  minStock: number;
  location: string;
  lastUpdated: string;
}

const Estoque = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadInventoryItems();
    
    // Listen for inventory updates
    const handleInventoryUpdate = () => {
      loadInventoryItems();
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, []);

  const loadInventoryItems = () => {
    const storedItems = localStorage.getItem("inventoryItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems)) {
          setInventoryItems(parsedItems);
        }
      } catch (error) {
        console.error("Error parsing stored inventory items:", error);
        setInventoryItems([]);
      }
    }
  };

  const exportToPDF = () => {
    try {
      if (inventoryItems.length === 0) {
        toast.error("Nenhum item no estoque para exportar");
        return;
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 30;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sistema de Gestão Restaurante', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Relatório de Estoque', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      // Separator line
      yPosition += 15;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;
      
      // Summary
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo do Estoque:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de Itens: ${inventoryItems.length}`, 20, yPosition);
      yPosition += 8;
      
      const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
      pdf.text(`Valor Total em Estoque: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 15;
      
      // Items with low stock
      const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock);
      if (lowStockItems.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 0, 0);
        pdf.text(`Itens com Estoque Baixo: ${lowStockItems.length}`, 20, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 15;
      }
      
      // Table header
      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', 20, yPosition);
      pdf.text('Categoria', 60, yPosition);
      pdf.text('Qtd', 100, yPosition);
      pdf.text('Unidade', 120, yPosition);
      pdf.text('Custo Unit.', 150, yPosition);
      pdf.text('Total', 180, yPosition);
      
      yPosition += 2;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Table data
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      inventoryItems.forEach((item) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Highlight low stock items
        if (item.quantity <= item.minStock) {
          pdf.setTextColor(255, 0, 0);
        }
        
        const itemName = item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name;
        const category = item.category.length > 12 ? item.category.substring(0, 9) + '...' : item.category;
        const unitCost = `R$ ${item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const totalCost = `R$ ${(item.quantity * item.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
        pdf.text(itemName, 20, yPosition);
        pdf.text(category, 60, yPosition);
        pdf.text(item.quantity.toString(), 100, yPosition);
        pdf.text(item.unit, 120, yPosition);
        pdf.text(unitCost, 150, yPosition);
        pdf.text(totalCost, 180, yPosition);
        
        pdf.setTextColor(0, 0, 0); // Reset color
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
      
      const fileName = `estoque-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Relatório PDF gerado com sucesso!");
      
    } catch (error) {
      toast.error("Erro ao gerar relatório PDF");
      console.error("Erro na geração do PDF:", error);
    }
  };

  const toggleAddItem = () => {
    setIsAddingItem(!isAddingItem);
    setSelectedItemId(null);
  };

  const handleCancelForm = () => {
    setIsAddingItem(false);
    setSelectedItemId(null);
  };

  const editItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsAddingItem(true);
  };

  const handleFormSuccess = () => {
    loadInventoryItems();
    setIsAddingItem(false);
    setSelectedItemId(null);
    toast.success(selectedItemId ? "Item atualizado com sucesso" : "Item adicionado com sucesso");
  };

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Gestão de Estoque
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Controle completo do seu inventário
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isAddingItem && (
              <>
                <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs py-1 h-8 sm:text-sm flex-1 sm:flex-none">
                  <FileDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Exportar</span>
                </Button>
                <Button onClick={toggleAddItem} size="sm" className="text-xs py-1 h-8 sm:text-sm flex-1 sm:flex-none">
                  <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Novo Item</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm w-full overflow-x-auto">
          <div className="min-w-full w-fit">
            {isAddingItem ? (
              <InventoryForm 
                itemId={selectedItemId} 
                onCancel={handleCancelForm} 
                onSuccess={handleFormSuccess}
              />
            ) : (
              <InventoryOverview 
                onEdit={editItem}
              />
            )}
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default Estoque;
