
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KPIService, KPIDiario } from '@/services/KPIService';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function KPIManager() {
  const { currentRestaurant } = useAuth();
  const [kpiHoje, setKpiHoje] = useState<KPIDiario | null>(null);
  const [kpisHistorico, setKpisHistorico] = useState<KPIDiario[]>([]);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    receita_total: 0,
    quantidade_pratos_vendidos: 0,
    cmv_dia: 0,
    despesas_dia: 0,
    receita_delivery: 0,
    taxa_delivery_paga: 0,
    meta_receita: 0
  });

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentRestaurant?.id) {
      carregarDados();
    }
  }, [currentRestaurant]);

  const carregarDados = async () => {
    if (!currentRestaurant?.id) return;

    try {
      // Carregar KPI de hoje
      const kpi = await KPIService.getKPIDiario(currentRestaurant.id, hoje);
      setKpiHoje(kpi);

      if (kpi) {
        setFormData({
          receita_total: kpi.receita_total,
          quantidade_pratos_vendidos: kpi.quantidade_pratos_vendidos,
          cmv_dia: kpi.cmv_dia,
          despesas_dia: kpi.despesas_dia,
          receita_delivery: kpi.receita_delivery,
          taxa_delivery_paga: kpi.taxa_delivery_paga,
          meta_receita: kpi.meta_receita
        });
      }

      // Carregar histórico
      const historico = await KPIService.getKPIsPeriodo(currentRestaurant.id, 30);
      setKpisHistorico(historico);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    }
  };

  const salvarKPI = async () => {
    if (!currentRestaurant?.id) return;

    try {
      const kpiData: Omit<KPIDiario, 'id' | 'created_at' | 'updated_at'> = {
        restaurant_id: currentRestaurant.id,
        data: hoje,
        ...formData,
        ticket_medio: 0, // Será calculado automaticamente
        cmv_percentual: 0, // Será calculado automaticamente
        lucro_dia: 0, // Será calculado automaticamente
        margem_dia: 0, // Será calculado automaticamente
        percentual_meta_atingido: 0 // Será calculado automaticamente
      };

      const sucesso = await KPIService.salvarKPIDiario(kpiData);
      if (sucesso) {
        await carregarDados();
        setEditando(false);
        toast.success('KPIs salvos com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar KPI:', error);
      toast.error('Erro ao salvar KPIs');
    }
  };

  const performance = kpisHistorico.length > 0 
    ? KPIService.analisarPerformance(kpisHistorico)
    : null;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente': return 'text-green-600 bg-green-50';
      case 'bom': return 'text-blue-600 bg-blue-50';
      case 'atencao': return 'text-yellow-600 bg-yellow-50';
      case 'critico': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KPIs do Dia</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button 
          onClick={() => setEditando(!editando)}
          variant={editando ? 'outline' : 'default'}
        >
          {editando ? 'Cancelar' : 'Editar Dados'}
        </Button>
      </div>

      {/* Resumo de Performance */}
      {performance && (
        <Card className={getStatusColor(performance.status_negocio)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Status do Negócio: {performance.status_negocio.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-lg font-semibold">{formatarMoeda(performance.media_ticket)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-lg font-semibold">
                  {performance.crescimento_receita > 0 ? '📈' : '📉'} 
                  {performance.crescimento_receita.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-lg font-semibold">{performance.eficiencia_operacional.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Dados de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editando ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receita_total">Receita Total</Label>
                    <Input
                      id="receita_total"
                      type="number"
                      step="0.01"
                      value={formData.receita_total}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        receita_total: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade_pratos">Pratos Vendidos</Label>
                    <Input
                      id="quantidade_pratos"
                      type="number"
                      value={formData.quantidade_pratos_vendidos}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quantidade_pratos_vendidos: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cmv_dia">CMV do Dia</Label>
                    <Input
                      id="cmv_dia"
                      type="number"
                      step="0.01"
                      value={formData.cmv_dia}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        cmv_dia: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="despesas_dia">Despesas do Dia</Label>
                    <Input
                      id="despesas_dia"
                      type="number"
                      step="0.01"
                      value={formData.despesas_dia}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        despesas_dia: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receita_delivery">Receita Delivery</Label>
                    <Input
                      id="receita_delivery"
                      type="number"
                      step="0.01"
                      value={formData.receita_delivery}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        receita_delivery: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_receita">Meta de Receita</Label>
                    <Input
                      id="meta_receita"
                      type="number"
                      step="0.01"
                      value={formData.meta_receita}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        meta_receita: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={salvarKPI} className="w-full">
                  Salvar KPIs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {kpiHoje ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-muted-foreground">Receita</p>
                      <p className="text-lg font-semibold">{formatarMoeda(kpiHoje.receita_total)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-lg font-semibold">{formatarMoeda(kpiHoje.ticket_medio)}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-muted-foreground">CMV %</p>
                      <p className="text-lg font-semibold">{kpiHoje.cmv_percentual.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p className="text-lg font-semibold">{kpiHoje.margem_dia.toFixed(1)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum dado registrado para hoje.<br/>
                      Clique em "Editar Dados" para adicionar.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights e Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Insights Oxford
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performance ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Insights Identificados:</h4>
                  <div className="space-y-2">
                    {performance.insights.map((insight, index) => (
                      <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        💡 {insight}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ações Recomendadas:</h4>
                  <div className="space-y-2">
                    {performance.acoes_recomendadas.map((acao, index) => (
                      <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                        🎯 {acao}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Registre dados por alguns dias para receber insights personalizados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
