import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export function PerformanceMonitor() {
  useEffect(() => {
    const measurePerformance = () => {
      // Basic timing metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };

      // Paint timing metrics (if supported)
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      // LCP (if supported)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
            
            // Log performance metrics in development
            if (process.env.NODE_ENV === 'development') {
              console.group('🎯 Lucraí Performance Metrics');
              console.log('Load Time:', metrics.loadTime.toFixed(2), 'ms');
              console.log('DOM Content Loaded:', metrics.domContentLoaded.toFixed(2), 'ms');
              if (metrics.firstContentfulPaint) {
                console.log('First Contentful Paint:', metrics.firstContentfulPaint.toFixed(2), 'ms');
              }
              if (metrics.largestContentfulPaint) {
                console.log('Largest Contentful Paint:', metrics.largestContentfulPaint.toFixed(2), 'ms');
              }
              console.groupEnd();
            }
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('Performance Observer not fully supported');
        }
      }

      // Simple performance logging for production monitoring
      if (process.env.NODE_ENV === 'production') {
        // Here you could send metrics to your analytics service
        // e.g., analytics.track('page_performance', metrics);
      }
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 0);
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return null; // This is a monitoring component, no UI needed
}

// Hook for component-level performance monitoring
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 100) {
        console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}