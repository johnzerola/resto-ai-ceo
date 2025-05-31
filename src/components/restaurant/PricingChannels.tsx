
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Truck, 
  Scale, 
  RotateCcw, 
  Smartphone,
  Calculator,
  TrendingUp,
  Save
} from 'lucide-react';
import { SupabaseDataService, PricingModel } from '@/services/SupabaseDataService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const channelIcons = {
  salon: Store,
  delivery: Truck,
  buffet: Scale,
  rodizio: RotateCcw,
  ifood: Smartphone
};

const channelNames = {
  salon: 'Salão',
  delivery: 'Delivery',
  buffet: 'Buffet por Kg',
  rodizio: 'Rodízio',
  ifood: 'iFood/Apps'
};

export function PricingChannels() {
  const { currentRestaurant } = useAuth();
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<PricingModel['channel']>('salon');
  const [baseCost, setBaseCost] = useState<number>(10); // Custo base para simulação
  const [editModel, setEditModel] = useState<Partial<PricingModel>>({
    markup_percentage: 250,
    delivery_fee: 5,
    platform_commission: 12,
    is_active: true
  });

  useEffect(() => {
    loadPricingModels();
  }, [currentRestaurant?.id]);

  const loadPricingModels = async () => {
    if (!currentRestaurant?.id) return;
    
    const models = await SupabaseDataService.getPricingModels(currentRestaurant.id);
    setPricingModels(models);
    
    // Carregar modelo atual do canal selecionado
    const currentModel = models.find(m => m.channel === selectedChannel);
    if (currentModel) {
      setEditModel(currentModel);
    }
  };

  const handleSaveModel = async () => {
    if (!currentRestaurant?.id) return;

    const modelData = {
      restaurant_id: currentRestaurant.id,
      channel: selectedChannel,
      markup_percentage: editModel.markup_percentage || 250,
      delivery_fee: editModel.delivery_fee || 0,
      platform_commission: editModel.platform_commission || 0,
      is_active: editModel.is_active ?? true
    };

    const saved = await SupabaseDataService.savePricingModel(modelData);
    if (saved) {
      loadPricingModels();
      toast.success(`Modelo de precificação para ${channelNames[selectedChannel]} salvo!`);
    }
  };

  const calculatePricing = (channel: PricingModel['channel']) => {
    const model = pricingModels.find(m => m.channel === channel);
    return SupabaseDataService.calculateChannelPricing(baseCost, channel, model);
  };

  const currentPricing = calculatePricing(selectedChannel);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modelos de Precificação</h2>
          <p className="text-gray-600">Configure preços otimizados para cada canal de venda</p>
        </div>
        <Button onClick={handleSaveModel} className="bg-gradient-to-r from-[#00D887] to-[#00B572]">
          <Save className="h-4 w-4 mr-2" />
          Salvar Modelo
        </Button>
      </div>

      <Tabs value={selectedChannel} onValueChange={(value) => setSelectedChannel(value as PricingModel['channel'])}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(channelNames).map(([key, name]) => {
            const Icon = channelIcons[key as keyof typeof channelIcons];
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(channelNames).map((channel) => (
          <TabsContent key={channel} value={channel} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Configuração do Modelo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Configuração - {channelNames[channel as keyof typeof channelNames]}
                  </CardTitle>
                  <CardDescription>
                    Ajuste os parâmetros de precificação para este canal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="markup">Markup (%)</Label>
                    <Input
                      id="markup"
                      type="number"
                      value={editModel.markup_percentage || ''}
                      onChange={(e) => setEditModel({...editModel, markup_percentage: Number(e.target.value)})}
                      placeholder="250"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentual de lucro sobre o custo base
                    </p>
                  </div>

                  {channel === 'delivery' && (
                    <div>
                      <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        value={editModel.delivery_fee || ''}
                        onChange={(e) => setEditModel({...editModel, delivery_fee: Number(e.target.value)})}
                        placeholder="5.00"
                      />
                    </div>
                  )}

                  {(channel === 'ifood' || channel === 'delivery') && (
                    <div>
                      <Label htmlFor="commission">Comissão da Plataforma (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        value={editModel.platform_commission || ''}
                        onChange={(e) => setEditModel({...editModel, platform_commission: Number(e.target.value)})}
                        placeholder="12"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comissão cobrada pela plataforma (iFood, Uber Eats, etc.)
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={editModel.is_active ?? true}
                      onChange={(e) => setEditModel({...editModel, is_active: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="active">Modelo ativo</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Simulação de Preço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Simulação de Preço
                  </CardTitle>
                  <CardDescription>
                    Veja como ficará o preço final com as configurações atuais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="baseCost">Custo Base (R$)</Label>
                    <Input
                      id="baseCost"
                      type="number"
                      step="0.01"
                      value={baseCost}
                      onChange={(e) => setBaseCost(Number(e.target.value))}
                      placeholder="10.00"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Custo Base:</span>
                      <span className="font-medium">R$ {baseCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Preço com Markup:</span>
                      <span className="font-medium">R$ {currentPricing.basePrice.toFixed(2)}</span>
                    </div>

                    {currentPricing.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                        <span className="font-medium">R$ {currentPricing.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}

                    {currentPricing.platformCommission > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Comissão ({currentPricing.platformCommission}%):</span>
                        <span className="font-medium text-red-600">
                          -R$ {((currentPricing.finalPrice - currentPricing.basePrice - currentPricing.deliveryFee)).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Preço Final:</span>
                      <span className="text-green-600">R$ {currentPricing.finalPrice.toFixed(2)}</span>
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className="bg-green-50">
                        Markup: {currentPricing.markup}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparativo de Canais */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativo de Preços por Canal</CardTitle>
                <CardDescription>
                  Veja como o mesmo produto fica precificado em diferentes canais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {Object.entries(channelNames).map(([channelKey, channelName]) => {
                    const pricing = calculatePricing(channelKey as PricingModel['channel']);
                    const Icon = channelIcons[channelKey as keyof typeof channelIcons];
                    
                    return (
                      <div key={channelKey} className="text-center p-4 border rounded-lg">
                        <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <h4 className="font-medium text-sm">{channelName}</h4>
                        <p className="text-lg font-bold text-green-600">
                          R$ {pricing.finalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{pricing.markup}% markup
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
