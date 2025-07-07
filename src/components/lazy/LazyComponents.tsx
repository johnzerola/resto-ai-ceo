import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading wrapper simplificado
export function withLazyLoading<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <OptimizedSkeleton />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Skeleton otimizado para diferentes tipos de componente
const OptimizedSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="space-y-2">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard skeleton específico
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[120px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Função para criar componentes lazy de forma segura
export function createLazyComponent(importPath: string, customSkeleton?: React.ReactNode) {
  return lazy(() => import(importPath).then(module => ({ 
    default: module.default || module[Object.keys(module)[0]] 
  })));
}

// Hook para lazy loading condicional
export function useLazyComponent<T = {}>(
  condition: boolean,
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  if (!condition) return null;
  return withLazyLoading(importFn);
}

export { DashboardSkeleton };