// Utilitários de performance para otimização

// Debounce otimizado
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle otimizado
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Cache para resultados de funções pesadas
class MemoCache {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const performanceCache = new MemoCache();

// Batch updates para múltiplas operações
export function batchUpdates<T>(
  items: T[],
  processor: (item: T) => void,
  batchSize: number = 100
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    function processBatch() {
      const batch = items.slice(index, index + batchSize);
      batch.forEach(processor);
      
      index += batchSize;
      
      if (index < items.length) {
        requestAnimationFrame(processBatch);
      } else {
        resolve();
      }
    }

    processBatch();
  });
}

// Lazy loader para componentes
import React from 'react';

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return React.createElement(
      React.Suspense,
      {
        fallback: fallback ? 
          React.createElement(fallback) : 
          React.createElement('div', {
            className: "flex items-center justify-center p-8"
          }, React.createElement('div', {
            className: "w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          }))
      },
      React.createElement(LazyComponent, props)
    );
  };
}

// Preload de recursos
export function preloadResource(url: string, type: 'script' | 'style' | 'image' = 'script'): Promise<void> {
  return new Promise((resolve, reject) => {
    let element: HTMLElement;

    switch (type) {
      case 'script':
        element = document.createElement('script');
        (element as HTMLScriptElement).src = url;
        break;
      case 'style':
        element = document.createElement('link');
        (element as HTMLLinkElement).rel = 'stylesheet';
        (element as HTMLLinkElement).href = url;
        break;
      case 'image':
        element = document.createElement('img');
        (element as HTMLImageElement).src = url;
        break;
      default:
        return reject(new Error('Tipo de recurso não suportado'));
    }

    element.onload = () => resolve();
    element.onerror = () => reject(new Error(`Falha ao carregar ${url}`));
    
    if (type !== 'image') {
      document.head.appendChild(element);
    }
  });
}

// Monitor de performance
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string): number | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        
        if (!this.metrics.has(name)) {
          this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(duration);
        
        // Limpar entradas antigas
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
        
        return duration;
      }
    } catch (error) {
      console.warn('Erro ao medir performance:', error);
    }
    
    return null;
  }

  getMetrics(name: string): { average: number; count: number; min: number; max: number } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const average = measurements.reduce((sum, value) => sum + value, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      average,
      count: measurements.length,
      min,
      max
    };
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();