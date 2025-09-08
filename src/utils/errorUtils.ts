import { toast } from 'sonner';

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: string;
  timestamp: string;
}

export class AppError extends Error {
  code?: string;
  context?: string;
  timestamp: string;

  constructor(message: string, code?: string, context?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export function handleError(error: Error | string, context?: string): ErrorInfo {
  const errorInfo: ErrorInfo = {
    message: typeof error === 'string' ? error : error.message,
    code: error instanceof AppError ? error.code : undefined,
    context: context || (error instanceof AppError ? error.context : undefined),
    timestamp: new Date().toISOString()
  };

  // Log do erro para monitoramento
  console.error('🚨 Error:', errorInfo);

  return errorInfo;
}

export function showUserFriendlyError(error: Error | string, context?: string) {
  const errorInfo = handleError(error, context);
  
  // Mensagens mais amigáveis para erros comuns
  let userMessage = errorInfo.message;
  
  if (errorInfo.message.includes('Network Error') || errorInfo.message.includes('fetch')) {
    userMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
  } else if (errorInfo.message.includes('401') || errorInfo.message.includes('Unauthorized')) {
    userMessage = 'Sessão expirada. Faça login novamente.';
  } else if (errorInfo.message.includes('403') || errorInfo.message.includes('Forbidden')) {
    userMessage = 'Você não tem permissão para realizar esta ação.';
  } else if (errorInfo.message.includes('404') || errorInfo.message.includes('Not Found')) {
    userMessage = 'Dados não encontrados.';
  } else if (errorInfo.message.includes('500') || errorInfo.message.includes('Server Error')) {
    userMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
  }
  
  toast.error(userMessage);
  
  return errorInfo;
}

export function createAsyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      showUserFriendlyError(error as Error, context);
      throw error;
    }
  }) as T;
}

// Hook para tratamento de erros em componentes
export function useErrorBoundary() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Component Error:', error, errorInfo);
    
    // Em produção, enviar erro para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Aqui integraria com Sentry, LogRocket, etc.
    }
  };

  return { handleError };
}