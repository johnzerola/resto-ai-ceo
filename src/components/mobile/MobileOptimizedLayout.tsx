
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableScroll?: boolean;
}

export function MobileOptimizedLayout({ 
  children, 
  className, 
  enableScroll = true 
}: MobileOptimizedLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen w-full",
        "touch-manipulation", // Otimiza toques em mobile
        enableScroll ? "overflow-y-auto" : "overflow-hidden",
        "scroll-smooth", // Scroll suave
        // Correção para iOS Safari
        "supports-[height:100dvh]:min-h-[100dvh]",
        "supports-[height:100svh]:min-h-[100svh]",
        className
      )}
      style={{
        // Fix para scroll em iOS
        WebkitOverflowScrolling: 'touch',
        // Previne zoom em inputs
        fontSize: '16px'
      }}
    >
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
