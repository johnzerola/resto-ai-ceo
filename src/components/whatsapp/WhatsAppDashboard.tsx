import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Package, Copy, Phone, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardData {
  summary: {
    cash_balance: number;
    cmv_percentage: number;
    critical_stock_count: number;
    operational_expenses: number;
  };
  trends: {
    cashFlow: Array<{ date: string; balance: number }>;
    topSkus: Array<{ name: string; movements: number }>;
  };
  recentActivities: Array<{
    id: string;
    type: 'transaction' | 'stock';
    description: string;
    amount?: number;
    quantity?: number;
    unit?: string;
    created_at: string;
  }>;
}

interface WhatsAppIntegration {
  id: string;
  phone_number: string;
  is_authorized: boolean;
  last_activity_at: string | null;
  created_at: string;
}

export function WhatsAppDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  useEffect(() => {
    loadDashboardData();
    loadIntegrations();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-dashboard-summary');
      
      if (error) throw error;
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    }
  };

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Erro ao carregar integrações');
    } finally {
      setLoading(false);
    }
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success('URL do webhook copiada!');
    } catch (error) {
      toast.error('Erro ao copiar URL');
    }
  };

  const addPhoneNumber = async () => {
    if (!newPhone.trim()) return;

    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('tenant_id')
        .single();

      if (!restaurant) {
        toast.error('Restaurante não encontrado');
        return;
      }

      const { error } = await supabase
        .from('whatsapp_integrations')
        .insert({
          tenant_id: restaurant.tenant_id,
          phone_number: newPhone.trim(),
          is_authorized: true
        });

      if (error) throw error;

      toast.success('Número adicionado com sucesso!');
      setNewPhone('');
      setShowAddPhone(false);
      loadIntegrations();
    } catch (error) {
      console.error('Error adding phone:', error);
      toast.error('Erro ao adicionar número');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo de Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.summary?.cash_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMV %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboardData?.summary?.cmv_percentage || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Custo dos produtos vendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.summary?.critical_stock_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Itens em falta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Operacionais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.summary?.operational_expenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Fluxo de Caixa (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.trends?.cashFlow || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Saldo']} />
                <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Produtos (Movimentação)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.trends?.topSkus || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="movements" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do Webhook</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                />
                <Button size="sm" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Configure esta URL no seu Evolution API ou plataforma WhatsApp
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Números Autorizados</label>
                <Button size="sm" onClick={() => setShowAddPhone(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {showAddPhone && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="5511999999999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button size="sm" onClick={addPhoneNumber}>
                    Adicionar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddPhone(false)}>
                    Cancelar
                  </Button>
                </div>
              )}

              <div className="space-y-2 mt-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{integration.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integration.is_authorized ? 'default' : 'secondary'}>
                        {integration.is_authorized ? 'Autorizado' : 'Pendente'}
                      </Badge>
                      {integration.last_activity_at && (
                        <span className="text-xs text-muted-foreground">
                          Última atividade: {formatDate(integration.last_activity_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {dashboardData?.recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-3 border rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <span className="text-sm font-medium">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    {activity.quantity && (
                      <span className="text-sm font-medium">
                        {activity.quantity} {activity.unit}
                      </span>
                    )}
                    <Badge variant="outline" className="ml-2">
                      {activity.type === 'transaction' ? 'Financeiro' : 'Estoque'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}