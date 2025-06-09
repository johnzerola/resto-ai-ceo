
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  reRenderCount: number;
  lastUpdate: Date;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    reRenderCount: 0,
    lastUpdate: new Date()
  });

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    // Monitorar uso de memória (se disponível)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

    setMetrics({
      renderTime,
      memoryUsage,
      reRenderCount: renderCount.current,
      lastUpdate: new Date()
    });

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        reRenders: renderCount.current,
        memory: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Reset timer para próximo render
    startTime.current = performance.now();
  });

  return metrics;
}

export function useRenderTracker(componentName: string, dependencies: any[]) {
  const prevDeps = useRef(dependencies);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      const changedDeps = dependencies.reduce((acc, dep, index) => {
        if (prevDeps.current[index] !== dep) {
          acc.push(`Index ${index}: ${prevDeps.current[index]} -> ${dep}`);
        }
        return acc;
      }, [] as string[]);

      if (changedDeps.length > 0) {
        console.log(`[Re-render] ${componentName} #${renderCount.current}:`, changedDeps);
      }
    }

    prevDeps.current = dependencies;
  });

  return renderCount.current;
}
