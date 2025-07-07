import { useCallback, useMemo, useRef } from 'react';

// Hook para otimização de performance com utilitários comuns
export function usePerformanceOptimization() {
  // Cache para evitar recriação de funções
  const functionCache = useRef(new Map());

  // Debounce otimizado para inputs e searches
  const useOptimizedDebounce = useCallback((func: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }, [func, delay]);
  }, []);

  // Memoização inteligente para objetos grandes
  const useMemoizedObject = useCallback(<T>(factory: () => T, deps: any[]): T => {
    return useMemo(factory, deps);
  }, []);

  // Cache para callbacks pesados
  const useCachedCallback = useCallback((key: string, callback: Function, deps: any[]) => {
    const cacheKey = `${key}_${JSON.stringify(deps)}`;
    
    if (!functionCache.current.has(cacheKey)) {
      functionCache.current.set(cacheKey, useCallback(callback, deps));
    }
    
    return functionCache.current.get(cacheKey);
  }, []);

  // Throttle para scroll events
  const useThrottle = useCallback((func: Function, limit: number) => {
    const inThrottle = useRef(false);
    
    return useCallback((...args: any[]) => {
      if (!inThrottle.current) {
        func(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }, [func, limit]);
  }, []);

  // Observer para lazy loading
  const useIntersectionObserver = useCallback((callback: (entries: IntersectionObserverEntry[]) => void, options?: IntersectionObserverInit) => {
    const observer = useMemo(() => {
      if (typeof window === 'undefined') return null;
      return new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      });
    }, [callback, options]);

    return observer;
  }, []);

  return {
    useOptimizedDebounce,
    useMemoizedObject,
    useCachedCallback,
    useThrottle,
    useIntersectionObserver,
  };
}