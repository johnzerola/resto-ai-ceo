
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileButtonProps extends ButtonProps {
  touchOptimized?: boolean;
}

export function MobileButton({ 
  children, 
  className, 
  touchOptimized = true,
  ...props 
}: MobileButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        touchOptimized && [
          // Otimizações para touch
          "touch-manipulation",
          "select-none",
          // Tamanho mínimo para dedos
          "min-h-[44px] min-w-[44px]",
          // Padding adequado para mobile
          "px-6 py-3",
          // Hover states apenas para desktop
          "hover:scale-105 active:scale-95",
          "transition-transform duration-150",
          // Fix para iOS
          "cursor-pointer",
          "-webkit-tap-highlight-color: transparent"
        ],
        className
      )}
      style={{
        // Remove highlight azul no iOS
        WebkitTapHighlightColor: 'transparent',
        // Prevent zoom on double tap
        touchAction: 'manipulation'
      }}
    >
      {children}
    </Button>
  );
}
