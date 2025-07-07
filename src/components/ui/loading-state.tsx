import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'card';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  type = 'spinner', 
  message = 'Carregando...', 
  size = 'md' 
}: LoadingStateProps) {
  if (type === 'skeleton') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className="flex items-center justify-center min-h-64">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <Loader2 className={`animate-spin ${
            size === 'sm' ? 'h-6 w-6' : 
            size === 'lg' ? 'h-12 w-12' : 
            'h-8 w-8'
          }`} />
          <p className="text-muted-foreground text-sm">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={`animate-spin ${
          size === 'sm' ? 'h-6 w-6' : 
          size === 'lg' ? 'h-12 w-12' : 
          'h-8 w-8'
        }`} />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// Hook para estados de loading consistentes
export function useLoadingState() {
  const getLoadingComponent = (
    type: LoadingStateProps['type'] = 'spinner',
    message?: string,
    size?: LoadingStateProps['size']
  ) => <LoadingState type={type} message={message} size={size} />;

  return { getLoadingComponent, LoadingState };
}