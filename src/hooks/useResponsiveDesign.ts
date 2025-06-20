
import { useState, useEffect } from 'react';

export type BreakpointType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const defaultBreakpoints: ResponsiveConfig = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280
};

export function useResponsiveDesign(customBreakpoints?: Partial<ResponsiveConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  const [breakpoint, setBreakpoint] = useState<BreakpointType>('desktop');
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      if (width < breakpoints.mobile) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Set initial values
    updateBreakpoint();

    // Add event listener with throttling
    let timeoutId: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 100);
    };

    window.addEventListener('resize', throttledUpdate);
    
    return () => {
      window.removeEventListener('resize', throttledUpdate);
      clearTimeout(timeoutId);
    };
  }, [breakpoints]);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const isMobileOrTablet = isMobile || isTablet;

  return {
    breakpoint,
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    breakpoints
  };
}
