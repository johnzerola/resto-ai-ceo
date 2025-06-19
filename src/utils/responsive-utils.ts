
import { useEffect, useState } from 'react';

export type BreakPoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint(): BreakPoint {
  const [breakpoint, setBreakpoint] = useState<BreakPoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export function isResponsiveLayout(breakpoint: BreakPoint): boolean {
  return breakpoint === 'mobile' || breakpoint === 'tablet';
}

export function getGridCols(breakpoint: BreakPoint): string {
  switch (breakpoint) {
    case 'mobile':
      return 'grid-cols-1';
    case 'tablet':
      return 'grid-cols-2';
    case 'desktop':
      return 'grid-cols-3';
    default:
      return 'grid-cols-1';
  }
}
