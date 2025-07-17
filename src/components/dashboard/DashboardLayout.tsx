
// DEPRECATED: Use OptimizedDashboardLayout instead
import React from 'react';
import { OptimizedDashboardLayout } from '@/components/layout/OptimizedDashboardLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Forward to new optimized layout
export function DashboardLayout({ children }: DashboardLayoutProps) {
  console.warn('DashboardLayout is deprecated. Use OptimizedDashboardLayout instead.');
  return <OptimizedDashboardLayout>{children}</OptimizedDashboardLayout>;
}
