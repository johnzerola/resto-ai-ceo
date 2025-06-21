
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function MobileScrollContainer({ 
  children, 
  className,
  maxHeight = "70vh" 
}: MobileScrollContainerProps) {
  return (
    <div 
      className={cn(
        // Base container styles
        "w-full overflow-y-auto overflow-x-hidden",
        // Mobile-specific improvements
        "touch-pan-y overscroll-contain",
        // Smooth scrolling
        "scroll-smooth",
        // Webkit scrollbar improvements for mobile
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300",
        className
      )}
      style={{ 
        maxHeight,
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'auto'
      }}
    >
      {children}
    </div>
  );
}
