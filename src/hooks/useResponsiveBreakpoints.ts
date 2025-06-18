
import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
}

export function useResponsiveBreakpoints(): ResponsiveBreakpoints {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    screenWidth: 0,
    breakpoint: 'mobile'
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024 && width < 1920;
      const isLargeDesktop = width >= 1920;

      let breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop' = 'mobile';
      if (isLargeDesktop) breakpoint = 'large-desktop';
      else if (isDesktop) breakpoint = 'desktop';
      else if (isTablet) breakpoint = 'tablet';

      setBreakpoints({
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        screenWidth: width,
        breakpoint
      });
    };

    // Initial call
    updateBreakpoints();

    // Add event listener
    window.addEventListener('resize', updateBreakpoints);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
}
