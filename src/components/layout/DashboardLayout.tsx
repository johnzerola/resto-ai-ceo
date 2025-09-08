// DEPRECATED: Use OptimizedDashboardLayout instead
import React, { memo } from 'react';
import { OptimizedDashboardLayout } from './OptimizedDashboardLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LoadingSpinner = memo(({ message }: { message: string }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
    <div className="text-center">
      <div className="relative mx-auto w-12 h-12 mb-6">
        <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
        <div className="w-12 h-12 rounded-full border-4 border-lucrai-green-primary border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Preparando seu dashboard inteligente</p>
    </div>
  </div>
));

// Forward to new optimized layout
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  console.warn('DashboardLayout is deprecated. Use OptimizedDashboardLayout instead.');
  return <OptimizedDashboardLayout>{children}</OptimizedDashboardLayout>;
};