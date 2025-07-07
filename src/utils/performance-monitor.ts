// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  
  static startTimer(name: string): void {
    this.metrics.set(name, performance.now());
  }
  
  static endTimer(name: string): number {
    const start = this.metrics.get(name);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.metrics.delete(name);
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(name);
      try {
        const result = await fn();
        this.endTimer(name);
        resolve(result);
      } catch (error) {
        this.endTimer(name);
        reject(error);
      }
    });
  }
  
  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

// Memory usage monitor
export class MemoryMonitor {
  static logUsage(context: string): void {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log(`🧠 ${context} - Memory:`, {
        used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  }
  
  static async monitorComponent(name: string, renderFn: () => any): Promise<any> {
    this.logUsage(`${name} - Before Render`);
    const result = await renderFn();
    this.logUsage(`${name} - After Render`);
    return result;
  }
}