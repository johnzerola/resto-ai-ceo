
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

  // Calcular resultados usando função do banco
  const calcularResultados = useCallback(async (pratoId?: string, precoFinal?: number) => {
    if (!currentRestaurant?.id || ingredientes.length === 0) return;

    setIsCalculating(true);
    try {
      let pratoIdParaCalculo = pratoId;
      
      if (!pratoIdParaCalculo) {
        const { data: pratoTemp, error } = await supabase
          .from('pratos')
          .insert({
            nome_prato: 'Cálculo Temporário',
            restaurant_id: currentRestaurant.id,
            categoria: 'temp',
            rendimento_porcoes: 1,
            margem_seguranca: 10
          })
          .select()
          .single();

        if (error) throw error;
        pratoIdParaCalculo = pratoTemp.id;

        const ingredientesData = ingredientes.map(ing => ({
          prato_id: pratoIdParaCalculo,
          insumo_id: ing.insumo_id,
          quantidade_bruta: ing.quantidade_bruta,
          quantidade_liquida: ing.quantidade_liquida,
          fator_correcao: ing.fator_correcao,
          custo_total: ing.custo_total
        }));

        await supabase
          .from('ingredientes_por_prato')
          .insert(ingredientesData);
      }

      const { data: resultadosCalculo, error: calcError } = await supabase
        .rpc('calcular_cmv_inteligente', {
          prato_uuid: pratoIdParaCalculo,
          preco_final: precoFinal || null
        });

      if (calcError) throw calcError;

      if (resultadosCalculo && resultadosCalculo.length > 0) {
        const resultado = resultadosCalculo[0];
        
        const statusViabilidade = resultado.status_viabilidade as 'saudavel' | 'atencao' | 'prejuizo';
        
        let alertasArray: string[] = [];
        if (resultado.alertas) {
          try {
            if (Array.isArray(resultado.alertas)) {
              alertasArray = resultado.alertas.map(item => String(item));
            } else if (typeof resultado.alertas === 'string') {
              const parsed = JSON.parse(resultado.alertas);
              alertasArray = Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
            }
          } catch (e) {
            console.warn('Erro ao processar alertas:', e);
            alertasArray = [];
          }
        }

        setResultados({
          cmv_estimado_percentual: resultado.cmv_estimado_percentual,
          cmv_estimado_valor: resultado.cmv_estimado_valor,
          lucro_estimado_valor: resultado.lucro_estimado_valor,
          lucro_estimado_percentual: resultado.lucro_estimado_percentual,
          margem_bruta: resultado.margem_bruta,
          margem_liquida: resultado.margem_liquida,
          preco_sugerido: resultado.preco_sugerido,
          status_viabilidade: statusViabilidade,
          alertas: alertasArray
        });
      }

      if (!pratoId && pratoIdParaCalculo) {
        await supabase
          .from('pratos')
          .delete()
          .eq('id', pratoIdParaCalculo);
      }

    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      toast.error('Erro ao calcular resultados da ficha técnica');
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
