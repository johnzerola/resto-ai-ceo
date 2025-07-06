import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileFriendlyInput } from "@/components/ui/mobile-friendly-input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  ArrowRight,
  Target,
  Building,
  BarChart3,
  Hash,
  Truck,
  Trophy
} from "lucide-react";

interface DadosPrato {
  nome_prato: string;
  categoria: string;
  rendimento_porcoes: number;
  observacoes: string;
  preco_desejado: number;
}

interface ConfiguracaoAvancada {
  meta_lucro_percentual: number;
  despesas_fixas_mensais: number;
  despesas_variaveis_mensais: number;
  markup_personalizado: number;
  canal_venda: string;
  preco_concorrente: number;
}

interface ResultadosCalculados {
  preco_sugerido: number;
  margem_liquida: number;
}

interface Props {
  dadosPrato: DadosPrato;
  configuracaoAvancada: ConfiguracaoAvancada;
  resultados: ResultadosCalculados | null;
  onAtualizarDados: (campo: keyof DadosPrato, valor: any) => void;
  onAtualizarConfig: (campo: keyof ConfiguracaoAvancada, valor: any) => void;
  onProximo: () => void;
  errors: string[];
}

export function NovaFichaTecnicaTab({
  dadosPrato,
  configuracaoAvancada,
  resultados,
  onAtualizarDados,
  onAtualizarConfig,
  onProximo,
  errors
}: Props) {
  
  const podeAvancar = dadosPrato.nome_prato?.trim() && dadosPrato.categoria;

  return (
    <div className="space-y-6">
      {/* Dados Básicos do Prato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Dados Básicos do Prato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <MobileFriendlyInput
                label="Nome do Prato *"
                value={dadosPrato.nome_prato}
                onChange={(value) => onAtualizarDados('nome_prato', value)}
                placeholder="Ex: Hambúrguer Artesanal Premium"
                required
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Categoria *
              </Label>
              <Select 
                value={dadosPrato.categoria} 
                onValueChange={(value) => onAtualizarDados('categoria', value)}
              >
                <SelectTrigger className={`mt-1 h-12 ${errors.some(e => e.includes('Categoria')) ? 'border-red-300' : ''}`}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">🥗 Entrada</SelectItem>
                  <SelectItem value="prato_principal">🍽️ Prato Principal</SelectItem>
                  <SelectItem value="sobremesa">🍰 Sobremesa</SelectItem>
                  <SelectItem value="bebida">🥤 Bebida</SelectItem>
                  <SelectItem value="lanche">🍔 Lanche</SelectItem>
                  <SelectItem value="acompanhamento">🍟 Acompanhamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <MobileFriendlyInput
                label="Quantas porções rende? *"
                value={dadosPrato.rendimento_porcoes}
                onChange={(value) => onAtualizarDados('rendimento_porcoes', Math.max(1, Number(value)))}
                type="number"
                helpText="Número de porções que a receita produz"
              />
            </div>
          </div>

          {/* Campo Preço Desejado em destaque */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
            <MobileFriendlyInput
              label="💰 Qual preço você quer cobrar? (Opcional)"
              value={dadosPrato.preco_desejado || ''}
              onChange={(value) => onAtualizarDados('preco_desejado', Number(value))}
              type="number"
              placeholder="Ex: 25.90"
              helpText="Se informar, calculamos se vale a pena cobrar esse preço"
            />
          </div>

          {/* Campo de observações */}
          <div>
            <MobileFriendlyInput
              label="Observações (Opcional)"
              value={dadosPrato.observacoes}
              onChange={(value) => onAtualizarDados('observacoes', value)}
              placeholder="Notas especiais, modo de preparo, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas de Precificação */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            🎯 Configurações de Precificação Inteligente
          </CardTitle>
          <p className="text-sm text-purple-600">
            Configure suas metas e parâmetros para precificação automática
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <MobileFriendlyInput
                label="🎯 Meta de Lucro (%)"
                value={configuracaoAvancada.meta_lucro_percentual}
                onChange={(value) => onAtualizarConfig('meta_lucro_percentual', Number(value))}
                type="number"
                placeholder="30"
                helpText="Margem de lucro desejada após impostos"
              />
            </div>
            
            <div>
              <MobileFriendlyInput
                label="🏢 Despesas Fixas/Mês (R$)"
                value={configuracaoAvancada.despesas_fixas_mensais}
                onChange={(value) => onAtualizarConfig('despesas_fixas_mensais', Number(value))}
                type="number"
                placeholder="5000"
                helpText="Aluguel, salários, energia, etc."
              />
            </div>
            
            <div>
              <MobileFriendlyInput
                label="📊 Despesas Variáveis (%)"
                value={configuracaoAvancada.despesas_variaveis_mensais}
                onChange={(value) => onAtualizarConfig('despesas_variaveis_mensais', Number(value))}
                type="number"
                placeholder="10"
                helpText="% sobre custo dos ingredientes"
              />
            </div>
            
            <div>
              <MobileFriendlyInput
                label="🔢 Markup Personalizado (%)"
                value={configuracaoAvancada.markup_personalizado}
                onChange={(value) => onAtualizarConfig('markup_personalizado', Number(value))}
                type="number"
                placeholder="250"
                helpText="Multiplicador para preço sugerido"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                🚀 Canal de Venda
              </Label>
              <Select 
                value={configuracaoAvancada.canal_venda} 
                onValueChange={(value) => onAtualizarConfig('canal_venda', value)}
              >
                <SelectTrigger className="mt-1 h-12 bg-white">
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balcao">🍽️ Balcão/Presencial</SelectItem>
                  <SelectItem value="ifood">🛵 iFood (15% taxa)</SelectItem>
                  <SelectItem value="uber_eats">🚗 Uber Eats (12% taxa)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-purple-600 mt-1">
                Taxas são consideradas automaticamente
              </p>
            </div>
            
            <div>
              <MobileFriendlyInput
                label="🏆 Preço Concorrente (R$)"
                value={configuracaoAvancada.preco_concorrente || ''}
                onChange={(value) => onAtualizarConfig('preco_concorrente', Number(value))}
                type="number"
                placeholder="20.00"
                helpText="Preço da concorrência para comparação"
              />
            </div>
          </div>
          
          {/* Preview em tempo real dos resultados */}
          {resultados && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                📊 Preview dos Resultados
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600 mb-1">Preço Sugerido</div>
                  <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                    R$ {resultados.preco_sugerido.toFixed(2)}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 mb-1">Margem Líquida</div>
                  <Badge className={`text-base px-3 py-1 ${
                    resultados.margem_liquida >= configuracaoAvancada.meta_lucro_percentual 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {resultados.margem_liquida.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Navegação */}
      <div className="flex justify-end">
        <Button 
          onClick={onProximo}
          disabled={!podeAvancar}
          className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
        >
          Próximo: Ingredientes
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}