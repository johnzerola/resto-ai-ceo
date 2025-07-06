import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileFriendlyInput } from "@/components/ui/mobile-friendly-input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  ArrowRight,
  Calculator,
  ShoppingCart,
  DollarSign
} from "lucide-react";

interface IngredienteCompleto {
  id: string;
  insumo_id: string;
  nome_insumo: string;
  quantidade_bruta: number;
  quantidade_liquida: number;
  fator_correcao: number;
  preco_unitario: number;
  custo_total: number;
  unidade_medida: string;
}

interface Props {
  ingredientes: IngredienteCompleto[];
  onAdicionar: () => void;
  onAtualizar: (id: string, campo: keyof IngredienteCompleto, valor: any) => void;
  onRemover: (id: string) => void;
  onProximo: () => void;
  onVoltar: () => void;
  errors: string[];
}

export function IngredientesTab({
  ingredientes,
  onAdicionar,
  onAtualizar,
  onRemover,
  onProximo,
  onVoltar,
  errors
}: Props) {
  
  const custoTotal = ingredientes.reduce((total, ing) => total + ing.custo_total, 0);
  const podeAvancar = ingredientes.length > 0 && 
    ingredientes.some(ing => ing.custo_total > 0);

  return (
    <div className="space-y-6">
      {/* Header com informações */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Lista de Ingredientes
          </h3>
          <p className="text-sm text-gray-600">
            Adicione todos os ingredientes e seus custos
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Custo Total</div>
          <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
            R$ {custoTotal.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Lista de Ingredientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ingredientes ({ingredientes.length})
            </CardTitle>
            <Button 
              onClick={onAdicionar} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ingredientes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">Nenhum ingrediente adicionado</h4>
              <p className="text-sm mb-4">Clique em "Adicionar" para começar</p>
              <Button onClick={onAdicionar} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Ingrediente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ingredientes.map((ingrediente, index) => (
                <div 
                  key={ingrediente.id} 
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {/* Nome do Ingrediente */}
                  <div className="md:col-span-3">
                    <MobileFriendlyInput
                      label={`Ingrediente ${index + 1}`}
                      value={ingrediente.nome_insumo}
                      onChange={(value) => onAtualizar(ingrediente.id, 'nome_insumo', value)}
                      placeholder="Ex: Carne moída"
                      required
                    />
                  </div>
                  
                  {/* Quantidade Bruta */}
                  <div className="md:col-span-2">
                    <MobileFriendlyInput
                      label="Qtd. Bruta"
                      value={ingrediente.quantidade_bruta || ''}
                      onChange={(value) => onAtualizar(ingrediente.id, 'quantidade_bruta', Number(value))}
                      type="number"
                      placeholder="200"
                      helpText="g, ml, unid"
                    />
                  </div>
                  
                  {/* Fator de Correção */}
                  <div className="md:col-span-2">
                    <MobileFriendlyInput
                      label="Fator Correção"
                      value={ingrediente.fator_correcao || ''}
                      onChange={(value) => onAtualizar(ingrediente.id, 'fator_correcao', Number(value))}
                      type="number"
                      placeholder="1.0"
                      helpText="Perdas e aparas"
                    />
                  </div>
                  
                  {/* Quantidade Líquida (calculada) */}
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Qtd. Líquida</label>
                      <div className="h-12 bg-blue-50 border rounded-md flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {ingrediente.quantidade_liquida.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Automático</p>
                    </div>
                  </div>
                  
                  {/* Preço Unitário */}
                  <div className="md:col-span-2">
                    <MobileFriendlyInput
                      label="Preço/kg ou L"
                      value={ingrediente.preco_unitario || ''}
                      onChange={(value) => onAtualizar(ingrediente.id, 'preco_unitario', Number(value))}
                      type="number"
                      placeholder="15.00"
                      helpText="R$ por unidade"
                    />
                  </div>
                  
                  {/* Custo Total (calculado) */}
                  <div className="md:col-span-1">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Custo
                      </label>
                      <div className="h-12 bg-green-50 border rounded-md flex items-center justify-center">
                        <span className="text-sm font-bold text-green-700">
                          R$ {ingrediente.custo_total.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Automático</p>
                    </div>
                  </div>
                  
                  {/* Botão Remover */}
                  <div className="md:col-span-12 md:col-start-12 md:col-span-1 flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemover(ingrediente.id)}
                      className="h-12 w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Totais */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Resumo dos Ingredientes</h4>
                    <p className="text-sm text-gray-600">{ingredientes.length} ingrediente(s) adicionado(s)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">
                      R$ {custoTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Custo Total dos Ingredientes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onVoltar}
          className="min-w-[120px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          onClick={onProximo}
          disabled={!podeAvancar}
          className="bg-purple-600 hover:bg-purple-700 min-w-[140px]"
        >
          Ver Resultados
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Alertas de validação */}
      {errors.some(e => e.includes('ingrediente')) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            ⚠️ Alguns ingredientes têm dados incompletos. Verifique os campos em vermelho.
          </p>
        </div>
      )}
    </div>
  );
}