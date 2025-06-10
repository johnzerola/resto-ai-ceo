
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentUpdates: number;
  lastUpdate: Date;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentUpdates: 0,
    lastUpdate: new Date()
  });
  
  const renderStartTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      renderStartTime.current = performance.now();
      isFirstRender.current = false;
      return;
    }

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStartTime.current;
    updateCount.current += 1;

    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

    setMetrics({
      renderTime,
      memoryUsage,
      componentUpdates: updateCount.current,
      lastUpdate: new Date()
    });

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 16) { // 60fps threshold
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      if (updateCount.current > 10) {
        console.warn(`🔄 Frequent updates in ${componentName}: ${updateCount.current} updates`);
      }
    }

    renderStartTime.current = performance.now();
  });

  // Reset counters periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateCount.current = 0;
    }, 10000); // Reset every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for monitoring expensive operations
export function useOperationTracker() {
  const trackedOperations = useRef<Map<string, number>>(new Map());

  const trackOperation = <T>(operationName: string, operation: () => T | Promise<T>): T | Promise<T> => {
    const startTime = performance.now();
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        trackedOperations.current.set(operationName, duration);
        
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          console.warn(`⏱️ Slow operation "${operationName}": ${duration.toFixed(2)}ms`);
        }
      });
    } else {
      const endTime = performance.now();
      const duration = endTime - startTime;
      trackedOperations.current.set(operationName, duration);
      
      if (process.env.NODE_ENV === 'development' && duration > 50) {
        console.warn(`⏱️ Slow operation "${operationName}": ${duration.toFixed(2)}ms`);
      }
      
      return result;
    }
  };

  const getOperationMetrics = () => {
    return Array.from(trackedOperations.current.entries()).map(([name, duration]) => ({
      name,
      duration,
      status: duration > 100 ? 'slow' : duration > 50 ? 'moderate' : 'fast'
    }));
  };

  return { trackOperation, getOperationMetrics };
}
