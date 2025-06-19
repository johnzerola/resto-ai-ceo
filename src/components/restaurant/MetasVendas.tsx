
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetaVenda {
  id: string;
  data_meta: string;
  meta_receita_dia: number;
  receita_real_dia: number;
  meta_pratos_dia: number;
  pratos_vendidos_dia: number;
  status: string;
  percentual_atingido: number;
}

export function MetasVendas() {
  const { currentRestaurant } = useAuth();
  const [metas, setMetas] = useState<MetaVenda[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarMetas();
      gerarMetasMensais();
    }
  }, [currentRestaurant, selectedDate]);

  const carregarMetas = async () => {
    if (!currentRestaurant?.id) return;

    try {
      setIsLoading(true);
      const inicioMes = startOfMonth(selectedDate);
      const fimMes = endOfMonth(selectedDate);

      const { data, error } = await supabase
        .from('metas_vendas')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .gte('data_meta', format(inicioMes, 'yyyy-MM-dd'))
        .lte('data_meta', format(fimMes, 'yyyy-MM-dd'))
        .order('data_meta', { ascending: true });

      if (error) throw error;
      setMetas(data || []);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const gerarMetasMensais = async () => {
    if (!currentRestaurant?.id) return;

    try {
      // Buscar configurações do restaurante
      const { data: config } = await supabase
        .from('configuracoes_restaurante')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id)
        .single();

      if (!config) return;

      const inicioMes = startOfMonth(selectedDate);
      const fimMes = endOfMonth(selectedDate);
      const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

      const metasParaInserir = diasDoMes.map(dia => ({
        restaurant_id: currentRestaurant.id,
        data_meta: format(dia, 'yyyy-MM-dd'),
        meta_receita_dia: config.meta_vendas_diaria || 0,
        meta_pratos_dia: config.pratos_vendidos_dia_meta || 50,
        receita_real_dia: 0,
        pratos_vendidos_dia: 0,
        status: 'em_andamento',
        percentual_atingido: 0
      }));

      // Inserir apenas se não existir
      const { error } = await supabase
        .from('metas_vendas')
        .upsert(metasParaInserir, { 
          onConflict: 'restaurant_id,data_meta',
          ignoreDuplicates: true 
        });

      if (error) console.error('Erro ao gerar metas:', error);
    } catch (error) {
      console.error('Erro ao gerar metas mensais:', error);
    }
  };

  const calcularResumoMes = () => {
    const totalMetaReceita = metas.reduce((acc, meta) => acc + meta.meta_receita_dia, 0);
    const totalReceitaReal = metas.reduce((acc, meta) => acc + meta.receita_real_dia, 0);
    const metasAtingidas = metas.filter(meta => meta.percentual_atingido >= 100).length;
    const percentualMedio = metas.length > 0 ? 
      metas.reduce((acc, meta) => acc + meta.percentual_atingido, 0) / metas.length : 0;

    return {
      totalMetaReceita,
      totalReceitaReal,
      metasAtingidas,
      totalMetas: metas.length,
      percentualMedio
    };
  };

  const resumo = calcularResumoMes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6" />
          Metas de Vendas
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho diário e mensal do seu restaurante
        </p>
      </div>

      {/* Resumo do Mês */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta do Mês</p>
                <p className="text-2xl font-bold">
                  R$ {resumo.totalMetaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Realizado</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {resumo.totalReceitaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas Atingidas</p>
                <p className="text-2xl font-bold">
                  {resumo.metasAtingidas}/{resumo.totalMetas}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold">
                  {resumo.percentualMedio.toFixed(1)}%
                </p>
              </div>
              {resumo.percentualMedio >= 100 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress geral do mês */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Meta: R$ {resumo.totalMetaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>{resumo.percentualMedio.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(resumo.percentualMedio, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>R$ {resumo.totalReceitaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>
                Faltam R$ {Math.max(0, resumo.totalMetaReceita - resumo.totalReceitaReal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {resumo.percentualMedio < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Performance abaixo de 80%. 
            Considere revisar estratégias de vendas ou ajustar metas.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de metas diárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Metas Diárias - {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metas.slice(0, 10).map((meta) => (
              <div key={meta.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {format(new Date(meta.data_meta), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <Badge 
                      variant={meta.percentual_atingido >= 100 ? "default" : 
                               meta.percentual_atingido >= 80 ? "secondary" : "destructive"}
                    >
                      {meta.percentual_atingido.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Meta: R$ {meta.meta_receita_dia.toFixed(2)}</span>
                    <span>Real: R$ {meta.receita_real_dia.toFixed(2)}</span>
                    <span>{meta.pratos_vendidos_dia}/{meta.meta_pratos_dia} pratos</span>
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={Math.min(meta.percentual_atingido, 100)} className="h-2" />
                </div>
              </div>
            ))}
            
            {metas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma meta encontrada para este mês</p>
                <p className="text-sm">Configure suas metas nas configurações</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
