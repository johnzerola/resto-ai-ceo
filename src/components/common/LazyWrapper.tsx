import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  name?: string;
}

const DefaultSkeleton = memo(() => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </CardContent>
  </Card>
));

const DefaultErrorFallback = memo(({ 
  error, 
  resetErrorBoundary, 
  name 
}: { 
  error: Error; 
  resetErrorBoundary: () => void; 
  name?: string;
}) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive mb-2">
            Erro ao carregar {name || 'componente'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'Algo deu errado. Tente novamente.'}
          </p>
          <Button 
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

export const LazyWrapper = memo<LazyWrapperProps>(({ 
  children, 
  fallback, 
  errorFallback, 
  name 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => 
        errorFallback || (
          <DefaultErrorFallback 
            error={error} 
            resetErrorBoundary={resetErrorBoundary} 
            name={name}
          />
        )
      }
      onError={(error, errorInfo) => {
        console.error(`LazyWrapper Error in ${name}:`, error, errorInfo);
      }}
    >
      <Suspense fallback={fallback || <DefaultSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

LazyWrapper.displayName = 'LazyWrapper';