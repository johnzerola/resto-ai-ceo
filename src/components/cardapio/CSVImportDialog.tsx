
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (items: any[]) => void;
}

export function CSVImportDialog({ open, onOpenChange, onImportComplete }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = async (csvFile: File) => {
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Preview first 3 rows
      const preview = lines.slice(1, 4).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const item: any = { id: index };
        headers.forEach((header, i) => {
          item[header] = values[i] || '';
        });
        return item;
      });
      
      setPreviewData(preview);
    } catch (error) {
      toast.error('Erro ao ler arquivo CSV');
    }
  };

  const processCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const items = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        
        return {
          id: Date.now().toString() + index,
          name: values[headers.indexOf('nome')] || values[headers.indexOf('name')] || '',
          description: values[headers.indexOf('descricao')] || values[headers.indexOf('description')] || '',
          category: values[headers.indexOf('categoria')] || values[headers.indexOf('category')] || 'geral',
          price: parseFloat(values[headers.indexOf('preco')] || values[headers.indexOf('price')] || '0'),
          cost: parseFloat(values[headers.indexOf('custo')] || values[headers.indexOf('cost')] || '0'),
          ingredients: [],
          isActive: true
        };
      }).filter(item => item.name); // Remove empty entries

      onImportComplete(items);
      toast.success(`${items.length} itens importados com sucesso!`);
      onOpenChange(false);
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      toast.error('Erro ao processar arquivo CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Cardápio via CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Formato do CSV:</p>
                <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                  <div>nome,descricao,categoria,preco,custo</div>
                  <div>Hambúrguer Artesanal,Hambúrguer com carne bovina,lanche,25.90,12.50</div>
                  <div>Pizza Margherita,Pizza tradicional com mussarela,pizza,35.00,15.00</div>
                </div>
                <ul className="text-sm space-y-1 mt-3">
                  <li>• <strong>nome</strong>: Nome do prato (obrigatório)</li>
                  <li>• <strong>descricao</strong>: Descrição do prato</li>
                  <li>• <strong>categoria</strong>: Categoria (entrada, prato-principal, sobremesa, bebida, lanche)</li>
                  <li>• <strong>preco</strong>: Preço de venda (use ponto para decimais)</li>
                  <li>• <strong>custo</strong>: Custo do prato (use ponto para decimais)</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Importante:</strong> Use vírgula para separar as colunas e ponto para números decimais.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Upload */}
          <div>
            <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Preview dos dados (primeiras 3 linhas):
              </h4>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="px-3 py-2 text-left">Descrição</th>
                      <th className="px-3 py-2 text-left">Categoria</th>
                      <th className="px-3 py-2 text-left">Preço</th>
                      <th className="px-3 py-2 text-left">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.nome || item.name || '-'}</td>
                        <td className="px-3 py-2">{item.descricao || item.description || '-'}</td>
                        <td className="px-3 py-2">{item.categoria || item.category || '-'}</td>
                        <td className="px-3 py-2">R$ {item.preco || item.price || '0'}</td>
                        <td className="px-3 py-2">R$ {item.custo || item.cost || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warning */}
          {file && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A importação irá adicionar os itens ao seu cardápio atual. Itens com nomes duplicados serão importados normalmente.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={processCSV} 
              disabled={!file || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
