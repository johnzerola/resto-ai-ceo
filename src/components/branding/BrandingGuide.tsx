import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Image, 
  Download, 
  Copy, 
  Search,
  Sparkles,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandingAsset {
  id: string;
  name: string;
  category: string;
  asset_data: any;
  version: number;
  is_active: boolean;
}

export function BrandingGuide() {
  const [assets, setAssets] = useState<BrandingAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrandingAssets();
    seedInitialAssets();
  }, []);

  const fetchBrandingAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('branding_assets')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching branding assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialAssets = async () => {
    const initialAssets = [
      {
        name: 'Primary Colors',
        category: 'colors',
        asset_data: {
          colors: [
            { name: 'Lucraí Green', hex: '#00D887', hsl: 'hsl(158, 100%, 42%)' },
            { name: 'Dark Green', hex: '#00B572', hsl: 'hsl(158, 100%, 36%)' },
            { name: 'Light Green', hex: '#4AE8A8', hsl: 'hsl(158, 80%, 60%)' },
            { name: 'Success Green', hex: '#22C55E', hsl: 'hsl(142, 71%, 45%)' }
          ]
        }
      },
      {
        name: 'Secondary Colors',
        category: 'colors',
        asset_data: {
          colors: [
            { name: 'Slate 900', hex: '#0F172A', hsl: 'hsl(222, 84%, 5%)' },
            { name: 'Slate 800', hex: '#1E293B', hsl: 'hsl(215, 28%, 17%)' },
            { name: 'Slate 100', hex: '#F1F5F9', hsl: 'hsl(210, 40%, 96%)' },
            { name: 'Slate 50', hex: '#F8FAFC', hsl: 'hsl(210, 40%, 98%)' }
          ]
        }
      },
      {
        name: 'Typography',
        category: 'typography',
        asset_data: {
          fonts: [
            { name: 'Inter', type: 'Primary', usage: 'Headings and body text' },
            { name: 'Inter Medium', type: 'Secondary', usage: 'Buttons and labels' },
            { name: 'Inter Bold', type: 'Accent', usage: 'Important headings' }
          ]
        }
      }
    ];

    for (const asset of initialAssets) {
      try {
        await supabase
          .from('branding_assets')
          .upsert(asset, { onConflict: 'name' });
      } catch (error) {
        console.error('Error seeding asset:', error);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Valor copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o valor.",
        variant: "destructive",
      });
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colorAssets = filteredAssets.filter(asset => asset.category === 'colors');
  const typographyAssets = filteredAssets.filter(asset => asset.category === 'typography');
  const logoAssets = filteredAssets.filter(asset => asset.category === 'logos');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Guia de Marca Lucraí
          </h1>
          <p className="text-muted-foreground">
            Palette de cores, tipografia e recursos visuais da marca
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Baixar Kit Completo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cores, tipografia, logos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Tipografia
          </TabsTrigger>
          <TabsTrigger value="logos">
            <Image className="h-4 w-4 mr-2" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="components">
            <Eye className="h-4 w-4 mr-2" />
            Componentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          {colorAssets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle>{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {asset.asset_data.colors?.map((color: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div 
                        className="w-full h-20 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{color.name}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {color.hex}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(color.hex)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {color.hsl}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(color.hsl)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          {typographyAssets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle>{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {asset.asset_data.fonts?.map((font: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{font.name}</h3>
                          <p className="text-sm text-muted-foreground">{font.usage}</p>
                        </div>
                        <Badge>{font.type}</Badge>
                      </div>
                      <div className="p-6 bg-muted rounded-lg">
                        <p style={{ fontFamily: font.name.replace(' ', '-').toLowerCase() }} className="text-2xl">
                          The quick brown fox jumps over the lazy dog
                        </p>
                        <p style={{ fontFamily: font.name.replace(' ', '-').toLowerCase() }} className="text-sm mt-2 text-muted-foreground">
                          AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 1234567890
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logos Lucraí</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Logo Principal</h3>
                  <div className="p-8 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-2xl font-bold text-primary">LUCRAÍ</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PNG
                  </Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Logo Símbolo</h3>
                  <div className="p-8 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      L
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar SVG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Componentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Botões</h3>
                  <div className="flex gap-4 flex-wrap">
                    <Button>Botão Primário</Button>
                    <Button variant="outline">Botão Secundário</Button>
                    <Button variant="ghost">Botão Ghost</Button>
                    <Button variant="destructive">Botão Destrutivo</Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Card Exemplo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Este é um exemplo de card padrão do sistema.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}