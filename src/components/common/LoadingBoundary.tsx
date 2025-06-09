
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  minLoadingTime?: number;
}

export function LoadingBoundary({
  children,
  isLoading = false,
  error = null,
  fallback,
  errorFallback,
  minLoadingTime = 500
}: LoadingBoundaryProps) {
  const [showLoading, setShowLoading] = useState(isLoading);

  // Garantir tempo mínimo de loading para evitar flicker
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  if (error) {
    return errorFallback || (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 font-medium">Erro ao carregar dados</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (showLoading) {
    return fallback || (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}

// Hook para estados de loading consistentes
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    errorMessage = 'Erro ao executar operação'
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      console.error('Error in withLoading:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    withLoading,
    reset,
    setError
  };
}
