
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoader({ children, fallback }: LazyLoaderProps) {
  const defaultFallback = (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// HOC para lazy loading de componentes
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <Component {...props} />
      </LazyLoader>
    );
  };
}

// Lazy components para módulos principais
export const LazyFichaTecnica = lazy(() => import('@/pages/FichaTecnica'));
export const LazyRecipeForm = lazy(() => import('@/components/restaurant/RecipeForm'));
export const LazyRecipeList = lazy(() => import('@/components/restaurant/RecipeList'));
export const LazyFichaTecnicaList = lazy(() => import('@/components/restaurant/FichaTecnicaList'));
