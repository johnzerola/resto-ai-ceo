
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = `${error.message}\n\nStack: ${errorInfo.componentStack}`;
    
    this.setState({
      error,
      errorInfo: errorMessage
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show toast notification
    toast.error('Ocorreu um erro inesperado', {
      description: 'A página foi recarregada automaticamente. Se o problema persistir, entre em contato com o suporte.'
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorMessage);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium text-gray-800">Erro:</p>
                  <p className="text-xs text-gray-600 mt-1">{this.state.error.message}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
