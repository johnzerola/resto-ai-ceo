import React from 'react';
import { cn } from "@/lib/utils";

interface BrandedLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandedLoader({ message = "Carregando...", size = 'md', className }: BrandedLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "rounded-full border-4 border-muted animate-spin",
          sizeClasses[size]
        )}></div>
        {/* Inner ring with Lucraí colors */}
        <div className={cn(
          "rounded-full border-4 border-primary border-t-transparent absolute top-0 left-0 animate-spin",
          sizeClasses[size]
        )}></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      {message && (
        <div className="text-center space-y-1">
          <p className={cn("font-medium text-foreground", textSizeClasses[size])}>
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            Preparando sua experiência inteligente
          </p>
        </div>
      )}
    </div>
  );
}

export function PageBrandedLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <BrandedLoader message={message} size="lg" />
    </div>
  );
}