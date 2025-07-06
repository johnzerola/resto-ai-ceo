import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FichaTecnicaImportCSVProps {
  onImportComplete?: () => void;
}

export function FichaTecnicaImportCSV({ onImportComplete }: FichaTecnicaImportCSVProps) {
  const { currentRestaurant } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Template CSV para download
  const downloadTemplate = () => {
    const template = [
      'nome_prato,categoria,rendimento_porcoes,ingrediente_1,quantidade_1,unidade_1,ingrediente_2,quantidade_2,unidade_2,ingrediente_3,quantidade_3,unidade_3,observacoes',
      'Hambúrguer Artesanal,lanche,1,Carne Bovina,200,g,Pão de Hambúrguer,1,un,Queijo Cheddar,50,g,Hambúrguer com queijo derretido',
      'Pizza Margherita,prato_principal,8,Massa de Pizza,300,g,Molho de Tomate,150,g,Mussarela,200,g,Pizza clássica italiana'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_fichas_tecnicas.csv';
    link.click();
    toast.success('📥 Modelo CSV baixado com sucesso!');
  };

  // Processar arquivo CSV
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const dataLines = lines.slice(1);

      // Validar estrutura mínima
      const requiredFields = ['nome_prato', 'categoria', 'rendimento_porcoes'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      const processedData = [];
      const newErrors = [];

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        // Mapear valores básicos
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Validar dados essenciais
        if (!row.nome_prato) {
          newErrors.push(`Linha ${i + 2}: Nome do prato é obrigatório`);
          continue;
        }

        if (!row.rendimento_porcoes || isNaN(Number(row.rendimento_porcoes))) {
          newErrors.push(`Linha ${i + 2}: Rendimento deve ser um número válido`);
          continue;
        }

        // Processar ingredientes (até 10 ingredientes)
        const ingredientes = [];
        for (let j = 1; j <= 10; j++) {
          const ingrediente = row[`ingrediente_${j}`];
          const quantidade = row[`quantidade_${j}`];
          const unidade = row[`unidade_${j}`];

          if (ingrediente && quantidade && unidade) {
            if (isNaN(Number(quantidade))) {
              newErrors.push(`Linha ${i + 2}: Quantidade do ingrediente ${j} deve ser um número`);
              continue;
            }

            ingredientes.push({
              nome: ingrediente,
              quantidade: Number(quantidade),
              unidade: unidade
            });
          }
        }

        if (ingredientes.length === 0) {
          newErrors.push(`Linha ${i + 2}: Pelo menos um ingrediente é obrigatório`);
          continue;
        }

        row.ingredientes_processados = ingredientes;
        processedData.push(row);
      }

      setErrors(newErrors);
      setImportedData(processedData);

      if (processedData.length > 0) {
        toast.success(`✅ ${processedData.length} ficha(s) processada(s) com sucesso!`);
      }

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      toast.error(`❌ Erro ao processar arquivo: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Salvar fichas importadas
  const saveImportedData = async () => {
    if (!currentRestaurant?.id || importedData.length === 0) return;

    setIsProcessing(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of importedData) {
        try {
          // Salvar prato
          const { data: prato, error: pratoError } = await supabase
            .from('pratos')
            .insert({
              nome_prato: row.nome_prato,
              categoria: row.categoria || 'outros',
              rendimento_porcoes: Number(row.rendimento_porcoes),
              observacoes: row.observacoes || '',
              restaurant_id: currentRestaurant.id,
              custo_total: 0,
              preco_sugerido: 0
            })
            .select()
            .single();

          if (pratoError) throw pratoError;

          // Salvar ingredientes (como referência, sem custos reais pois podem não ter insumos cadastrados)
          if (prato && row.ingredientes_processados) {
            const ingredientesData = row.ingredientes_processados.map((ing: any) => ({
              prato_id: prato.id,
              insumo_id: null, // Será preenchido manualmente depois
              quantidade_bruta: ing.quantidade,
              quantidade_liquida: ing.quantidade,
              custo_total: 0 // Será calculado depois
            }));

            await supabase
              .from('ingredientes_por_prato')
              .insert(ingredientesData);
          }

          successCount++;
        } catch (error) {
          console.error(`Erro ao salvar ${row.nome_prato}:`, error);
          errorCount++;
        }
      }

      toast.success(`✅ ${successCount} ficha(s) importada(s) com sucesso!`);
      
      if (errorCount > 0) {
        toast.error(`⚠️ ${errorCount} ficha(s) com erro na importação`);
      }

      // Reset e fechar
      setImportedData([]);
      setIsOpen(false);
      onImportComplete?.();
      
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('❌ Erro durante a importação');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Fichas Técnicas via CSV
          </DialogTitle>
          <DialogDescription>
            Importe múltiplas fichas técnicas de uma só vez usando um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Como usar:</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Baixe o modelo CSV clicando no botão abaixo</p>
              <p>2. Preencha o arquivo com seus dados (nome, categoria, ingredientes)</p>
              <p>3. Salve o arquivo e faça o upload aqui</p>
              <p>4. Revise os dados e confirme a importação</p>
            </CardContent>
          </Card>

          {/* Botão para baixar modelo */}
          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>

          {/* Upload de arquivo */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="csvFile">Selecionar arquivo CSV</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Erros de validação */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-red-800">Erros encontrados:</p>
                  {errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm text-red-700">• {error}</p>
                  ))}
                  {errors.length > 5 && (
                    <p className="text-sm text-red-700">... e mais {errors.length - 5} erro(s)</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview dos dados importados */}
          {importedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Dados Processados ({importedData.length} fichas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {importedData.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800">{item.nome_prato}</h4>
                      <p className="text-sm text-green-700">
                        {item.categoria} • {item.rendimento_porcoes} porção(ões)
                      </p>
                      <p className="text-xs text-green-600">
                        {item.ingredientes_processados?.length || 0} ingrediente(s)
                      </p>
                    </div>
                  ))}
                  {importedData.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... e mais {importedData.length - 5} ficha(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            
            {importedData.length > 0 && (
              <Button 
                onClick={saveImportedData}
                disabled={isProcessing || errors.length > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Confirmar Importação ({importedData.length})
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Aviso importante */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Importante:</strong> As fichas importadas terão custos zerados. 
              Você precisará vincular os ingredientes aos insumos cadastrados para calcular os preços corretos.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}