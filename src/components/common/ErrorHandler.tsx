import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorHandlerProps {
  error: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  showDetails?: boolean;
}

export function ErrorHandler({ 
  error, 
  onRetry, 
  onGoHome, 
  title = "Algo deu errado",
  showDetails = false 
}: ErrorHandlerProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? null : error.stack;

  const handleRetry = () => {
    toast.loading('Tentando novamente...');
    onRetry?.();
  };

  const handleGoHome = () => {
    onGoHome?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          {showDetails && errorStack && (
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-medium">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
                {errorStack}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            
            {onGoHome && (
              <Button variant="outline" onClick={handleGoHome} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para usar o ErrorHandler de forma mais simples
export function useErrorHandler() {
  const handleError = (error: Error | string, options?: {
    onRetry?: () => void;
    showToast?: boolean;
    title?: string;
  }) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    console.error('Error handled:', error);
    
    if (options?.showToast !== false) {
      toast.error(options?.title || errorMessage);
    }
    
    return {
      error,
      onRetry: options?.onRetry,
      title: options?.title
    };
  };

  return { handleError };
}