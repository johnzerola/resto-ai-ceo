import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  RefreshCw, 
  Eye,
  Zap,
  Settings,
  BarChart3,
  Package,
  FileText,
  DollarSign
} from 'lucide-react';
import { useTheme, ThemeSection } from '@/contexts/ThemeContext';

export function ThemeSettings() {
  const { 
    theme, 
    preferences, 
    setTheme, 
    setSectionTheme, 
    setUseSystemPreference,
    getCurrentTheme,
    resetToDefaults 
  } = useTheme();

  const sectionIcons = {
    dashboard: BarChart3,
    financial: DollarSign,
    inventory: Package,
    reports: FileText,
    settings: Settings
  };

  const sectionLabels = {
    dashboard: 'Dashboard',
    financial: 'Financeiro',
    inventory: 'Estoque',
    reports: 'Relatórios',
    settings: 'Configurações'
  };

  const themeLabels = {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema'
  };

  const currentTheme = getCurrentTheme();

  return (
    <div className="space-y-6">
      {/* Main Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Principal
          </CardTitle>
          <CardDescription>
            Configure o tema visual da interface do Lucraí para uma melhor experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                theme === 'light' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTheme('light')}
            >
              <CardContent className="p-4 text-center">
                <Sun className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-medium">Modo Claro</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Interface brilhante para uso durante o dia
                </p>
                {theme === 'light' && (
                  <Badge className="mt-2" variant="secondary">Ativo</Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                theme === 'dark' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTheme('dark')}
            >
              <CardContent className="p-4 text-center">
                <Moon className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-medium">Modo Escuro</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Interface escura que reduz o cansaço visual
                </p>
                {theme === 'dark' && (
                  <Badge className="mt-2" variant="secondary">Ativo</Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                theme === 'system' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTheme('system')}
            >
              <CardContent className="p-4 text-center">
                <Monitor className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-medium">Automático</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Segue as configurações do dispositivo
                </p>
                {theme === 'system' && (
                  <Badge className="mt-2" variant="secondary">Ativo</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Tema Atual</p>
                <p className="text-sm text-muted-foreground">
                  {currentTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro'} 
                  {theme === 'system' && ' (Automático)'}
                </p>
              </div>
            </div>
            <Badge variant="outline">
              {themeLabels[theme]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section-specific Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tema por Seção
          </CardTitle>
          <CardDescription>
            Configure temas diferentes para cada área do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Object.keys(sectionLabels) as ThemeSection[])
              .filter(section => section !== 'global')
              .map((section) => {
                const Icon = sectionIcons[section];
                const currentSectionTheme = preferences.sectionThemes[section];
                
                return (
                  <div key={section} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{sectionLabels[section]}</p>
                        <p className="text-sm text-muted-foreground">
                          Tema específico para esta seção
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={currentSectionTheme}
                        onChange={(e) => setSectionTheme(section, e.target.value as any)}
                        className="px-3 py-1 rounded border bg-background text-sm"
                      >
                        <option value="system">Sistema</option>
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                      </select>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Personalize a experiência do tema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Preference */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Seguir configurações do sistema</Label>
              <p className="text-sm text-muted-foreground">
                Muda automaticamente com as configurações do dispositivo
              </p>
            </div>
            <Switch
              checked={preferences.useSystemPreference}
              onCheckedChange={setUseSystemPreference}
            />
          </div>

          <Separator />

          {/* Transition Duration */}
          <div className="space-y-3">
            <Label>Velocidade da transição</Label>
            <div className="px-3">
              <Slider
                value={[preferences.transitionDuration]}
                onValueChange={([value]) => {
                  // This would need to be implemented in the context
                  console.log('Transition duration:', value);
                }}
                max={1000}
                min={100}
                step={50}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {preferences.transitionDuration}ms - {
                preferences.transitionDuration < 200 ? 'Rápido' :
                preferences.transitionDuration < 500 ? 'Médio' : 'Suave'
              }
            </p>
          </div>

          <Separator />

          {/* Reset Button */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Restaurar padrões</Label>
              <p className="text-sm text-muted-foreground">
                Volta para as configurações originais de tema
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}