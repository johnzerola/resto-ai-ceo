
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      // Base responsive container
      "w-full min-h-screen",
      // Mobile-first approach
      "px-3 py-4", // Mobile padding
      "sm:px-4 sm:py-6", // Tablet padding
      "md:px-6 md:py-8", // Desktop padding
      "lg:px-8 lg:py-10", // Large desktop padding
      // Responsive text scaling
      "text-sm sm:text-base",
      // Responsive spacing
      "space-y-4 sm:space-y-6 md:space-y-8",
      className
    )}>
      <div className={cn(
        // Responsive max-width container
        "mx-auto w-full",
        "max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl",
        // Responsive grid when needed
        "grid grid-cols-1",
        !isMobile && "lg:grid-cols-12 gap-6"
      )}>
        {children}
      </div>
    </div>
  );
}
