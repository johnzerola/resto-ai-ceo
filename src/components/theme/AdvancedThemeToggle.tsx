import React, { useState } from 'react';
import { Moon, Sun, Monitor, Settings, Palette, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme, Theme, ThemeSection } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface AdvancedThemeToggleProps {
  variant?: 'compact' | 'full' | 'floating';
  showLabel?: boolean;
  className?: string;
}

export function AdvancedThemeToggle({ 
  variant = 'compact', 
  showLabel = false,
  className 
}: AdvancedThemeToggleProps) {
  const { theme, preferences, setTheme, setSectionTheme, getCurrentTheme } = useTheme();
  const [showSectionSettings, setShowSectionSettings] = useState(false);
  
  const currentTheme = getCurrentTheme();
  const isSystemTheme = theme === 'system';

  const themeOptions: Array<{ value: Theme; label: string; icon: React.ReactNode; description: string }> = [
    { 
      value: 'light', 
      label: 'Modo Claro', 
      icon: <Sun className="h-4 w-4" />,
      description: 'Interface clara para uso durante o dia'
    },
    { 
      value: 'dark', 
      label: 'Modo Escuro', 
      icon: <Moon className="h-4 w-4" />,
      description: 'Interface escura que reduz o cansaço visual'
    },
    { 
      value: 'system', 
      label: 'Sistema', 
      icon: <Monitor className="h-4 w-4" />,
      description: 'Segue as configurações do seu dispositivo'
    }
  ];

  const sectionOptions: Array<{ value: ThemeSection; label: string; description: string }> = [
    { value: 'dashboard', label: 'Dashboard', description: 'Painel principal e métricas' },
    { value: 'financial', label: 'Financeiro', description: 'DRE, fluxo de caixa e relatórios' },
    { value: 'inventory', label: 'Estoque', description: 'Gestão de produtos e insumos' },
    { value: 'reports', label: 'Relatórios', description: 'Análises e projeções' },
    { value: 'settings', label: 'Configurações', description: 'Preferências do sistema' }
  ];

  const ThemeIcon = currentTheme === 'dark' ? Moon : Sun;

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 px-0 relative", className)}
          >
            <ThemeIcon className="h-[1.2rem] w-[1.2rem] transition-all duration-300" />
            {isSystemTheme && (
              <Monitor className="h-2 w-2 absolute -bottom-0.5 -right-0.5 opacity-60" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tema da Interface
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {themeOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1">
                {option.icon}
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
              {theme === option.value && (
                <Badge variant="secondary" className="text-xs">Ativo</Badge>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações Avançadas
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              <DropdownMenuLabel>Tema por Seção</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {sectionOptions.map((section) => (
                <DropdownMenuSub key={section.value}>
                  <DropdownMenuSubTrigger className="flex items-center justify-between">
                    <span>{section.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {preferences.sectionThemes[section.value] === 'system' ? 'Auto' : 
                       preferences.sectionThemes[section.value] === 'dark' ? 'Escuro' : 'Claro'}
                    </Badge>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {themeOptions.map((themeOpt) => (
                      <DropdownMenuItem
                        key={`${section.value}-${themeOpt.value}`}
                        onClick={() => setSectionTheme(section.value, themeOpt.value)}
                        className="flex items-center gap-2"
                      >
                        {themeOpt.icon}
                        <span>{themeOpt.label}</span>
                        {preferences.sectionThemes[section.value] === themeOpt.value && (
                          <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
          size="sm"
        >
          <ThemeIcon className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && (
        <span className="text-sm font-medium">
          {currentTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      )}
      
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {themeOptions.map((option) => (
          <Button
            key={option.value}
            variant={theme === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTheme(option.value)}
            className={cn(
              "h-8 px-3 text-xs font-medium transition-all duration-200",
              theme === option.value && "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            {option.icon}
            <span className="ml-1 hidden sm:inline">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}