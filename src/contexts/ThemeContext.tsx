import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export type ThemeSection = 
  | 'global'
  | 'dashboard' 
  | 'financial'
  | 'inventory'
  | 'reports'
  | 'settings';

export interface ThemePreferences {
  globalTheme: Theme;
  sectionThemes: Record<ThemeSection, Theme>;
  useSystemPreference: boolean;
  transitionDuration: number;
}

interface ThemeContextType {
  theme: Theme;
  preferences: ThemePreferences;
  setTheme: (theme: Theme) => void;
  setSectionTheme: (section: ThemeSection, theme: Theme) => void;
  setUseSystemPreference: (use: boolean) => void;
  getCurrentTheme: (section?: ThemeSection) => 'light' | 'dark';
  resetToDefaults: () => void;
}

const defaultPreferences: ThemePreferences = {
  globalTheme: 'system',
  sectionThemes: {
    global: 'system',
    dashboard: 'system',
    financial: 'system',
    inventory: 'system',
    reports: 'system',
    settings: 'system'
  },
  useSystemPreference: true,
  transitionDuration: 300
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    try {
      const stored = localStorage.getItem('lucrai-theme-preferences');
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  // System theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const actualTheme = getCurrentTheme();
    
    // Add transition class for smooth theme switching
    root.style.setProperty('--theme-transition-duration', `${preferences.transitionDuration}ms`);
    root.classList.add('theme-transitioning');
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Apply new theme
    root.classList.add(actualTheme);
    
    // Remove transition class after transition completes
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, preferences.transitionDuration);
  }, [theme, systemTheme, preferences.transitionDuration]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('lucrai-theme-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }, [preferences]);

  const getCurrentTheme = (section?: ThemeSection): 'light' | 'dark' => {
    const targetTheme = section && preferences.sectionThemes[section] !== 'system' 
      ? preferences.sectionThemes[section]
      : preferences.globalTheme !== 'system' 
        ? preferences.globalTheme 
        : 'system';
    
    return targetTheme === 'system' ? systemTheme : targetTheme as 'light' | 'dark';
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setPreferences(prev => ({
      ...prev,
      globalTheme: newTheme
    }));
  };

  const setSectionTheme = (section: ThemeSection, sectionTheme: Theme) => {
    setPreferences(prev => ({
      ...prev,
      sectionThemes: {
        ...prev.sectionThemes,
        [section]: sectionTheme
      }
    }));
  };

  const setUseSystemPreference = (use: boolean) => {
    setPreferences(prev => ({
      ...prev,
      useSystemPreference: use,
      globalTheme: use ? 'system' : prev.globalTheme
    }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    setThemeState('system');
    localStorage.removeItem('lucrai-theme-preferences');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        preferences,
        setTheme,
        setSectionTheme,
        setUseSystemPreference,
        getCurrentTheme,
        resetToDefaults
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};