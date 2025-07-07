import React, { useCallback, useMemo } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumThemeToggleProps {
  position?: 'header' | 'floating' | 'sidebar';
  className?: string;
}

export function PremiumThemeToggle({ 
  position = 'header', 
  className 
}: PremiumThemeToggleProps) {
  const { theme, setTheme, getCurrentTheme } = useTheme();
  const currentTheme = getCurrentTheme();
  
  const handleToggle = useCallback(() => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [currentTheme, setTheme]);

  const themeConfig = useMemo(() => ({
    light: { 
      icon: Sun, 
      label: 'Modo Claro ☀️',
      bgClass: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500'
    },
    dark: { 
      icon: Moon, 
      label: 'Modo Escuro 🌙',
      bgClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
    },
    system: { 
      icon: Monitor, 
      label: 'Sistema',
      bgClass: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
    }
  }), []);

  const currentConfig = themeConfig[currentTheme];
  const IconComponent = currentConfig.icon;

  if (position === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-[9999] transition-all duration-300 hover:scale-110",
        "md:bottom-8 md:right-8",
        className
      )}>
        <Button
          onClick={handleToggle}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl border-2 border-white/20",
            "hover:shadow-[0_0_30px_rgba(0,212,170,0.4)] transition-all duration-300",
            "backdrop-blur-sm",
            currentConfig.bgClass
          )}
          aria-label={currentConfig.label}
        >
          <IconComponent className="h-6 w-6 text-white drop-shadow-lg" />
        </Button>
      </div>
    );
  }

  if (position === 'header') {
    return (
      <Button
        onClick={handleToggle}
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 px-3 rounded-lg transition-all duration-200 group",
          "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10",
          "border border-border/50 hover:border-primary/30",
          "backdrop-blur-sm",
          className
        )}
        aria-label={currentConfig.label}
      >
        <div className="flex items-center gap-2">
          <IconComponent className={cn(
            "h-4 w-4 transition-all duration-200",
            "group-hover:scale-110 group-hover:text-primary"
          )} />
          <span className="hidden sm:inline text-sm font-medium">
            {currentTheme === 'dark' ? 'Escuro' : 'Claro'}
          </span>
        </div>
      </Button>
    );
  }

  // Sidebar variant
  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 rounded-lg transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      aria-label={currentConfig.label}
    >
      <IconComponent className="h-4 w-4" />
    </Button>
  );
}