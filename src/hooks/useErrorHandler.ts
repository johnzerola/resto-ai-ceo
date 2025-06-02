
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
  logError?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: Error, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = 'Erro',
      toastDescription = 'Ocorreu um erro inesperado. Tente novamente.',
      logError = true,
      onError
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandler:', error);
    }

    // Show user-friendly toast
    if (showToast) {
      toast.error(toastTitle, {
        description: toastDescription
      });
    }

    // Call custom error handler
    if (onError) {
      onError(error);
    }
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}
