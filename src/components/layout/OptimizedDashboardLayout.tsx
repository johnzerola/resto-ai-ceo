import React, { useState, useEffect, memo, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { EmailConfirmationBanner } from '@/components/auth/EmailConfirmationBanner';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { DataSync } from '@/components/restaurant/DataSync';
import { FeedbackSystem } from '@/components/feedback/FeedbackSystem';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { UnifiedSidebar, type SidebarConfig } from './UnifiedSidebar';
import { cn } from '@/lib/utils';

interface OptimizedDashboardLayoutProps {
  children: React.ReactNode;
}

// Skeleton Loader otimizado
const SkeletonLoader = memo(({ message }: { message: string }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
    <div className="text-center space-y-4">
      <div className="relative mx-auto w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-muted animate-pulse"></div>
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">Preparando seu dashboard inteligente</p>
      </div>
      {/* Loading bars skeleton */}
      <div className="flex justify-center space-x-1 mt-4">
        <div className="w-2 h-6 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="w-2 h-6 bg-primary/30 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-6 bg-primary/30 rounded-full animate-pulse delay-200"></div>
      </div>
    </div>
  </div>
));

// Content Skeleton para transições
const ContentSkeleton = memo(() => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-muted rounded-lg w-1/3"></div>
    <div className="h-4 bg-muted rounded w-1/2"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded-lg"></div>
      ))}
    </div>
    <div className="h-64 bg-muted rounded-lg"></div>
  </div>
));

export const OptimizedDashboardLayout: React.FC<OptimizedDashboardLayoutProps> = memo(({ children }) => {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const initializeLayout = () => {
      setIsInitialized(true);
    };
    
    const timer = requestAnimationFrame(initializeLayout);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(timer);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Dashboard initialization timeout - forcing render');
        setIsInitialized(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isInitialized]);

  // Loading states
  if (isLoading && !isInitialized) {
    return <SkeletonLoader message="Carregando Lucraí..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!currentRestaurant && userRestaurants.length > 0) {
    return <SkeletonLoader message="Configurando restaurante..." />;
  }

  return (
    <DataSync>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/10">
        <UnifiedSidebar />
        
        <main className={cn(
          "flex-1 min-h-screen w-full transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-60"
        )}>
          <div className="w-full max-w-7xl mx-auto">
            <div className="p-4 md:p-6 pb-20 md:pb-6 pt-16 md:pt-6">
              <EmailConfirmationBanner />
              <TrialBanner />
              
              <Suspense fallback={<ContentSkeleton />}>
                <EnhancedErrorBoundary>
                  {children}
                </EnhancedErrorBoundary>
              </Suspense>
            </div>
          </div>
          
          <FeedbackSystem />
        </main>
      </div>
    </DataSync>
  );
});

OptimizedDashboardLayout.displayName = 'OptimizedDashboardLayout';