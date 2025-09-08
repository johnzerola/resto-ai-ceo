import React, { memo, Suspense } from 'react';
import { LucideIcon } from 'lucide-react';

interface LazyIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

const IconFallback = memo(({ className, size = 16 }: { className?: string; size?: number }) => (
  <div className={`bg-lucrai-gray-200 rounded animate-pulse ${className}`} style={{ width: size, height: size }} />
));

export const LazyIcon = memo<LazyIconProps>(({ icon: Icon, className, size }) => (
  <Suspense fallback={<IconFallback className={className} size={size} />}>
    <Icon className={className} size={size} />
  </Suspense>
));

LazyIcon.displayName = 'LazyIcon';