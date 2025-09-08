import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { OptimizedLoader } from './OptimizedLoader';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptimizedLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  minLoadTime?: number;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Ops! Algo deu errado</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || 'Erro inesperado ao carregar o componente'}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}

export const OptimizedLazyLoader = memo(({ 
  children, 
  fallback, 
  onError,
  minLoadTime = 100 
}: OptimizedLazyLoaderProps) => {
  const [showLoader, setShowLoader] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={onError}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback || <OptimizedLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

OptimizedLazyLoader.displayName = 'OptimizedLazyLoader';