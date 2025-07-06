
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface IngredienteInteligente {
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

interface ResultadosCalculados {
  cmv_estimado_percentual: number;
  cmv_estimado_valor: number;
  lucro_estimado_valor: number;
  lucro_estimado_percentual: number;
  margem_bruta: number;
  margem_liquida: number;
  preco_sugerido: number;
  status_viabilidade: 'saudavel' | 'atencao' | 'prejuizo';
  alertas: string[];
}

export function useFichaTecnicaCore() {
  const { currentRestaurant } = useAuth();
  const [ingredientes, setIngredientes] = useState<IngredienteInteligente[]>([]);
  const [resultados, setResultados] = useState<ResultadosCalculados | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular resultados usando função do banco com fallback
  const calcularResultados = useCallback(async (pratoId?: string, precoFinal?: number) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) {
      console.log('❌ Condições insuficientes para cálculo:', { 
        restaurant: !!currentRestaurant?.id, 
        ingredientes: ingredientes.length 
      });
      return;
    }

    // Validar se todos os ingredientes têm dados necessários
    const ingredientesValidos = ingredientes.filter(ing => 
      ing.insumo_id && 
      ing.quantidade_bruta > 0 && 
      ing.preco_unitario > 0
    );

    if (ingredientesValidos.length === 0) {
      console.log('❌ Nenhum ingrediente válido para cálculo');
      return;
    }

    setIsCalculating(true);
    console.log('🧮 Iniciando cálculo para', ingredientesValidos.length, 'ingredientes');

    try {
      let pratoIdParaCalculo = pratoId;
      
      // Criar prato temporário se necessário
      if (!pratoIdParaCalculo) {
        const { data: pratoTemp, error } = await supabase
          .from('pratos')
          .insert({
            nome_prato: 'Cálculo Temporário ' + Date.now(),
            restaurant_id: currentRestaurant.id,
            categoria: 'temp',
            rendimento_porcoes: 1,
            margem_seguranca: 10
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar prato temporário:', error);
          throw error;
        }
        
        pratoIdParaCalculo = pratoTemp.id;
        console.log('✅ Prato temporário criado:', pratoIdParaCalculo);

        // Inserir apenas ingredientes válidos
        const ingredientesData = ingredientesValidos.map(ing => ({
          prato_id: pratoIdParaCalculo,
          insumo_id: ing.insumo_id,
          quantidade_bruta: Number(ing.quantidade_bruta),
          quantidade_liquida: Number(ing.quantidade_liquida) || Number(ing.quantidade_bruta) * Number(ing.fator_correcao || 1),
          fator_correcao: Number(ing.fator_correcao) || 1,
          custo_total: Number(ing.custo_total)
        }));

        const { error: ingredientesError } = await supabase
          .from('ingredientes_por_prato')
          .insert(ingredientesData);

        if (ingredientesError) {
          console.error('Erro ao inserir ingredientes temporários:', ingredientesError);
          throw ingredientesError;
        }
        
        console.log('✅ Ingredientes temporários inseridos:', ingredientesData.length);
      }

      // Chamar função de cálculo do banco
      const { data: resultadosCalculo, error: calcError } = await supabase
        .rpc('calcular_cmv_inteligente', {
          prato_uuid: pratoIdParaCalculo,
          preco_final: precoFinal || null
        });

      if (calcError) {
        console.error('Erro na função de cálculo:', calcError);
        throw calcError;
      }

      console.log('✅ Resultados obtidos:', resultadosCalculo);

      if (resultadosCalculo && resultadosCalculo.length > 0) {
        const resultado = resultadosCalculo[0];
        
        // Validação mais robusta do status_viabilidade
        let statusViabilidade: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
        if (typeof resultado.status_viabilidade === 'string') {
          const statusValue = resultado.status_viabilidade.toLowerCase();
          if (['saudavel', 'atencao', 'prejuizo'].includes(statusValue)) {
            statusViabilidade = statusValue as 'saudavel' | 'atencao' | 'prejuizo';
          }
        }
        
        // Conversão mais segura dos alertas
        let alertasArray: string[] = [];
        if (resultado.alertas) {
          try {
            if (Array.isArray(resultado.alertas)) {
              alertasArray = resultado.alertas
                .filter(item => item !== null && item !== undefined)
                .map(item => String(item));
            } else if (typeof resultado.alertas === 'string') {
              const parsed = JSON.parse(resultado.alertas);
              if (Array.isArray(parsed)) {
                alertasArray = parsed
                  .filter(item => item !== null && item !== undefined)
                  .map(item => String(item));
              }
            }
          } catch (e) {
            console.warn('Erro ao processar alertas:', e);
            alertasArray = [];
          }
        }

        const resultadosProcessados = {
          cmv_estimado_percentual: Number(resultado.cmv_estimado_percentual) || 0,
          cmv_estimado_valor: Number(resultado.cmv_estimado_valor) || 0,
          lucro_estimado_valor: Number(resultado.lucro_estimado_valor) || 0,
          lucro_estimado_percentual: Number(resultado.lucro_estimado_percentual) || 0,
          margem_bruta: Number(resultado.margem_bruta) || 0,
          margem_liquida: Number(resultado.margem_liquida) || 0,
          preco_sugerido: Number(resultado.preco_sugerido) || 0,
          status_viabilidade: statusViabilidade,
          alertas: alertasArray
        };

        console.log('✅ Resultados processados:', resultadosProcessados);
        setResultados(resultadosProcessados);
      } else {
        console.warn('⚠️ Nenhum resultado retornado da função');
      }

      // Limpar prato temporário
      if (!pratoId && pratoIdParaCalculo) {
        await supabase
          .from('ingredientes_por_prato')
          .delete()
          .eq('prato_id', pratoIdParaCalculo);
        
        await supabase
          .from('pratos')
          .delete()
          .eq('id', pratoIdParaCalculo);
        
        console.log('🗑️ Prato temporário removido');
      }

    } catch (error) {
      console.error('❌ Erro ao calcular resultados:', error);
      toast.error('Erro ao calcular resultados da ficha técnica', {
        description: 'Verifique se todos os ingredientes estão completos'
      });
    } finally {
      setIsCalculating(false);
    }
  }, [currentRestaurant, ingredientes]);

  return {
    ingredientes,
    setIngredientes,
    resultados,
    isCalculating,
    calcularResultados
  };
}
