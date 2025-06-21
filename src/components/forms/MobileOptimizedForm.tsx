
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function MobileOptimizedForm({ 
  children, 
  onSubmit, 
  className 
}: MobileOptimizedFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "w-full space-y-4",
        // Scroll otimizado para mobile
        "overflow-y-auto",
        "touch-manipulation",
        // Padding adequado para telas pequenas
        "px-4 pb-6",
        className
      )}
      style={{
        // Fix scroll no iOS
        WebkitOverflowScrolling: 'touch',
        // Previne zoom em inputs
        fontSize: '16px'
      }}
    >
      <div className="space-y-4">
        {children}
      </div>
    </form>
  );
}
